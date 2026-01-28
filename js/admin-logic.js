/**
 * Admin Logic - Gestion du Registre des Habilitations
 */
const AdminApp = {
    init: function() {
        console.log("Admin Logic Initialized");
        this.loadRegistry();
    },

    // 1. Enregistrer les informations d'un agent créé dans la console
    saveUserPermissions: function() {
        const uid = document.getElementById('adm-uid').value; // Ajoutez un champ UID dans admin.html
        const nom = document.getElementById('adm-nom').value;
        const email = document.getElementById('adm-email').value;
        const role = document.getElementById('adm-role').value;
        const service = document.getElementById('adm-service').value;

        if(!uid || !nom) {
            alert("L'UID et le Nom sont obligatoires");
            return;
        }

        window.db.collection("users").doc(uid).set({
            nom: nom,
            email: email,
            role: role,
            service: service,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert("Habilitation enregistrée avec succès !");
            this.clearForm();
        })
        .catch(error => console.error("Erreur : ", error));
    },

    // 2. Lire la liste des agents habilités
    loadRegistry: function() {
        const container = document.getElementById('users-registry');
        window.db.collection("users").onSnapshot(snapshot => {
            container.innerHTML = "";
            snapshot.forEach(doc => {
                const user = doc.data();
                container.innerHTML += `
                    <div class="flex justify-between items-center bg-slate-700 p-4 rounded-2xl mb-2 border border-slate-600">
                        <div>
                            <p class="text-white font-bold">${user.nom} <span class="text-xs font-normal text-slate-400">(${user.email})</span></p>
                            <p class="text-xs text-blue-400 uppercase tracking-widest">${user.service}</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="text-[10px] bg-slate-900 px-3 py-1 rounded-full text-white border border-slate-500">${user.role}</span>
                            <button onclick="AdminApp.deleteAccess('${doc.id}')" class="text-red-400 hover:text-red-600">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        });
    },

    deleteAccess: function(uid) {
        if(confirm("Supprimer définitivement l'accès à cet agent ?")) {
            window.db.collection("users").doc(uid).delete();
        }
    },

    clearForm: function() {
        ['adm-uid', 'adm-nom', 'adm-email', 'adm-service'].forEach(id => {
            document.getElementById(id).value = "";
        });
    }
};

AdminApp.init();
