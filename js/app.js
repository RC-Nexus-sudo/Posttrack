/*
* Chef d'orchestre de l'application SGC
*/
var App = App || {}; 

// Assurez-vous que les autres objets (logger, templates, auth, router, monitoring) sont définis avant (0.1.1)

// --- 1. Utilitaires ---
App.utils = App.utils || {};

// Fonction utilitaire pour l'affichage visuel des erreurs dans App.utils (0.1.1)
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

// Définition globale de la fonction toggleOverlay
window.toggleOverlay = function(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.classList.toggle('hidden');
        App.logger.log(`Toggle Overlay: ${id}`, 'ui');
    }
};

// Définition de la fonction de conversion de date dans App.utils (0.1.2)
App.utils.convertFirestoreTimestampToDate = function(timestamp) {
    if (!timestamp) { return null; }
    if (timestamp instanceof Date) { return timestamp; }
    if (typeof timestamp.toDate === 'function') { return timestamp.toDate(); }
    if (timestamp.seconds !== undefined) { return new Date(timestamp.seconds * 1000); }
    return null;
};


// --- 2. Mappage des modules chargés séparément (admin-logic.js, etc.) ---
// C'est ici que l'on lie les scripts externes à l'objet global App
App.modules = App.modules || {};

// Si le script admin-logic.js a été chargé, App.modules.parametres existera déjà.
if (App.modules.parametres) {
    App.logger.log("Module Administration (parametres) mappé et prêt.", "info");
} else {
    // Ce log ne devrait plus apparaître si le script est bien chargé dans index.html
    App.logger.log("[INFO] : Attente des dépendances Firebase...", "info");
}

// Mappage des autres modules (courriers entrants, etc.)
if (typeof EntrantsLogic !== 'undefined') {
    App.modules.entrants = EntrantsLogic;
}


// --- 3. Logique de démarrage (bootApp) ---

// Cette fonction exécute toute la logique de démarrage de l'interface APRES authentification et récupération des données utilisateur
function bootApp() {
    try {
        // 1. L'authentification a déjà été gérée par l'observateur d'état plus bas.
        
        // 2. Génération de la Sidebar dynamique
        const sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav) {
            // Utilise les modules de l'utilisateur courant pour filtrer la sidebar
            sidebarNav.innerHTML = App.router.generateSidebarHtml(App.currentUser.modules); 
            App.logger.log("UI : Sidebar générée avec permissions.", "debug");
        }
        
        // 3. Initialisation de la Monitoring Bar
        if (App.monitoring && App.monitoring.init) App.monitoring.init();
        
        // 4. Lancement du module par défaut (ex: dashboard)
        App.router.go('dashboard');
    } catch (error) {
        App.logger.log("CRITICAL ERROR in bootApp: " + error.message, "error");
        console.error("Détails :", error);
    }
}

// --- 4. Initialisation de l'horloge et du statut système ---

function initClock() {
    const timeDisplay = document.getElementById('current-datetime');
    if (timeDisplay) {
        const updateClock = () => {
            // Formatage de l'heure en français belge
            timeDisplay.innerText = new Date().toLocaleString('fr-BE', { 
                weekday: 'short', day: '2-digit', month: 'short',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
}

// --- 5. Observateur d'état d'authentification Firebase (Cœur du démarrage) ---

// Cet observateur gère la redirection et le lancement de l'application (bootApp)
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // L'utilisateur est connecté et authentifié.
        App.logger.log(`Utilisateur connecté: ${user.email}`, "auth");
        try {
            // Étape CRUCIALE: Récupérer les données Firestore (rôles/modules) avant de démarrer l'UI
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

// --- 6. Initialisation DOMContentLoaded ---

document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");
    
    // 5. Gestion de l'horloge
    initClock();
    
    // Initialisation des autres modules de base
    if (App.auth && App.auth.init) App.auth.init();

    App.logger.log("✅Système prêt et opérationnel.", "info");
});

