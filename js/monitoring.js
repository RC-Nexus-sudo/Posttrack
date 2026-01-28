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

    // Affiche les pastilles de statistiques
    renderStats: function() {
        const container = document.getElementById('quick-stats');
        if (!container) return;

        // Structure HTML des pastilles
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

        // Lancement des écouteurs Firestore
        this.listenCollection('courriers_entrants', 'stat-in');
        this.listenCollection('courriers_sortants', 'stat-out');
        // Pour les emails, on peut mettre une valeur fixe ou une autre collection
        this.updatePillValue('stat-mail', 0);
    },

    // Fonction de mise à jour manuelle
    updatePillValue: function(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) el.innerText = value;
    },

    // Écoute temps réel des collections
    listenCollection: function(collectionName, elementId) {
        if (!window.db) return;
        
        window.db.collection(collectionName).onSnapshot(snap => {
            this.updatePillValue(elementId, snap.size);
        }, err => {
            App.logger.log("Erreur monitoring (" + collectionName + "): " + err.message, "error");
        });
    },

    initSearch: function() {
        const searchInput = document.querySelector('#monitoring-bar input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            // Logique de filtrage à implémenter selon le module actif
        });
    }
};

