/**
 * Configuration Firebase - Service Courrier
 * Ce fichier initialise la connexion à Firestore et à l'Auth.
 */

// Vos informations de connexion (à récupérer sur console.firebase.google.com)
// js/firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyBv7NP2Mxt8QslKpVl6Ik4Uk76DGoIP1ds",
    authDomain: "posttrack-fcb9b.firebaseapp.com",
    projectId: "posttrack-fcb9b",
    storageBucket: "posttrack-fcb9b.firebasestorage.app",
    messagingSenderId: "298056968036",
    appId: "1:298056968036:web:7b76259843af13fc2c7c71"
};

// Fonction d'initialisation sécurisée
function initFirebase() {
    try {
        // Vérification si le coeur de Firebase est chargé
        if (typeof firebase === 'undefined') throw new Error("Bibliothèque core manquante");

        firebase.initializeApp(firebaseConfig);
        
        // Vérification si Firestore est disponible (le fichier local peut mettre du temps)
        if (typeof firebase.firestore !== 'function') throw new Error("Module Firestore non détecté");

        window.db = firebase.firestore();
        window.auth = firebase.auth();

        // Persistance
        window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        App.logger.log("✅ Firebase & Firestore (Locaux) connectés", "info");
    } catch (error) {
        App.logger.log("❌ Erreur critique : " + error.message, "error");
        // Si Firestore n'est pas encore prêt, on réessaie dans 200ms
        if (error.message.includes("Firestore")) {
            setTimeout(initFirebase, 200);
        }
    }
}
App.utils.getNewIndicator = async function() {
    // Référence au document 'compteur' dans la collection 'compteurs' (ajustez le nom de la collection si nécessaire)
    const counterRef = window.db.collection("compteurs").doc("courriersEntrants");

    try {
        const newIndicator = await window.db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            if (!counterDoc.exists) {
                // Initialise le compteur s'il n'existe pas
                transaction.set(counterRef, { currentCount: 1 });
                return 1;
            }

            const newCount = counterDoc.data().currentCount + 1;
            transaction.update(counterRef, { currentCount: newCount });
            return newCount;
        });

        // Formate le numéro sur 6 chiffres (ex: 000142)
        return String(newIndicator).padStart(6, '0');

    } catch (error) {
        App.logger.log("Erreur lors de la génération de l'indicateur: " + error, "error");
        throw error;
    }
};
initFirebase();

