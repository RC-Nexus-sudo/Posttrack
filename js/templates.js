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
                <div id="${id}-content">${body}</div> 
    </div>`;
    }, // <-- Virgule obligatoire ici

    // 3. FORMULAIRE DE SAISIE (MODAL)
    entryForm: function() {
        return `
            <div class="p-10">
            <header class="mb-8">
                <h3 class="text-2xl font-black text-slate-800 tracking-tight">Nouvel Enregistrement</h3>
                <p class="text-slate-400 text-sm italic font-medium">Saisie rigoureuse du courrier entrant</p>
            </header>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <!-- 1. Mode de réception -->
                <div>
                    <label class="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">1. Mode de réception</label>
                    <select id="mail-mode" class="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium text-sm">
                        <option value="Direct">Direct</option>
                        <option value="Poste">Poste</option>
                        <option value="Transporteur">Transporteur</option>
                        <option value="Huissiers">Huissiers</option>
                        <option value="Police">Police</option>
                    </select>
                </div>

                <!-- 2. Type de lettre -->
                <div>
                    <label class="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">2. Type de pli</label>
                    <select id="mail-type" class="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium text-sm">
                        <option value="Simple">Simple</option>
                        <option value="Prior">Prior</option>
                        <option value="Recommandé">Recommandé</option>
                        <option value="Recommandé AR">Recommandé AR</option>
                    </select>
                </div>

                <!-- 3. Expéditeur -->
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">3. Expéditeur</label>
                    <input type="text" id="mail-sender" placeholder="Nom, Institution ou Entreprise..." class="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition font-medium text-sm">
                </div>

                <!-- 4. Service destinataire -->
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">4. Service destinataire</label>
                    <select id="mail-dest-service" class="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium text-sm">
                        <option value="">Chargement des services...</option>
                    </select>
                </div>

                <!-- 5. Description -->
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">5. Description de l'objet</label>
                    <textarea id="mail-subject" rows="3" placeholder="Contenu sommaire ou référence du dossier..." class="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium text-sm"></textarea>
                </div>
            </div>

            <div class="mt-10 flex gap-4">
                <button id="save-mail-btn" onclick="App.modules.entrants.save()" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100 uppercase text-xs tracking-widest">
                    Valider l'entrée
                </button>
                <button onclick="document.getElementById('modal-overlay').classList.replace('flex', 'hidden')" class="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition text-xs uppercase tracking-widest">
                    Annuler
                </button>
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
