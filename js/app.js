document.addEventListener('DOMContentLoaded', () => {
    // 1. Générer la sidebar
    document.getElementById('sidebar-nav').innerHTML = App.templates.sidebar();
    
    // 2. Lancer le dashboard par défaut
    App.router.go('dashboard');

    // 3. Afficher l'heure en temps réel dans la Front Bar
    setInterval(() => {
        const now = new Date();
        document.getElementById('current-datetime').innerText = now.toLocaleString('fr-BE');
    }, 1000);
});
