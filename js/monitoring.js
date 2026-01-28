/**
 * Module Monitoring - Statistiques et Recherche
 */
var App = App || {};

App.monitoring = {
    init: function() {
        App.logger.log("Initialisation de la Monitoring Bar...", "debug");
        this.renderStats();
        this.initSearch();
    },

    renderStats: function() {
        const container = document.getElementById('quick-stats');
        if (!container) return;

        container.innerHTML = `
            <div class="flex gap-2">
                <div class="stat-pill border bg-white px-4 py-2 rounded-full flex items-center gap-2 text-[11px] font-bold shadow-sm">
                    <i class="fa-solid fa-download text-blue-500"></i> Entrants: <span id="stat-in">0</span>
                </div>
                <div class="stat-pill border bg-white px-4 py-2 rounded-full flex items-center gap-2 text-[11px] font-bold shadow-sm">
                    <i class="fa-solid fa-upload text-emerald-500"></i> Sortants: <span id="stat-out">0</span>
                </div>
                <div class="stat-pill border bg-white px-4 py-2 rounded-full flex items-center gap-2 text-[11px] font-bold shadow-sm">
                    <i class="fa-solid fa-at text-amber-500"></i> Emails: <span id="stat-mail">0</span>
                </div>
            </div>
        `;

        // Lancement direct des écouteurs
        this.listenCollection('courriers_entrants', 'stat-in');
        this.listenCollection('courriers_sortants', 'stat-out');
    },

    listenCollection: function(collectionName, elementId) {
        if (!window.db) return;
        
        window.db.collection(collectionName).onSnapshot(snap => {
            const el = document.getElementById(elementId);
            if (el) el.innerText = snap.size;
        }, err => {
            App.logger.log("Erreur monitoring [" + collectionName + "]", "error");
        });
    },

    initSearch: function() {
        const searchInput = document.querySelector('#monitoring-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                App.logger.log("Recherche: " + e.target.value, "debug");
            });
        }
    }
};

