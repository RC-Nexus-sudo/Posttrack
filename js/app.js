document.addEventListener('DOMContentLoaded', () => {
    App.logger.log("Système : Initialisation de l'application...", "info");

    try {
        // 1. Initialisation de l'authentification (DANS le bloc DOMContentLoaded)
        if (App.auth && App.auth.init) {
            App.auth.init();
        }

        // 2. Générer la sidebar
        if (App.templates && App.templates.sidebar) {
            document.getElementById('sidebar-nav').innerHTML = App.templates.sidebar();
        } else {
            throw new Error("Le module Templates n'est pas chargé.");
        }
        
        // 3. Lancer le dashboard par défaut
        if (App.router && App.router.go) {
            App.router.go('dashboard');
        } else {
            throw new Error("Le module Router n'est pas chargé.");
        }

        // 4. Afficher l'heure en temps réel dans la Front Bar
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
