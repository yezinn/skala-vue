<!-- Day 2. 실습 과제 - 날씨 (컴포넌트) -->
<!-- 선택된 도시 객체를 전달받아 표시 (props)
    카드를 선택하는 것(select-card 이벤트)과 상세보기(click-detail 이벤트)를 부모에게 전달 (emits) -->

<script setup>
defineProps({
    cityItem: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
    <div class="weather-card" @click="emit('select-card', `${cityItem.name}이 선택되었습니다.`)">    
        <h4>{{cityItem.name }}</h4>
        <p>현재 기온: {{ cityItem.temp }}°C</p>

        <span v-if="cityItem.temp >= 25" class="hot">🥵 더움</span>
        <span v-else class="cool">🥶 시원함</span>

        <button class="btn-detail" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">상세보기</button>
    </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
}
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  color: #fff;
}
.hot {
  background-color: #ff7675;
}
.cool {
  background-color: #74b9ff;
}
.btn-detail {
  position: absolute;
  right: 12px;
  top: 15px;
  padding: 6px 10px;
  cursor: pointer;
}
</style>