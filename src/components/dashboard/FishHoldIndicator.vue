<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  temp: number | null;
}>();

// Simple logic to color the temp
const tempColor = computed(() => {
  if (props.temp === null) return '#ffffff';
  if (props.temp < -10) return '#60a5fa'; // Blueish for very cold
  if (props.temp < 0) return '#fde047'; // Yellow for moderate
  return '#f87171'; // Red for hot/error
});
</script>

<template>
  <div class="indicator">
    <span :style="{ color: tempColor }" class="temp-text">
      {{ temp !== null ? temp.toFixed(1) : '--' }}
    </span>
  </div>
</template>

<style scoped>
.indicator {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Background is mostly transparent because the blueprint already has a black box */
  /* If the text needs more contrast, we can add a subtle shadow or let it sit on the black box */
  font-family: 'Inter', sans-serif;
}

.temp-text {
  font-weight: 800;
  font-size: 1.1vw; /* Reduced font size to fit better within cells */
  /* text-shadow: 1px 1px 2px rgba(0,0,0,0.8); */
}

/* 태블릿 이하 */
@media (max-width: 1200px) {
  .temp-text {
    font-size: 13px;
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .temp-text {
    font-size: 8px;
    font-weight: 700;
  }
}

/* 소형 모바일 */
@media (max-width: 480px) {
  .temp-text {
    font-size: 6px;
  }
}
</style>
