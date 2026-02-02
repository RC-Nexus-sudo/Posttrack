/**
* Module d'Authentification - Gestion des accès institutionnels
*/
var App = App || {};
App.auth = {
 // 1. Initialisation (Appelé par app.js)
 init: function() {
  if (!window.auth) return;
  window.auth.onAuthStateChanged(user => {
   if (user) {
    // L'utilisateur est connecté. On charge son profil d'abord.
    this.loadUserProfile(user).then(() => {
        // --- NOUVELLE LOGIQUE : Charger les données des modules ICI ---
        // Une fois le profil chargé ET l'utilisateur authentifié, on déclenche les fetch data.
        if (App.modules.entrants && App.modules.entrants.fetchData) {
            App.logger.log("Authentification confirmée. Déclenchement de fetchData (entrants)...", "debug");
            App.modules.entrants.fetchData(); 
        }
        // Ajoutez ici les appels pour d'autres modules (ex: sortants) si nécessaire.
        // if (App.modules.sortants && App.modules.sortants.fetchData) { App.modules.sortants.fetchData(); }
        // --- FIN NOUVELLE LOGIQUE ---
    });
   } else {
    // L'utilisateur est déconnecté. Afficher l'interface invité.
    this.renderGuestUI();
   }
  });
 },
 
 // 2. Affichage du formulaire (inchangé)
 showLoginForm: function() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
    <div class="p-8">
    <h3 class="text-2xl font-bold text-slate-800 mb-2 text-center">Connexion SGC</h3>
    <p class="text-slate-500 text-center mb-8 text-sm">Identifiants institutionnels requis</p>
    <div class="space-y-4">
    <input type="email" id="login-email" placeholder="Email" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition">
    <input type="password" id="login-password" placeholder="Mot de passe" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition">
    <button onclick="App.auth.handleLogin()" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">Se connecter</button>
    </div>
    </div>`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
 },

 // 3. Logique de connexion (inchangé, mais appelle loadUserProfile qui gère maintenant le déclenchement)
 handleLogin: function() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    window.auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {
        App.logger.log("Connexion réussie : " + email, "info");
        document.getElementById('modal-overlay').classList.add('hidden');
        this.loadUserProfile(userCredential.user); // loadUserProfile gère la suite
    })
    .catch(error => {
        App.logger.log("Erreur : " + error.message, "error");
        alert("Erreur : " + error.message);
    });
 },

 // 4. Chargement du profil réel (Renvoie maintenant une Promesse)
 loadUserProfile: function(user) {
    // Renvoyer la promesse pour pouvoir chaîner les actions (le .then() dans init)
    return window.db.collection("users").doc(user.uid).get() 
    .then(doc => {
        if (doc.exists) {
            this.renderUserUI(doc.data());
        } else {
            App.logger.log("Avertissement : Profil Firestore introuvable pour cet UID. Utilisation profil invité.", "error");
            this.renderUserUI({ nom: "Admin", prenom: "Principal", service: "IT", role: "admin" });
        }
    })
    .catch(err => App.logger.log("Erreur Firestore : " + err.message, "error"));
 },

 // 5. Mise à jour de la Front Bar (inchangé)
 renderUserUI: function(data) {
    document.getElementById('user-profile-summary').innerHTML = `
    <div class="text-right hidden sm:block">
    <p class="font-bold text-slate-800 text-sm leading-tight">${data.prenom} ${data.nom}</p>
    <p class="text-[10px] uppercase tracking-wider text-blue-600 font-bold">${data.service}</p>
    </div>
    <div class="w-10 h-10 bg-blue-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
    ${data.prenom.charAt(0)}${data.nom.charAt(0)}
    </div>
    <button onclick="App.auth.logout()" class="ml-2 text-slate-300 hover:text-red-500 transition"><i class="fa-solid fa-power-off"></i></button>`;
    
    document.getElementById('auth-zone').innerHTML = `<span class="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">Session Active</span>`;
 },

 // Interface invité (inchangé)
 renderGuestUI: function() {
    document.getElementById('user-profile-summary').innerHTML = "";
    document.getElementById('auth-zone').innerHTML = `
    <button onclick="App.auth.showLoginForm()" class="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">Connexion</button>`;
 },

 // Déconnexion (inchangé)
 logout: function() {
    window.auth.signOut().then(() => {
    App.logger.log("Session fermée", "info");
    window.location.reload();
    });
 }
};

