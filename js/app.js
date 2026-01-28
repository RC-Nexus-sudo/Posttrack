/**
 * Chef d'orchestre de l'application SGC
 */
document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");

    // Sécurité : On attend que Templates et Router soient bien chargés
    const checkCore = setInterval(() => {
        if (App.templates && App.router && App.router.routes) {
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

            // 5. Gestion de l'horloge
            initClock();

            App.logger.log("✅ Système prêt et opérationnel.", "info");

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
});
