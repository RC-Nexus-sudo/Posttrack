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
 container.innerHTML = '\
 <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">\
 <table class="w-full text-left border-collapse">\
 <thead class="bg-slate-50 border-b border-slate-100">\
 <tr class="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">\
 <th class="p-5">Indicateur</th> <!-- NOUVELLE COLONNE -->\
 <th class="p-5">Date</th>\
 <th class="p-5 text-center">Mode</th>\
 <th class="p-5">Expéditeur & Type</th>\
 <th class="p-5">Description</th>\
 <th class="p-5">Destination</th>\
 <th class="p-5">Encodé par</th>\
 <th class="p-5">Modifié le</th>\
 <th class="p-5 text-right">Actions</th>\
 </tr>\
 </thead>\
 <tbody id="table-body-entrants" class="divide-y divide-slate-50">\
 <tr><td colspan="9" class="p-10 text-center text-slate-300 italic">Connexion à \
 Firestore...</td></tr>\
 </tbody>\
 </table>\
 </div>';
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
// Récupération des données et Rendu des lignes (MIS À JOUR AVEC INDICATEUR)
fetchData: function() {
 var tbody = document.getElementById('table-body-entrants');
 if (!tbody) return;
 window.db.collection("services").get().then(function(serviceSnap) {
  var serviceMap = {};
  serviceSnap.forEach(function(doc) { serviceMap[doc.id] = doc.data().color; });
  window.db.collection("services").get().then(function(serviceSnap) {
   var serviceMap = {};
   serviceSnap.forEach(function(doc) { serviceMap[doc.id] = doc.data().color; });
   window.db.collection("courriers_entrants").orderBy("timestamp", "desc").onSnapshot(function(snap) { 
    if (snap.empty) {
     tbody.innerHTML = '<tr><td colspan="9" class="p-10 text-center text-slate-400 italic">Aucun pli \
 enregistré.</td></tr>';
     return;
    }
    var html = "";
    snap.forEach(function(doc) {
     var mail = doc.data();
     var date = mail.timestamp ? new Date(mail.timestamp.seconds * 1000).toLocaleDateString('fr-BE') : '...';
     var color = serviceMap[mail.service] || '#cbd5e1';
     var modeIcon = this.getModeIcon(mail.mode_reception);
     var updateDate = mail.updatedAt ? new Date(mail.updatedAt.seconds * 1000).toLocaleDateString('fr-BE') : '-';
     
     // Remplacement des template literals par de la concaténation de chaînes ES5
     html += '<tr class="hover:bg-slate-50/80 transition group border-b border-slate-50">\
 <td class="p-4 text-sm font-bold text-blue-600">' + (mail.indicateur || 'N/A') + '</td> <!-- AFFICHAGE INDICATEUR -->\
 <td class="p-4 text-[10px] font-mono text-slate-400 uppercase">' + date + '</td>\
 <td class="p-4 text-center">\
 <div class="w-8 h-8 rounded-lg ' + this.getModeStyle(mail.mode_reception) + ' flex items-center justify-center border border-slate-100 shadow-sm mx-auto">\
 <i class="fa-solid ' + modeIcon + ' text-xs"></i>\
 </div>\
 </td>\
 <td class="p-4">\
 <p class="text-sm font-black text-slate-800 leading-tight">' + (mail.expediteur || 'Inconnu') + '</p>\
 <p class="text-[10px] ' + this.getTypeStyle(mail.type_lettre) + ' font-bold uppercase tracking-tighter rounded px-1 mt-1 inline-block">' + (mail.type_lettre || 'Simple') + '</p>\
 </td>\
 <td class="p-4 text-sm text-slate-500 max-w-xs truncate font-medium">' + (mail.objet || 'Sans description') + '</td>\
 <td class="p-4">\
 <span class="px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest"\
 style="background: ' + color + '10; border-color: ' + color + '; color: ' + color + '">\
 ' + (mail.service || 'N/A') + '\
 </span>\
 </td>\
 <td class="p-4 text-[10px] text-slate-400">' + (mail.encodedBy || 'Système') + '</td>\
 <td class="p-4 text-[10px] text-slate-400">' + updateDate + '</td>\
 <td class="p-4 text-right flex justify-end gap-2">\
 <button onclick="App.modules.entrants.edit(\'' + doc.id + '\')" class="w-8 h-8 rounded-xl hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition flex items-center justify-center">\
 <i class="fa-solid fa-pencil text-xs"></i>\
 </button>\
 <button onclick="App.modules.entrants.delete(\'' + doc.id + '\')" class="w-8 h-8 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition flex items-center justify-center">\
 <i class="fa-solid fa-trash-can text-xs"></i>\
 </button>\
 </td>\
 </tr>';
    }.bind(this)); // Ajout de .bind(this) pour conserver le contexte 'this' dans la boucle
    tbody.innerHTML = html;
   }.bind(this)); // Ajout de .bind(this) pour conserver le contexte 'this' dans onSnapshot
  }.bind(this)); // Ajout de .bind(this) pour conserver le contexte 'this' dans le second then
 }.bind(this)); // Ajout de .bind(this) pour conserver le contexte 'this' dans le premier then
},
// Ouverture du formulaire (Overlay)
openForm: function(docId) {
  docId = docId || null; // Correction ES5 pour le paramètre par défaut
  var modal = document.getElementById('modal-overlay');
  var content = document.getElementById('modal-content');
  content.innerHTML = App.templates.entryForm();
  var saveButton = document.getElementById('save-mail-btn');
  if (docId) {
   // Remplacement du template literal
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
    // Remplacement du template literal
    select.innerHTML += '<option value="' + doc.id + '">' + doc.id + '</option>';
   });
  });
  modal.classList.replace('hidden', 'flex');
},
// Sauvegarde Firestore (Simplifiée pour Cloud Function et corrigée)
save: function() { // Suppression de 'async'
 var user = window.auth.currentUser;
 var saveButton = document.getElementById('save-mail-btn');
 var editId = saveButton.getAttribute('data-edit-id'); 
 // Utilisation unique de baseData
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
 try {
  if (editId) {
   // Mode mise à jour (inchangé)
   // Remplacement de await par .then()
   window.db.collection("courriers_entrants").doc(editId).update(baseData).then(function() {
    App.logger.log("✅Courrier mis à jour", "info");
    document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
   });
  } else {
   // Mode ajout : Générer l'indicateur d'abord
   App.logger.log("Génération de l'indicateur unique...", "debug");
   // Remplacement de await par .then()
   App.utils.getNewIndicator().then(function(indicateurValue) {
    baseData.indicateur = indicateurValue; // AJOUT DU NOUVEAU CHAMP DANS baseData
    baseData.timestamp = firebase.firestore.FieldValue.serverTimestamp(); 
    // Remplacement de await par .then()
    window.db.collection("courriers_entrants").add(baseData).then(function() {
     // Remplacement du template literal
     App.logger.log("✅Courrier " + indicateurValue + " enregistré", "info");
     document.getElementById('modal-overlay').classList.replace('flex', 'hidden');
    });
   });
  }
 } catch (error) {
  // Remplacement du template literal
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
  }
 });
}
};


