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
  this.renderTable();
  this.fetchData();
 },
 // Construction de la structure (Titres des colonnes)
 renderTable: function() {
  var container = document.getElementById('entrants-content');
  if (!container) return;
  // Utilisation de FontAwesome 6 pour les icônes nécessaires à l'œil
  container.innerHTML = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com""")/>>' +
  '<div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">' +
  '<table class="w-full text-left border-collapse">' +
  '<thead class="bg-slate-50 border-b border-slate-100">' +
  '<tr class="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">' +
  '<th class="p-5">Indicateur</th>' +
  '<th class="p-5">Date</th>' +
  '<th class="p-5 text-center">Mode</th>' +
  '<th class="p-5">Expéditeur & Type</th>' +
  '<th class="p-5">Description</th>' +
  '<th class="p-5">Destination</th>' +
  '<th class="p-5">Encodé par</th>' +
  '<th class="p-5">Modifié le</th>' +
  '<th class="p-5 text-right">Actions</th>' +
  '</tr>' +
  '</thead>' +
  '<tbody id="table-body-entrants" class="divide-y divide-slate-50">' +
  '<tr><td colspan="9" class="p-10 text-center text-slate-300 italic">Connexion à Firestore...</td></tr>' +
  '</tbody>' +
  '</table>' +
  '</div>';
 },
 // Helper pour les icônes
 getModeIcon: function(mode) { /* ... inchangé ... */
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
 getModeStyle: function(mode) { /* ... inchangé ... */
  var styles = {
  'Direct': 'bg-gray-100 text-gray-800',
  'Poste': 'bg-red-500 text-white',
  'Transporteur': 'bg-orange-500 text-white',
  'Huissiers': 'bg-gray-800 text-white',
  'Police': 'bg-blue-600 text-white'
  };
  return styles[mode] || 'bg-gray-100 text-gray-800';
 },
 getTypeStyle: function(type) { /* ... inchangé ... */
  var styles = {
  'Simple': 'bg-gray-100 text-gray-800',
  'Prior': 'bg-yellow-400 text-black',
  'Recommandé': 'bg-red-500 text-white',
  'Recommandé AR': 'bg-red-700 text-white font-bold'
  };
  return styles[type] || 'bg-gray-100 text-gray-800';
 },
 
 // Récupération des données et Rendu des lignes (MIS À JOUR AVEC L'OEIL)
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
  var date = mail.timestamp ? new Date(mail.timestamp.seconds * 1000).toLocaleDateString('fr-BE') : '...';
  var color = serviceMap[mail.service] || '#cbd5e1';
  var modeIcon = this.getModeIcon(mail.mode_reception);
  var updateDate = mail.updatedAt ? new Date(mail.updatedAt.seconds * 1000).toLocaleDateString('fr-BE') : '-';
  
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

 // Helper pour visualiser le fichier Base64
 viewFile: function(base64Data, fileName) {
    // Crée un objet Blob à partir de la chaîne Base64 pour l'ouvrir dans un nouvel onglet
    // Note: window.atob et Blob supportent les navigateurs modernes
    var arr = base64Data.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr = bstr.charCodeAt(n);
    }
    var blob = new Blob([u8arr], {type: mime});
    var fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
 },
 
 // Ouverture du formulaire (Overlay)
 openForm: function(docId) { /* ... inchangé sauf l'appel à entryForm qui contient maintenant l'input file ... */
  docId = docId || null;
  var modal = document.getElementById('modal-overlay');
  var content = document.getElementById('modal-content');
  content.innerHTML = App.templates.entryForm(); // Utilise le template mis à jour avec le champ fichier
  var saveButton = document.getElementById('save-mail-btn');
  if (docId) { /* ... inchangé ... */
  App.logger.log("Ouverture formulaire en mode édition pour ID: " + docId, "info");
  saveButton.innerText = "Mettre à jour le courrier";
  saveButton.setAttribute('data-edit-id', docId);
  this.loadDataIntoForm(docId);
  } else { /* ... inchangé ... */
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

 // Sauvegarde Firestore (MISE À JOUR AVEC UPLOAD STORAGE)
 save: function() {
  var user = window.auth.currentUser;
  var saveButton = document.getElementById('save-mail-btn');
  var editId = saveButton.getAttribute('data-edit-id');
  var fileInput = document.getElementById('mail-file');
  var file = fileInput.files[0]; // Correction: prend le premier fichier

  var baseData = {
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
  
  var saveToFirestore = function(base64Data, fileName) {
    if (base64Data && fileName) {
        baseData.fileBase64 = base64Data; // Stocke la chaîne Base64
        baseData.fileName = fileName;
    }

    try {
        if (editId) {
            window.db.collection("courriers_entrants").doc(editId).update(baseData).then(function() {
                App.logger.log("✅Courrier mis à jour", "info");
                document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
                uploadProgress.classList.add('hidden');
            });
        } else {
            App.logger.log("Génération de l'indicateur unique...", "debug");
            App.utils.getNewIndicator().then(function(indicateurValue) {
                baseData.indicateur = indicateurValue;
                baseData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                window.db.collection("courriers_entrants").add(baseData).then(function() {
                    App.logger.log("✅Courrier " + indicateurValue + " enregistré", "info");
                    document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
                    uploadProgress.classList.add('hidden');
                });
            });
        }
    } catch (error) {
        App.logger.log("Une erreur est survenue lors de la sauvegarde: " + error.message, "error");
        alert("Une erreur est survenue. Consultez la console de logs.");
        uploadProgress.classList.add('hidden');
    }
};

// Logique de traitement (Choisissez Base64 OU Storage, ici Base64 selon votre dernier bloc)
if (file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        App.logger.log("Conversion du fichier en Base64...", "debug");
        saveToFirestore(event.target.result, file.name);
    };
    reader.onerror = function(error) {
        App.logger.log("Erreur de lecture de fichier: " + error, "error");
        saveToFirestore(null, null);
    };
    reader.readAsDataURL(file);
} else {
    saveToFirestore(null, null);
}

 // Logique de conversion Base64 si un fichier est sélectionné
  if (file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        App.logger.log("Conversion du fichier en Base64...", "debug");
        saveToFirestore(event.target.result, file.name); // Appelle la sauvegarde avec la donnée
    };
    reader.onerror = function(error) {
        App.logger.log("Erreur de lecture de fichier: " + error, "error");
        saveToFirestore(null, null);
    };
    reader.readAsDataURL(file); // Lance la lecture en Base64
  } else {
    saveToFirestore(null, null); // Pas de fichier, sauvegarde directe
  }
 },
 
 // Suppression
 delete: function(id) { /* ... inchangé ... */
  if(confirm("Supprimer ce pli du registre ?")) {
  window.db.collection("courriers_entrants").doc(id).delete();
  }
 },
 // Modification (redirige vers openForm avec l'ID) - inchangé
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
      // Vous pouvez ajouter un message ou un lien dans l'UI ici si vous le souhaitez pour l'édition
  }

  }
  });
 }
};

