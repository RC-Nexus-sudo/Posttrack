/**
 * Module d'Authentification - Gestion des accès institutionnels
 */
var App = App || {};

App.auth = {
    // Ouvre la fenêtre de connexion (Overlay)
    showLoginForm: function() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <div class="p-8">
                <h3 class="text-2xl font-bold text-slate-800 mb-2 text-center">Connexion SGC</h3>
                <p class="text-slate-500 text-center mb-8 text-sm">Veuillez entrer vos identifiants institutionnels</p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-400 mb-1 ml-1">Email</label>
                        <input type="email" id="login-email" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase text-slate-400 mb-1 ml-1">Mot de passe</label>
                        <input type="password" id="login-password" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition">
                    </div>
                    <button onclick="App.auth.handleLogin()" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        Se connecter
                    </button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    handleLogin: function() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        window.auth.signInWithEmailAndPassword(email, pass)
            .then((userCredential) => {
                App.logger.log("Utilisateur connecté : " + email, "info");
                document.getElementById('modal-overlay').classList.add('hidden');
                this.updateUI(userCredential.user);
            })
            .catch((error) => {
                App.logger.log("Échec connexion : " + error.message, "error");
                alert("Identifiants incorrects.");
            });
    },

    // Met à jour la Front Bar avec les infos utilisateur
    updateUI: function(user) {
        if (user) {
            const frontBar = document.getElementById('user-profile-summary');
            // Simulation des infos département (à tirer de Firestore normalement)
            frontBar.innerHTML = `
                <div class="text-right">
                    <p class="font-bold text-slate-800 leading-tight">${user.email.split('@')[0]}</p>
                    <p class="text-[10px] uppercase tracking-wider text-slate-400">Service Courrier • Agent</p>
                </div>
                <div class="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                    <i class="fa-solid fa-user text-slate-400"></i>
                </div>
                <button onclick="App.auth.logout()" class="ml-2 text-slate-300 hover:text-red-500 transition">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            `;
            document.getElementById('auth-zone').innerHTML = `
                <span class="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">Connecté</span>
            `;
        }
    },

    logout: function() {
        window.auth.signOut().then(() => {
            location.reload(); // Recharge pour réinitialiser l'état
        });
    }
};

// Écouteur d'état Firebase (Automatique)
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.auth) {
            window.auth.onAuthStateChanged(user => {
                if (user) App.auth.updateUI(user);
            });
        }
    }, 1000);
});
