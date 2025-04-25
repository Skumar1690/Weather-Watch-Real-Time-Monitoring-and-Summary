import React, { useState } from "react";
import "./App.css";

const API_KEY = "6d00894aabc66a84ad788985ff252614";

export default function App() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const kelvinToCelsius = (k) => (k - 273.15).toFixed(2);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setWeather(null);

    if (!city || !country) {
      setError("Please enter both city and country code.");
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}`
      );
      const data = await res.json();

      if (data.cod !== 200) {
        setError(data.message);
        return;
      }

      const temp = kelvinToCelsius(data.main.temp);
      const max = kelvinToCelsius(data.main.temp_max);
      const min = kelvinToCelsius(data.main.temp_min);
      const condition = data.weather[0].main;

      setWeather({
        city: data.name,
        country: data.sys.country,
        temp,
        max,
        min,
        condition,
      });
    } catch (err) {
      setError("Error fetching weather data.");
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>🌤 Weather-Watch</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="text"
            placeholder="Country Code (e.g., IN)"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-box">
            <h2>
              {weather.city}, {weather.country}
            </h2>
            <p>Temperature: {weather.temp}°C</p>
            <p>Max: {weather.max}°C | Min: {weather.min}°C</p>
            <p>Condition: {weather.condition}</p>
          </div>
        )}
      </div>
    </div>
  );
}
