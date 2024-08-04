import { auth } from './td_firebase_init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for file upload
    document.getElementById('upload-form').addEventListener('submit', handleFileUpload);

    // Fetch user-specific data
    fetchUserData();
});

async function handleFileUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    try {
        const user = auth.currentUser;
        const idToken = await user.getIdToken();

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + idToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        const result = await response.json();
        alert('File uploaded successfully: ' + result.message);
        // Fetch user-specific data again to update the display
        fetchUserData();
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file: ' + error.message);
    }
}


async function fetchUserData() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('No user is signed in');
            return;
        }

        const idToken = await user.getIdToken();
        const response = await fetch('/getUserData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + idToken
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        displayUserData(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function displayUserData(userData) {
    const userDataContainer = document.getElementById('user-data');
    userDataContainer.innerHTML = '';  // Clear existing data
    userData.forEach(data => {
        const dataElement = document.createElement('div');
        dataElement.innerHTML = `
            <p>Column1: ${data.budget}</p>
        `;
        userDataContainer.appendChild(dataElement);
    });
}
