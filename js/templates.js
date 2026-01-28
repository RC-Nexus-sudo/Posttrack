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
return `
    <div class="animate-fade-in">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Administration & Paramètres</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Formulaire de création d'utilisateur -->
            <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-700 mb-4 italic">Enregistrer un nouvel agent</h3>
                <div class="space-y-4">
                    <input type="text" id="new-user-name" placeholder="Nom complet" class="w-full p-3 bg-slate-50 rounded-xl border-none text-sm">
                    <input type="email" id="new-user-email" placeholder="Email institutionnel" class="w-full p-3 bg-slate-50 rounded-xl border-none text-sm">
                    <select id="new-user-role" class="w-full p-3 bg-slate-50 rounded-xl border-none text-sm">
                        <option value="agent">Agent (Lecture/Écriture)</option>
                        <option value="admin">Administrateur (Gestion Totale)</option>
                    </select>
                    <button onclick="App.admin.createUser()" class="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-black transition">Créer le compte</button>
                </div>
            </div>

            <!-- Liste des utilisateurs connectés -->
            <div class="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-700 mb-4 italic">Personnel autorisé</h3>
                <div id="users-list" class="space-y-3">
                    <p class="text-slate-400 text-sm">Chargement de la liste des agents...</p>
                </div>
            </div>
        </div>
    </div>
`;
    }
};

