/**
 * Module : Courriers Entrants
 * Chemin : js/modules/courriers-entrants.js
 */
var App = App || {};
App.modules = App.modules || {};

App.modules.entrants = {
    init: function() {
        // Cette fonction est appelée par App.router.go('entrants')
        const viewContainer = document.getElementById('entrants-content');
        if (viewContainer) {
            this.renderTable();
            this.fetchData();
        }
    },

    renderTable: function() {
        const container = document.getElementById('entrants-content');
        container.innerHTML = `
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400">
                        <tr>
                            <th class="p-4">Expéditeur</th>
                            <th class="p-4">Objet</th>
                            <th class="p-4">Service</th>
                            <th class="p-4">Date</th>
                            <th class="p-4">Statut</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-entrants" class="text-sm divide-y divide-slate-50">
                        <tr><td colspan="5" class="p-10 text-center italic">Chargement...</td></tr>
                    </tbody>
                </table>
            </div>`;
    },

    // ... (Le reste des fonctions fetchData, openForm et save reste identique)
};
