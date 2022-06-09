// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "twitter-dapp.firebaseapp.com",
  projectId: "twitter-dapp",
  storageBucket: "twitter-dapp.appspot.com",
  messagingSenderId: "98336204747",
  appId: "1:98336204747:web:51d7bbf36addb1e340b84e",
  measurementId: "G-28GE28Y14K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;