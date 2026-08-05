import {ref} from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const STORAGE_KEY = 'skala-weather-cities'

const normalize = (value) => value.trim().toLowerCase()

const getStoreCities = () => {
    try{
        const storedCities = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

        return Array.isArray(storedCities) ? storedCities : []
    } catch{
        return []
    }
}

export const useWeatherStore = defineStore('weather', () => {
    const weatherList = ref(getStoreCities())
    const isLoading = ref(false)

    const saveCities = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(weatherList.value))
    }
    const requestCityWeather = async (cityQuery) => {
        if(!API_KEY){
            throw new Error('OpenWeather API 키를 찾을 수 없습니다.')
        }

        // 한글 또는 영문 도시명을 좌표로 변환
        const geoResponse = await axios.get(GEO_URL, {
            params:{
                q:cityQuery,
                limit: 1,
                appid: API_KEY,
            },
        })
        
        const location = geoResponse.data[0]

        if(!location) {
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
        if(!query) return
        // if (!query) {
        //     throw new Error('도시명을 입력해 주세요.')
        // }

        
        isLoading.value = true
       
        try{
            const newCity = await requestCityWeather(query)

            const isDuplicate = weatherList.value.some(
                (item) => item.id === newCity.id,
            )

            if(isDuplicate) {
                throw new Error('이미 목록에 있는 도시입니다.')
            }

            weatherList.value.push(newCity)
            saveCities()
        } finally{
            isLoading.value = false
        }
    }
    const deleteCity = (id) => {
        weatherList.value = weatherList.value.filter((item) => item.id !== String(id))
        saveCities()
    }

    const loadInitialCities = async () => {
        if(weatherList.value.length > 0) return

        isLoading.value = true

        try{
            const initialCities = await Promise.all([
                requestCityWeather('서울'),
                requestCityWeather('부산'),
                requestCityWeather('대구'),
            ])

            weatherList.value = initialCities
            saveCities()
        }finally{
            isLoading.value = false
        }

    }

    const findCityById = (id) => 
        weatherList.value.find((item) => item.id === String(id))

    return{
        weatherList,
        isLoading,
        addCity,
        deleteCity,
        loadInitialCities,
        findCityById,
    }
})