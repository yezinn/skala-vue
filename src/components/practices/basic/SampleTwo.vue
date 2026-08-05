<script setup>
// import { ref } from 'vue'

const welcomeMessage = 'Welcome to Skala-Vue'
</script>

<template>
  <div class="practice-section">
    <h2>{{ welcomeMessage }}</h2>
    <p>{{ welcomeMessage.toUpperCase() }}</p>
    <p>{{ 'Random number: ' + Math.ceil(Math.random() * 100) }}</p>
    <!-- <h3>반응성 변수 클릭: {{ vueCount }}</h3> -->
    <!-- <button @click="vueCount++">반응성 변수 증가</button> -->
  </div>
</template>
