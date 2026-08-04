<script setup>
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'

import WeatherFind from './components/exercise/WeatherFind.vue'
import WeatherComposition from './components/exercise/WeatherComposition.vue'
import WeatherParent from './components/exercise/WeatherParent.vue'
// import LifeCycle from './components/practices/basic/LifeCycle.vue'
</script>


<template>
  <div class="app-container">
    <!-- <SampleOne /> -->
    <WeatherFind />
  </div>
  <div class="app-container">
    <!-- <SampleTwo /> -->
    <WeatherComposition />
  </div>
  <div class="app-container">
    <h1>🌤️과제 3: 날씨 (Component)</h1>
    <hr />
    <WeatherParent />
  </div>
  <div class="app-container">
    <h1>🌤️과제 4: 날씨 (Vue Router)</h1>
    <hr />
    <div class="dashboard-wrapper">
      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item">🌤️ 날씨 대시보드</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/about" class="nav-item">ℹ 서비스 소개</RouterLink>
      </nav>
      <main>
        <RouterView />
        <!-- <RouterView v-slot="{ Component }">
          <KeepAlive>
            <component :is="Component" />
          </KeepAlive>
        </RouterView> -->
      </main>
    </div>
  </div>
</template>


<style>
@import '@/assets/exercise.css';
</style>

<!-- <template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template> -->

<!-- <style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style> -->
