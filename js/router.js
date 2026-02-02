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
        'parametres': { title: 'Administration', icon: 'fa-gears' }
    },

    // Fonction principale pour changer de vue
    go: function(routeId) {
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

   // --- NOUVELLE LOGIQUE D'AFFICHAGE/MASQUAGE DES CONTENEURS ---
   const allContentViews = document.querySelectorAll('#app-view > div');
   // Masquer tous les conteneurs de contenu par défaut
   allContentViews.forEach(container => {
    container.classList.add('hidden');
    container.classList.remove('flex'); // S'assurer que flex est retiré si utilisé pour l'affichage
   });

   // Afficher uniquement le conteneur cible (convention: [routeId]-content)
   const targetContainerId = `${routeId}-content`;
   const targetContainer = document.getElementById(targetContainerId);

   // --- GESTION SPÉCIFIQUE AJOUTÉE POUR LES MODULES INEXISTANTS/EN CRÉATION ---
   if (!targetContainer) {
        // Si le conteneur spécifique n'existe pas (ex: sortants-content),
        // on injecte un message d'information dans le conteneur principal.
        document.getElementById('app-view').innerHTML = `
            <div class="p-10 text-center bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                <i class="fa-solid fa-hourglass-start fa-2x mb-4"></i>
                <p class="font-bold">Module en cours de création</p>
                <p>La page pour ce module sera disponible prochainement.</p>
            </div>
        `;
        App.logger.log(`Info : Le module "${routeId}" est en cours de création.`, "warn");
        // On arrête l'exécution de la navigation ici
        return; 
   }
   // --- FIN GESTION SPÉCIFIQUE ---

            document.getElementById('app-view').innerHTML = '';
            
   // Si le conteneur est valide (le cas pour 'entrants' et 'dashboard'):
   // Si le conteneur est vide, injecter le template initial
   if (!targetContainer.hasChildNodes()) {
        targetContainer.innerHTML = App.templates.renderView(routeId, view.title);
   }

   // Rendre le conteneur cible visible
   targetContainer.classList.remove('hidden');
   // Vous pouvez utiliser 'block', 'flex', ou autre selon votre framework CSS (Tailwind)
   // Par exemple: targetContainer.classList.add('flex'); 

   // --- FIN NOUVELLE LOGIQUE ---
   
   // 2. Log de l'action
   App.logger.log(`Navigation vers : ${view.title}`, 'info');

   // 3. Charger les données spécifiques au module
   this.loadModuleData(routeId);
  } catch (error) {
   App.logger.log(`Erreur de routage : ${error.message}`, 'error');
   App.utils.displayModuleError(routeId, error.message); // Utilisation de la fonction d'erreur
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

    loadModuleData: function(routeId) {
    App.logger.log(`Initialisation des données pour [${routeId}]...`, 'debug');
    
    // On vérifie si le module existe et possède une fonction init
    if (App.modules && App.modules[routeId] && App.modules[routeId].init) {
        App.modules[routeId].init(); 
    } else {
        App.logger.log(`Info : Pas de logique spécifique pour le module ${routeId}`, 'debug');
    }
}
};


