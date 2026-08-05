<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs as toRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weather'
import { useConfigStore } from '@/stores/configStore'

const weatherStore = useWeatherStore()
const { currentLocationWeather, hourlyForecast, isLocationLoading } = toRefs(weatherStore)
const configStore = useConfigStore()

// 1분마다 현재 시각을 갱신해서, 시간별 예보 중 "지금과 가장 가까운 시간" 강조 표시를 최신 상태로 유지
const now = ref(Date.now())
let nowTimer = null

onMounted(() => {
  nowTimer = setInterval(() => {
    now.value = Date.now()
  }, 60000)
})

onUnmounted(() => {
  clearInterval(nowTimer)
})

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

// 현재 시각과 가장 가까운 시간별 예보 항목의 dt(유닉스 타임스탬프)
const closestHourlyDt = computed(() => {
  if (!hourlyForecast.value.length) return null

  return hourlyForecast.value.reduce((closest, item) => {
    const closestDiff = Math.abs(closest.dt * 1000 - now.value)
    const itemDiff = Math.abs(item.dt * 1000 - now.value)
    return itemDiff < closestDiff ? item : closest
  }).dt
})

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
  if (feelsLike >= 26) {
    return '🥵 무더운 날씨에요. 온열 질환에 주의하세요.'
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
        <div
          v-for="item in hourlyForecast"
          :key="item.time"
          class="hourly-item"
          :class="{ 'hourly-item--now': item.dt === closestHourlyDt }"
        >
          <span v-if="item.dt === closestHourlyDt" class="hourly-now-badge"></span>
          <span class="hourly-time">{{ item.time }}</span>
          <span class="hourly-temp"
            >{{ toDisplayTemp(item.temp) }}{{ configStore.unitSymbol }}</span
          >
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
  gap: 4px;
}
.hourly-item {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: #fff;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 6px 2px;
  font-size: 0.72rem;
}
.hourly-item--now {
  border-color: #4b6584;
  background: #eaf1fb;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(75, 101, 132, 0.25);
}
.hourly-now-badge {
  position: absolute;
  top: -9px;
  padding: 1px 6px;
  font-size: 0.65rem;
  font-weight: bold;
  color: #fff;
  background-color: #4b6584;
  border-radius: 999px;
}
</style>
