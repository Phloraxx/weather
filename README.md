# Weather App

A responsive weather application built with React and the OpenWeatherMap API. Search any city to view current conditions and a 5-day forecast.

[Live Demo](https://phloraxx.github.io/weather/)

## Features

- Search by city name with recent search history (saved locally)
- Current weather: temperature, feels like, humidity, wind speed, pressure
- 5-day forecast with daily highs and lows
- Dynamic gradient backgrounds that reflect weather conditions
- Responsive design optimized for mobile and desktop
- OpenWeatherMap icons and weather data

## Setup

```bash
git clone https://github.com/Phloraxx/weather.git
cd weather
npm install
```

Create a `.env` file in the project root:

```env
VITE_WEATHER_API_KEY=your_openweathermap_api_key
```

Get a free API key at [https://openweathermap.org/api](https://openweathermap.org/api).

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```
