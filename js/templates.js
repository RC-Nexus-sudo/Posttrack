/**
 * Templates Module - Composants UI
 */
var App = App || {}; 

App.templates = {
    // 1. GÉNÉRATEUR DE LA SIDEBAR
    sidebar: function() {
        if (!App.router || !App.router.routes) return "";
        return Object.keys(App.router.routes).map(id => {
            const route = App.router.routes[id];
            return `
                <button onclick="App.router.go('${id}')" id="btn-${id}" 
                        class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 transition-all group">
                    <i class="fa-solid ${route.icon} w-5"></i>
                    <span class="font-medium">${route.title}</span>
                </button>`;
        }).join('');
    }, // <-- Virgule obligatoire ici

    // 2. GÉNÉRATEUR DES VUES (MAIN CONTENT)
    renderView: function(id, title) {
        let headerAction = "";
        let body = "";

        if (id === 'dashboard') {
            body = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    ${this.dashCard('Entrants', '0', 'fa-download', 'text-blue-600', 'stat-in-dash')}
                    ${this.dashCard('Sortants', '0', 'fa-upload', 'text-emerald-600', 'stat-out-dash')}
                    ${this.dashCard('E-mails', '0', 'fa-at', 'text-amber-600', 'stat-email-dash')}
                    ${this.dashCard('eBox', '0', 'fa-box-archive', 'text-indigo-600', 'stat-ebox-dash')}
                </div>
                <div class="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center italic text-slate-400">
                    Vue Dashboard Active - Analyse des flux en cours...
                </div>`;
        } 
        else if (id === 'entrants') {
            headerAction = `
                <button onclick="App.modules.entrants.openForm()" class="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> Nouveau Courrier
                </button>`;
            body = `<div id="entrants-content" class="p-4 text-slate-400 italic text-sm text-center">Initialisation du registre...</div>`;
        }
        else if (id === 'parametres') {
            body = `
                <div class="max-w-xl mx-auto bg-slate-900 p-8 rounded-[2.5rem] text-center shadow-2xl">
                    <i class="fa-solid fa-user-shield text-4xl text-blue-400 mb-4"></i>
                    <h3 class="text-white font-bold mb-2">Console d'administration</h3>
                    <p class="text-slate-400 text-xs mb-6">Redirection sécurisée vers le registre des habilitations...</p>
                    <a href="admin.html" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Ouvrir</a>
                </div>`;
        } 
        else {
            body = `<div class="p-10 bg-slate-50 border border-dashed rounded-[2.5rem] text-slate-400 text-center italic">Module ${title} en attente.</div>`;
        }

        return `
            <div class="animate-fade-in flex flex-col h-full">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-black text-slate-800 tracking-tight">${title}</h2>
                        <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-70">SGC Monitoring</p>
                    </div>
                    <div>${headerAction}</div>
                </div>
                <div class="flex-1">${body}</div>
            </div>`;
    }, // <-- Virgule obligatoire ici

    // 3. FORMULAIRE DE SAISIE (MODAL)
    entryForm: function() {
        return `
            <div class="p-10">
                <h3 class="text-2xl font-black text-slate-800 mb-6 tracking-tight text-left">Nouvel Enregistrement</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div class="md:col-span-2">
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Expéditeur</label>
                        <input type="text" id="mail-sender" placeholder="Origine..." class="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Service</label>
                        <select id="mail-dest-service" class="w-full p-4 bg-slate-50 rounded-2xl outline-none"></select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Type</label>
                        <select id="mail-type" class="w-full p-4 bg-slate-50 rounded-2xl outline-none">
                            <option>Lettre</option><option>Recommandé</option><option>Facture</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Objet</label>
                        <textarea id="mail-subject" rows="2" class="w-full p-4 bg-slate-50 rounded-2xl outline-none"></textarea>
                    </div>
                </div>
                <div class="mt-10 flex gap-4">
                    <button onclick="App.modules.entrants.save()" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition">VALIDER</button>
                    <button onclick="document.getElementById('modal-overlay').classList.replace('flex', 'hidden')" class="px-8 py-4 text-slate-400 font-bold">ANNULER</button>
                </div>
            </div>`;
    }, // <-- Virgule obligatoire ici

    // 4. HELPER DASHCARD
    dashCard: function(label, val, icon, color, id) {
        return `
            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color} text-lg border border-slate-100">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div>
                    <p class="text-[10px] font-black uppercase text-slate-400 tracking-tighter">${label}</p>
                    <p class="text-2xl font-black text-slate-800" id="${id}">${val}</p>
                </div>
            </div>`;
    }
}; // FERMETURE FINALE DE L'OBJET
