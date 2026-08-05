<!-- :cityId 패턴을 수신하는 동적 상세 페이지 -->
<!-- 지역별 상세 기상관측 정보 보여주기 -->
<!-- 도시 코드에 해당하는 Mock Data를 임시로 활용 -->
 <!-- Router 동적 경로 매칭에 해당되는 도시ID (cityId)를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택 -->

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weather'
// import axios from 'axios'

const route = useRoute()
const router = useRouter()

const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const {isLoading} = storeToRefs(weatherStore)

onMounted(() => {
    weatherStore.loadInitialCities()
})

const cityData = computed(() => 
    weatherStore.findCityById(route.params.cityId),
)
// const isLoading = ref(false)

const displayTemp = computed(() => {
  if (!cityData.value) return 0
  const rawTemp = cityData.value.temp // 원본 섭씨 온도
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 공식 적용
  }
  return rawTemp // celsius 상태일 땐 원본 반환
})

const displayFeelsLike = computed( () => {
    if(!cityData.value) return 0
    const rawTemp = cityData.value.feelsLike

    if(configStore.unit === 'fahrenheit') {
        return Math.round((rawTemp * 9) / 5 + 32)
    }

    return rawTemp
})
// const cityMapping = {
//     city_01: { english: 'Seoul', korean: '대한민국 서울특별시' },
//     city_02: { english: 'Busan', korean: '부산광역시 해운대구' },
//     city_03: { english: 'Daegu', korean: '대구광역시 수성구'},
// }

// onMounted( async () => {
//     const id = route.params.cityId
//     const targetCity = cityMapping[id]

//     if(targetCity) {
//         isLoading.value = true
//         try{
//             const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
//             const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${targetCity.english}&appid=${API_KEY}&units=metric&lang=kr`)

//             const raw = response.data

//             cityData.value = {
//                 name: targetCity.korean,
//                 temp: raw.main.temp,
//                 status: raw.weather[0].description,
//                 humidity:  `${raw.main.humidity}%`,
//                 wind: `${raw.wind.speed}m/s`,
//             }
//         } catch (error) {
//             console.error('‼️상세 정보 로딩 중 네트워크 에러 발생:', error)
//         } finally {
//             isLoading.value = false
//         }
//     }
// })
</script>

<template>
    <div class="detail-container">
        <h3>📊 지역별 상세 기상 관측 정보</h3>
        <hr />

        <p v-if="isLoading">날씨 정보를 불러오는 중입니다...</p>

        <div v-else-if="cityData" class="info-card">
            <h4>📍 지정 지역: {{ cityData.name }}</h4>
            <p>
                실시간 기온: <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
            </p>
            <p>
                체감 기온:
                <strong>{{ displayFeelsLike }}{{ configStore.unitSymbol }}</strong>
            </p>
            <p>기상 현황: {{ cityData.status }}</p>
            <p>대기 습도: {{ cityData.humidity }}</p>
            <p>현재 풍속: {{ cityData.windSpeed }}</p>
        </div>

        <div v-else>
            <p>해당 지역의 상세 데이터 장부가 존재하지 않습니다.</p>
        </div>

        <button @click="router.push('/')" class="back-btn">
            🔙 메인 대시보드로 돌아가기
        </button>
    </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>