import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
   apiKey: "AIzaSyD3husBYrq1tY-K3I87PL7Vjnq9iVkPyWk",
  authDomain: "drevantatrade.firebaseapp.com",
  projectId: "drevantatrade",
  storageBucket: "drevantatrade.firebasestorage.app",
  messagingSenderId: "443069466176",
  appId: "1:443069466176:web:793c8acb38fccf86aa41a5",
  measurementId: "G-QTLQJKLVP4"

  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth =getAuth(app)
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };