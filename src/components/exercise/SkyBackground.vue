<!-- 대시보드 바깥(페이지 전체) 배경 -->
<!-- 현재 시각(새벽/아침/낮/저녁/밤)에 따라 하늘 색이 바뀌고,
     현재 위치 날씨(비/천둥번개/맑은 밤)에 맞춰 움직이는 요소를 겹쳐 보여줌 -->

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weather'

const weatherStore = useWeatherStore()
const { currentLocationWeather } = storeToRefs(weatherStore)

// 1분마다 갱신 - 시간대(period)가 넘어갈 때 배경이 서서히 전환됨
const now = ref(new Date())
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000)
})
onUnmounted(() => clearInterval(timer))

const period = computed(() => {
  const hour = now.value.getHours()
  if (hour >= 5 && hour < 7) return 'dawn' // 새벽/여명
  if (hour >= 7 && hour < 11) return 'morning' // 오전
  if (hour >= 11 && hour < 17) return 'day' // 낮
  if (hour >= 17 && hour < 20) return 'evening' // 저녁/노을
  return 'night' // 밤
})

const weatherId = computed(() => currentLocationWeather.value?.weatherId ?? null)
const isRaining = computed(() => {
  const id = weatherId.value
  return id !== null && ((id >= 300 && id < 400) || (id >= 500 && id < 600))
})
const isThunder = computed(() => {
  const id = weatherId.value
  return id !== null && id >= 200 && id < 300
})
const isClearNight = computed(
  () => period.value === 'night' && (weatherId.value === null || weatherId.value === 800),
)

// 구름/별/빗방울은 개수만 고정이고 위치·속도는 최초 1회만 무작위로 정해서 고정 (매 렌더마다 재생성되지 않도록)
const randomBetween = (min, max) => Math.random() * (max - min) + min

const clouds = Array.from({ length: 5 }, (_, i) => ({
  top: `${randomBetween(4, 40)}%`,
  scale: randomBetween(0.6, 1.4).toFixed(2),
  duration: `${randomBetween(50, 90).toFixed(0)}s`,
  delay: `${(-i * randomBetween(5, 20)).toFixed(0)}s`,
  opacity: randomBetween(0.5, 0.9).toFixed(2),
}))

const stars = Array.from({ length: 45 }, () => ({
  top: `${randomBetween(0, 65)}%`,
  left: `${randomBetween(0, 100)}%`,
  size: `${randomBetween(1, 2.6).toFixed(1)}px`,
  duration: `${randomBetween(2, 6).toFixed(1)}s`,
  delay: `${randomBetween(0, 5).toFixed(1)}s`,
}))

const raindrops = Array.from({ length: 60 }, () => ({
  left: `${randomBetween(0, 100)}%`,
  duration: `${randomBetween(0.5, 1.1).toFixed(2)}s`,
  delay: `${randomBetween(0, 2).toFixed(2)}s`,
  height: `${randomBetween(14, 26).toFixed(0)}px`,
}))
</script>

<template>
  <div class="sky-background" :class="`sky-background--${period}`" aria-hidden="true">
    <!-- 해/달 -->
    <div v-if="period !== 'night'" class="sun" :class="`sun--${period}`"></div>
    <div v-else class="moon"></div>

    <!-- 별 (밤에만) -->
    <div v-if="period === 'night'" class="stars">
      <span
        v-for="(star, i) in stars"
        :key="i"
        class="star"
        :style="{
          top: star.top,
          left: star.left,
          width: star.size,
          height: star.size,
          animationDuration: star.duration,
          animationDelay: star.delay,
        }"
      ></span>
    </div>

    <!-- 별똥별 (맑은 밤에만, 가끔) -->
    <div v-if="isClearNight" class="shooting-star"></div>

    <!-- 구름 -->
    <div class="clouds">
      <span
        v-for="(cloud, i) in clouds"
        :key="i"
        class="cloud"
        :style="{
          top: cloud.top,
          opacity: cloud.opacity,
          transform: `scale(${cloud.scale})`,
          animationDuration: cloud.duration,
          animationDelay: cloud.delay,
        }"
      ></span>
    </div>

    <!-- 비 -->
    <div v-if="isRaining" class="rain">
      <span
        v-for="(drop, i) in raindrops"
        :key="i"
        class="raindrop"
        :style="{
          left: drop.left,
          height: drop.height,
          animationDuration: drop.duration,
          animationDelay: drop.delay,
        }"
      ></span>
    </div>

    <!-- 천둥번개 -->
    <div v-if="isThunder" class="lightning-flash"></div>
  </div>
</template>

<style scoped>
.sky-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  transition: background 3s ease;
}
.sky-background--dawn {
  background: linear-gradient(to bottom, #ff9a76 0%, #ffd39b 45%, #cfe8ff 100%);
}
.sky-background--morning {
  background: linear-gradient(to bottom, #8ec9f0 0%, #cfeeff 55%, #fdfefe 100%);
}
.sky-background--day {
  background: linear-gradient(to bottom, #4fa8f0 0%, #8fd0f7 55%, #eaf7ff 100%);
}
.sky-background--evening {
  background: linear-gradient(to bottom, #2b3a67 0%, #a25b6e 55%, #ff9966 100%);
}
.sky-background--night {
  background: linear-gradient(to bottom, #05070f 0%, #0d1836 55%, #16234a 100%);
}

/* 해 */
.sun {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6d9 0%, #ffd76a 60%, #ffb84d 100%);
  animation: sunPulse 6s ease-in-out infinite;
}
.sun--dawn {
  top: 70%;
  left: 12%;
}
.sun--morning {
  top: 20%;
  left: 15%;
}
.sun--day {
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
}
.sun--evening {
  top: 65%;
  left: 78%;
  background: radial-gradient(circle, #ffe1b0 0%, #ff9d5c 60%, #ff7043 100%);
}
@keyframes sunPulse {
  0%,
  100% {
    filter: drop-shadow(0 0 25px rgba(255, 200, 120, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 45px rgba(255, 200, 120, 0.95));
  }
}

/* 달 */
.moon {
  position: absolute;
  top: 10%;
  right: 14%;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fdfdfd 0%, #d8dee8 60%, #b7c0cf 100%);
  box-shadow: 0 0 30px rgba(220, 228, 245, 0.5);
}

/* 별 */
.stars {
  position: absolute;
  inset: 0;
}
.star {
  position: absolute;
  border-radius: 50%;
  background: #ffffff;
  animation-name: twinkle;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.15;
  }
  50% {
    opacity: 1;
  }
}

/* 별똥별 */
.shooting-star {
  position: absolute;
  top: 15%;
  left: 85%;
  width: 2px;
  height: 2px;
  background: linear-gradient(-45deg, rgba(255, 255, 255, 0), #ffffff, rgba(255, 255, 255, 0));
  border-radius: 50%;
  animation: shoot 9s linear infinite;
  animation-delay: 3s;
}
.shooting-star::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 90px;
  height: 1.5px;
  background: linear-gradient(-45deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  transform: translateX(1px) rotate(0deg);
}
@keyframes shoot {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  2% {
    opacity: 1;
  }
  15% {
    transform: translate(-420px, 260px);
    opacity: 0;
  }
  100% {
    transform: translate(-420px, 260px);
    opacity: 0;
  }
}

/* 구름 */
.clouds {
  position: absolute;
  inset: 0;
}
.cloud {
  position: absolute;
  left: -20%;
  width: 140px;
  height: 44px;
  background: #ffffff;
  border-radius: 999px;
  filter: blur(2px);
  animation-name: drift;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
}
.cloud::before {
  width: 60px;
  height: 60px;
  top: -28px;
  left: 15px;
}
.cloud::after {
  width: 46px;
  height: 46px;
  top: -18px;
  left: 70px;
}
@keyframes drift {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(130vw);
  }
}

/* 비 */
.rain {
  position: absolute;
  inset: 0;
}
.raindrop {
  position: absolute;
  top: -30px;
  width: 2px;
  background: linear-gradient(to bottom, rgba(174, 214, 255, 0), rgba(174, 214, 255, 0.75));
  animation-name: fall;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
@keyframes fall {
  from {
    transform: translateY(-10vh);
  }
  to {
    transform: translateY(110vh);
  }
}

/* 천둥번개 */
.lightning-flash {
  position: absolute;
  inset: 0;
  background: #ffffff;
  opacity: 0;
  animation: flash 7s ease-in-out infinite;
}
@keyframes flash {
  0%,
  90%,
  94%,
  100% {
    opacity: 0;
  }
  91%,
  93% {
    opacity: 0.55;
  }
}
</style>
