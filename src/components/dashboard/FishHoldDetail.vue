<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  tank: {
    id: string;
    name: string;
    temp: number | null;
  }
}>();

const emit = defineEmits(['back']);

const todayStr = new Date().toISOString().split('T')[0];
const today = ref(todayStr);

const startDate = ref(todayStr);
const endDate = ref(todayStr);

function validateRange() {
  if (!startDate.value) startDate.value = todayStr;
  if (!endDate.value) endDate.value = todayStr;
  
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  
  if (end < start) {
      endDate.value = startDate.value;
      return;
  }
  
  const diffTime = end.getTime() - start.getTime();
  const diffDaysVal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDaysVal > 6) {
      const maxEnd = new Date(start);
      maxEnd.setDate(maxEnd.getDate() + 6);
      const tzOffset = maxEnd.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(maxEnd.getTime() - tzOffset)).toISOString().slice(0, 10);
      endDate.value = localISOTime;
      alert('기간은 최대 7일까지만 지정할 수 있습니다.');
  }
}

const diffDays = computed(() => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
});

// Generate dynamic data based on selected date range (24 points per day)
const historyData = computed(() => {
  const data = [];
  const baseTemp = props.tank.temp ?? 0;
  
  if (!startDate.value) return [];
  const start = new Date(startDate.value);
  const days = diffDays.value;
  
  for (let d = 0; d < days; d++) {
    const curDate = new Date(start);
    curDate.setDate(curDate.getDate() + d);
    
    for (let i = 0; i < 24; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      const variation = Math.sin((i - 6) / 24 * Math.PI * 2) * (baseTemp < 0 ? 1.5 : 2.5);
      const dayVariation = Math.sin(d) * 0.5; // Slight drift per day
      const noise = (Math.random() - 0.5) * 0.8;
      data.push({
        time,
        temp: parseFloat((baseTemp + variation + dayVariation + noise).toFixed(1)),
        hour: i,
        day: curDate.getDate(),
        month: curDate.getMonth() + 1,
        isNewDay: i === 0
      });
    }
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

const svgPoints = computed(() => {
  const total = historyData.value.length;
  if (total === 0) return [];
  return historyData.value.map((point, index) => {
    const x = (index / Math.max(1, total - 1)) * 100;
    const y = 100 - getBarHeight(point.temp);
    return { ...point, x, y };
  });
});

const svgLine = computed(() => {
  if (svgPoints.value.length === 0) return '';
  return svgPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
});

const svgFill = computed(() => {
  if (svgPoints.value.length === 0) return '';
  return `${svgLine.value} L 100 100 L 0 100 Z`;
});
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
        <div class="chart-header">
          <h3>기간별 모니터링</h3>
          <div class="custom-date-picker">
            <input type="date" v-model="startDate" :max="today" @change="validateRange" />
            <span class="separator">~</span>
            <input type="date" v-model="endDate" :max="today" @change="validateRange" />
          </div>
        </div>
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
            
            <!-- Line Chart SVG -->
            <div class="line-container">
              <svg class="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineFillBlue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="rgba(59, 130, 246, 0.4)" />
                    <stop offset="100%" stop-color="rgba(59, 130, 246, 0.0)" />
                  </linearGradient>
                  <linearGradient id="lineFillRed" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="rgba(248, 113, 113, 0.4)" />
                    <stop offset="100%" stop-color="rgba(248, 113, 113, 0.0)" />
                  </linearGradient>
                </defs>
                <path :d="svgFill" :fill="tank.temp && tank.temp >= 0 ? 'url(#lineFillRed)' : 'url(#lineFillBlue)'" class="chart-area-fill" />
                <path :d="svgLine" fill="none" :stroke="tank.temp && tank.temp >= 0 ? '#f87171' : '#3b82f6'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line-stroke" vector-effect="non-scaling-stroke" />
              </svg>

              <!-- Interactive Points -->
              <div 
                v-for="(p, index) in svgPoints" 
                :key="index"
                class="chart-point"
                :style="{ 
                  left: `${p.x}%`, 
                  top: `${p.y}%`,
                  borderColor: tank.temp && tank.temp >= 0 ? '#f87171' : '#3b82f6'
                }"
              >
                <div class="point-tooltip">{{ p.temp }}°C ({{ p.time }})</div>
              </div>
            </div>
            
            <!-- X-Axis Labels -->
            <div class="x-axis-container">
              <div 
                class="x-label" 
                v-for="(p, index) in svgPoints" 
                :key="index" 
                v-show="diffDays === 1 ? (p.hour % 4 === 0 || p.hour === 23) : p.isNewDay" 
                :style="{ left: `${p.x}%` }"
              >
                {{ diffDays === 1 ? p.hour + '시' : p.month + '/' + p.day }}
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-date-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.custom-date-picker input[type="date"] {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  outline: none;
  cursor: pointer;
}

.custom-date-picker .separator {
  color: #94a3b8;
  font-weight: 500;
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

.line-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 28px; /* Matches grid-layout */
  z-index: 1;
}

.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-area-fill {
  transition: d 0.5s ease;
}

.chart-line-stroke {
  transition: d 0.5s ease;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.chart-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2.5px solid;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
  z-index: 2;
}

.chart-point:hover {
  transform: translate(-50%, -50%) scale(1.6);
  box-shadow: 0 0 10px rgba(0,0,0,0.15);
  z-index: 3;
}

.point-tooltip {
  position: absolute;
  bottom: 18px; /* Appears above the point */
  left: 50%;
  transform: translateX(-50%);
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

.point-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}

.chart-point:hover .point-tooltip {
  opacity: 1;
  visibility: visible;
  bottom: 24px;
}

.x-axis-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
}

.x-label {
  position: absolute;
  transform: translateX(-50%);
  bottom: -20px;
  font-size: 10px;
  color: #64748b;
  white-space: nowrap;
  font-weight: 500;
}
</style>
