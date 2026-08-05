<script setup>
import UnitToggler from './components/exercise/UnitToggler.vue';
</script>


<template>
  <div class="app-container">
    <h1>🌤️ 날씨</h1>
    <hr />
    <div class="dashboard-wrapper">
      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item">⌘ 대시보드</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/about" class="nav-item">ℹ 서비스 소개</RouterLink>
        <UnitToggler />
      </nav>
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>


<style>
@import '@/assets/exercise.css';
</style>
