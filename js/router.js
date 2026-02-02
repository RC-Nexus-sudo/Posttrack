/*
* Router Module - Gestion de la navigation SPA
*/
var App = App || {};

App.router = {
    // Définition des routes et des titres correspondants
    routes: {
        'dashboard': { title: 'Tableau de Bord', icon: 'fa-gauge' },
        'entrants': { title: 'Courriers Entrants', icon: 'fa-inbox' },
        'sortants': { title: 'Courriers Sortants', icon: 'fa-paper-plane' },
        'emails': { title: 'Emails Boite Info', icon: 'fa-envelope' },
        'ebox': { title: 'eBox Institutionnelle', icon: 'fa-box-archive' },
        'parametres': { title: 'Administration', icon: 'fa-gears' }
    },

    // Nouvelle fonction utilitaire pour charger les templates HTML via fetch()
    loadTemplate: async function(routeId) {
        try {
            // Tente de charger le fichier views/[routeId].html
            const response = await fetch(`views/${routeId}.html`);
            if (!response.ok) {
                // Si le fichier n'existe pas (ex: sortants.html), lève une erreur
                throw new Error(`Le template views/${routeId}.html n'existe pas.`);
            }
            return await response.text();
        } catch (error) {
            console.error("Erreur de chargement du template:", error);
            return null; // Retourne null si le template n'est pas trouvé
        }
    },

    // Fonction principale pour changer de vue (mise à jour pour être asynchrone)
    go: async function(routeId) { // Ajout de 'async'
        try {
            // --- CAS SPÉCIFIQUE : ADMINISTRATION ---
            if (routeId === 'parametres') {
                App.logger.log("Accès Admin : Redirection vers admin.html", "info");
                window.location.href = 'admin.html';
                return; // On arrête l'exécution ici
            }

            const view = this.routes[routeId];
            if (!view) throw new Error(`Route "${routeId}" non définie.`);

            // 1. Mise à jour de l'interface (Active state sur la sidebar)
            this.updateSidebarUI(routeId);

            const appView = document.getElementById('app-view');

            // 2. Chargement asynchrone du template HTML externe
            const templateHtml = await this.loadTemplate(routeId);

            if (templateHtml) {
                // Le template existe : on l'injecte dans le DOM principal
                appView.innerHTML = templateHtml;
                App.logger.log(`Navigation vers : ${view.title} (via template externe)`, 'info');

                // 3. Initialiser le module JavaScript associé si nécessaire
                if (App.modules && App.modules[routeId] && typeof App.modules[routeId].init === 'function') {
                    App.modules[routeId].init(); // Appel de la fonction init() du module
                }

            } else {
                // Le template n'existe pas (ex: module sortants) : affichage du message d'erreur
                appView.innerHTML = `
                 <div class="p-10 text-center bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                 <i class="fa-solid fa-hourglass-start fa-2x mb-4"></i>
                 <p class="font-bold">Module en cours de création</p>
                 <p>La page pour ce module sera disponible prochainement.</p>
                 </div>`;
                App.logger.log(`Info : Le module "${routeId}" est en cours de création ou le template est manquant.`, "warn");
            }

        } catch (error) {
            App.logger.log(`Erreur de routage : ${error.message}`, 'error');
            // Optionnel : afficher l'erreur à l'écran si vous avez une fonction utilitaire pour cela
            // App.utils.displayModuleError(routeId, error.message);
        }
    },

    updateSidebarUI: function(activeId) {
        // On retire le style actif de TOUS les boutons
        document.querySelectorAll('#sidebar-nav button').forEach(btn => {
         btn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
         btn.classList.add('text-slate-400');
        });
        // On l'ajoute au bouton correspondant
        const activeBtn = document.getElementById(`btn-${activeId}`);
        if (activeBtn) {
         activeBtn.classList.remove('text-slate-400');
         activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
        }
    },
    
    // loadModuleData est maintenant redondante car gérée dans go(), mais peut rester si elle est appelée ailleurs.
    loadModuleData: function(routeId) {
        App.logger.log(`Initialisation des données pour [${routeId}]...`, 'debug');
        if (App.modules && App.modules[routeId] && App.modules[routeId].init) {
            App.modules[routeId].init();
        } else {
            App.logger.log(`Info : Pas de logique spécifique pour le module ${routeId}`, 'debug');
        }
    }
};
