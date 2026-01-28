/**
 * Admin Logic - Gestion sécurisée des habilitations
 */
const AdminApp = {
    init: function() {
        this.log("Initialisation du registre...");
        this.listenAuth();
        this.loadUsers();
    },

    log: function(msg) {
        const logBox = document.getElementById('admin-logs');
        const time = new Date().toLocaleTimeString();
        logBox.innerHTML += `<div>[${time}] ${msg}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
    },

    // Sécurité : Vérifie si l'utilisateur actuel est bien admin
    listenAuth: function() {
    window.auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            // On vérifie le rôle avec un délai de sécurité
            window.db.collection("users").doc(user.uid).get().then(doc => {
                if (!doc.exists || doc.data().role !== 'admin') {
                    console.error("Accès refusé pour :", user.uid);
                    alert("Accès réservé aux administrateurs.");
                    window.location.href = 'index.html';
                } else {
                    this.log("Accès Admin validé pour " + user.email);
                }
            }).catch(err => {
                window.location.href = 'index.html';
            });
        }
    });
},


    // Sauvegarde un utilisateur
    saveUser: function() {
        const uid = document.getElementById('adm-uid').value.trim();
        const data = {
            prenom: document.getElementById('adm-prenom').value.trim(),
            nom: document.getElementById('adm-nom').value.trim(),
            email: document.getElementById('adm-email').value.trim(),
            service: document.getElementById('adm-service').value.trim(),
            role: document.getElementById('adm-role').value
        };

        if (!uid || !data.nom || !data.prenom) {
            alert("Veuillez remplir l'UID, le Nom et le Prénom (Obligatoire)");
            return;
        }

        window.db.collection("users").doc(uid).set(data)
            .then(() => {
                this.log("Habilitation réussie pour : " + data.email);
                this.clearForm();
            })
            .catch(err => this.log("Erreur : " + err.message));
    },

    // Affiche le registre en temps réel
    loadUsers: function() {
        const container = document.getElementById('users-registry');
        window.db.collection("users").onSnapshot(snap => {
            container.innerHTML = "";
            snap.forEach(doc => {
                const u = doc.data();
                container.innerHTML += `
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group hover:border-blue-500 transition">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-blue-500">
                                ${u.prenom.charAt(0)}${u.nom.charAt(0)}
                            </div>
                            <div>
                                <p class="text-white font-bold text-sm">${u.prenom} ${u.nom}</p>
                                <p class="text-[10px] text-slate-500 uppercase tracking-widest">${u.service} • ${u.email}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="text-[9px] px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">${u.role}</span>
                            <button onclick="AdminApp.deleteUser('${doc.id}')" class="text-slate-600 hover:text-red-500 transition">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>`;
            });
        });
    },

    deleteUser: function(id) {
        if (confirm("Révoquer l'accès pour cet agent ?")) {
            window.db.collection("users").doc(id).delete();
        }
    },

    clearForm: function() {
        ['adm-uid', 'adm-prenom', 'adm-nom', 'adm-email', 'adm-service'].forEach(id => {
            document.getElementById(id).value = "";
        });
    }
};

// Remplit le formulaire pour modification
editUser: function(id) {
    window.db.collection("users").doc(id).get().then(doc => {
        if (doc.exists) {
            const u = doc.data();
            document.getElementById('adm-uid').value = id;
            document.getElementById('adm-prenom').value = u.prenom;
            document.getElementById('adm-nom').value = u.nom;
            document.getElementById('adm-email').value = u.email;
            document.getElementById('adm-service').value = u.service;
            document.getElementById('adm-role').value = u.role;
            
            this.log("Édition de l'agent : " + u.nom);
            // On scrolle vers le haut pour voir le formulaire
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
},

// Supprime un accès
deleteUser: function(id) {
    if (confirm("🚨 Voulez-vous vraiment révoquer l'accès de cet agent ?\nCette action est irréversible dans Firestore.")) {
        window.db.collection("users").doc(id).delete()
            .then(() => this.log("Accès révoqué pour l'UID : " + id))
            .catch(err => alert("Erreur suppression : " + err.message));
    }
},

AdminApp.init();
