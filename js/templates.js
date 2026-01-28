App.templates.renderView = (id, title) => {
    return `
        <div class="animate-fade-in">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold text-slate-800">${title}</h2>
                <button onclick="App.modules.${id}.openForm()" class="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition">
                    <i class="fa-solid fa-plus mr-2"></i> Ajouter un enregistrement
                </button>
            </div>
            
            <!-- Zone des Widgets/Tableaux -->
            <div id="${id}-content" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${App.templates.card('Statut', '<p class="text-slate-400 italic">Chargement des données...</p>')}
            </div>
        </div>
    `;
};
