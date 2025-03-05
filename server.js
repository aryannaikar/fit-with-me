require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Route to exchange code for an access token
app.post('/auth/token', async (req, res) => {
    const { code } = req.body;
    // console.log(code)

    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
        }));
        
        console.log("Access Token:", response.data.access_token); // Debugging
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching token:', error.response.data);
        res.status(500).json({ error: 'Failed to get access token' });
    }
});

// Route to fetch step count from Google Fit
app.get('/steps', async (req, res) => {
    const { accessToken } = req.query;

    try {
        const response = await axios.post(
            'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
            {
                "aggregateBy": [{ "dataTypeName": "com.google.step_count.delta" }],
                "bucketByTime": { "durationMillis": 86400000 },
                "startTimeMillis": Date.now() - 86400000,
                "endTimeMillis": Date.now()
            },
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        const steps = response.data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
        res.json({ steps });
    } catch (error) {
        console.error('Error fetching steps:', error.response.data);
        res.status(500).json({ error: 'Failed to fetch steps' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
