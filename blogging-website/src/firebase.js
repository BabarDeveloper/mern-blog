// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-2ff1b.firebaseapp.com",
  projectId: "mern-blog-2ff1b",
  storageBucket: "mern-blog-2ff1b.firebasestorage.app",
  messagingSenderId: "1015483647559",
  appId: "1:1015483647559:web:3488749722b41f16a29362",
  measurementId: "G-48J4Q1GSNT",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
