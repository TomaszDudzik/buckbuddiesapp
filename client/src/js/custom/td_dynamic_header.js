import { auth } from './td_firebase_init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function () {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadUserHeader(user);
        } else {
            loadDefaultHeader();
        }
    });
});

export function loadDefaultHeader() {
    document.getElementById('td_dynamic_header').innerHTML = `
		<span>Demo Version</span>
        <a href="./authentication/sign-in.html" id="signUpButton" class="btn btn-sm btn-success d-flex flex-center ms-6 ps-3 pe-4 h-35px">
			<span>Sign In</span>
		</a>
        <a href="./authentication/sign-up.html" id="signUpButton" class="btn btn-sm btn-success d-flex flex-center ms-6 ps-3 pe-4 h-35px">
			<span>Sign Up</span>
		</a>
    `;
}

// Load the user header
export function loadUserHeader(user) {
    document.getElementById('td_dynamic_header').innerHTML = `
	    <span>Welcome, ${user.displayName}, ${user.email}</span>	
        <a href="./content_cockpit.html" id="signOutButton" class="btn btn-sm btn-success d-flex flex-center ms-6 ps-3 pe-4 h-35px">
		<span>Sign Out</span>
		</a>
    `;
}

