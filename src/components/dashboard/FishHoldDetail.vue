<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  tank: {
    id: string;
    name: string;
    temp: number | null;
  }
}>();

const emit = defineEmits(['back']);

// Mock historical data for a line chart (using CSS simple bars or SVG for a placeholder)
const historyData = ref([
  { time: '10:00', temp: props.tank.temp ? props.tank.temp + 1 : 0 },
  { time: '11:00', temp: props.tank.temp ? props.tank.temp + 0.5 : 0 },
  { time: '12:00', temp: props.tank.temp ? props.tank.temp - 0.2 : 0 },
  { time: '13:00', temp: props.tank.temp ? props.tank.temp - 1 : 0 },
  { time: '14:00', temp: props.tank.temp ? props.tank.temp : 0 },
]);
</script>

<template>
  <div class="detail-container">
    <div class="header-actions">
      <button class="back-btn" @click="emit('back')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        뒤로 가기
      </button>
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
        <h3>기간별 모니터링</h3>
        <div class="dummy-chart">
          <div class="bar-container" v-for="(point, index) in historyData" :key="index">
            <div class="bar-value">{{ point.temp.toFixed(1) }}</div>
            <div class="bar" :style="{ height: `${Math.abs(point.temp) * 3 + 20}%`, backgroundColor: point.temp < 0 ? '#60a5fa' : '#f87171' }"></div>
            <div class="bar-label">{{ point.time }}</div>
          </div>
        </div>
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
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
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
  min-width: 300px;
}

.chart-card {
  flex: 2;
  min-width: 400px;
  display: flex;
  flex-direction: column;
}

h2, h3 {
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

.status-dot.active {
  background-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.status-dot.inactive {
  background-color: #94a3b8;
}

.dummy-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  flex-grow: 1;
  margin-top: 24px;
  height: 200px;
  padding: 20px 0 0;
  border-bottom: 2px solid #e2e8f0;
  border-left: 2px solid #e2e8f0;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  width: 40px;
}

.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 1s ease-out;
  min-height: 5px;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}
</style>
