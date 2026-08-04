<!-- :cityId 패턴을 수신하는 동적 상세 페이지 -->
<!-- 지역별 상세 기상관측 정보 보여주기 -->
<!-- 도시 코드에 해당하는 Mock Data를 임시로 활용 -->
 <!-- Router 동적 경로 매칭에 해당되는 도시ID (cityId)를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택 -->

<script setup>
import {ref, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const mockDetails = {
    city_01: { name: '대한민국 서울특별시', temp: 28, status: '맑음', humidity: '55%', wind: '2.5m/s' },
    city_02: { name: '부산광역시 해운대구', temp: 30, status: '비', humidity: '85%', wind: '4.1m/s' },
    city_03: { name: '대구광역시 수성구', temp: 26, status: '구름', humidity: '65%', wind: '5.0m/s' },
}

const cityData = ref(null)

onMounted(() => {
    const id = route.params.cityId
    if(mockDetails[id]){
        cityData.value = mockDetails[id]
    }
})
</script>

<template>
    <div class="detail-container">
        <h3>📊 지역별 상세 기상 관측 정보</h3>
        <hr />

        <div v-if="cityData" class="info-card">
            <h4>📍 지정 지역: {{ cityData.name }}</h4>
            <p>실시간 기온: <strong>{{ cityData.temp }}°C</strong></p>
            <p>기상 현황: {{ cityData.status }}</p>
            <p>대기 습도: {{ cityData.humidity }}</p>
            <p>현재 풍속: {{ cityData.wind }}</p>
        </div>

        <div v-else>
            <p>해당 지역의 상세 데이터 장부가 존재하지 않습니다.</p>
        </div>

        <button @click="router.push('/')" class="back-btn">🔙 메인 대시보드로 돌아가기</button>
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