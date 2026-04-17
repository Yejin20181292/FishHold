<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tank: {
    id: string;
    name: string;
    temp: number | null;
  }
}>();

const emit = defineEmits(['back']);

// Mock historical data for a 24-hour line/bar chart
const historyData = computed(() => {
  const data = [];
  const baseTemp = props.tank.temp ?? 0;
  for (let i = 0; i < 24; i++) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    // Create a realistic daily wave curve (colder at night, warmer in day) + slight noise
    const variation = Math.sin((i - 6) / 24 * Math.PI * 2) * (baseTemp < 0 ? 1.5 : 2.5);
    const noise = (Math.random() - 0.5) * 0.8;
    data.push({
      time,
      temp: parseFloat((baseTemp + variation + noise).toFixed(1)),
      hour: i
    });
  }
  return data;
});

// Calculate metrics for Y-axis scaling
const maxTemp = computed(() => Math.ceil(Math.max(...historyData.value.map(d => d.temp)) + 1));
const minTemp = computed(() => Math.floor(Math.min(...historyData.value.map(d => d.temp)) - 1));

function getBarHeight(temp: number) {
  const range = maxTemp.value - minTemp.value;
  if(range === 0) return 50; 
  // Convert temperature to a percentage height mapping within the grid height
  return ((temp - minTemp.value) / range) * 100;
}
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
          <!-- Y-Axis -->
          <div class="y-axis">
            <span>{{ maxTemp }}°C</span>
            <span>{{ Math.round((maxTemp + minTemp) / 2) }}°C</span>
            <span>{{ minTemp }}°C</span>
          </div>
          
          <div class="chart-content">
            <!-- Grid Lines -->
            <div class="grid-layout">
              <div class="grid-line" v-for="n in 3" :key="n"></div>
            </div>
            
            <!-- Bars -->
            <div class="bars-container">
              <div class="bar-wrapper" v-for="point in historyData" :key="point.hour">
                <div class="bar-tooltip">{{ point.temp }}°C ({{ point.time }})</div>
                <div 
                  class="bar" 
                  :style="{ 
                    height: `${getBarHeight(point.temp)}%`, 
                    backgroundColor: point.temp < 0 ? '#60a5fa' : '#f87171' 
                  }"
                ></div>
                <!-- X-Axis Labels (every 4 hours) -->
                <div class="bar-label" v-if="point.hour % 4 === 0 || point.hour === 23">
                  {{ point.hour }}시
                </div>
              </div>
            </div>
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
  min-width: 250px;
}

.chart-card {
  flex: 3;
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
  flex-grow: 1;
  margin-top: 24px;
  height: 250px;
  position: relative;
  font-family: inherit;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 12px;
  padding-bottom: 24px; /* Reserve space for X-axis labels */
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-align: right;
  min-width: 40px;
}

.chart-content {
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.grid-layout {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 28px; /* Match X-axis label space */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  height: 1px;
  background-color: #f1f5f9;
  width: 100%;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-grow: 1;
  position: relative;
  z-index: 1;
  padding-bottom: 24px; /* Space for X-axis labels */
  height: 100%;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 100%;
  position: relative;
}

.bar {
  width: 50%;
  max-width: 18px;
  border-radius: 4px 4px 0 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 4px;
  opacity: 0.85;
}

.bar-wrapper:hover .bar {
  opacity: 1;
  filter: brightness(1.15);
  box-shadow: 0 0 8px rgba(0,0,0,0.1);
}

.bar-tooltip {
  position: absolute;
  top: -30px;
  background: #1e293b;
  color: #fff;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 6px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.bar-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}

.bar-wrapper:hover .bar-tooltip {
  opacity: 1;
  visibility: visible;
  top: -42px;
}

.bar-label {
  position: absolute;
  bottom: -20px;
  font-size: 10px;
  color: #64748b;
  white-space: nowrap;
  font-weight: 500;
}
</style>
