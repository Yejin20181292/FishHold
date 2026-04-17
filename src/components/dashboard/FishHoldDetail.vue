<script setup lang="ts">

import DateRangeChart from './DateRangeChart.vue'

defineProps<{
  tank: {
    id: string;
    name: string;
    temp: number | null;
  }
}>();

const emit = defineEmits(['back']);
</script>

<template>
  <div class="detail-container">
    <div class="header-actions">
      <button class="back-btn" @click="emit('back')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <h2 class="page-title">데이터 추이</h2>
    </div>

    <div class="content-wrapper">
      <div class="card premium-card min-info">
        <h2>{{ tank.name }} 상세 정보</h2>
        <div class="temp-display">
          <span class="label">현재 온도</span>
          <span class="value" :class="{ 'text-blue': tank.temp && tank.temp < 0, 'text-red': tank.temp && tank.temp >= 0 }">
            {{ tank.temp !== null ? tank.temp.toFixed(1) : '--' }} °C
          </span>
        </div>
        
        <div class="status-indicator">
          <div class="status-dot" :class="tank.temp !== null ? 'active' : 'inactive'"></div>
          <span>상태: {{ tank.temp !== null ? '정상 작동 중' : '데이터 없음' }}</span>
        </div>
      </div>

      <div class="card premium-card chart-card">
        <DateRangeChart :baseTemp="tank.temp" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-container {
  padding: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  box-sizing: border-box;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.back-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  padding: 0;
}

.back-btn:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.content-wrapper {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.premium-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.min-info {
  flex: 1;
  min-width: 250px;
}

.chart-card {
  flex: 3;
  min-width: 400px;
  display: flex;
  flex-direction: column;
}

h2 {
  margin-top: 0;
  color: #1e293b;
  font-weight: 700;
}

.temp-display {
  margin: 32px 0;
  display: flex;
  flex-direction: column;
}

.temp-display .label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.temp-display .value {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.text-blue { color: #2563eb; }
.text-red { color: #dc2626; }

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

</style>
