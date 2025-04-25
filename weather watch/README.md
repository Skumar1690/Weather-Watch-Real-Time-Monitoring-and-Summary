# Weather-Watch 🌤
A React + Vite based real-time weather app using OpenWeatherMap API.

## 🚀 Features
- 🔍 Search by City & Country Code
- 🌡️ Shows current temperature, max/min, and condition
- 🎨 Beautiful responsive UI with gradient and glassmorphism
- ❌ Error handling for invalid inputs

## 🛠️ Tech Stack
- React (Vite)
- OpenWeatherMap API
- Vanilla CSS (no axios or extras)

## 📦 Setup

# Clone this repo (or start a Vite + React project on StackBlitz)
npx create-vite@latest weather-watch --template react
cd weather-watch

# Replace App.jsx and App.css with provided files
# Add your OpenWeatherMap API key in App.jsx

# Install dependencies
npm install

# Start the dev server
npm run dev

## 🔑 API Key
Get one for free at: https://openweathermap.org/api  
Replace the placeholder in `App.jsx`:
const API_KEY = "YOUR_API_KEY_HERE";

## 🌍 Example Search
City: Mumbai  
Country Code: IN  
Input: `Mumbai`, `IN`

## 📸 UI Preview
- Gradient background
- Search form with input validation
- Glass effect results box

## ✅ TODO (Next Steps)
- Add weather icons
- Add Chart.js for trends
- Add auto-suggestions or recent searches

---
