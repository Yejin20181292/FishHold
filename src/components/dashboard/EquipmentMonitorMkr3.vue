<script setup lang="ts">
import DateRangeChart from './DateRangeChart.vue'

// Base temp for MKR-3 as visually mock
const mkr3BaseTemp = 5.4; 
</script>

<template>
  <div class="mkr3-container">
    <div class="header">
      <h2 class="title">MKR-3 데이터 모니터링</h2>
    </div>

    <div class="content">
      <div class="card premium-card full-chart-card">
        <DateRangeChart :baseTemp="mkr3BaseTemp" titleName="신라 나오에로썬 MKR-3" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mkr3-container {
  padding: 32px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.header {
  margin-bottom: 24px;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.full-chart-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.premium-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
