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

    // Fonction pour générer le HTML de la sidebar à partir des routes définies
    /**
     * Génère le HTML de la sidebar à partir des routes définies et des permissions de l'utilisateur.
     * @param {object} userModules L'objet App.currentUser.modules contenant les permissions.
     */
    generateSidebarHtml: function(userModules) {
        // S'assurer que userModules est au moins un objet vide si undefined
        const modules = userModules || {}; 
        let sidebarHtml = '';
        
        for (const routeId in this.routes) {
            if (Object.hasOwnProperty.call(this.routes, routeId)) {
                const view = this.routes[routeId];
                
                let isAllowed = false;

                if (routeId === 'dashboard') {
                    isAllowed = true; 
                } else if (routeId === 'parametres') {
                    // Accès admin via la clé 'admin' dans l'objet modules
                    isAllowed = modules.admin || (App.currentUser && App.currentUser.role === 'admin');
                } else {
                    // S'assurer d'accéder à la propriété existante dans l'objet 'modules'
                    // Si vos clés sont 'courriersEntrants' etc., utilisez celle-ci.
                    // En supposant que vos clés sont simplement 'entrants', 'sortants' etc.
                    isAllowed = modules[routeId] || false; 
                }

                if (isAllowed) {
                    sidebarHtml += `
                        <button id="btn-${routeId}" onclick="App.router.go('${routeId}')" class="flex items-center 
                        w-full px-5 py-3 text-sm font-medium transition duration-150 ease-in-out text-slate-400">
                        <i class="fa-solid ${view.icon} mr-3"></i>
                        ${view.title}
                        </button>
                    `;
                }
            }
        }
        return sidebarHtml;
    },
    
    // Nouvelle fonction utilitaire pour charger les templates HTML via fetch()
    loadTemplate: async function(routeId) {
        try {
            // Tente de charger le fichier js/modules/[routeId].html
            const response = await fetch(`js/modules/${routeId}/${routeId}.html`);
            if (!response.ok) {
                // Si le fichier n'existe pas (ex: sortants.html), lève une erreur
                throw new Error(`Le template js/modules/${routeId}.html n'existe pas.`);
            }
            return await response.text();
        } catch (error) {
            console.error("Erreur de chargement du template:", error);
            return null; // Retourne null si le template n'est pas trouvé
        }
    },

    // Fonction principale pour changer de vue (mise à jour pour être asynchrone)
    go: async function(routeId) { // Ajout de 'async'
        
        // Utilisation du chaînage optionnel et fallback solide
        const userModules = App.currentUser?.modules || {}; // S'assure que userModules est un objet valide, même si App.currentUser est null/undefined
        const userRole = App.currentUser?.role || 'agent'; // Fallback au rôle 'agent' par défaut

        let isAllowed = false;
        
        if (routeId === 'dashboard') {
            isAllowed = true;
        } else if (routeId === 'parametres') {
            // Vérifie l'accès admin
            isAllowed = userModules.admin || userRole === 'admin';
        } else {
            // Vérifie l'accès aux autres modules (entrants, sortants...)
            isAllowed = userModules[routeId] || false;
        }
        
        if (!isAllowed) {
            App.logger.log(`Accès refusé au module ${routeId}.`, "error");
            App.router.go('dashboard'); 
            return; 
        }
        // -----------------------------------------------------------------
        
        try {
            // --- CAS SPÉCIFIQUE : ADMINISTRATION ---
            if (routeId === 'parametres') {
                App.logger.log("Accès Admin : Chargement du module Administration", "info");
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
                appView.classList.remove('backdrop-blur-md', 'fixed', 'inset-0');
                appView.innerHTML = templateHtml;
                App.logger.log(`Navigation vers : ${view.title} (via template externe)`, 'info');

                // 3. Initialiser le module JavaScript associé si nécessaire
                // Assurez-vous que votre fichier admin.logic.js est bien relié à window.App.modules.parametres
                if (App.modules && App.modules[routeId] && typeof App.modules[routeId].init === 'function') {
                    App.modules[routeId].init(); // Appel de la fonction init() du module
                }

            } else {
                // Le template n'existe pas (ex: module sortants) : affichage du message d'erreur
                appView.classList.remove('backdrop-blur-md', 'fixed', 'inset-0');
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
