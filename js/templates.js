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
        return `<div class="animate-fade-in"><h2 class="text-2xl font-bold text-slate-800">${title}</h2></div>`;
    }
};

