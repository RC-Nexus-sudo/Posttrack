var App = App || { modules: {} };

App.templates = {
    // Génère les boutons à partir des routes définies dans le router
    sidebar: function() {
        if (!App.router || !App.router.routes) return "Erreur: Routes non chargées";
        
        return Object.keys(App.router.routes).map(id => {
            const route = App.router.routes[id];
            return `
                <button onclick="App.router.go('${id}')" 
                        id="btn-${id}"
                        class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 transition-all group">
                    <i class="fa-solid ${route.icon} w-5 text-lg group-hover:scale-110 transition-transform"></i>
                    <span class="font-medium">${route.title}</span>
                </button>
            `;
        }).join('');
    },

    renderView: function(id, title) {
        // Dans App.templates.renderView (cas 'parametres')
// 1. Structure de base commune (Titre + Zone de contenu)
        let html = `
            <div class="animate-fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-slate-800">${title}</h2>
                    ${this.getActionBtn(id)}
                </div>
                <div id="${id}-content" class="grid grid-cols-1 gap-6">`;

        // 2. Contenu spécifique selon l'ID du module
        if (id === 'dashboard') {
            html += this.getDashboardLayout();
        } else if (id === 'parametres') {
            html += this.getAdminSettingsLayout();
        } else {
            // Vue par défaut pour les autres (Entrants, Sortants, eBox, etc.)
            html += `
                <div class="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-200 mb-4"></i>
                    <p class="text-slate-400 italic">Le module ${title} est prêt à recevoir ses données Firestore.</p>
                </div>`;
        }

        html += `</div></div>`;
        return html;
    },

    // Génère le bouton "Ajouter" uniquement si nécessaire
    getActionBtn: function(id) {
        const modulesWithAdd = ['entrants', 'sortants', 'emails'];
        if (modulesWithAdd.includes(id)) {
            return `<button class="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">
                        <i class="fa-solid fa-plus mr-2"></i>Nouveau
                    </button>`;
        }
        return '';
    },

    getDashboardLayout: function() {
        return `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">Stats Courriers</div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">Derniers Emails</div>
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">Flux eBox</div>
                </div>`;
    },

    getAdminSettingsLayout: function() {
        return `
            <div class="bg-amber-50 border border-amber-200 p-6 rounded-3xl">
                <h3 class="text-amber-800 font-bold mb-2">Accès Administrateur</h3>
                <p class="text-amber-700 text-sm">Pour gérer les accès de sécurité, veuillez vous rendre sur la 
                   <a href="admin.html" class="underline font-bold">Page Admin Sécurisée</a>.</p>
            </div>`;
    }
};

