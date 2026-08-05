<!-- Day 2. 실습 과제 - 날씨 (컴포넌트) -->
<!-- 선택된 도시 객체를 전달받아 표시 (props)
    카드를 선택하는 것(select-card 이벤트)과 상세보기(click-detail 이벤트)를 부모에게 전달 (emits) -->

<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'delete-city', 'move-up', 'move-down'])

const configStore = useConfigStore()

const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})
</script>

<template>
  <div class="weather-card" @click="emit('select-card', cityItem.name)">
    <!-- <h4>{{cityItem.name }}</h4> -->
    <!-- <p>현재 기온: {{ cityItem.temp }}°C</p> -->
    <h4>{{ cityItem.name }} ({{ cityItem.status }})</h4>
    <p>현재 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>
    <span v-if="cityItem.temp >= 25" class="hot">🥵 더움</span>
    <span v-else-if="cityItem.temp >= 20" class="moderate">😎 선선함</span>
    <span v-else class="cool">🥶 시원함</span>

    <button
      v-if="!isEditMode"
      class="btn-detail"
      @click.stop="emit('click-detail', cityItem.name, cityItem.status)"
    >
      상세보기
    </button>
    <div v-else class="card-edit-actions">
      <button class="btn-move" :disabled="isFirst" @click.stop="emit('move-up', cityItem.id)">
        ▲
      </button>
      <button class="btn-move" :disabled="isLast" @click.stop="emit('move-down', cityItem.id)">
        ▼
      </button>
      <button class="btn-delete" @click.stop="emit('delete-city', cityItem.id)">삭제</button>
    </div>
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
.moderate {
  background-color: #00b894;
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
.card-edit-actions {
  position: absolute;
  right: 12px;
  top: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-move {
  padding: 4px 8px;
  cursor: pointer;
  background-color: #f1f2f6;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  line-height: 1;
}
.btn-move:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.btn-delete {
  padding: 6px 10px;
  cursor: pointer;
  background-color: #ff7675;
  color: #fff;
  border: none;
  border-radius: 4px;
}
</style>
