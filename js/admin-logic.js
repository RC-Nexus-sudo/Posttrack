/**
 * Admin Logic - Gestion unifiée des habilitations et des services
 */
const AdminApp = {
    // 1. INITIALISATION SÉCURISÉE
    init: function() {
        this.log("Initialisation du registre des accès...");
        
        const checkFirebase = setInterval(() => {
            if (window.db && window.auth) {
                clearInterval(checkFirebase);
                this.listenAuth();
                this.loadUsers();
                this.loadServices(); // Active la liste des services et le menu déroulant
            }
        }, 500);
    },

    // 2. CONSOLE DE LOGS INTERNE
    log: function(msg) {
        const logBox = document.getElementById('admin-logs');
        if (!logBox) return;
        const time = new Date().toLocaleTimeString();
        logBox.innerHTML += `<div>[${time}] ${msg}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
    },

    // 3. GARDIEN D'ACCÈS (UID & EMAIL FALLBACK)
    listenAuth: function() {
        window.auth.onAuthStateChanged(user => {
            if (!user) {
                window.location.href = 'index.html';
            } else {
                this.checkAccess(user.uid, (isValid) => {
                    if (!isValid) {
                        this.checkAccess(user.email, (isEmailValid) => {
                            if (!isEmailValid) {
                                alert("Accès réservé aux administrateurs.");
                                window.location.href = 'index.html';
                            }
                        });
                    }
                });
            }
        });
    },

    checkAccess: function(id, callback) {
        window.db.collection("users").doc(id).get().then(doc => {
            if (doc.exists && doc.data().role?.toLowerCase() === 'admin') {
                this.log("Session validée pour " + (doc.data().email || id));
                callback(true);
            } else {
                callback(false);
            }
        }).catch(() => callback(false));
    },

    // 4. ENREGISTREMENT / MISE À JOUR AGENT
    saveUser: function() {
        let uid = document.getElementById('adm-uid').value.trim();
        const data = {
            prenom: document.getElementById('adm-prenom').value.trim(),
            nom: document.getElementById('adm-nom').value.trim(),
            email: document.getElementById('adm-email').value.trim().toLowerCase(),
            service: document.getElementById('adm-service').value.trim(),
            role: document.getElementById('adm-role').value.toLowerCase().trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!data.nom || !data.email || !data.prenom) {
            alert("Le nom, le prénom et l'email sont obligatoires.");
            return;
        }

        if (!uid) { uid = data.email; }

        window.db.collection("users").doc(uid).set(data, { merge: true })
            .then(() => {
                this.log("✅ Habilitation enregistrée : " + uid);
                this.clearForm();
            })
            .catch(err => {
                this.log("❌ Erreur : " + err.message);
                alert("Erreur Firestore : " + err.message);
            });
    },

    // 5. CHARGEMENT DU REGISTRE AGENTS
    loadUsers: function() {
        const container = document.getElementById('users-registry');
        if (!container) return;

        window.db.collection("users").orderBy("nom", "asc").onSnapshot(snap => {
            if (snap.empty) {
                container.innerHTML = `<div class="text-slate-500 italic p-6 border border-slate-800 rounded-2xl text-center bg-slate-900/30">Aucun agent dans le registre.</div>`;
                return;
            }
            let html = "";
            snap.forEach(doc => {
                const u = doc.data();
                const initiales = ((u.prenom?.charAt(0) || '') + (u.nom?.charAt(0) || '')).toUpperCase();
                html += `
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center hover:border-blue-500/50 transition-all mb-3 group">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-blue-500 border border-slate-700 uppercase text-xs">${initiales}</div>
                            <div>
                                <p class="text-white font-bold text-sm leading-tight">${u.prenom} ${u.nom}</p>
                                <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">${u.service} • ${u.email}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800 mr-2 uppercase">${u.role}</span>
                            <button onclick="AdminApp.editUser('${doc.id}')" class="w-8 h-8 rounded-lg bg-blue-900/20 text-blue-400 hover:bg-blue-600 hover:text-white transition flex items-center justify-center"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
                            <button onclick="AdminApp.deleteUser('${doc.id}')" class="w-8 h-8 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white transition flex items-center justify-center"><i class="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </div>`;
            });
            container.innerHTML = html;
        });
    },

    // 6. ÉDITION AGENT
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

    // 7. SUPPRESSION AGENT
    deleteUser: function(id) {
        if (confirm("🚨 Supprimer cet agent ?")) {
            window.db.collection("users").doc(id).delete().then(() => this.log("Compte révoqué : " + id));
        }
    },

    // 8. GESTION DES SERVICES
    addService: function() {
        const nameInput = document.getElementById('new-service-name');
        const colorInput = document.getElementById('new-service-color');
        const name = nameInput.value.trim();
        const color = colorInput.value;

        if (!name) return alert("Nom de service requis.");

        window.db.collection("services").doc(name).set({
            name: name,
            color: color,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).then(() => {
            this.log(`✅ Service "${name}" enregistré.`);
            nameInput.value = "";
        });
    },

    loadServices: function() {
        const listAdmin = document.getElementById('services-list-admin');
        const selectAgent = document.getElementById('adm-service');
        if (!listAdmin || !selectAgent) return;

        window.db.collection("services").onSnapshot(snap => {
            listAdmin.innerHTML = "";
            selectAgent.innerHTML = '<option value="">-- Choisir un service --</option>';
            snap.forEach(doc => {
                const s = doc.data();
                listAdmin.innerHTML += `
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold text-white" style="background: ${s.color}22; border-color: ${s.color}">
                        <span class="w-2 h-2 rounded-full" style="background: ${s.color}"></span>
                        ${s.name}
                        <button onclick="AdminApp.deleteService('${doc.id}')" class="ml-1 text-slate-500 hover:text-white">×</button>
                    </div>`;
                selectAgent.innerHTML += `<option value="${s.name}">${s.name}</option>`;
            });
        });
    },

    deleteService: function(id) {
        if (confirm(`Supprimer le service "${id}" ?`)) {
            window.db.collection("services").doc(id).delete().then(() => this.log(`🗑️ Service "${id}" supprimé.`));
        }
    },

    // UTILITAIRE
    clearForm: function() {
        ['adm-uid', 'adm-prenom', 'adm-nom', 'adm-email', 'adm-service'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        document.getElementById('adm-uid').placeholder = "Généré automatiquement";
    },

    logout: function() {
        window.auth.signOut().then(() => { window.location.href = 'index.html'; });
    }
};
// 9. AJOUTER UN SERVICE
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
            this.log(`✅ Service "${name}" enregistré.`);
            nameInput.value = "";
        })
        .catch(err => this.log("❌ Erreur service : " + err.message));
    },

    // 10. CHARGER LES SERVICES (ADMIN + MENU DÉROULANT)
    loadServices: function() {
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
                        <button onclick="AdminApp.deleteService('${doc.id}')" class="ml-1 text-slate-500 hover:text-white">×</button>
                    </div>`;
                
                // Injection automatique dans le menu déroulant des agents
                selectAgent.innerHTML += `<option value="${s.name}">${s.name}</option>`;
            });
        }, err => this.log("Erreur flux services: " + err.message));
    },

    // 11. SUPPRIMER UN SERVICE
    deleteService: function(id) {
        if (confirm(`Supprimer le service "${id}" ?`)) {
            window.db.collection("services").doc(id).delete()
                .then(() => this.log(`🗑️ Service "${id}" supprimé.`));
        }
    },

    // 12. DÉCONNEXION
    logout: function() {
        window.auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    }
};

// LANCEMENT
AdminApp.init();
