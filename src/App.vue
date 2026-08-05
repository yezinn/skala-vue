<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'
import SkyBackground from './components/exercise/SkyBackground.vue'

const route = useRoute()
const isDashboardRoute = computed(() => route.path === '/')
</script>

<template>
  <SkyBackground />
  <div class="app-container">
    <div class="app-header">
      <h1>🌤️ 날씨</h1>
      <UnitToggler v-if="isDashboardRoute" />
    </div>
    <hr />
    <div class="dashboard-wrapper">
      <main>
        <RouterView />
      </main>
    </div>

    <nav class="side-nav-rail">
      <RouterLink to="/" class="nav-circle" aria-label="대시보드">⌘</RouterLink>
      <RouterLink to="/about" class="nav-circle" aria-label="서비스 소개">ℹ</RouterLink>
    </nav>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
