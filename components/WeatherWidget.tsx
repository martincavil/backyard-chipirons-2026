'use client';

import { useEffect, useState } from 'react';

// Bayonne coordinates
const LATITUDE = 43.49;
const LONGITUDE = -1.47;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
}

// Weather code to emoji mapping (WMO Weather interpretation codes)
const getWeatherEmoji = (code: number): string => {
  if (code === 0) return '☀️'; // Clear sky
  if (code === 1 || code === 2) return '🌤️'; // Mainly clear, partly cloudy
  if (code === 3) return '☁️'; // Overcast
  if (code >= 45 && code <= 48) return '🌫️'; // Fog
  if (code >= 51 && code <= 57) return '🌧️'; // Drizzle
  if (code >= 61 && code <= 67) return '🌧️'; // Rain
  if (code >= 71 && code <= 77) return '❄️'; // Snow
  if (code >= 80 && code <= 82) return '🌦️'; // Rain showers
  if (code >= 85 && code <= 86) return '🌨️'; // Snow showers
  if (code >= 95 && code <= 99) return '⛈️'; // Thunderstorm
  return '🌤️';
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Paris`;
      const response = await fetch(url);
      const data = await response.json();

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        windSpeed: Math.round(data.current.wind_speed_10m),
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading || !weather) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        backgroundColor: 'rgba(26, 26, 46, 0.8)',
        border: '1px solid #333',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'var(--font-oswald)',
        color: '#eee',
        backdropFilter: 'blur(4px)',
      }}
    >
      <span style={{ fontSize: '24px' }}>
        {getWeatherEmoji(weather.weatherCode)}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '20px', fontWeight: 500 }}>
          {weather.temperature}°C
        </span>
      </div>
      <div
        style={{
          height: '20px',
          width: '1px',
          backgroundColor: '#444',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>💨</span>
        <span style={{ fontSize: '14px' }}>{weather.windSpeed} km/h</span>
      </div>
    </div>
  );
}
