'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserPreferences } from '@/lib/supabase/database'
import { getWeatherByLocation, getWeatherTheme, WEATHER_THEMES, type WeatherTheme } from '@/lib/weather'

export function WeatherAppShell({ children }: { children: ReactNode }) {
  const [weatherEffect, setWeatherEffect] = useState<WeatherTheme>('clear')
  const [isDaytime, setIsDaytime] = useState(true)
  const [isDrizzling, setIsDrizzling] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadWeather() {
      let location = 'New York'

      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()

        if (data.user) {
          try {
            const preferences = await getUserPreferences()
            location = preferences?.location?.trim() || location
          } catch {
            // A saved location is optional; retain the default when unavailable.
          }
        }

        const weather = await getWeatherByLocation(location)

        if (isCurrent) {
          setWeatherEffect(getWeatherTheme(weather))
          setIsDaytime(weather.isDaytime)
          setIsDrizzling(weather.isDrizzling)
        }
      } catch {
        // Keep the clear fallback theme if live weather cannot be reached.
      }
    }

    loadWeather()

    return () => {
      isCurrent = false
    }
  }, [])

  return (
    <div className={`weather-app-shell ${isDaytime ? 'is-day' : 'is-night'}`}>
      <div className={`weather-sky ${isDaytime ? 'is-day' : 'is-night'}`} aria-hidden="true">
        {WEATHER_THEMES.map((theme) => (
          <div
            key={theme}
            className={`weather-gradient weather-gradient-${theme} ${weatherEffect === theme ? 'is-active' : ''}`}
          />
        ))}
        <div className={`weather-atmosphere weather-atmosphere-${weatherEffect} ${isDrizzling ? 'is-drizzle' : ''}`}>
          <span className="weather-stars" />
          <span className="weather-orb" />
          <span className="weather-cloud weather-cloud-one" />
          <span className="weather-cloud weather-cloud-two" />
          <span className="weather-cloud weather-cloud-three" />
          <span className="weather-precipitation" />
        </div>
      </div>

      <div className="weather-app-content">{children}</div>
    </div>
  )
}
