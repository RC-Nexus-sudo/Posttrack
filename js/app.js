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


// --- LOGIQUE DE DÉMARRAGE BASÉE SUR L'AUTHENTIFICATION ---

// Cette fonction exécute toute la logique de démarrage de l'interface
function bootApp() {
    try {
        // 1. Initialisation de l'Authentification
        if (App.auth && App.auth.init) App.auth.init();

        // 2. Génération de la Sidebar dynamique
        const sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav) {
            // ASSUREZ-VOUS DE PASSER LE BON OBJET : 
            // App.router.generateSidebarHtml s'attend à recevoir l'objet "modules" en paramètre.
            
            // SI generateSidebarHtml n'a PAS de paramètre dans votre version originale du PDF 0.1.1:
            // sidebarNav.innerHTML = App.router.generateSidebarHtml(); 
            // ALORS LA LOGIQUE DE FILTRAGE DOIT ÊTRE DANS generateSidebarHtml ET UTILISER App.currentUser

            // Si vous avez utilisé ma version modifiée de router.js qui accepte un paramètre:
            // sidebarNav.innerHTML = App.router.generateSidebarHtml(App.currentUser.modules); 
            
            // Pour l'instant, faisons confiance à la version du router.js que je viens de corriger
            sidebarNav.innerHTML = App.router.generateSidebarHtml(App.currentUser.modules);
            App.logger.log("UI : Sidebar générée avec permissions.", "debug");
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

// --- LOGIQUE DE DÉMARRAGE BASÉE SUR L'AUTHENTIFICATION ET FIRESTORE ---

// Observateur d'état d'authentification Firebase (cœur de la logique)
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // L'utilisateur est connecté et authentifié.
        App.logger.log(`Utilisateur connecté: ${user.email}`, "auth");

        try {
            // Étape CRUCIALE: Récupérer les données Firestore avant de démarrer l'UI
            const docRef = firebase.firestore().collection("users").doc(user.uid);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                App.currentUser = docSnap.data(); // Stocke TOUT l'objet utilisateur avec ses 'modules'
                App.logger.log("Données utilisateur Firestore récupérées.", "auth");
                bootApp(); // Démarrer l'application MAINTENANT que nous avons les permissions
            } else {
                // Pas de document Firestore -> problème de compte
                App.logger.log("Document utilisateur Firestore manquant. Déconnexion.", "error");
                await firebase.auth().signOut();
            }
        } catch (error) {
            App.logger.log(`Erreur fatale lors de la récupération des données utilisateur: ${error.message}`, "error");
            await firebase.auth().signOut();
        }

    } else {
        // L'utilisateur n'est pas connecté. Rediriger vers la page de connexion.
        App.logger.log("Aucun utilisateur connecté. Redirection vers login.html", "auth");
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");
    
    // 5. Gestion de l'horloge
    initClock();
    App.logger.log("✅Système prêt et opérationnel.", "info");
});




