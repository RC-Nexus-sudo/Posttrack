const App = {
    logger: {
        log: (msg, type = 'info') => {
            const container = document.getElementById('log-entries');
            const time = new Date().toLocaleTimeString();
            const color = type === 'error' ? 'text-red-400' : 'text-green-400';
            container.innerHTML += `<div class="${color}">[${time}] [${type.toUpperCase()}] : ${msg}</div>`;
            container.parentElement.scrollTop = container.parentElement.scrollHeight;
        },
        clear: () => document.getElementById('log-entries').innerHTML = ''
    }
};
