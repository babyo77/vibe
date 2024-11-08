import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "vibe-d49bd.firebaseapp.com",
  projectId: "vibe-d49bd",
  storageBucket: "vibe-d49bd.appspot.com",
  messagingSenderId: "285843330561",
  appId: "1:285843330561:web:f751510d7f43d583c95200",
  measurementId: "G-D9Y2W9GQF6",
};
export const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const provider = new GoogleAuthProvider();
