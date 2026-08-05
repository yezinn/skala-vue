<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs as toRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weather'
import { useConfigStore } from '@/stores/configStore'

const weatherStore = useWeatherStore()
const { currentLocationWeather, hourlyForecast, isLocationLoading } = toRefs(weatherStore)
const configStore = useConfigStore()

onMounted(() => {
    if (!navigator.geolocation) {
        weatherStore.loadCurrentLocationWeather() // 서울로 대체
        return
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            weatherStore.loadCurrentLocationWeather({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            })
        },
        () => {
            weatherStore.loadCurrentLocationWeather() // 권한 거부/실패 시 서울로 대체
        },
    )
})

const toDisplayTemp = (celsius) => {
    const value = configStore.unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
    return Math.round(value)
}

// 오늘의 한 줄 행동 제안
const actionSuggestion = computed(() => {
    if (!currentLocationWeather.value) return ''

    const feelsLike = currentLocationWeather.value.feelsLike
    const weatherId = currentLocationWeather.value.weatherId
    const maxPop = hourlyForecast.value.length
        ? Math.max(...hourlyForecast.value.map((item) => item.pop))
        : 0

    if (maxPop >= 0.5) {
        return '🌂 이따 강수 가능성이 있어 우산을 챙기세요.'
    }
    if (feelsLike <= 10) {
        return `🧥 체감온도 ${Math.round(feelsLike)}°C로 쌀쌀해요. 가벼운 외투를 추천해요.`
    }
    // 800 = 맑음 (OpenWeather 코드 기준). 무료 플랜엔 UV지수가 없어 날씨상태+기온으로 대체 추정
    if (weatherId === 800 && feelsLike >= 26) {
        return '😎 자외선이 강할 수 있어요. 선글라스나 자외선 차단제를 챙기세요.'
    }
    return '🙂 오늘은 무난한 날씨예요.'
})
</script>

<template>
    <div class="current-location-weather">
        <p v-if="isLocationLoading">현재 위치 날씨를 불러오는 중입니다...</p>

        <template v-else-if="currentLocationWeather">
            <p class="suggestion">{{ actionSuggestion }}</p>

            <div class="current-summary">
                <h4>📍 {{ currentLocationWeather.name }}</h4>
                <p class="current-temp">
                    {{ toDisplayTemp(currentLocationWeather.temp) }}{{ configStore.unitSymbol }}
                    <span class="status">{{ currentLocationWeather.status }}</span>
                </p>
            </div>

            <div class="hourly-list">
                <div v-for="item in hourlyForecast" :key="item.time" class="hourly-item">
                    <span class="hourly-time">{{ item.time }}</span>
                    <span class="hourly-temp">{{ toDisplayTemp(item.temp) }}{{ configStore.unitSymbol }}</span>
                    <span class="hourly-pop">☔ {{ Math.round(item.pop * 100) }}%</span>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.current-location-weather {
  background: #eaf4fb;
  border: 1px solid #d3e7f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 15px;
}
.suggestion {
  font-weight: bold;
  margin-bottom: 10px;
}
.current-summary {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}
.current-temp {
  font-size: 1.3rem;
  font-weight: bold;
}
.status {
  font-size: 0.9rem;
  font-weight: normal;
  color: #555;
}
.hourly-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.hourly-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.85rem;
}
</style>