/**
* Chef d'orchestre de l'application SGC
*/
var App = App || {}; 
// Assurez-vous que les autres objets (logger, templates, auth...) sont définis avant

if (!App.utils) {
    App.utils = {};
}

// 1. Ajout de la fonction utilitaire pour l'affichage visuel des erreurs dans App.utils
App.utils.displayModuleError = function(moduleName, errorMessage) {
    var containerId = moduleName + '-content';
    var container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="p-10 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">' +
                              '<p class="font-bold">Erreur de chargement du module</p>' +
                              '<p>Le module <strong>' + moduleName + '</strong> n\'a pas pu se charger correctement.</p>' +
                              '<p class="mt-2 text-xs">Détail technique : ' + errorMessage + '</p>' +
                              '</div>';
    } else {
        App.logger.log("Impossible d'afficher l'erreur visuelle pour le module " + moduleName, "warn");
    }
};

// 2. Définition de la fonction de conversion de date dans App.utils
App.utils.convertFirestoreTimestampToDate = function(timestamp) {
 if (!timestamp) {
 return null;
 }
 if (timestamp instanceof Date) {
 return timestamp;
 }
 if (typeof timestamp.toDate === 'function') {
 return timestamp.toDate();
 }
 if (timestamp.seconds !== undefined) {
 return new Date(timestamp.seconds * 1000);
 }
 return null;
 };


document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");
    
    // 5. Gestion de l'horloge
    initClock();
    App.logger.log("✅Système prêt et opérationnel.", "info");
});


// --- LOGIQUE DE DÉMARRAGE BASÉE SUR L'AUTHENTIFICATION ---

// Cette fonction exécute toute la logique de démarrage de l'interface
function bootApp() {
    try {
        // 1. Initialisation de l'Authentification
        if (App.auth && App.auth.init) App.auth.init();

        // 2. Génération de la Sidebar dynamique
        const sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav) {
            // Utilise la fonction generateSidebarHtml() du routeur (doit être définie dans router.js)
            sidebarNav.innerHTML = App.router.generateSidebarHtml();
            App.logger.log("UI : Sidebar générée.", "debug");
        }
        
        // 3. Initialisation de la Monitoring Bar
        if (App.monitoring && App.monitoring.init) App.monitoring.init();
        
        // 4. Lancement du module par défaut (ex: dashboard)
        App.router.go('dashboard');

    } catch (error) {
        App.logger.log("CRITICAL ERROR : " + error.message, "error");
        console.error("Détails :", error);
    }
}

// Observateur d'état d'authentification Firebase
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // L'utilisateur est connecté et authentifié. On peut démarrer l'app.
        App.logger.log(`Utilisateur connecté: ${user.email}`, "auth");
        bootApp();
    } else {
        // L'utilisateur n'est pas connecté. Rediriger vers la page de connexion.
        App.logger.log("Aucun utilisateur connecté. Redirection vers login.html", "auth");
        window.location.href = 'login.html';
    }
});


function initClock() {
    const timeDisplay = document.getElementById('current-datetime');
    if (timeDisplay) {
        const updateClock = () => {
            timeDisplay.innerText = new Date().toLocaleString('fr-BE', {
                weekday: 'short', day: '2-digit', month: 'short',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
}
