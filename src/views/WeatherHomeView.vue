<!-- 메인 날씨 대시보드 화면 -->

<!-- Day 3(과제 4). 실습 과제 - 날씨 (라우터 적용) -->
<!-- Day 2(과제 3)의 WeatherParent 대체 (참고 및 경로에 맞게 작성) -->
<!-- 상세보기 버튼 클릭 시 - window.alert()를 제거, Programmatic Navigation 처리 -->
<!-- router.push('/weather/' + id) -->

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

import { useWeatherStore } from '@/stores/weather'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import CurrentLocationWeather from '@/components/exercise/CurrentLocationWeather.vue'

const weatherStore = useWeatherStore()
const { weatherList, isLoading, isLocationLoading, lastUpdated } = storeToRefs(weatherStore)

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const isEditMode = ref(false)
const isSearchVisible = ref(false)

const handleDeleteCity = (id) => {
  weatherStore.deleteCity(id)
  ElMessage.success('도시가 삭제되었습니다.')
}

const handleMoveCity = (id, direction) => {
  weatherStore.moveCity(id, direction)
}

// 마지막 갱신 시간 표시 (1분마다 "n분 전" 문구 갱신)
const nowTick = ref(Date.now())
let nowTickTimer = null

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return '아직 갱신되지 않음'

  const diffMs = nowTick.value - new Date(lastUpdated.value).getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return '방금 갱신됨'
  if (diffMinutes < 60) return `${diffMinutes}분 전 갱신`

  return `${new Date(lastUpdated.value).toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  })} 갱신`
})

const isRefreshing = computed(() => isLoading.value || isLocationLoading.value)

const handleRefreshAll = async () => {
  try {
    await weatherStore.refreshAll()
    ElMessage.success('날씨 정보를 최신으로 갱신했습니다.')
  } catch {
    ElMessage.error('갱신에 실패했습니다. 잠시 후 다시 시도해 주세요.')
  }
}

onMounted(async () => {
  if (route.query.search) {
    searchQuery.value = route.query.search
    isSearchVisible.value = true
  }
  // fetchRealTimeWeather()

  await weatherStore.loadInitialCities()

  nowTickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 30000)
})

onUnmounted(() => {
  clearInterval(nowTickTimer)
})

watch(searchQuery, (newQuery) => {
  router.push({
    path: route.path,
    query: { search: newQuery || undefined },
  })
})

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return weatherList.value
  // return weatherList.value.filter((item) => item.name.includes(query))

  return weatherList.value.filter((item) => {
    const matchesKoreanName = item.name.includes(query)
    const matchesKeyword = item.searchKeywords.some((keyword) => keyword.includes(query))
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
    <div class="update-status-bar">
      <span class="update-status-text">🕒 {{ lastUpdatedLabel }}</span>
      <button class="btn-refresh" :disabled="isRefreshing" @click="handleRefreshAll">
        {{ isRefreshing ? '갱신 중...' : '🔄 새로고침' }}
      </button>
    </div>
    <CurrentLocationWeather />

    <BaseDashboardCard>
      <div class="weather-section-header">
        <h3>📍 지역별 날씨 현황</h3>
        <div class="header-actions">
          <el-button
            circle
            :type="isSearchVisible ? 'primary' : 'default'"
            aria-label="도시 검색"
            @click="isSearchVisible = !isSearchVisible"
            >🔍</el-button
          >
          <template v-if="isEditMode">
            <el-button circle aria-label="도시 추가" @click="isAddDialogVisible = true"
              >➕</el-button
            >
            <el-button type="danger" circle aria-label="편집 종료" @click="isEditMode = false"
              >✕</el-button
            >
          </template>
          <el-button v-else type="primary" circle aria-label="편집" @click="isEditMode = true"
            >✏️</el-button
          >
        </div>
      </div>
      <SearchBar
        v-if="isSearchVisible"
        :current-query="searchQuery"
        @update-query="(val) => (searchQuery = val)"
      />
      <p v-if="isLoading">날씨 정보를 불러오는 중입니다...</p>

      <WeatherCard
        v-for="(item, index) in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        :is-edit-mode="isEditMode"
        :is-first="index === 0"
        :is-last="index === filteredWeatherList.length - 1"
        @select-card="selectCity"
        @click-detail="handleDetailJump(item.id)"
        @delete-city="handleDeleteCity(item.id)"
        @move-up="handleMoveCity(item.id, 'up')"
        @move-down="handleMoveCity(item.id, 'down')"
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

  <el-dialog
    v-model="isAddDialogVisible"
    title="도시 추가"
    width="min(90vw, 420px)"
    align-center
    @closed="
      () => {
        newCityQuery = ''
      }
    "
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
      <el-button @click="isAddDialogVisible = false"> 취소 </el-button>
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
.update-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 2px;
}
.update-status-text {
  font-size: 0.85rem;
  color: #4b4b4b;
}
.btn-refresh {
  padding: 5px 12px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #4b6584;
  background-color: #eef1f4;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn-refresh:hover:not(:disabled) {
  background-color: #dfe4ea;
}
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.status-bar {
  background: #e8f5e9;
  padding: 10px;
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  border-radius: 6px;
}
.weather-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
