/**
 * Chef d'orchestre de l'application SGC
 */
if (!App.utils) {
    App.utils = {};
}

// 1. Ajout de la fonction utilitaire pour l'affichage visuel des erreurs dans App.utils
App.utils.displayModuleError = function(moduleName, errorMessage) {
    // Cibler le conteneur spécifique du module dans la page HTML (ex: <div id="entrants-content">)
    var containerId = moduleName + '-content';
    var container = document.getElementById(containerId);

    if (container) {
        // Afficher un message d'erreur visible à l'utilisateur dans le conteneur du module
        container.innerHTML = '<div class="p-10 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">' +
                              '<p class="font-bold">Erreur de chargement du module</p>' +
                              '<p>Le module <strong>' + moduleName + '</strong> n\'a pas pu se charger correctement.</p>' +
                              '<p class="mt-2 text-xs">Détail technique : ' + errorMessage + '</p>' +
                              '</div>';
    } else {
        App.logger.log("Impossible d'afficher l'erreur visuelle pour le module " + moduleName, "warn");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");

    // Sécurité : On attend que Templates, Router, ET les modules soient bien chargés
    const checkCore = setInterval(() => {
        if (
            App.templates &&
            App.router &&
            App.router.routes &&
            App.modules &&
            App.modules.entrants // Ajout de la vérification spécifique
        ) {
            clearInterval(checkCore);
            bootApp(); // On lance l'application
        }
    }, 100);

    function bootApp() {
        try {
            // 1. Initialisation de l'Authentification
            if (App.auth && App.auth.init) App.auth.init();

            // 2. Génération de la Sidebar dynamique
            const sidebarNav = document.getElementById('sidebar-nav');
            if (sidebarNav) {
                sidebarNav.innerHTML = App.templates.sidebar();
                App.logger.log("UI : Sidebar générée.", "debug");
            }

            // 3. Initialisation de la Monitoring Bar
            if (App.monitoring && App.monitoring.init) App.monitoring.init();

            // 4. Lancement du module par défaut
            App.router.go('dashboard');

            // --- NOUVELLE LOGIQUE POUR INITIALISER LES MODULES EN TOUTE SÉCURITÉ ---
            App.logger.log("Démarrage de l'application et initialisation des modules...", "info");

            for (var moduleName in App.modules) {
                if (App.modules.hasOwnProperty(moduleName)) {
                    var module = App.modules[moduleName];
                    try {
                        if (typeof module.init === 'function') {
                            module.init();
                            App.logger.log("✅ Module '" + moduleName + "' initialisé.", "success");
                        }
                    } catch (error) {
                        App.logger.log("❌ Erreur critique dans le module '" + moduleName + "': " + error.message, "error");
                        App.utils.displayModuleError(moduleName, error.message); // Affichage visuel de l'erreur
                    }
                }
            }
            // --- FIN NOUVELLE LOGIQUE ---
            
            // 5. Gestion de l'horloge
            initClock();
            App.logger.log("✅Système prêt et opérationnel.", "info");

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
    
    // 2. Définition de la fonction de conversion de date (au bon endroit dans App.utils)
    App.utils.convertFirestoreTimestampToDate = function(timestamp) {
        if (!timestamp) {
            return null;
        }
        if (timestamp instanceof Date) {
            return timestamp;
        }
        // La définition complète de la fonction se trouve sur la page 3 du PDF
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        if (timestamp.seconds !== undefined) {
            return new Date(timestamp.seconds * 1000);
        }
        return null;
    };
});
