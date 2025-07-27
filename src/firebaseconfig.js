import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUBLdwITiw2dZcW0Qow5GWun3YxxyLllE",
    authDomain: "movie-recommender-f0ad3.firebaseapp.com",
    projectId: "movie-recommender-f0ad3",
    storageBucket: "movie-recommender-f0ad3.firebasestorage.app",
    messagingSenderId: "654882199374",
    appId: "1:654882199374:web:f3932d9282b51aab2f701f",
    measurementId: "G-LRDS7YN7TC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth for web
export const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { db };
export default app;