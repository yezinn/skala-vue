<!-- 메인 날씨 대시보드 화면 -->

<!-- Day 3(과제 4). 실습 과제 - 날씨 (라우터 적용) -->
<!-- Day 2(과제 3)의 WeatherParent 대체 (참고 및 경로에 맞게 작성) -->
 <!-- 상세보기 버튼 클릭 시 - window.alert()를 제거, Programmatic Navigation 처리 -->
  <!-- router.push('/weather/' + id) -->

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

const router = useRouter()
const route = useRoute()

const weatherList = ref([
  {id: 'city_01', name: '서울', temp:28, status:'맑음'},
  {id: 'city_02', name: '부산', temp:30, status:'흐림'},
  {id: 'city_03', name: '대구', temp:24, status:'비'},
  {id: 'city_04', name: '블라디보스토크', temp:18, status:'흐림'},
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

onMounted(() => {
    if(route.query.search){
        searchQuery.value = route.query.search
    }
})

watch(searchQuery, (newQuery) => {
    router.push({
        path: route.path,
        query: { search: newQuery || undefined },
    })
})

const filteredWeatherList = computed( () => {
    const query = searchQuery.value.trim()
    if(!query)  return weatherList.value
    return weatherList.value.filter((item) => item.name.includes(query))
})

// watch(selectedCityInfo, (newInfo) => {
//     console.log(`[watch 감지] 상태 바 문구가 업데이트 되었습니다 -> "${newInfo}"`)
// })
// watchEffect(() => {
//     console.log(`[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`)
// })

// const showDetail = (cityName, status) => {
//   window.alert(`${cityName}의 날씨는 ${status}입니다.`)
// }

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
</script>

<template>
    <div class="dashboard-wrapper">
        <BaseDashboardCard>
            <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
        </BaseDashboardCard>

        <BaseDashboardCard>
            <h3>📍 지역별 날씨 현황</h3>
            <WeatherCard v-for="item in filteredWeatherList" :key="item.id" :city-item="item" @select-card="selectCity" @click-detail="handleDetailJump(item.id)" />
            <p v-if="filteredWeatherList.length === 0" style="text-align: center; color: #e74c3c; padding: 10px">😩 검색 결과와 일치하는 도시가 없습니다.</p>
        </BaseDashboardCard>
    </div>

    <div class="status-bar">
        {{ selectedCityInfo }}
    </div>

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