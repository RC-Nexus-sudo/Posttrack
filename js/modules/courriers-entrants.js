/**
 * Module : Courriers Entrants
 * Gère l'affichage du tableau Bento et la saisie des plis reçus.
 */
var App = App || {};
App.modules = App.modules || {};
App.modules.entrants = {
    // Initialisation appelée par le Router
    init: function() {
        App.logger.log("Module Entrants : Initialisation du tableau...", "info");
        this.renderTable();
        this.fetchData();
    },
    // Construction de la structure (Titres des colonnes)
    renderTable: function() {
        const container = document.getElementById('entrants-content');
        if (!container) return;
        container.innerHTML = `
        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 border-b border-slate-100">
        <tr class="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">
        <th class="p-5">Référence</th> <!-- NOUVELLE COLONNE -->
        <th class="p-5">Date</th>
        <th class="p-5 text-center">Mode</th>
        <th class="p-5">Expéditeur & Type</th>
        <th class="p-5">Description</th>
        <th class="p-5">Destination</th>
        <th class="p-5">Encodé par</th>
        <th class="p-5">Modifié le</th>
        <th class="p-5 text-right">Actions</th>
        </tr>
        </thead>
        <tbody id="table-body-entrants" class="divide-y divide-slate-50">
        <tr><td colspan="9" class="p-10 text-center text-slate-300 italic">Connexion à 
        Firestore...</td></tr>
        </tbody>
        </table>
        </div>`;
    },
    // Helper pour les icônes 
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
    // Helper pour les couleurs 
    getModeStyle: function(mode) {
        const styles = {
            'Direct': 'bg-gray-100 text-gray-800',
            'Poste': 'bg-red-500 text-white',
            'Transporteur': 'bg-orange-500 text-white',
            'Huissiers': 'bg-gray-800 text-white',
            'Police': 'bg-blue-600 text-white'
        };
        return styles[mode] || 'bg-gray-100 text-gray-800';
    },
    getTypeStyle: function(type) {
        const styles = {
            'Simple': 'bg-gray-100 text-gray-800',
            'Prior': 'bg-yellow-400 text-black',
            'Recommandé': 'bg-red-500 text-white',
            'Recommandé AR': 'bg-red-700 text-white font-bold'
        };
        return styles[type] || 'bg-gray-100 text-gray-800';
    },

    /**
     * Récupère le prochain numéro de séquence via une transaction Firestore
     * et le formate sur 6 chiffres (ex: 000042).
     */
    getNextSequence: function() {
    const counterRef = window.db.collection("compteurs").doc("courriersEntrantsCompteur");

    // Utilisation d'une transaction pour garantir l'atomicité de l'incrémentation
    return window.db.runTransaction(function(transaction) {
        // Cette promesse lit le document actuel
        return transaction.get(counterRef).then(function(doc) {
            if (!doc.exists) {
                // Initialise si le document n'existe pas
                transaction.set(counterRef, { sequence: 1 });
                return "000001";
            }

            // Incrémente le compteur
            const newSequence = doc.data().sequence + 1;
            transaction.update(counterRef, { sequence: newSequence });

            // Formate le numéro sur 6 chiffres avec des zéros initiaux
            return String(newSequence).padStart(6, '0');
        });
    }).catch(error => {
        App.logger.log("Erreur transaction compteur: " + error, "error");
        // En cas d'échec critique, retournez quelque chose pour ne pas bloquer l'appli
        return null;
    });
        
    // Récupération des données et Rendu des lignes (MIS À JOUR)
    fetchData: function() {
        const tbody = document.getElementById('table-body-entrants');
        if (!tbody) return;
        window.db.collection("services").get().then(serviceSnap => {
            const serviceMap = {};
            serviceSnap.forEach(doc => serviceMap[doc.id] = doc.data().color);
            window.db.collection("courriers_entrants").orderBy("timestamp", "desc").onSnapshot(snap => {
                if (snap.empty) {
                    tbody.innerHTML = '<tr><td colspan="8" class="p-10 text-center text-slate-400 italic">Aucun pli enregistré.</td></tr>';
                    return;
                }
                let html = "";
                snap.forEach(doc => {
                    const mail = doc.data();
                    const date = mail.timestamp ? new Date(mail.timestamp.seconds * 1000).toLocaleDateString('fr-BE') : '...';
                    const color = serviceMap[mail.service] || '#cbd5e1';
                    const modeIcon = this.getModeIcon(mail.mode_reception);
                    const updateDate = mail.updatedAt ? new Date(mail.updatedAt.seconds * 1000).toLocaleDateString('fr-BE') : '-';
                    
                    html += `
                    <tr class="hover:bg-slate-50/80 transition group border-b border-slate-50">
                    <td class="p-4 text-sm font-bold text-blue-600">${mail.indicateur || 'N/A'}</td>
                    <td class="p-4 text-[10px] font-mono text-slate-400 uppercase">${date}</td>
                    <td class="p-4 text-center">
                    <div class="w-8 h-8 rounded-lg ${this.getModeStyle(mail.mode_reception)} flex items-center justify-center border border-slate-100 shadow-sm mx-auto">
                    <i class="fa-solid ${modeIcon} text-xs"></i>
                    </div>
                    </td>
                    <td class="p-4">
                    <p class="text-sm font-black text-slate-800 leading-tight">${mail.expediteur || 'Inconnu'}</p>
                    <p class="text-[10px] ${this.getTypeStyle(mail.type_lettre)} font-bold uppercase tracking-tighter rounded px-1 mt-1 inline-block">${mail.type_lettre || 'Simple'}</p>
                    </td>
                    <td class="p-4 text-sm text-slate-500 max-w-xs truncate font-medium">${mail.objet || 'Sans description'}</td>
                    <td class="p-4">
                    <span class="px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest"
                    style="background: ${color}10; border-color: ${color}; color: ${color}">
                    ${mail.service || 'N/A'}
                    </span>
                    </td>
                    <td class="p-4 text-[10px] text-slate-400">${mail.encodedBy || 'Système'}</td>
                    <td class="p-4 text-[10px] text-slate-400">${updateDate}</td>
                    <td class="p-4 text-right flex justify-end gap-2">
                    <button onclick="App.modules.entrants.edit('${doc.id}')" class="w-8 h-8 rounded-xl hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition flex items-center justify-center">
                        <i class="fa-solid fa-pencil text-xs"></i>
                    </button>
                    <button onclick="App.modules.entrants.delete('${doc.id}')" class="w-8 h-8 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition flex items-center justify-center">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                    </td>
                    </tr>`;
                });
                tbody.innerHTML = html;
            });
        });
    },
    // Ouverture du formulaire (Overlay)
    openForm: function(docId = null) {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = App.templates.entryForm();
        const saveButton = document.getElementById('save-mail-btn');
        if (docId) {
            App.logger.log(`Ouverture formulaire en mode édition pour ID: ${docId}`, "info");
            saveButton.innerText = "Mettre à jour le courrier";
            saveButton.setAttribute('data-edit-id', docId); 
            this.loadDataIntoForm(docId);
        } else {
            App.logger.log("Ouverture formulaire en mode ajout.", "info");
            saveButton.innerText = "Enregistrer le courrier";
            saveButton.removeAttribute('data-edit-id');
        }
        
        const select = document.getElementById('mail-dest-service');
        window.db.collection("services").get().then(snap => {
            select.innerHTML = '<option value="">-- Sélectionner le service --</option>';
            snap.forEach(doc => {
                select.innerHTML += `<option value="${doc.id}">${doc.id}</option>`;
            });
        });
        modal.classList.replace('hidden', 'flex');
    },

    // Sauvegarde Firestore (Simplifiée pour Cloud Function)
    async save() {
    const user = window.auth.currentUser;
    const saveButton = document.getElementById('save-mail-btn');
    const editId = saveButton.getAttribute('data-edit-id'); 

    const baseData = {
        mode_reception: document.getElementById('mail-mode').value,
        type_lettre: document.getElementById('mail-type').value,
        expediteur: document.getElementById('mail-sender').value.trim(),
        service: document.getElementById('mail-dest-service').value,
        objet: document.getElementById('mail-subject').value.trim(),
        statut: "Reçu",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(), 
        encodedBy: user ? (user.displayName || user.email) : "Anonyme",
    };
    
    if(!baseData.expediteur || !baseData.service || !baseData.objet) {
        alert("Veuillez remplir les champs obligatoires.");
        return;
    }

     try {
        if (editId) {
            // Mode mise à jour (inchangé)
            await window.db.collection("courriers_entrants").doc(editId).update(baseData);
            App.logger.log("✅Courrier mis à jour", "info");
            document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
        } else {
            // Mode ajout : Générer l'indicateur d'abord
            App.logger.log("Génération de l'indicateur unique...", "debug");
            // App.utils.getNewIndicator est la fonction utilitaire de la réponse précédente
            const indicateurValue = await App.utils.getNewIndicator(); 
            baseData.indicateur = indicateurValue; // <-- AJOUTEZ LE NOUVEAU CHAMP
            baseData.timestamp = firebase.firestore.FieldValue.serverTimestamp(); 
            
            await window.db.collection("courriers_entrants").add(baseData); //
            App.logger.log(`✅Courrier ${indicateurValue} enregistré`, "info");
            document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
        }
    } catch (error) {
        App.logger.log("Une erreur est survenue lors de la sauvegarde: " + error.message, "error");
        alert("Une erreur est survenue. Consultez la console de logs.");
    }
},
    // Suppression 
    delete: function(id) {
        if(confirm("Supprimer ce pli du registre ?")) {
            window.db.collection("courriers_entrants").doc(id).delete();
        }
    },
    // Modification (redirige vers openForm avec l'ID) - inchangé
    edit: function(id) {
        this.openForm(id);
    },
    // Fonction pour charger les données dans le formulaire 
    loadDataIntoForm: function(id) {
        window.db.collection("courriers_entrants").doc(id).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('mail-mode').value = data.mode_reception;
                document.getElementById('mail-type').value = data.type_lettre;
                document.getElementById('mail-sender').value = data.expediteur;
                document.getElementById('mail-subject').value = data.objet;
                setTimeout(() => {
                    document.getElementById('mail-dest-service').value = data.service;
                }, 300); 
            }
        });
    }
};
