// js/firebase-init.js

// ==========================================
// CONFIGURACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyB2hxjJkzHjABl_7gy2LIUA3SWBLwOrr6k",
    authDomain: "aranduka-web.firebaseapp.com",
    projectId: "aranduka-web",
    storageBucket: "aranduka-web.appspot.com",
    messagingSenderId: "42621456094",
    appId: "1:42621456094:web:35d86552061e7d0928fc4f"
};

// Initialize Firebase
let app, auth, db, storage;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    console.log("Firebase inicializado correctamente para: aranduka-web");
} catch (error) {
    console.error("Error inicializando Firebase.", error);
    alert("Error de conexión con la base de datos. Recarga la página.");
}
