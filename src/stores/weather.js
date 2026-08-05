import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const STORAGE_KEY = 'skala-weather-cities'
const REVERSE_GEO_URL = 'https://api.openweathermap.org/geo/1.0/reverse'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const SEOUL_COORDS = { lat: 37.5665, lon: 126.978 }

const normalize = (value) => value.trim().toLowerCase()

const getStoreCities = () => {
  try {
    const storedCities = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    return Array.isArray(storedCities) ? storedCities : []
  } catch {
    return []
  }
}

export const useWeatherStore = defineStore('weather', () => {
  const weatherList = ref(getStoreCities())
  const isLoading = ref(false)
  const lastUpdated = ref(null)
  const markUpdated = () => {
    lastUpdated.value = new Date()
  }

  const saveCities = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherList.value))
  }
  const requestCityWeather = async (cityQuery) => {
    if (!API_KEY) {
      throw new Error('OpenWeather API 키를 찾을 수 없습니다.')
    }

    // 한글 또는 영문 도시명을 좌표로 변환
    const geoResponse = await axios.get(GEO_URL, {
      params: {
        q: cityQuery,
        limit: 1,
        appid: API_KEY,
      },
    })

    const location = geoResponse.data[0]

    if (!location) {
      throw new Error('도시를 찾을 수 없습니다.')
    }
    const weatherResponse = await axios.get(WEATHER_URL, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })

    const weather = weatherResponse.data
    const koreanName = location.local_names?.ko ?? weather.name

    const searchKeywords = [
      cityQuery,
      location.name,
      weather.name,
      koreanName,
      ...Object.values(location.local_names ?? {}),
    ]
      .filter(Boolean)
      .map(normalize)

    return {
      id: String(weather.id),
      name: koreanName,
      searchKeywords: [...new Set(searchKeywords)],
      temp: weather.main.temp,
      feelsLike: weather.main.feels_like,
      humidity: weather.main.humidity,
      status: weather.weather[0].description,
      windSpeed: weather.wind.speed,
      lat: weather.coord.lat,
      lon: weather.coord.lon,
    }
  }

  const addCity = async (cityQuery) => {
    const query = cityQuery.trim()
    if (!query) return
    // if (!query) {
    //     throw new Error('도시명을 입력해 주세요.')
    // }

    isLoading.value = true

    try {
      const newCity = await requestCityWeather(query)

      const isDuplicate = weatherList.value.some((item) => item.id === newCity.id)

      if (isDuplicate) {
        throw new Error('이미 목록에 있는 도시입니다.')
      }

      weatherList.value.push(newCity)
      saveCities()
      markUpdated()
    } finally {
      isLoading.value = false
    }
  }
  const deleteCity = (id) => {
    weatherList.value = weatherList.value.filter((item) => item.id !== String(id))
    saveCities()
  }

  const moveCity = (id, direction) => {
    const list = weatherList.value
    const index = list.findIndex((item) => item.id === String(id))
    if (index === -1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
    saveCities()
  }

  const loadInitialCities = async () => {
    if (weatherList.value.length > 0) return

    isLoading.value = true

    try {
      const initialCities = await Promise.all([
        requestCityWeather('서울'),
        requestCityWeather('부산'),
        requestCityWeather('대구'),
      ])

      weatherList.value = initialCities
      saveCities()
      markUpdated()
    } finally {
      isLoading.value = false
    }
  }

  const refreshCityWeather = async (city) => {
    const response = await axios.get(WEATHER_URL, {
      params: { lat: city.lat, lon: city.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
    })
    const weather = response.data

    return {
      ...city,
      temp: weather.main.temp,
      feelsLike: weather.main.feels_like,
      humidity: weather.main.humidity,
      status: weather.weather[0].description,
      windSpeed: weather.wind.speed,
    }
  }

  // 도시 목록 + 현재 위치 날씨를 한 번에 최신 데이터로 갱신
  const refreshAll = async () => {
    isLoading.value = true
    try {
      const [refreshedCities] = await Promise.all([
        Promise.all(weatherList.value.map(refreshCityWeather)),
        loadCurrentLocationWeather(currentCoords.value),
      ])

      weatherList.value = refreshedCities
      saveCities()
      markUpdated()
    } finally {
      isLoading.value = false
    }
  }

  const findCityById = (id) => weatherList.value.find((item) => item.id === String(id))

  const currentLocationWeather = ref(null)
  const hourlyForecast = ref([])
  const isLocationLoading = ref(false)
  const currentCoords = ref(SEOUL_COORDS)

  const requestWeatherByCoords = async (lat, lon) => {
    const [weatherResponse, reverseGeoResponse] = await Promise.all([
      axios.get(WEATHER_URL, {
        params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
      }),
      axios.get(REVERSE_GEO_URL, {
        params: { lat, lon, limit: 1, appid: API_KEY },
      }),
    ])

    const weather = weatherResponse.data
    const location = reverseGeoResponse.data[0]
    const displayName = location?.local_names?.ko ?? location?.name ?? weather.name

    return {
      name: displayName,
      temp: weather.main.temp,
      feelsLike: weather.main.feels_like,
      humidity: weather.main.humidity,
      status: weather.weather[0].description,
      weatherId: weather.weather[0].id,
      windSpeed: weather.wind.speed,
    }
  }

  const requestHourlyForecastByCoords = async (lat, lon) => {
    const response = await axios.get(FORECAST_URL, {
      params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr', cnt: 8 }, // 3시간 간격 x 8 = 다음 24시간
    })

    return response.data.list.map((item) => ({
      dt: item.dt, // 유닉스 타임스탬프(초) - 현재 시간과 가장 가까운 항목 판별용
      // dt_txt는 UTC 기준이라 그대로 쓰면 로컬 시간과 어긋남 -> 브라우저 로컬 시간대로 변환해서 표시
      time: new Date(item.dt * 1000).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      temp: item.main.temp,
      pop: item.pop, // 강수확률 0~1
      status: item.weather[0].description,
      weatherId: item.weather[0].id,
    }))
  }

  const loadCurrentLocationWeather = async (coords = SEOUL_COORDS) => {
    currentCoords.value = coords
    isLocationLoading.value = true
    try {
      const [current, hourly] = await Promise.all([
        requestWeatherByCoords(coords.lat, coords.lon),
        requestHourlyForecastByCoords(coords.lat, coords.lon),
      ])
      currentLocationWeather.value = current
      hourlyForecast.value = hourly
      markUpdated()
    } finally {
      isLocationLoading.value = false
    }
  }
  return {
    weatherList,
    isLoading,
    lastUpdated,
    addCity,
    deleteCity,
    moveCity,
    refreshAll,
    loadInitialCities,
    findCityById,
    currentLocationWeather,
    hourlyForecast,
    isLocationLoading,
    loadCurrentLocationWeather,
  }
})
