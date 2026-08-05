<script setup>
import { useConfigStore } from '@/stores/configStore.js'
const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggle" role="group" aria-label="온도 단위 선택">
    <button
      type="button"
      class="unit-option"
      :class="{ active: configStore.unit === 'celsius' }"
      @click="configStore.setUnit('celsius')"
    >
      ℃
    </button>
    <span class="unit-divider">|</span>
    <button
      type="button"
      class="unit-option"
      :class="{ active: configStore.unit === 'fahrenheit' }"
      @click="configStore.setUnit('fahrenheit')"
    >
      ℉
    </button>
  </div>
</template>

<style scoped>
.unit-toggle {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  background-color: #eef1f4;
  border-radius: 6px;
  padding: 3px;
  gap: 2px;
}
.unit-option {
  border: none;
  background: transparent;
  color: #7f8c8d;
  font-weight: bold;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}
.unit-option:hover {
  color: #4b6584;
}
.unit-option.active {
  background-color: #4b6584;
  color: #ffffff;
}
.unit-divider {
  color: #c2cbd3;
  font-weight: bold;
}
</style>
