import { auth } from './td_firebase_init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function () {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // The user object has basic properties such as display name, email, etc.
            const userDisplayName = user.displayName;
            const userEmail = user.email;
            const userPhotoURL = user.photoURL;
            const userEmailVerified = user.emailVerified;

            // The user's ID, unique to the Firebase project. Do NOT use
            // this value to authenticate with your backend server, if
            // you have one. Use User.getToken() instead.
            const uid = user.uid;

            // Update header with user name
            document.getElementById('user-greeting').innerText = `Welcome, ${userDisplayName}, ${userEmail}`;
            
        } else {
            document.getElementById('user-greeting').innerText = `Demo Version`;
            console.log('No user is signed in.');
        }
    });
});

