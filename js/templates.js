/**
 * Templates Module - Générateur de composants dynamiques
 */
var App = App || {}; // Empêche l'écrasement de l'objet global

App.templates = {
    sidebar: function() {
        if (!App.router || !App.router.routes) return "Erreur chargement";
        return Object.keys(App.router.routes).map(id => {
            const route = App.router.routes[id];
            return `<button onclick="App.router.go('${id}')" id="btn-${id}" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 transition-all">
                <i class="fa-solid ${route.icon}"></i> <span>${route.title}</span>
            </button>`;
        }).join('');
    },

    renderView: function(id, title) {
        // Log de contrôle dans la console navigateur (F12)
        console.log("Génération de la vue pour :", id);
        
        let body = "";
        if (id === 'dashboard') {
            body = `<div class="p-6 bg-white rounded-3xl border">Vue Dashboard Active</div>`;
        } else if (id === 'parametres') {
            body = `<div class="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800">Vue Paramètres Active</div>`;
        } else {
            body = `<div class="p-6 bg-slate-50 border border-dashed rounded-3xl text-slate-400 font-italic italic">Module ${title} en attente de données Firestore.</div>`;
        }

        return `
            <div class="animate-fade-in">
                <h2 class="text-2xl font-bold text-slate-800 mb-6">${title}</h2>
                <div id="${id}-content">${body}</div>
            </div>`;
    }
};

