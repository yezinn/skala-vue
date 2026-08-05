<!-- Day 2. 실습 과제 - 날씨 (컴포넌트) -->
<!-- 모든 반응형 데이터 유지 -->

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '부산', temp: 30, status: '흐림' },
  { id: 'city_03', name: '대구', temp: 24, status: '비' },
  { id: 'city_04', name: '블라디보스토크', temp: 18, status: '흐림' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(query))
})

watch(selectedCityInfo, (newInfo) => {
  console.log(`[watch 감지] 상태 바 문구가 업데이트 되었습니다 -> "${newInfo}"`)
})
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`,
  )
})

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 날씨는 ${status}입니다.`)
}
// 한글 받침 여부에 따른 조사 설정
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
      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        @select-card="selectCity"
        @click-detail="showDetail"
      />
      <p
        v-if="filteredWeatherList.length === 0"
        style="text-align: center; color: #e74c3c; padding: 10px"
      >
        😩 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>
  </div>

  <div class="status-bar">
    {{ selectedCityInfo }}
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 600px;
  margin: 0 auto;
}
</style>
