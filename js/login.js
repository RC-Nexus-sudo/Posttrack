// Attendre que tout le DOM et tous les scripts (y compris firebase-config.js) soient chargés
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM complètement chargé. Initialisation de la page de connexion.");

    // Maintenant, nous sommes sûrs que firebase.initializeApp() a été appelé
});

function loginUser() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('error-message');
    const errorTextSpan = document.getElementById('error-text');

    const email = emailInput.value;
    const password = passwordInput.value;

    // Masquer les erreurs précédentes
    errorMessageDiv.classList.add('hidden');
    errorTextSpan.textContent = '';

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Utilisateur connecté avec succès
            // Redirection vers la page principale (index.html)
            window.location.href = 'index.html';
        })
        .catch((error) => {
            // Gérer les erreurs de connexion (mauvais mot de passe, utilisateur inconnu...)
            const errorCode = error.code;
            let friendlyMessage = "Une erreur inconnue est survenue.";

            switch (errorCode) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    friendlyMessage = "E-mail ou mot de passe incorrect.";
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = "Format d'e-mail invalide.";
                    break;
                case 'auth/user-disabled':
                    friendlyMessage = "Votre compte a été désactivé.";
                    break;
            }

            errorTextSpan.textContent = friendlyMessage;
            errorMessageDiv.classList.remove('hidden');
        });
}
