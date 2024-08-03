import { auth } from './td_firebase_init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function () {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        loadHeaderTemplate(user).then(() => {
            updateGreeting(user);
        });
    });
});


function loadHeaderTemplate(user) {
    const headerTemplate = user ? 'header_user.html' : 'header_demo.html';
    return fetch(headerTemplate)
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading header template:', error));
}

function updateGreeting(user) {
    if (user) {
        const userDisplayName = user.displayName;
        const userEmail = user.email;
        document.getElementById('user-greeting').innerText = `Welcome, ${userDisplayName}, ${userEmail}`;
    } else {
        document.getElementById('user-greeting').innerText = `Demo Version`;
        console.log('No user is signed in.');
    }
}