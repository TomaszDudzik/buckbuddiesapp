const express = require('express');
const bodyParser = require('body-parser');
const firebaseAdmin = require('./firebase');
const spannerDb = require('./spanner');

const app = express();
app.use(bodyParser.json());

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization;
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

app.post('/api/storeUser', verifyToken, async (req, res) => {
  const { uid, email } = req.body;
  const userTable = spannerDb.table('Users');

  try {
    await userTable.insert({
      uid,
      email,
    });
    res.status(200).send('User stored in Spanner');
  } catch (error) {
    res.status(500).send('Error storing user in Spanner');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
