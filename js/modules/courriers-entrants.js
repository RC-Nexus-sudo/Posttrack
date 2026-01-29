/**
 * Module : Courriers Entrants
 * Gère l'affichage du tableau Bento et la saisie des plis reçus.
 */
var App = App || {};
App.modules = App.modules || {};

App.modules.entrants = {
    // 1. Point d'entrée (appelé par le Router)
    init: function() {
        App.logger.log("Module Entrants : Initialisation du tableau...", "info");
        this.renderTable();
        this.fetchData();
    },

    // 2. Construction de la structure du tableau
    renderTable: function() {
        const container = document.getElementById('entrants-content');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr class="text-[10px] uppercase tracking-widest text-slate-400">
                            <th class="p-4 font-bold">Date</th>
                            <th class="p-4 font-bold">Mode</th>
                            <th class="p-4 font-bold">Expéditeur</th>
                            <th class="p-4 font-bold">Service Destinataire</th>
                            <th class="p-4 font-bold">Description</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-entrants" class="divide-y divide-slate-50">
                        <tr><td colspan="5" class="p-10 text-center text-slate-300 italic">Connexion à la base de données...</td></tr>
                    </tbody>
                </table>
            </div>`;
    },

    // Helper pour les icônes de réception
    getModeIcon: function(mode) {
        const icons = {
            'Direct': 'fa-hand-holding-dots text-slate-400',
            'Poste': 'fa-envelope-open text-blue-400',
            'Transporteur': 'fa-truck-fast text-amber-500',
            'Huissiers': 'fa-scale-balanced text-purple-500',
            'Police': 'fa-shield-halved text-rose-500'
        };
        return icons[mode] || 'fa-file text-slate-300';
    },

    fetchData: function() {
        const tbody = document.getElementById('table-body-entrants');
        if (!tbody) return;

        window.db.collection("services").get().then(serviceSnap => {
            const serviceMap = {};
            serviceSnap.forEach(doc => serviceMap[doc.id] = doc.data().color);

            window.db.collection("courriers_entrants").orderBy("timestamp", "desc").onSnapshot(snap => {
                if (snap.empty) {
                    tbody.innerHTML = '<tr><td colspan="6" class="p-10 text-center text-slate-400 italic">Aucun pli enregistré.</td></tr>';
                    return;
                }

                let html = "";
                snap.forEach(doc => {
                    const mail = doc.data();
                    const date = mail.timestamp ? new Date(mail.timestamp.seconds * 1000).toLocaleDateString('fr-BE') : '...';
                    const color = serviceMap[mail.service] || '#cbd5e1';
                    const modeIcon = this.getModeIcon(mail.mode_reception);

                    html += `
                        <tr class="hover:bg-slate-50/80 transition group border-b border-slate-50">
                            <td class="p-4 text-[10px] font-mono text-slate-400 uppercase">${date}</td>
                            <td class="p-4 text-center">
                                <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition shadow-sm" title="${mail.mode_reception}">
                                    <i class="fa-solid ${modeIcon} text-xs"></i>
                                </div>
                            </td>
                            <td class="p-4">
                                <p class="text-sm font-black text-slate-800 leading-tight">${mail.expediteur}</p>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">${mail.type_lettre}</p>
                            </td>
                            <td class="p-4 text-sm text-slate-500 max-w-xs truncate font-medium">${mail.objet}</td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest" 
                                      style="background: ${color}10; border-color: ${color}; color: ${color}">
                                    ${mail.service}
                                </span>
                            </td>
                            <td class="p-4 text-right">
                                <button onclick="App.modules.entrants.delete('${doc.id}')" class="w-8 h-8 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition flex items-center justify-center ml-auto">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>
                            </td>
                        </tr>`;
                });
                tbody.innerHTML = html;
            });
        });
    },

    // 4. Ouverture du formulaire (Injecté dans la Modal)
    openForm: function() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        // On utilise un template dédié
        content.innerHTML = App.templates.entryForm();
        
        // Remplissage du Select des services
        const select = document.getElementById('mail-dest-service');
        window.db.collection("services").get().then(snap => {
            select.innerHTML = '<option value="">-- Sélectionner --</option>';
            snap.forEach(doc => {
                select.innerHTML += `<option value="${doc.id}">${doc.id}</option>`;
            });
        });

        modal.classList.replace('hidden', 'flex');
    },

    // 5. Sauvegarde Firestore
    save: function() {
    const data = {
        mode_reception: document.getElementById('mail-mode').value,
        type_lettre: document.getElementById('mail-type').value,
        expediteur: document.getElementById('mail-sender').value.trim(),
        service: document.getElementById('mail-dest-service').value,
        objet: document.getElementById('mail-subject').value.trim(),
        statut: "Reçu",
        agent_nom: window.auth.currentUser.email, // On trace qui a fait l'encodage
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Validation
    if(!data.expediteur || !data.service || !data.objet) {
        alert("Les champs Expéditeur, Service et Description sont obligatoires.");
        return;
    }

    window.db.collection("courriers_entrants").add(data)
        .then(() => {
            App.logger.log(`✅ Courrier de [${data.expediteur}] enregistré via [${data.mode_reception}]`, "info");
            document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
        })
        .catch(err => App.logger.log("Erreur Firestore : " + err.message, "error"));
}
};
