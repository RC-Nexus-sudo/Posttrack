/**
 * Configuration Firebase - Service Courrier
 * Ce fichier initialise la connexion à Firestore et à l'Auth.
 */

// Vos informations de connexion (à récupérer sur console.firebase.google.com)
const firebaseConfig = {
    apiKey: "AIzaSyBv7NP2Mxt8QslKpVl6Ik4Uk76DGoIP1ds",
    authDomain: "posttrack-fcb9b.firebaseapp.com",
    projectId: "posttrack-fcb9b",
    storageBucket: "posttrack-fcb9b.firebasestorage.app",
    messagingSenderId: "298056968036",
    appId: "1:298056968036:web:7b76259843af13fc2c7c71"
};

// Initialisation de Firebase
try {
    firebase.initializeApp(firebaseConfig);
    
    // Initialisation des services
    const db = firebase.firestore();
    const auth = firebase.auth();

    // Exportation globale pour les autres modules (.js)
    window.db = db;
    window.auth = auth;

    App.logger.log("✅ Connexion Firebase établie avec succès", "info");
} catch (error) {
    App.logger.log("❌ Erreur d'initialisation Firebase : " + error.message, "error");
}

// Persistance de la session (reste connecté même si on ferme le navigateur)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => App.logger.log("Système : Erreur de persistance", "error"));
