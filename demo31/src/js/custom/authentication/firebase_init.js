// This file is used to initialize the Firebase app and connect to the Firestore database.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Add the Firebase products that you want to use
const firebaseConfig = {
  apiKey: "AIzaSyCHxfKTjZNvjbyjZyELmL64I5iIFeJFN5k",
  authDomain: "buckbuddiesapp.firebaseapp.com",
  projectId: "buckbuddiesapp",
  storageBucket: "buckbuddiesapp.appspot.com",
  messagingSenderId: "483445476447",
  appId: "1:483445476447:web:ef998a3885905a4ff01fea",
  measurementId: "G-WS3KHEF841"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth};
