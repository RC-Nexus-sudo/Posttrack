/**
 * Chef d'orchestre de l'application SGC
 * Gère le cycle de démarrage et les services globaux.
 */
document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");

    try {
        // 1. Initialisation de l'Authentification
        // Vérifie l'état de session et met à jour la Front Bar
        if (App.auth && App.auth.init) {
            App.auth.init();
        } else {
            App.logger.log("Avertissement : Module Auth non détecté.", "error");
        }

        // 2. Génération de la Sidebar dynamique
        // Utilise les routes définies dans le Router
        const sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav && App.templates && App.templates.sidebar) {
            sidebarNav.innerHTML = App.templates.sidebar();
            App.logger.log("UI : Sidebar générée.", "debug");
        } else {
            throw new Error("Impossible de générer la sidebar (DOM ou Template manquant).");
        }

        // 3. Initialisation de la Monitoring Bar
        // Lance les écouteurs de statistiques en temps réel
        if (App.monitoring && App.monitoring.init) {
            App.monitoring.init();
        }

        // 4. Lancement du module par défaut (Dashboard)
        if (App.router && App.router.go) {
            App.router.go('dashboard');
        } else {
            throw new Error("Le module Router est requis pour l'affichage.");
        }

        // 5. Gestion de l'horloge en temps réel (Front Bar)
        const timeDisplay = document.getElementById('current-datetime');
        if (timeDisplay) {
            // Mise à jour immédiate puis chaque seconde
            const updateClock = () => {
                const now = new Date();
                timeDisplay.innerText = now.toLocaleString('fr-BE', {
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit'
                });
            };
            updateClock();
            setInterval(updateClock, 1000);
        }

        App.logger.log("✅ Système prêt et opérationnel.", "info");

    } catch (error) {
        // Capture toute erreur critique au démarrage et l'affiche dans la console logs
        App.logger.log("CRITICAL ERROR : " + error.message, "error");
        console.error("Détails de l'erreur :", error);
    }
});
