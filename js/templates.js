/**
 * Templates Module - Générateur de composants dynamiques
 */
var App = App || {};

App.templates = {
    // 1. GÉNÉRATEUR DE LA SIDEBAR
    sidebar: function() {
        if (!App.router || !App.router.routes) {
            App.logger.log("Erreur: Routes non chargées pour la sidebar", "error");
            return "Erreur: Routes non chargées";
        }
        
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

    // 2. GÉNÉRATEUR DES VUES (MAIN CONTENT)
    renderView: function(id, title) {
        // Début commun
        let html = `
            <div class="animate-fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-slate-800">${title}</h2>
                </div>
                <div id="${id}-content">`;

        // Sélection du contenu selon l'onglet
        switch(id) {
            case 'dashboard':
                html += `
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">Graphique Courriers</div>
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">Derniers Emails</div>
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">Activité eBox</div>
                    </div>`;
                break;

            case 'parametres':
                html += `
                    <div class="bg-amber-50 border border-amber-200 p-6 rounded-3xl">
                        <h3 class="text-amber-800 font-bold mb-2 uppercase text-[10px] tracking-widest">Sécurité</h3>
                        <p class="text-amber-700 text-sm">Gestion des habilitations disponible sur la 
                           <a href="admin.html" class="underline font-bold text-amber-900">Console Admin</a>.</p>
                    </div>`;
                break;

            default:
                // Pour Entrants, Sortants, Emails, eBox
                html += `
                    <div class="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                        <i class="fa-solid fa-folder-open text-4xl text-slate-200 mb-4"></i>
                        <p class="text-slate-400 italic">Le module <strong>${title}</strong> attend la configuration Firestore.</p>
                    </div>`;
                break;
        }

        html += `</div></div>`;
        return html;
    }
};
