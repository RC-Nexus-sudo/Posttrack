/**
 * Module Monitoring - Statistiques en temps réel
 */
App.stats = {
    init: function() {
        const container = document.getElementById('quick-stats');
        container.innerHTML = `
            <div class="stat-pill"><i class="fa-solid fa-inbox text-blue-500"></i> <span id="stat-in">0</span></div>
            <div class="stat-pill"><i class="fa-solid fa-paper-plane text-emerald-500"></i> <span id="stat-out">0</span></div>
            <div class="stat-pill"><i class="fa-solid fa-envelope-open-text text-amber-500"></i> <span id="stat-mail">0</span></div>
        `;
        this.sync();
    },

    sync: function() {
        // Écoute temps réel sur le courrier entrant
        db.collection("courriers_entrants").onSnapshot(snap => {
            document.getElementById('stat-in').innerText = snap.size;
        });
        // Ajoutez ici les écoutes pour sortants et emails
    }
};
