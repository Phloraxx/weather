import { useState, useEffect, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';

const conditions = {
  Thunderstorm: { bg: 'thunderstorm', icon: '11d' },
  Drizzle: { bg: 'drizzle', icon: '09d' },
  Rain: { bg: 'rain', icon: '10d' },
  Snow: { bg: 'snow', icon: '13d' },
  Mist: { bg: 'mist', icon: '50d' },
  Smoke: { bg: 'mist', icon: '50d' },
  Haze: { bg: 'mist', icon: '50d' },
  Dust: { bg: 'mist', icon: '50d' },
  Fog: { bg: 'mist', icon: '50d' },
  Clear: { bg: 'clear', icon: '01d' },
  Clouds: { bg: 'clouds', icon: '02d' },
};

function getCondition(main) {
  return conditions[main] || { bg: 'default', icon: '01d' };
}

function dayName(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('weather-cities') || '[]'); }
    catch { return []; }
  });

  const fetchWeather = useCallback(async (city) => {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      setError('Set your OpenWeather API key in the .env file');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`),
      ]);
      if (!wRes.ok) {
        const msg = wRes.status === 404 ? 'City not found' : 'Failed to load weather';
        setError(msg);
        setLoading(false);
        return;
      }
      const wData = await wRes.json();
      const fData = await fRes.json();
      setWeather(wData);
      const daily = fData.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      ).slice(0, 5);
      setForecast(daily.length ? daily : fData.list.filter((_, i) => i % 8 === 0).slice(0, 5));
      updateRecent(wData.name);
    } catch {
      setError('Network error. Check your connection.');
    }
    setLoading(false);
  }, []);

  function updateRecent(name) {
    setRecent((prev) => {
      const next = [name, ...prev.filter((c) => c !== name)].slice(0, 5);
      localStorage.setItem('weather-cities', JSON.stringify(next));
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const city = query.trim();
    if (!city) return;
    fetchWeather(city);
  }

  function handleRecent(city) {
    setQuery(city);
    fetchWeather(city);
  }

  const cond = weather ? getCondition(weather.weather[0].main) : null;

  return (
    <div className={`app ${cond ? cond.bg : 'default'}`}>
      <div className="app-bg"></div>

      <div className="container">
        <form className="search" onSubmit={handleSubmit}>
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {error && <div className="error">{error}</div>}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {weather && !loading && (
          <>
            <div className="current">
              <div className="current-main">
                <img
                  className="current-icon"
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt={weather.weather[0].description}
                />
                <div className="current-temp">{Math.round(weather.main.temp)}</div>
                <div className="current-unit">°C</div>
              </div>
              <div className="current-info">
                <h1 className="current-city">{weather.name}</h1>
                <p className="current-desc">{weather.weather[0].description}</p>
              </div>
            </div>

            <div className="details">
              <div className="detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">{Math.round(weather.main.feels_like)}°</span>
              </div>
              <div className="detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2v20"/>
                  <path d="M2 12h20"/>
                </svg>
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weather.main.humidity}%</span>
              </div>
              <div className="detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                </svg>
                <span className="detail-label">Wind</span>
                <span className="detail-value">{Math.round(weather.wind.speed)} km/h</span>
              </div>
              <div className="detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span className="detail-label">Pressure</span>
                <span className="detail-value">{weather.main.pressure} hPa</span>
              </div>
            </div>

            {forecast && (
              <div className="forecast">
                <h2 className="forecast-title">5-Day Forecast</h2>
                <div className="forecast-grid">
                  {forecast.map((day, i) => (
                    <div key={i} className="forecast-day">
                      <span className="forecast-day-name">{i === 0 ? 'Today' : dayName(day.dt)}</span>
                      <img
                        className="forecast-icon"
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                        alt={day.weather[0].description}
                      />
                      <div className="forecast-temps">
                        <span className="forecast-high">{Math.round(day.main.temp_max)}°</span>
                        <span className="forecast-low">{Math.round(day.main.temp_min)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!weather && !loading && !error && (
          <div className="welcome">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.15">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <p className="welcome-text">Search for a city to see the weather</p>
          </div>
        )}

        {recent.length > 0 && (
          <div className="recent">
            <span className="recent-label">Recent</span>
            <div className="recent-list">
              {recent.map((city) => (
                <button key={city} className="recent-chip" onClick={() => handleRecent(city)}>
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
