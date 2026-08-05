<!-- 메인 날씨 대시보드 화면 -->

<!-- Day 3(과제 4). 실습 과제 - 날씨 (라우터 적용) -->
<!-- Day 2(과제 3)의 WeatherParent 대체 (참고 및 경로에 맞게 작성) -->
 <!-- 상세보기 버튼 클릭 시 - window.alert()를 제거, Programmatic Navigation 처리 -->
  <!-- router.push('/weather/' + id) -->

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {ElMessage} from 'element-plus'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

import { storeToRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weather'

const weatherStore = useWeatherStore()
const {weatherList, isLoading} = storeToRefs(weatherStore)

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const isEditMode = ref(false)

const handleDeleteCity = (id) => {
    weatherStore.deleteCity(id)
    ElMessage.success('도시가 삭제되었습니다.')
}

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
const isAddDialogVisible = ref(false)
const newCityQuery = ref('')

const addCityFromDialog = async () => {
    try {
        await weatherStore.addCity(newCityQuery.value)

        ElMessage.success('도시가 추가되었습니다.')
        newCityQuery.value = ''
        isAddDialogVisible.value = false
    } catch (error) {
        ElMessage.error(error.message)
    }
}
</script>

<template>
    <div class="dashboard-wrapper">
        <BaseDashboardCard>
            <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
        </BaseDashboardCard>

        <BaseDashboardCard>
            <div class="weather-section-header">
                <h3>📍 지역별 날씨 현황</h3>
                <div class="header-actions">
                    <template v-if="isEditMode">
                        <el-button circle aria-label="도시 추가" @click="isAddDialogVisible = true">➕</el-button>
                        <el-button type="danger" circle aria-label="편집 종료" @click="isEditMode = false">✕</el-button>
                    </template>
                    <el-button v-else type="primary" circle aria-label="편집" @click="isEditMode = true">✏️</el-button>
                </div>
            </div>
            <p v-if="isLoading">날씨 정보를 불러오는 중입니다...</p>

            <WeatherCard 
                v-for="item in filteredWeatherList" 
                :key="item.id" 
                :city-item="item" 
                :is-edit-mode="isEditMode"
                @select-card="selectCity" 
                @click-detail="handleDetailJump(item.id)"
                @delete-city="handleDeleteCity(item.id)"
            />
            <p v-if="filteredWeatherList.length === 0" style="text-align: center; color: #e74c3c; padding: 10px">😩 검색 결과와 일치하는 도시가 없습니다.</p>
        </BaseDashboardCard>
    </div>

    <div class="status-bar">
        {{ selectedCityInfo }}
    </div>
    
    <el-dialog
        v-model="isAddDialogVisible"
        title="도시 추가"
        width="min(90vw, 420px)"
        align-center
        @closed="() => {newCityQuery = ''; isEditMode = false}"
    >
        <form @submit.prevent="addCityFromDialog">
            <el-input 
                v-model="newCityQuery"
                placeholder="도시명을 입력하세요. (예: 서울, Seoul, Tokyo)"
                clearable
                autofocus
            />
        </form>
        <template #footer>
            <el-button @click="isAddDialogVisible = false">
                취소
            </el-button>
            <el-button
                type="primary"
                :loading="isLoading"
                :disabled="!newCityQuery.trim()"
                @click="addCityFromDialog"
            >
                도시 추가
            </el-button>
        </template>
    </el-dialog>
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
.weather-section-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}
</style>