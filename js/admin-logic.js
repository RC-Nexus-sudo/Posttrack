/**
* Admin Logic - Gestion unifiée des habilitations et des services
* Ce fichier est chargé une seule fois au démarrage de index.html
* Il s'attache directement à l'objet global App.modules.parametres
*/

// S'assurer que App et App.modules existent
var AdminApp = App.modules.parametres; 
App.modules = App.modules || {};

// Définition directe de la logique d'administration
App.modules.parametres = {
    // 1. INITIALISATION SÉCURISÉE
    init: function() {
        // Nous utilisons le logger global de App.js au lieu d'un logger interne
        App.logger.log("Initialisation du registre des accès (AdminLogic.init())...", "info");
        
        // Assurez-vous que les variables globales db et auth de firebase-config.js sont accessibles
        const checkFirebase = setInterval(() => {
            if (window.db && window.auth) {
                clearInterval(checkFirebase);               
                this.loadUsers(); 
                this.loadServices(); // Active la liste des services et le menu déroulant
                this.bindEventListeners();
            }
        }, 500);
    },

    bindEventListeners: function() {
        // Notez que "this" fait référence à App.modules.parametres dans ce contexte

    // 1. Écouteur global pour les formulaires principaux (restent inchangés)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-save-user') { 
            e.preventDefault();
            this.saveUser();
        }
        if (e.target.id === 'btn-add-service') { 
            e.preventDefault();
            this.addService();
        }
    });

        // 2. Délégation d'événements pour le registre des agents dynamiques
    const usersRegistry = document.getElementById('users-registry');
    if (usersRegistry) {
        usersRegistry.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return; // S'assurer que le clic est bien sur un bouton d'action

            const action = button.getAttribute('data-action');
            const id = button.getAttribute('data-id');

            if (action === 'editUser') {
                this.editUser(id);
            } else if (action === 'deleteUser') {
                this.deleteUser(id);
            }
        });
    }

    // 3. Délégation d'événements pour la liste des services dynamiques
    const servicesList = document.getElementById('services-list-admin');
    if (servicesList) {
        servicesList.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.getAttribute('data-action');
            const id = button.getAttribute('data-id');

            if (action === 'deleteService') {
                this.deleteService(id);
            }
        });
    }

    App.logger.log("Gestionnaires d'événements dynamiques liés.");
},
    
    // 2. ENREGISTREMENT / MISE À JOUR AGENT
    saveUser: function() {
        let uid = document.getElementById('adm-uid').value.trim();

        // Récupération des permissions depuis les checkboxes ---
        const accessEntrants = document.getElementById('access-entrants').checked;
        const accessSortants = document.getElementById('access-sortants').checked;
        const accessAdmin = document.getElementById('access-admin').checked; // Géré aussi par le rôle 'admin'
        // ------------------------------------------------------------------
        
        const data = {
            prenom: document.getElementById('adm-prenom').value.trim(),
            nom: document.getElementById('adm-nom').value.trim(),
            email: document.getElementById('adm-email').value.trim().toLowerCase(),
            service: document.getElementById('adm-service').value.trim(),
            role: document.getElementById('adm-role').value.toLowerCase().trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),

            // Objet de permissions ---
            modules: {
                dashboard: true, // Toujours actif
                courriersEntrants: accessEntrants,
                courriersSortants: accessSortants,
                admin: accessAdmin
                // Ajoutez ici eBox, Emails Boite Info, etc.
            }
            // ------------------------------------
        };

        if (!data.nom || !data.email || !data.prenom) {
            alert("Le nom, le prénom et l'email sont obligatoires.");
            return;
        }

        if (!uid) { uid = data.email; }

        window.db.collection("users").doc(uid).set(data, { merge: true })
            .then(() => {
                App.logger.log("✅ Habilitation enregistrée : " + uid);
                this.clearForm();
            })
            .catch(err => {
                App.logger.log("❌ Erreur : " + err.message);
                alert("Erreur Firestore : " + err.message);
            });
    },

    // 3. CHARGEMENT DU REGISTRE AGENTS
    loadUsers: function() {
    const container = document.getElementById('users-registry');
    if (!container) return;

    window.db.collection("users").orderBy("nom", "asc").onSnapshot(snap => {
        // Si la collection est vide
        if (snap.empty) {
            container.innerHTML = `<div class="text-slate-500 italic p-6 border border-slate-800 rounded-2xl text-center bg-slate-900/30">Aucun agent dans le registre.</div>`;
            return;
        }

        let html = "";
        snap.forEach(doc => {
            const u = doc.data();
            
            // SÉCURITÉ : On vérifie que nom et prénom existent avant de prendre l'initiale
            const pFirst = (u.prenom && u.prenom.length > 0) ? u.prenom.charAt(0) : '?';
            const nFirst = (u.nom && u.nom.length > 0) ? u.nom.charAt(0) : '?';
            const initiales = (pFirst + nFirst).toUpperCase();
            
            html += `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center hover:border-blue-500/50 transition-all mb-3 group shadow-lg">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-blue-500 border border-slate-700 uppercase text-xs">
                            ${initiales}
                        </div>
                        <div>
                            <p class="text-white font-bold text-sm leading-tight">${u.prenom || 'Inconnu'} ${u.nom || 'Agent'}</p>
                            <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">${u.service || 'Sans service'} • ${u.email || 'Pas d\'email'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800 mr-2 uppercase">${u.role || 'agent'}</span>
                        <button data-action="editUser" data-id="${doc.id}" class="w-8 h-8 rounded-lg bg-blue-900/20 text-blue-400 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
                        <button data-action="deleteUser" data-id="${doc.id}" class="w-8 h-8 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white transition flex items-center justify-center"><i class="fa-solid fa-trash-can text-xs"></i></button>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
        App.logger.log("Registre mis à jour.");
    }, err => {
        App.logger.log("ERREUR de flux : " + err.message);
        container.innerHTML = `<div class="text-red-500 p-4 text-xs bg-red-500/10 rounded-xl">Erreur de lecture Firestore : ${err.message}</div>`;
    });
},


    // 4. ÉDITION AGENT
    editUser: function(id) {
        window.db.collection("users").doc(id).get().then(doc => {
            if (doc.exists) {
                const u = doc.data();
                document.getElementById('adm-uid').value = id;
                document.getElementById('adm-prenom').value = u.prenom || "";
                document.getElementById('adm-nom').value = u.nom || "";
                document.getElementById('adm-email').value = u.email || "";
                document.getElementById('adm-service').value = u.service || "";
                document.getElementById('adm-role').value = u.role || "agent";
                this.log("Édition de l'agent : " + (u.nom || id));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    },

    // 5. SUPPRESSION AGENT
    deleteUser: function(id) {
        if (confirm("🚨 Supprimer cet agent ?")) {
            window.db.collection("users").doc(id).delete().then(() => App.logger.log("Compte révoqué : " + id));
        }
    },
   
   // 6. AJOUTER UN SERVICE
    addService: function() {
        const nameInput = document.getElementById('new-service-name');
        const colorInput = document.getElementById('new-service-color');
        const name = nameInput.value.trim();
        const color = colorInput.value;

        if (!name) {
            alert("Veuillez saisir un nom de service.");
            return;
        }

        window.db.collection("services").doc(name).set({
            name: name,
            color: color,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(() => {
            App.logger.log(`✅ Service "${name}" enregistré.`);
            nameInput.value = "";
        })
        .catch(err => App.logger.log("❌ Erreur service : " + err.message));
    },

    // 7. CHARGER LES SERVICES (ADMIN + MENU DÉROULANT)
    loadServices: function() {
        App.logger.log("Début du chargement des services...", "info");
        const listAdmin = document.getElementById('services-list-admin');
        const selectAgent = document.getElementById('adm-service');

        if (!listAdmin || !selectAgent) return;

        window.db.collection("services").onSnapshot(snap => {
            listAdmin.innerHTML = "";
            selectAgent.innerHTML = '<option value="">-- Choisir un service --</option>';

            snap.forEach(doc => {
                const s = doc.data();
                // Badge coloré dans l'interface admin
                listAdmin.innerHTML += `
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold text-white" 
                         style="background: ${s.color}22; border-color: ${s.color}">
                        <span class="w-2 h-2 rounded-full" style="background: ${s.color}"></span>
                        ${s.name}
                        <button data-action="deleteService" data-id="${doc.id}" class="ml-1 text-slate-500 hover:text-white">×</button>
                    </div>`;
                
                // Injection automatique dans le menu déroulant des agents
                selectAgent.innerHTML += `<option value="${s.name}">${s.name}</option>`;
                App.logger.log("Fin du chargement des services (vérifier Firebase pour les données)", "info");
            });
        }, err => App.logger.log("Erreur flux services: " + err.message));
    },

    // 8. SUPPRIMER UN SERVICE
    deleteService: function(id) {
        if (confirm(`Supprimer le service "${id}" ?`)) {
            window.db.collection("services").doc(id).delete()
                .then(() => App.logger.log(`🗑️ Service "${id}" supprimé.`));
        }
    },

    clearForm: function() {
    document.getElementById('adm-uid').value = '';
    document.getElementById('adm-prenom').value = '';
    document.getElementById('adm-nom').value = '';
    document.getElementById('adm-email').value = '';
    document.getElementById('adm-service').value = ''; // Peut-être remettre à '-- Choisir un service --'
    document.getElementById('adm-role').value = 'agent';
    // Réinitialiser les checkboxes si nécessaire
    // ...
    },
};
