/**
 * Module : Courriers Entrants
 * Chemin : js/modules/courriers-entrants.js
 */
var App = App || {};
App.modules = App.modules || {};

App.modules.entrants = {
    init: function() {
        // Cette fonction est appelée par App.router.go('entrants')
        const viewContainer = document.getElementById('entrants-content');
        if (viewContainer) {
            this.renderTable();
            this.fetchData();
        }
    },

    renderTable: function() {
        const container = document.getElementById('entrants-content');
        container.innerHTML = `
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400">
                        <tr>
                            <th class="p-4">Expéditeur</th>
                            <th class="p-4">Objet</th>
                            <th class="p-4">Service</th>
                            <th class="p-4">Date</th>
                            <th class="p-4">Statut</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-entrants" class="text-sm divide-y divide-slate-50">
                        <tr><td colspan="5" class="p-10 text-center italic">Chargement...</td></tr>
                    </tbody>
                </table>
            </div>`;
    },

    // ... (Le reste des fonctions fetchData, openForm et save reste identique)
};

// 3. Récupération des données en temps réel (Firestore)
    fetchData: function() {
        const tbody = document.getElementById('table-body-entrants');
        
        // On récupère d'abord les services pour avoir les couleurs
        window.db.collection("services").get().then(serviceSnap => {
            const colors = {};
            serviceSnap.forEach(s => colors[s.id] = s.data().color);

            // On écoute les courriers
            window.db.collection("courriers_entrants").orderBy("timestamp", "desc").onSnapshot(snap => {
                if (snap.empty) {
                    tbody.innerHTML = '<tr><td colspan="5" class="p-10 text-center text-slate-400 italic">Aucun courrier enregistré.</td></tr>';
                    return;
                }

                tbody.innerHTML = "";
                snap.forEach(doc => {
                    const mail = doc.data();
                    const dateStr = mail.timestamp ? new Date(mail.timestamp.seconds * 1000).toLocaleDateString('fr-BE') : '...';
                    const serviceColor = colors[mail.service] || '#cbd5e1';

                    tbody.innerHTML += `
                        <tr class="hover:bg-slate-50 transition group">
                            <td class="p-4 text-xs font-mono text-slate-500">${dateStr}</td>
                            <td class="p-4 text-sm font-bold text-slate-700">${mail.expediteur}</td>
                            <td class="p-4 text-sm text-slate-600">${mail.objet}</td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-[10px] font-extrabold border" 
                                      style="background: ${serviceColor}15; border-color: ${serviceColor}; color: ${serviceColor}">
                                    ${mail.service}
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase">
                                    <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span> ${mail.statut}
                                </span>
                            </td>
                        </tr>
                    `;
                });
            });
        });
    },

    // 4. Ouverture du formulaire (Injecté via Templates)
    openForm: function() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = App.templates.entryForm();
        
        // Auto-remplissage des services dans le select du formulaire
        const select = document.getElementById('mail-dest-service');
        window.db.collection("services").get().then(snap => {
            snap.forEach(doc => {
                select.innerHTML += `<option value="${doc.id}">${doc.id}</option>`;
            });
        });

        modal.classList.replace('hidden', 'flex');
    },

    // 5. Sauvegarde
    save: function() {
        const data = {
            expediteur: document.getElementById('mail-sender').value.trim(),
            service: document.getElementById('mail-dest-service').value,
            type: document.getElementById('mail-type').value,
            objet: document.getElementById('mail-subject').value.trim(),
            statut: "Reçu",
            agent: window.auth.currentUser.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if(!data.expediteur || !data.service) {
            alert("Champs obligatoires manquants.");
            return;
        }

        window.db.collection("courriers_entrants").add(data).then(() => {
            App.logger.log("✅ Courrier enregistré.", "info");
            document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
        }).catch(err => App.logger.log("Erreur : " + err.message, "error"));
    }
};
