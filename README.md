# Weather-Watch: Real-Time Monitoring and Summary System 🌤️

A sophisticated Node.js-based weather monitoring system that leverages the OpenWeatherMap API to provide real-time weather insights and daily summaries.

## 🌟 Features

- **Live Weather Data**: Real-time weather information for Indian cities (customizable for other regions)
- **Smart Temperature Handling**: Automatic conversion from Kelvin to Celsius
- **Intelligent Summaries**: Daily weather analytics including:
  - Average temperature
  - Maximum and minimum temperatures
  - Dominant weather conditions
- **Advanced Alerting System** (Bonus): Configurable thresholds for weather conditions
- **Visual Analytics** (Bonus): Weather trend visualization using Chart.js

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm (Node Package Manager)
- OpenWeatherMap API key ([Get yours here](https://home.openweathermap.org/users/sign_up))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Skumar1690/Weather-Watch-Real-Time-Monitoring-and-Summary.git
cd Weather-Watch-Real-Time-Monitoring-and-Summary
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# API Configuration

API_BASE_URL="http://api.openweathermap.org/data/2.5/weather"
API_BASE_KEY="appid"
API_KEY_VALUE="0845f0b322938a32731e842aa0aac735"
CACHE_TIME="5 minutes"  # Caching time for the weather data
RATELIMIT_TIME=5        # Rate limiting time in minutes for request limit per user
SECRET_API_KEY="souravisawesome" # Custom secret API key for securing proxy requests
```

### 3. Install Dependencies

```bash
npm install
```

## 💻 Core Functionality

### Weather Data Retrieval

```javascript
const axios = require("axios");

async function getWeather(city) {
  const url = `${process.env.API_BASE_URL}?q=${city}&appid=${process.env.API_KEY_VALUE}`;
  const response = await axios.get(url);
  return response.data;
}
```

### Temperature Conversion

```javascript
function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}
```

### Daily Summaries

The system automatically collects weather data at configured intervals and generates comprehensive daily summaries including:

- Temperature metrics (avg/max/min)
- Predominant weather conditions

### Alert System (Bonus Feature)

Configure custom alerts based on:

- Temperature thresholds
- Specific weather conditions
- Custom notification methods

### Data Visualization (Bonus Feature)

Implement visual analytics using Chart.js to track:

- Temperature trends
- Weather pattern changes
- Historical data analysis

## 📊 Example Usage

```javascript
// Fetch current weather
const weatherData = await getWeather("Mumbai");
console.log(`Current temperature: ${kelvinToCelsius(weatherData.main.temp)}°C`);
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- OpenWeatherMap API for weather data
- index.js for visualization capabilities

## 📧 Contact

- Project Link: [https://github.com/Skumar1690/Weather-Watch-Real-Time-Monitoring-and-Summary](https://github.com/Skumar1690/Weather-Watch-Real-Time-Monitoring-and-Summary)
