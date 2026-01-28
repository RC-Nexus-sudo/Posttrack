/**
 * Admin Logic - Gestion unifiée des habilitations
 */
const AdminApp = {
    // 1. INITIALISATION SÉCURISÉE
    init: function() {
        this.log("Initialisation du registre des accès...");
        
        // On attend que les services Firebase (db/auth) soient injectés
        const checkFirebase = setInterval(() => {
            if (window.db && window.auth) {
                clearInterval(checkFirebase);
                this.listenAuth();
                this.loadUsers();
            }
        }, 500);
    },

    // 2. CONSOLE DE LOGS ADMIN
    log: function(msg) {
        const logBox = document.getElementById('admin-logs');
        if (!logBox) return;
        const time = new Date().toLocaleTimeString();
        logBox.innerHTML += `<div>[${time}] ${msg}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
    },

    // 3. VÉRIFICATION DU RÔLE (GARDIEN)
    listenAuth: function() {
        window.auth.onAuthStateChanged(user => {
            if (!user) {
                window.location.href = 'index.html';
            } else {
                window.db.collection("users").doc(user.uid).get().then(doc => {
                    if (!doc.exists || doc.data().role !== 'admin') {
                        alert("Accès réservé aux administrateurs.");
                        window.location.href = 'index.html';
                    } else {
                        this.log("Session validée pour " + user.email);
                    }
                }).catch(err => {
                    this.log("Erreur sécurité : " + err.message);
                    window.location.href = 'index.html';
                });
            }
        });
    },

    // 4. ENREGISTREMENT / MISE À JOUR
    saveUser: function() {
        const uid = document.getElementById('adm-uid').value.trim();
        const data = {
            prenom: document.getElementById('adm-prenom').value.trim(),
            nom: document.getElementById('adm-nom').value.trim(),
            email: document.getElementById('adm-email').value.trim(),
            service: document.getElementById('adm-service').value.trim(),
            role: document.getElementById('adm-role').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!uid || !data.nom || !data.prenom || !data.email) {
            alert("Tous les champs sont obligatoires (UID, Nom, Prénom, Email, Service)");
            return;
        }

        window.db.collection("users").doc(uid).set(data, { merge: true })
            .then(() => {
                this.log("✅ Habilitation enregistrée : " + data.email);
                this.clearForm();
            })
            .catch(err => {
                this.log("❌ Erreur sauvegarde : " + err.message);
                alert("Erreur : " + err.message);
            });
    },

    // 5. CHARGEMENT DU REGISTRE EN TEMPS RÉEL
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
                const initiales = (u.prenom?.charAt(0) || '') + (u.nom?.charAt(0) || '');
                
                html += `
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center hover:border-blue-500/50 transition-all mb-3 group shadow-lg">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-blue-500 border border-slate-700 uppercase text-xs">
                                ${initiales}
                            </div>
                            <div>
                                <p class="text-white font-bold text-sm leading-tight">${u.prenom} ${u.nom}</p>
                                <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">${u.service} • ${u.email}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800 mr-2">${u.role}</span>
                            <button onclick="AdminApp.editUser('${doc.id}')" class="w-8 h-8 rounded-lg bg-blue-900/20 text-blue-400 hover:bg-blue-600 hover:text-white transition flex items-center justify-center" title="Modifier">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button onclick="AdminApp.deleteUser('${doc.id}')" class="w-8 h-8 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white transition flex items-center justify-center" title="Supprimer">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>`;
            });
            container.innerHTML = html;
        }, err => {
            this.log("ERREUR de flux : " + err.message);
        });
    },

    // 6. ÉDITION (Pré-remplissage)
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
                this.log("Édition en cours : " + (u.nom || id));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    },

    // 7. SUPPRESSION
    deleteUser: function(id) {
        if (confirm("🚨 RÉVOCATION D'ACCÈS\nVoulez-vous vraiment supprimer cet agent du registre ?")) {
            window.db.collection("users").doc(id).delete()
                .then(() => this.log("Habilitation révoquée pour " + id))
                .catch(err => alert("Erreur suppression : " + err.message));
        }
    },

    // 8. RESET FORMULAIRE
    clearForm: function() {
        ['adm-uid', 'adm-prenom', 'adm-nom', 'adm-email', 'adm-service'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
    }
};

// Lancement automatique
AdminApp.init();

