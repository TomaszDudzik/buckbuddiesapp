// server.js
import express from 'express';
import { insertUserData } from '.custom/authentication/insert_user_to_db.js';

const app = express();
app.use(express.json());

app.post('/insert-user', async (req, res) => {
    try {
        await insertUserData(req.body);
        res.status(200).send('User data inserted successfully.');
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});