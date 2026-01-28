var App = App || {}; // Sécurité : crée App si non défini

App.templates.sidebar = function() {
    const menu = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
        { id: 'entrants', label: 'Courriers entrants', icon: 'fa-file-import' },
        { id: 'sortants', label: 'Courriers sortants', icon: 'fa-file-export' },
        { id: 'emails', label: 'Emails Boite Info', icon: 'fa-at' },
        { id: 'ebox', label: 'eBox', icon: 'fa-box-archive' },
        { id: 'parametres', label: 'Paramètres', icon: 'fa-sliders' }
    ];

    return menu.map(item => `
        <button onclick="App.router.go('${item.id}')" 
                id="btn-${item.id}"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group">
            <i class="fa-solid ${item.icon} w-5 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="font-medium">${item.label}</span>
        </button>
    `).join('');
};
