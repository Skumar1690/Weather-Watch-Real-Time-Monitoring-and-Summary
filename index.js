const express = require('express');
const path = require('path');
const url = require('url');
const apicache = require('apicache');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const needle = require('needle');
require('dotenv').config();

const app = express();

app.use(cors());

let cache = apicache.middleware;

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let limit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        status: 429,
        error: 'Too many requests, please try again later.'
    }
});
app.use(limit);

const API_BASE_KEY = process.env.API_BASE_KEY;
const API_KEY_VALUE = process.env.API_KEY_VALUE;
const API_BASE_URL = process.env.API_BASE_URL;

app.get('/getWeather', cache('2 minutes'), async (req, res) => {
    try {
        const city = req.query.q;

        if (!city) {
            return res.status(400).json({ error: 'City is required' });
        }

        const params = new URLSearchParams({
            [API_BASE_KEY]: API_KEY_VALUE,
            q: city
        });

        const apiRes = await needle('get', `${API_BASE_URL}?${params}`);
        const data = apiRes.body;

        if (apiRes.statusCode === 429) {
            return res.status(429).json({ error: 'Weather API rate limit exceeded. Please try again later.' });
        }

        if (apiRes.statusCode !== 200) {
            return res.status(apiRes.statusCode).json({
                error: data.message || 'An error occurred while fetching weather data.'
            });
        }

        res.status(200).json({
            data
        });

    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

app.listen(port, () => {
    console.log(`API proxy server listening at http://localhost:${port}`);
});
