var App = App || {}; // Sécurité : crée App si non défini

App.templates.sidebar = function() {
    // On boucle sur l'objet routes que vous avez défini dans le router
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
};
