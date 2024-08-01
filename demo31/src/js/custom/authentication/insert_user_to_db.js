const { Spanner } = require('@google-cloud/spanner');

// Function to insert user data into Spanner
async function insertUserData(user) {
    const spanner = new Spanner({
        projectId: 'buckbuddiesapp',
    });

    const instance = spanner.instance('buckbuddiesapp');
    const database = instance.database('test_db');
    const table = database.table('Users');

    const userData = {
        UserId: user.uid,
        UserName: user.displayName || 'Anonymous',
        UserEmail: user.email,
        // Add more fields as necessary
    };

    await table.insert([userData]);
}

export { insertUserData };