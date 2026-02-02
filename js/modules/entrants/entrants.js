/*
* Module : Courriers Entrants
* Gère l'affichage du tableau Bento et la saisie des plis reçus.
*/
var App = App || {};
App.modules = App.modules || {};
App.modules.entrants = {
    // Initialisation appelée par le Router
    init: function() {
        App.logger.log("Module Entrants : Initialisation du tableau...", "info");
        this.fetchData();
    },

    // Helper pour les icônes
    getModeIcon: function(mode) {
        var icons = {
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
        var styles = {
            'Direct': 'bg-gray-100 text-gray-800',
            'Poste': 'bg-red-500 text-white',
            'Transporteur': 'bg-orange-500 text-white',
            'Huissiers': 'bg-gray-800 text-white',
            'Police': 'bg-blue-600 text-white'
        };
        return styles[mode] || 'bg-gray-100 text-gray-800';
    },

    getTypeStyle: function(type) {
        var styles = {
            'Simple': 'bg-gray-100 text-gray-800',
            'Prior': 'bg-yellow-400 text-black',
            'Recommandé': 'bg-red-500 text-white',
            'Recommandé AR': 'bg-red-700 text-white font-bold'
        };
        return styles[type] || 'bg-gray-100 text-gray-800';
    },

    // Récupération des données et Rendu des lignes
    fetchData: function() {
        var tbody = document.getElementById('table-body-entrants');
        if (!tbody) return;
        window.db.collection("services").get().then(function(serviceSnap) {
            var serviceMap = {};
            serviceSnap.forEach(function(doc) { serviceMap[doc.id] = doc.data().color; });
            
            // Écouteur en temps réel sur la collection principale
            window.db.collection("courriers_entrants").orderBy("timestamp", "desc").onSnapshot(function(snap) {
                if (snap.empty) {
                    tbody.innerHTML = '<tr><td colspan="9" class="p-10 text-center text-slate-400 italic">Aucun pli enregistré.</td></tr>';
                    return;
                }
                var html = "";
                snap.forEach(function(doc) {
                    var mail = doc.data();
                    var dateObj = App.utils.convertFirestoreTimestampToDate(mail.timestamp);
                    var date = 'N/A'; // Texte à afficher par défaut

                        if (dateObj && !isNaN(dateObj.getTime())) {
                        date = dateObj.toLocaleDateString('fr-BE');
                        }
                    var color = serviceMap[mail.service] || '#cbd5e1';
                            // Assurez-vous que le champ utilisé ici est 'mode_reception'
                    var modeIcon = this.getModeIcon(mail.mode_reception); 
                    var updatedAtObj = App.utils.convertFirestoreTimestampToDate(mail.updatedAt);
                    var updateDate = '-'; // Valeur par défaut

                        if (updatedAtObj && !isNaN(updatedAtObj.getTime())) {
                            updateDate = updatedAtObj.toLocaleDateString('fr-BE');
                            }
                    
                    html += '<tr class="hover:bg-slate-50/80 transition group border-b border-slate-50">';
                    html += '<td class="p-4 text-sm font-bold text-blue-600">' + (mail.indicateur || 'N/A') + '</td>';
                    html += '<td class="p-4 text-[10px] font-mono text-slate-400 uppercase">' + date + '</td>';
                    html += '<td class="p-4 text-center">' +
                        '<div class="w-8 h-8 rounded-lg ' + this.getModeStyle(mail.mode_reception) + ' flex items-center justify-center border border-slate-100 shadow-sm mx-auto">' +
                            '<i class="fa-solid ' + modeIcon + ' text-xs"></i>' +
                        '</div>' +
                    '</td>';
                    html += '<td class="p-4">';
                    html += '<p class="text-sm font-black text-slate-800 leading-tight">' + (mail.expediteur || 'Inconnu') + '</p>';
                    html += '<p class="text-[10px] ' + this.getTypeStyle(mail.type_lettre) + ' font-bold uppercase tracking-tighter rounded px-1 mt-1 inline-block">' + (mail.type_lettre || 'Simple') + '</p>';
                    html += '</td>';
                    html += '<td class="p-4 text-sm text-slate-500 max-w-xs truncate font-medium">' + (mail.objet || 'Sans description') + '</td>';
                    html += '<td class="p-4">';
                    html += '<span class="px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest" style="background: ' + color + '10; border-color: ' + color + '; color: ' + color + '">';
                    html += (mail.service || 'N/A') + '</span>';
                    html += '</td>';
                    html += '<td class="p-4 text-[10px] text-slate-400">' + (mail.encodedBy || 'Système') + '</td>';
                    html += '<td class="p-4 text-[10px] text-slate-400">' + updateDate + '</td>';
                    html += '<td class="p-4 text-right flex justify-end gap-2">';
                    
                    // --- NOUVEAUTÉ : AJOUT DU BOUTON OEIL POUR FICHIER JOINT ---
                    if (mail.fileBase64) { 
                        // Appel de la fonction viewFile intégrée au module
                        html += '<button onclick="App.modules.entrants.viewFile(\'' + mail.fileBase64 + '\', \'' + mail.fileName + '\')" class="w-8 h-8 rounded-xl hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition flex items-center justify-center" title="Voir le document">';
                        html += '<i class="fa-solid fa-eye text-xs"></i>';
                        html += '</button>';
                    }
                    // --- FIN AJOUT ---
                    html += '<button onclick="App.modules.entrants.edit(\'' + doc.id + '\')" class="w-8 h-8 rounded-xl hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition flex items-center justify-center">';
                    html += '<i class="fa-solid fa-pencil text-xs"></i>';
                    html += '</button>';
                    html += '<button onclick="App.modules.entrants.delete(\'' + doc.id + '\')" class="w-8 h-8 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition flex items-center justify-center">';
                    html += '<i class="fa-solid fa-trash-can text-xs"></i>';
                    html += '</button>';
                    html += '</td>';
                    html += '</tr>';
                }.bind(this)); // Ajout de .bind(this) pour conserver le contexte 'this' dans la boucle
                tbody.innerHTML = html;
            }.bind(this)); // Ajout de .bind(this) pour conserver le contexte 'this' dans onSnapshot
        }.bind(this)); // Ajout de .bind(this) pour conserver le contexte 'this' dans le premier then
    },

    // Helper pour visualiser le fichier Base64 (Utilise un BLOB pour l'affichage)
    viewFile: function(base64Data, fileName) {
    if (!base64Data) {
        alert("Aucun fichier valide n'est attaché.");
        return;
    }
    
    // 1. Extraire le type MIME et les données brutes
    var parts = base64Data.split(';base64,');
    var mimeType = parts[0].split(':')[1];
    var rawData = window.atob(parts[1]);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    // 2. Créer un Blob à partir des données binaires
    var blob = new Blob([outputArray], { type: mimeType });
    
    // 3. Créer une URL d'objet temporaire
    var objectUrl = URL.createObjectURL(blob);

    // 4. Ouvrir cette URL d'objet (ce qui est autorisé par les navigateurs)
    window.open(objectUrl, '_blank');
},

    // Ouverture du formulaire (Overlay)
    openForm: function(docId) { 
        docId = docId || null;
        var modal = document.getElementById('modal-overlay');
        var content = document.getElementById('modal-content');
        content.innerHTML = App.templates.entryForm(); // Utilise le template mis à jour avec le champ fichier
        var saveButton = document.getElementById('save-mail-btn');
        if (docId) { 
            App.logger.log("Ouverture formulaire en mode édition pour ID: " + docId, "info");
            saveButton.innerText = "Mettre à jour le courrier";
            saveButton.setAttribute('data-edit-id', docId);
            this.loadDataIntoForm(docId);
        } else { 
            App.logger.log("Ouverture formulaire en mode ajout.", "info");
            saveButton.innerText = "Enregistrer le courrier";
            saveButton.removeAttribute('data-edit-id');
        }
        var select = document.getElementById('mail-dest-service');
        window.db.collection("services").get().then(function(snap) {
            select.innerHTML = '<option value="">-- Sélectionner le service --</option>';
            snap.forEach(function(doc) {
                select.innerHTML += '<option value="' + doc.id + '">' + doc.id + '</option>';
            });
        });
        modal.classList.replace('hidden', 'flex');
    },

    // Sauvegarde Firestore (MISE À JOUR AVEC LOGIQUE ANTI-DOUBLON ET BASE64)
    save: function() {
        var user = window.auth.currentUser;
        var saveButton = document.getElementById('save-mail-btn');
        var editId = saveButton.getAttribute('data-edit-id');
        var fileInput = document.getElementById('mail-file');
        var file = fileInput.files[0]; // Prend le premier fichier
        
        // baseData est la structure de base, elle sera copiée avant envoi
        var baseData = {
            mode_reception: document.getElementById('mail-mode').value,
            type_lettre: document.getElementById('mail-type').value,
            expediteur: document.getElementById('mail-sender').value.trim(),
            service: document.getElementById('mail-dest-service').value,
            objet: document.getElementById('mail-subject').value.trim(),
            statut: "Reçu",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            encodedBy: user ? (user.displayName || user.email) : "Anonyme",
            fileName: null,
            fileBase64: null
        };

        if(!baseData.expediteur || !baseData.service || !baseData.objet) {
            alert("Veuillez remplir les champs obligatoires.");
            return;
        }
        
        // --- FONCTIONS INTERNES À SAVE ---
        var finaliserAction = function() {
            document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
            if(typeof uploadProgress !== 'undefined') uploadProgress.classList.add('hidden');
            // Nettoyage crucial pour éviter les doublons/résidus
            document.getElementById('mail-file').value = ""; 
        };
        
        var saveToFirestore = function(base64Data, fileName) {
            // CRUCIAL : Copie profonde pour éviter les références et les doublons
            var dataToSend = Object.assign({}, baseData); 

            if (base64Data && fileName) {
                dataToSend.fileBase64 = base64Data;
                dataToSend.fileName = fileName;
            }

            try {
                if (editId) {
                    window.db.collection("courriers_entrants").doc(editId).update(dataToSend).then(function() {
                        App.logger.log("✅ Courrier mis à jour", "info");
                        finaliserAction();
                    });
                } else {
                    App.logger.log("Génération de l'indicateur unique...", "debug");
                    App.utils.getNewIndicator().then(function(indicateurValue) {
                        dataToSend.indicateur = indicateurValue;
                        dataToSend.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                        window.db.collection("courriers_entrants").add(dataToSend).then(function() {
                            App.logger.log("✅ Courrier " + indicateurValue + " enregistré", "info");
                            finaliserAction();
                        });
                    });
                }
            } catch (error) {
                App.logger.log("Erreur Firestore: " + error.message, "error");
                alert("Erreur lors de la sauvegarde.");
                if(typeof uploadProgress !== 'undefined') uploadProgress.classList.add('hidden');
            }
        };
        
        // --- LOGIQUE DE DÉCLENCHEMENT UNIQUE (Base64) ---
        // Anciens blocs de déclenchement dans le PDF ont été supprimés et remplacés par ceci
        if (file) {
            var reader = new FileReader();
            if(typeof uploadProgress !== 'undefined') uploadProgress.classList.remove('hidden');

            reader.onload = function(event) {
                App.logger.log("Conversion Base64 terminée, envoi vers Firestore...", "debug");
                saveToFirestore(event.target.result, file.name);
            };
            reader.onerror = function(error) {
                App.logger.log("Erreur de lecture du fichier: " + error, "error");
                saveToFirestore(null, null);
            };
            reader.readAsDataURL(file);
        } else {
            saveToFirestore(null, null);
        }
        // --- FIN LOGIQUE UNIQUE ---

    }, // Fin de la fonction save

    // Suppression
    delete: function(id) {
        if(confirm("Supprimer ce pli du registre ?")) {
            window.db.collection("courriers_entrants").doc(id).delete();
        }
    },

    // Modification (redirige vers openForm avec l'ID)
    edit: function(id) {
        this.openForm(id);
    },

    // Fonction pour charger les données dans le formulaire (Mise à jour pour fichier)
    loadDataIntoForm: function(id) {
        window.db.collection("courriers_entrants").doc(id).get().then(function(doc) {
            if (doc.exists) {
                var data = doc.data();
                document.getElementById('mail-mode').value = data.mode_reception;
                document.getElementById('mail-type').value = data.type_lettre;
                document.getElementById('mail-sender').value = data.expediteur;
                document.getElementById('mail-subject').value = data.objet;
                setTimeout(function() {
                    document.getElementById('mail-dest-service').value = data.service;
                }, 300); 
                // Indication visuelle si un fichier est déjà attaché
                if (data.fileName) {
                    App.logger.log("Fichier existant: " + data.fileName, 'info');
                }
            }
        });
    }
};
