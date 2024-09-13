const express = require("express");
const path = require("path");
const url = require("url");
const apicache = require("apicache");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const needle = require("needle");
require("dotenv").config();

const app = express();

app.use(cors());

let cache = apicache.middleware;

const port = process.env.PORT || 4444;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const cacheTime = process.env.CACHE_TIME;
const rateLimitTime = process.env.RATELIMIT_TIME * 60 * 1000;

let limit = rateLimit({
  windowMs: rateLimitTime,
  max: 5,
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
  },
});
app.use(limit);

const API_BASE_KEY = process.env.API_BASE_KEY;
const API_KEY_VALUE = process.env.API_KEY_VALUE;
const API_BASE_URL = process.env.API_BASE_URL;

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

  if (req.rateLimit) {
    console.log({
      rateLimit: {
        limit: req.rateLimit.limit,
        current: req.rateLimit.current,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString(),
      },
    });
  }

  next();
});

app.get("/getWeather", cache(cacheTime), async (req, res) => {
  try {
    const city = req.query.q;

    console.log({
      index: apicache.getIndex(),
    });

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

    res.status(200).json({
      data,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

app.listen(port, () => {
  console.log(`API proxy server listening at http://localhost:${port}`);
});