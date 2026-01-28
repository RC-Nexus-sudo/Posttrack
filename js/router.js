var App = App || { modules: {} };
/**
 * Router Module - Gestion de la navigation SPA
 */
App.router = {
    // Définition des routes et des titres correspondants
    routes: {
        'dashboard': { title: 'Tableau de Bord', icon: 'fa-gauge' },
        'entrants': { title: 'Courriers Entrants', icon: 'fa-inbox' },
        'sortants': { title: 'Courriers Sortants', icon: 'fa-paper-plane' },
        'emails': { title: 'Emails Boite Info', icon: 'fa-envelope' },
        'ebox': { title: 'eBox Institutionnelle', icon: 'fa-box-archive' },
        'parametres': { title: 'Paramètres Système', icon: 'fa-gears' }
    },

    // Fonction principale pour changer de vue
    go: function(routeId) {
        try {
            const view = this.routes[routeId];
            if (!view) throw new Error(`Route "${routeId}" non définie.`);

            // 1. Mise à jour de l'interface (Active state sur la sidebar)
            this.updateSidebarUI(routeId);

            // 2. Injection du template via App.templates
            const mainDisplay = document.getElementById('app-view');
            if (!mainDisplay) throw new Error("Conteneur 'app-view' introuvable.");
            
            mainDisplay.innerHTML = App.templates.renderView(routeId, view.title);

            // 3. Log de l'action
            App.logger.log(`Navigation vers : ${view.title}`, 'info');

            // 4. Charger les données Firebase spécifiques au module
            this.loadModuleData(routeId);

        } catch (error) {
            App.logger.log(`Erreur de routage : ${error.message}`, 'error');
        }
    },

    updateSidebarUI: function(activeId) {
        // On retire le style actif de TOUS les boutons de la sidebar
        document.querySelectorAll('#sidebar-nav button').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
            btn.classList.add('text-slate-400');
        });

        // On l'ajoute au bouton correspondant au module actuel
        const activeBtn = document.getElementById(`btn-${activeId}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-400');
            activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
        }
    },

    loadModuleData: function(routeId) {
        // Logique pour appeler les fonctions spécifiques aux modules
        App.logger.log(`Initialisation des données pour [${routeId}]...`, 'debug');
    }
};

