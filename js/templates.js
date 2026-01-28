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
    console.log("Génération de la vue pour :", id);
    
    let headerAction = ""; // Pour le bouton à droite du titre
    let body = "";         // Pour le contenu Bento/Tableau

    // --- MODULE : DASHBOARD ---
    if (id === 'dashboard') {
        body = `<div class="p-6 bg-white rounded-3xl border">Vue Dashboard Active</div>`;
    } 
    
    // --- MODULE : COURRIERS ENTRANTS ---
    else if (id === 'entrants') {
        // 1. On ajoute le bouton "Nouveau" dans le Header
        headerAction = `
            <button onclick="App.modules.entrants.openForm()" class="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition">
                <i class="fa-solid fa-plus mr-2"></i> Nouveau Courrier
            </button>`;
        
        // 2. Le body est initialement vide, car App.modules.entrants.fetchData() le remplira
        body = `<div class="p-4 text-slate-400 italic text-sm">Initialisation du tableau...</div>`;
    }

        // --- MODULE : ADMINISTRATION ---
    else if (id === 'parametres') {
        body = `<div class="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 text-sm">
                    Accès Admin externe : <a href="admin.html" class="font-bold underline">Console de sécurité</a>
                </div>`;
    } 
    
    else {
        body = `<div class="p-6 bg-slate-50 border border-dashed rounded-3xl text-slate-400 italic font-medium">
                    Module ${title} en attente de données Firestore.
                </div>`;
    }

    // Structure finale retournée
    return `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-slate-800">${title}</h2>
                <div id="module-header-action">${headerAction}</div>
            </div>
            <div id="${id}-content">${body}</div>
        </div>`;
}


