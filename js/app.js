App.auth.init();

document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");

    try {
        // 1. Générer la sidebar (Vérifie si la fonction existe)
        if (App.templates && App.templates.sidebar) {
            document.getElementById('sidebar-nav').innerHTML = App.templates.sidebar();
        } else {
            throw new Error("Le module Templates n'est pas chargé.");
        }
        
        // 2. Lancer le dashboard par défaut
        if (App.router && App.router.go) {
            App.router.go('dashboard');
        } else {
            throw new Error("Le module Router n'est pas chargé.");
        }

        // 3. Afficher l'heure en temps réel dans la Front Bar
        const timeDisplay = document.getElementById('current-datetime');
        if (timeDisplay) {
            setInterval(() => {
                const now = new Date();
                timeDisplay.innerText = now.toLocaleString('fr-BE');
            }, 1000);
        }

    } catch (error) {
        App.logger.log("Échec du démarrage : " + error.message, "error");
    }
});

