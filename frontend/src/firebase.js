// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDqDJ__OuW4TXdSJ35-LXvW1A_GjAjYzaw",
    authDomain: "spotify-pagos.firebaseapp.com",
    projectId: "spotify-pagos",
    storageBucket: "spotify-pagos.firebasestorage.app",
    messagingSenderId: "64423196377",
    appId: "1:64423196377:web:582c8f3c8886041b09f0c8",
    measurementId: "G-WK9C7HEQSZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);