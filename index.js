const express = require("express");
const path = require("path");
const url = require("url");
const apicache = require("apicache");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const needle = require("needle");
require("dotenv").config();

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());
let cache = apicache.middleware;

// In-memory storage for weather data
class WeatherDataStore {
    constructor() {
        this.dailyReadings = new Map(); // city -> readings
        this.dailySummaries = new Map(); // city -> summary
        this.alerts = new Map(); // city -> alerts
    }

    addReading(city, data) {
        if (!this.dailyReadings.has(city)) {
            this.dailyReadings.set(city, []);
        }
        const readings = this.dailyReadings.get(city);
        readings.push({
            timestamp: new Date(),
            temperature: this.kelvinToCelsius(data.main.temp),
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure
        });

        // Keep only last 24 hours of readings
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.dailyReadings.set(city, 
            readings.filter(reading => reading.timestamp > twentyFourHoursAgo)
        );

        this.updateSummary(city);
        return this.checkAlerts(city, data);
    }

    kelvinToCelsius(kelvin) {
        return kelvin - 273.15;
    }

   updateSummary(city) {
    const readings = this.dailyReadings.get(city) || [];

    if (readings.length === 0) return null;

    // Collect temperatures and conditions from readings
    const temperatures = readings.map(r => r.temperature);
    const conditions = readings.map(r => r.condition.toLowerCase()); // Normalize to lowercase

    // the dominant condition
    const conditionCounts = conditions.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {});

    const sortedConditions = Object.entries(conditionCounts)
        .sort((a, b) => b[1] - a[1]); // Sort by count

    const dominantCondition = sortedConditions.length > 0 ? sortedConditions[0][0] : "Unknown";

    // Create the summary object
    const summary = {
        city,
        averageTemp: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        maxTemp: Math.max(...temperatures),
        minTemp: Math.min(...temperatures),
        dominantCondition,
        readingCount: readings.length,
        lastUpdated: new Date(),
        date: new Date().toISOString().split('T')[0],
    };

    // Save summary to the store
    this.dailySummaries.set(city, summary);
    return summary;
}


    getSummary(city) {
        return this.dailySummaries.get(city);
    }

    checkAlerts(city, currentWeather) {
        const temp = this.kelvinToCelsius(currentWeather.main.temp);
        const alerts = [];

        // Temperature thresholds
        if (temp > 35) {
            alerts.push(`High Temperature Alert: Current temperature (${temp.toFixed(1)}°C) exceeds 35°C`);
        }
        if (temp < 0) {
            alerts.push(`Low Temperature Alert: Current temperature (${temp.toFixed(1)}°C) is below 0°C`);
        }

        // Weather condition alerts
        const severeConditions = ['Thunderstorm', 'Tornado', 'Hurricane'];
        if (severeConditions.includes(currentWeather.weather[0].main)) {
            alerts.push(`Severe Weather Alert: ${currentWeather.weather[0].main} detected`);
        }

        // Rain alert
        if (currentWeather.weather[0].main === 'Rain') {
            alerts.push('Rain Alert: Precipitation detected');
        }

        // High wind alert
        if (currentWeather.wind.speed > 10) {
            alerts.push(`High Wind Alert: Wind speed ${currentWeather.wind.speed}m/s exceeds 10m/s`);
        }

        this.alerts.set(city, alerts);
        return alerts;
    }

    getAlerts(city) {
        return this.alerts.get(city) || [];
    }

    getAllSummaries() {
        return Array.from(this.dailySummaries.values());
    }
}

const weatherStore = new WeatherDataStore();

// Constants
const port = process.env.PORT || 4444;
const cacheTime = process.env.CACHE_TIME;
const rateLimitTime = process.env.RATELIMIT_TIME * 60 * 1000;
const API_BASE_KEY = process.env.API_BASE_KEY;
const API_KEY_VALUE = process.env.API_KEY_VALUE;
const API_BASE_URL = process.env.API_BASE_URL;
const SECRET_API_KEY = process.env.SECRET_API_KEY;

// Middleware
app.use((req, res, next) => {
    console.log({
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: url.format({
            protocol: req.protocol,
            host: req.get("host"),
            pathname: req.originalUrl,
        }),
    });
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: rateLimitTime,
    max: 5,
    message: {
        status: 429,
        error: "Too many requests, please try again later.",
    },
});

app.use(limiter);

// Authentication middleware
const authenticate = (req, res, next) => {
    const clientApiKey = req.headers['x-api-key'];
    if (clientApiKey && clientApiKey === SECRET_API_KEY) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }
};

// Serve static files
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Get current weather
app.get("/getWeather", authenticate, cache(cacheTime), async (req, res) => {
    try {
        const city = req.query.q;

        if (!city) {
            return res.status(400).json({ error: "City is required" });
        }

        const params = new URLSearchParams({
            [API_BASE_KEY]: API_KEY_VALUE,
            q: city,
        });

        const apiRes = await needle("get", `${API_BASE_URL}?${params}`);
        const data = apiRes.body;

        if (apiRes.statusCode === 429) {
            return res.status(429).json({
                error: "Weather API rate limit exceeded. Please try again later.",
            });
        }

        if (apiRes.statusCode !== 200) {
            return res.status(apiRes.statusCode).json({
                error: data.message || "An error occurred while fetching weather data.",
            });
        }

        // Process the weather data
        const alerts = weatherStore.addReading(city, data);
        const summary = weatherStore.getSummary(city);

        res.status(200).json({
            data,
            alerts,
            summary
        });

    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "An internal server error occurred" });
    }
});

// Get weather summary
app.get("/getSummary", authenticate, async (req, res) => {
    try {
        const city = req.query.q;
        if (!city) {
            return res.status(400).json({ error: "City is required" });
        }

        const summary = weatherStore.getSummary(city);
        if (!summary) {
            return res.status(404).json({ error: "No summary available for this city" });
        }

        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: "Error fetching weather summary" });
    }
});

// Get all summaries
app.get("/getAllSummaries", authenticate, async (req, res) => {
    try {
        const summaries = weatherStore.getAllSummaries();
        res.json({ summaries });
    } catch (error) {
        res.status(500).json({ error: "Error fetching weather summaries" });
    }
});

// Get alerts
app.get("/getAlerts", authenticate, async (req, res) => {
    try {
        const city = req.query.q;
        if (!city) {
            return res.status(400).json({ error: "City is required" });
        }

        const alerts = weatherStore.getAlerts(city);
        res.json({ alerts });
    } catch (error) {
        res.status(500).json({ error: "Error fetching weather alerts" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong , Try again later!" });
});

// Start server
app.listen(port, () => {
    console.log(`API proxy server listening at http://localhost:${port}`);
});

// Cleanup old readings periodically
setInterval(() => {
    weatherStore.dailyReadings.forEach((readings, city) => {
        weatherStore.updateSummary(city);
    });
}, 5 * 60 * 1000);