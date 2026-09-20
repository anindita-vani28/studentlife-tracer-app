// Weather service using Open-Meteo (free, no API key needed)

export type WeatherData = {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  isDaytime: boolean
  isDrizzling: boolean
  isRaining: boolean
  isCloudy: boolean
  isSnowing: boolean
  isStormy: boolean
}

export type GeocodeResult = {
  latitude: number
  longitude: number
  name: string
  country: string
}

export type WeatherTheme = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm'

export const WEATHER_THEMES: WeatherTheme[] = ['clear', 'cloudy', 'rain', 'snow', 'storm']

export function getWeatherTheme(weather: WeatherData): WeatherTheme {
  if (weather.isStormy) return 'storm'
  if (weather.isSnowing) return 'snow'
  if (weather.isRaining) return 'rain'
  if (weather.isCloudy) return 'cloudy'
  return 'clear'
}

// Get weather code description
function getWeatherCondition(code: number): string {
  // WMO Weather interpretation codes
  if (code === 0) return 'Clear'
  if (code === 1 || code === 2) return 'Mostly Clear'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 67) return 'Drizzle'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain Showers'
  if (code >= 85 && code <= 86) return 'Snow Showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

// Geocode location (city name or coordinates) to lat/lng
export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
  )

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    throw new Error(`Location not found: ${location}`)
  }

  const result = data.results[0]
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country || '',
  }
}

// Get weather for coordinates
export async function getWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&temperature_unit=fahrenheit`
  )

  if (!response.ok) {
    throw new Error(`Weather API failed: ${response.statusText}`)
  }

  const data = await response.json()
  const current = data.current

  const condition = getWeatherCondition(current.weather_code)
  const isDrizzling = current.weather_code >= 51 && current.weather_code <= 57
  const isRaining = (current.weather_code >= 51 && current.weather_code <= 67)
    || (current.weather_code >= 80 && current.weather_code <= 82)
  const isCloudy = current.weather_code === 2
    || current.weather_code === 3
    || current.weather_code === 45
    || current.weather_code === 48
  const isSnowing = (current.weather_code >= 71 && current.weather_code <= 77)
    || (current.weather_code >= 85 && current.weather_code <= 86)
  const isStormy = current.weather_code >= 95 && current.weather_code <= 99

  return {
    temperature: current.temperature_2m,
    condition,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    isDaytime: current.is_day === 1,
    isDrizzling,
    isRaining,
    isCloudy,
    isSnowing,
    isStormy,
  }
}

// Get weather by location name
export async function getWeatherByLocation(location: string): Promise<WeatherData & { location: GeocodeResult }> {
  const geo = await geocodeLocation(location)
  const weather = await getWeather(geo.latitude, geo.longitude)

  return {
    ...weather,
    location: geo,
  }
}
