# Weather API Proxy Server

This project is an API proxy server that fetches weather data from the OpenWeatherMap API. It is built using **Node.js** with **Express.js** and implements features like **rate limiting**, **caching**, and **CORS** to enhance performance and security. The server is intended to fetch weather information for any city provided in the query.

## Features

- **CORS enabled**: Allows cross-origin resource sharing.
- **Rate limiting**: Prevents abuse by limiting the number of requests an IP can make within a set time frame (5 requests per 5 minutes).
- **Caching**: Caches weather data for 2 minutes to reduce external API requests.
- **Error Handling**: Handles and returns proper error responses for invalid requests, rate limit exceedance, and internal server errors.

## Prerequisites

- **Node.js** (version 14.x or higher)
- **npm** (Node Package Manager)
- OpenWeatherMap API key. You can get an API key by signing up at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up).

## Project Setup

### Clone the repository

To clone this project to your local machine, run the following command:

```bash
git clone https://github.com/Skumar1690/-API-Proxy-Server.git
cd -API-Proxy-Server
```

## Environment Variables

You need to configure your environment variables to run this project. Create a `.env` file in the root of the project and add the following details:

```bash
API_BASE_URL=http://api.openweathermap.org/data/2.5/weather
API_BASE_KEY=appid
API_KEY_VALUE=YOUR_API_KEY


```