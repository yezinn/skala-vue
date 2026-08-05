<!-- 메인 날씨 대시보드 화면 -->

<!-- Day 3(과제 4). 실습 과제 - 날씨 (라우터 적용) -->
<!-- Day 2(과제 3)의 WeatherParent 대체 (참고 및 경로에 맞게 작성) -->
 <!-- 상세보기 버튼 클릭 시 - window.alert()를 제거, Programmatic Navigation 처리 -->
  <!-- router.push('/weather/' + id) -->

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import axios from 'axios'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

import { storeToRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weather'

const weatherStore = useWeatherStore()
const {weatherList, isLoading} = storeToRefs(weatherStore)

const router = useRouter()
const route = useRoute()

// const weatherList = ref([])
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
// const isLoading = ref(false)

// const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
// const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// const fetchRealTimeWeather = async () => {
//     isLoading.value = true
//     try{
//         const [seoulRes, busanRes, daeguRes] = await Promise.all([
//             axios.get(`${BASE_URL}?q=Seoul&appid=${API_KEY}&units=metric&lang=kr`),
//             axios.get(`${BASE_URL}?q=Busan&appid=${API_KEY}&units=metric&lang=kr`),
//             axios.get(`${BASE_URL}?q=Daegu&appid=${API_KEY}&units=metric&lang=kr`),

//         ])
//         weatherList.value = [
//             {
//                 id: 'city_01',
//                 name: '서울',
//                 searchKeywords: ['seoul'],
//                 temp: seoulRes.data.main.temp,
//                 status: seoulRes.data.weather[0].description,
//             },
//             {
//                 id: 'city_02',
//                 name: '부산',
//                 searchKeywords: ['busan'],
//                 temp: busanRes.data.main.temp,
//                 status: busanRes.data.weather[0].description,
//             },
//             {
//                 id: 'city_03',
//                 name: '대구',
//                 searchKeywords: ['daegu', 'taegu'],
//                 temp: daeguRes.data.main.temp,
//                 status: daeguRes.data.weather[0].description,
//             },
//         ]
//         console.log('🟢 [API 통신 완료] 메인 대시보드 실시간 기상 장부 동기화:', weatherList.value)
//     } catch (error){
//         console.error('‼️날씨 API 연동 실패:', error)
//     }finally{
//         isLoading.value = false
//     }
// }

onMounted(async () => {
    if(route.query.search){
        searchQuery.value = route.query.search
    }
    // fetchRealTimeWeather()

    await weatherStore.loadInitialCities()
})

watch(searchQuery, (newQuery) => {
    router.push({
        path: route.path,
        query: { search: newQuery || undefined },
    })
})

const filteredWeatherList = computed( () => {
    const query = searchQuery.value.trim().toLowerCase()
    if(!query)  return weatherList.value
    // return weatherList.value.filter((item) => item.name.includes(query))

    return weatherList.value.filter((item) => {
        const matchesKoreanName = item.name.includes(query)
        const matchesKeyword = item.searchKeywords.some((keyword) =>
            keyword.includes(query),
        )
        return matchesKoreanName || matchesKeyword
    })
})

// 자식 카드 컴포넌트의 상세보기 신호를 받으면 해당 ID 주소로 라우터 점프 실행
const handleDetailJump = (id) => {
    router.push(`/weather/${id}`)
}

// 한글 받침 여부에 따른 조사 설정 (Prac 3 Update)
const getSubjectParticle = (name) => {
    const lastChar = name.trim().at(-1)
    const code = lastChar?.charCodeAt(0)

    if (!code || code < 0xac00 || code > 0xd7a3) {
        return '이'
    }
    const hasBatchim = (code - 0xac00) % 28 !== 0
    return hasBatchim ? '이' : '가'
}
const selectCity = (city) => {
    selectedCityInfo.value = `${city}${getSubjectParticle(city)} 선택되었습니다.`
}

// 도시 추가 기능
const newCityQuery = ref('')

// const addCity = async () => {
//     const cityQuery = newCityQuery.value.trim()

//     if(!cityQuery) return

//     try{
//         const response = await axios.get(BASE_URL, {
//             params: {
//                 q: `${cityQuery},KR`,
//                 appid: API_KEY,
//                 units: 'metric',
//                 lang: 'kr',
//             },
//         })

//         const weather = response.data
//         const normalize = (value) => value.trim().toLowerCase()

//         const isDuplicate = weatherList.value.some((item) => {
//             const searchableNames = [
//                 item.name,
//                 ...(item.searchKeywords ?? []),
//             ].map(normalize)

//             return (
//                 searchableNames.includes(normalize(cityQuery)) || 
//                 searchableNames.includes(normalize(weather.name))
//             )
//         })

//         if (isDuplicate) {
//             window.alert('이미 목록에 있는 도시입니다.')
//             return
//         }

//         weatherList.value.push({
//             id: String(weather.id),
//             name:weather.name,
//             searchKeywords: [
//                 cityQuery.toLowerCase(),
//                 weather.name.toLowerCase(),
//             ],
//             temp: weather.main.temp,
//             status: weather.weather[0].description
//         })

//         newCityQuery.value = ''
//     } catch (error) {
//         console.error('도시 추가 실패:', error)
//         window.alert('도시를 찾을 수 없습니다.')
//     }
// }
const addCity = async () => {
    try{
        await weatherStore.addCity(newCityQuery.value)
        newCityQuery.value = ''
    }catch (error) {
        window.alert(error.message)
    }
}
</script>

<template>
    <div class="dashboard-wrapper">
        <BaseDashboardCard>
            <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
        </BaseDashboardCard>

        <BaseDashboardCard>
            <h3>📍 지역별 날씨 현황</h3>
            <p v-if="isLoading">날씨 정보를 불러오는 중입니다...</p>
            
            <WeatherCard v-for="item in filteredWeatherList" :key="item.id" :city-item="item" @select-card="selectCity" @click-detail="handleDetailJump(item.id)" />
            <p v-if="filteredWeatherList.length === 0" style="text-align: center; color: #e74c3c; padding: 10px">😩 검색 결과와 일치하는 도시가 없습니다.</p>
        </BaseDashboardCard>
    </div>

    <div class="status-bar">
        {{ selectedCityInfo }}
    </div>
    <form @submit.prevent="addCity">
        <input
            v-model="newCityQuery"
            placeholder="추가할 도시명 입력 (예: Incheon)"
        />
        <button type="submit">도시 추가</button>
    </form>

</template>

<style scoped>
.status-bar {
  background: #e8f5e9;
  padding: 10px;
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  border-radius: 6px;
}
</style>