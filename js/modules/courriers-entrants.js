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
                            <th class="p-4 font-bold">Réception</th>
                            <th class="p-4 font-bold">Expéditeur</th>
                            <th class="p-4 font-bold">Objet</th>
                            <th class="p-4 font-bold">Service Destinataire</th>
                            <th class="p-4 font-bold">Statut</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-entrants" class="divide-y divide-slate-50">
                        <tr><td colspan="5" class="p-10 text-center text-slate-300 italic">Connexion à la base de données...</td></tr>
                    </tbody>
                </table>
            </div>`;
    },

    // 3. Récupération des données et des couleurs de services
    fetchData: function() {
        const tbody = document.getElementById('table-body-entrants');
        if (!tbody) return;

        // Étape A : On récupère les services pour mapper les couleurs
        window.db.collection("services").get().then(serviceSnap => {
            const serviceMap = {};
            serviceSnap.forEach(doc => {
                serviceMap[doc.id] = doc.data().color;
            });

            // Étape B : On écoute les courriers en temps réel
            window.db.collection("courriers_entrants").orderBy("timestamp", "desc").onSnapshot(snap => {
                if (snap.empty) {
                    tbody.innerHTML = '<tr><td colspan="5" class="p-10 text-center text-slate-400">Aucun courrier enregistré.</td></tr>';
                    return;
                }

                let html = "";
                snap.forEach(doc => {
                    const mail = doc.data();
                    const date = mail.timestamp ? new Date(mail.timestamp.seconds * 1000).toLocaleDateString('fr-BE') : '...';
                    const color = serviceMap[mail.service] || '#cbd5e1';

                    html += `
                        <tr class="hover:bg-slate-50/80 transition group">
                            <td class="p-4 text-xs font-mono text-slate-400">${date}</td>
                            <td class="p-4 text-sm font-bold text-slate-700">${mail.expediteur}</td>
                            <td class="p-4 text-sm text-slate-500 max-w-xs truncate">${mail.objet}</td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-[10px] font-extrabold border" 
                                      style="background: ${color}15; border-color: ${color}; color: ${color}">
                                    ${mail.service}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase">
                                    <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span> ${mail.statut}
                                </div>
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
            expediteur: document.getElementById('mail-sender').value.trim(),
            service: document.getElementById('mail-dest-service').value,
            type: document.getElementById('mail-type').value,
            objet: document.getElementById('mail-subject').value.trim(),
            statut: "Reçu",
            agent: window.auth.currentUser.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if(!data.expediteur || !data.service || !data.objet) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        window.db.collection("courriers_entrants").add(data).then(() => {
            App.logger.log("✅ Courrier enregistré avec succès.", "info");
            document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
        }).catch(err => App.logger.log("Erreur : " + err.message, "error"));
    }
};
