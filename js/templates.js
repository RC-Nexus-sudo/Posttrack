var App = App || {}; // Sécurité : crée App si non défini
App.templates = {
    renderView: function(id, title) {
        return `
            <div class="animate-fade-in">
                <h2 class="text-2xl font-bold text-slate-800 mb-6">${title}</h2>
                <div id="${id}-container" class="grid grid-cols-1 gap-6">
                    <div class="widget-card">Contenu du module ${title} en attente...</div>
                </div>
            </div>`;
    }
};
