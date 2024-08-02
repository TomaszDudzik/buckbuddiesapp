import { auth } from './td_firebase_init.js';

// Check authentication status
export function checkAuthStatus() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, load personalized content
            loadUserContent(user);
        } else {
            // No user is signed in, load demo content
            loadDemoContent();
        }
    });
}

// Load demo content
export function loadDemoContent() {
    fetch('/templates/content_demo.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('kt_app_wrapper').innerHTML = html;
        });
}