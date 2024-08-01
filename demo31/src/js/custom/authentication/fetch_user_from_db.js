import KTSignupGeneral from './sign-up/general.js';
const { Spanner } = require('@google-cloud/spanner');

// Function to fetch user data
async function fetchUserData(userId) {
    // Create a Spanner client
    const spanner = new Spanner({
        projectId: 'buckbuddiesapp',
    });

    // Get a reference to a Cloud Spanner instance and database
    const instance = spanner.instance('buckbuddiesapp');
    const database = instance.database('test_db');

    const query = {
        sql: 'SELECT * FROM Users WHERE UserId = @userId',
        params: {
            userId: userId,
        },
    };

    const [rows] = await database.run(query);
    return rows.map(row => row.toJSON());
}

// Function to populate the page with user data
function populateUserData(userData) {
    // Example: Populate a div with user data
    const userDiv = document.querySelector('#user-data');
    userDiv.innerHTML = `
        <h1>Welcome, ${userData.UserName}</h1>
        <p>Email: ${userData.UserEmail}</p>
        <!-- Add more fields as necessary -->
    `;
}

// On document ready
document.addEventListener('DOMContentLoaded', async function () {
    // Initialize the signup form
    KTSignupGeneral.init();

    // Check if the user is on the user account page
    if (window.location.pathname === '/user-account') {
        // Get the current user ID from Firebase
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            try {
                const userData = await fetchUserData(userId);
                populateUserData(userData[0]);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    }
});