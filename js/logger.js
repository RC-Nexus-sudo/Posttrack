var App = App || {}; 

App.logger = {
    log: function(msg, type = 'info') {
        const container = document.getElementById('log-entries');
        if (!container) return;
        const time = new Date().toLocaleTimeString();
        const colors = {
            'info': 'text-emerald-400',
            'error': 'text-red-400',
            'debug': 'text-blue-400'
        };
        const color = colors[type] || 'text-white';
        container.innerHTML += `<div class="${color} mb-1">[${time}] [${type.toUpperCase()}] : ${msg}</div>`;
        container.scrollTop = container.scrollHeight;
    },
    clear: () => {
        const entries = document.getElementById('log-entries');
        if (entries) entries.innerHTML = '';
    }
};
