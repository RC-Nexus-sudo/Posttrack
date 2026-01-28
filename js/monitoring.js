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

        // On écoute en temps réel les collections pour mettre à jour les chiffres
        this.listenCollection('courriers_entrants', 'stat-in');
        this.listenCollection('courriers_sortants', 'stat-out');
        // Emails simulerait une attente
        this.updatePill('stat-mail', 0);

        container.innerHTML = `
            <div class="flex gap-2">
                <div class="stat-pill border bg-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold">
                    <i class="fa-solid fa-download text-blue-500"></i> Entrants: <span id="stat-in">0</span>
                </div>
                <div class="stat-pill border bg-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold">
                    <i class="fa-solid fa-upload text-emerald-500"></i> Sortants: <span id="stat-out">0</span>
                </div>
                <div class="stat-pill border bg-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold">
                    <i class="fa-solid fa-envelope text-amber-500"></i> Emails: <span id="stat-mail">0</span>
                </div>
            </div>
        `;
    },

    // Fonction générique d'écoute Firestore
    listenCollection: function(collectionName, elementId) {
        window.db.collection(collectionName).onSnapshot(snap => {
            const count = snap.size;
            const el = document.getElementById(elementId);
            if (el) el.innerText = count;
        }, err => App.logger.log("Erreur monitoring: " + err.message, "error"));
    },

    // Gestion de la recherche globale
    initSearch: function() {
        const searchInput = document.querySelector('#monitoring-bar input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            App.logger.log("Recherche en cours: " + query, "debug");
            // Ici, on pourra déclencher un filtre sur le tableau actuellement affiché
        });
    }
};
