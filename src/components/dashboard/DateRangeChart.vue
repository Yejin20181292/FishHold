<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  baseTemp?: number | null;
}>();

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
  const baseT = props.baseTemp ?? 0;
  
  if (!startDate.value) return [];
  const start = new Date(startDate.value);
  const days = diffDays.value;
  
  for (let d = 0; d < days; d++) {
    const curDate = new Date(start);
    curDate.setDate(curDate.getDate() + d);
    
    for (let i = 0; i < 24; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      const variation = Math.sin((i - 6) / 24 * Math.PI * 2) * (baseT < 0 ? 1.5 : 2.5);
      const dayVariation = Math.sin(d) * 0.5; // Slight drift per day
      const noise = (Math.random() - 0.5) * 0.8;
      data.push({
        time,
        temp: parseFloat((baseT + variation + dayVariation + noise).toFixed(1)),
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

const isWarm = computed(() => props.baseTemp !== null && props.baseTemp !== undefined && props.baseTemp >= 0);
</script>

<template>
  <div class="date-range-chart-container">
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
            <path :d="svgFill" :fill="isWarm ? 'url(#lineFillRed)' : 'url(#lineFillBlue)'" class="chart-area-fill" />
            <path :d="svgLine" fill="none" :stroke="isWarm ? '#f87171' : '#3b82f6'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line-stroke" vector-effect="non-scaling-stroke" />
          </svg>

          <!-- Interactive Points -->
          <div 
            v-for="(p, index) in svgPoints" 
            :key="index"
            class="chart-point"
            :style="{ 
              left: `${p.x}%`, 
              top: `${p.y}%`,
              borderColor: isWarm ? '#f87171' : '#3b82f6'
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
</template>

<style scoped>
.date-range-chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

h3 {
  margin: 0;
  color: #1e293b;
  font-weight: 700;
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

.dummy-chart {
  flex-grow: 1;
  display: flex;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px 24px 24px 10px;
  position: relative;
  min-height: 250px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 16px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  align-items: flex-end;
}

.chart-content {
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.grid-layout {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  border-bottom: 1px dashed #e2e8f0;
  width: 100%;
  height: 0;
}

.line-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-area-fill {
  transition: d 0.3s ease;
}

.chart-line-stroke {
  transition: d 0.3s ease;
}

.chart-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 2px solid;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
}

.chart-point:hover {
  transform: translate(-50%, -50%) scale(1.5);
  z-index: 20;
}

.point-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, -8px);
  background: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.chart-point:hover .point-tooltip {
  opacity: 1;
}

.x-axis-container {
  position: absolute;
  bottom: -24px;
  left: 0;
  right: 0;
  height: 20px;
}

.x-label {
  position: absolute;
  transform: translateX(-50%);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
