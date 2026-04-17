<script setup lang="ts">
import { ref, computed } from 'vue'

interface TankData {
  id: string;
  name: string;
  temp: number;
}

const props = defineProps<{
  tanks?: TankData[];
  baseTemp?: number | null;
  titleName?: string;
  showExpand?: boolean;
}>();

const emit = defineEmits(['navigate']);

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

const computedTanks = computed(() => {
  if (props.tanks && props.tanks.length > 0) {
    return props.tanks;
  }
  if (props.titleName || props.baseTemp !== undefined) {
    return [{
      id: 'default',
      name: props.titleName || '',
      temp: props.baseTemp ?? 0
    }];
  }
  return [];
});

const palette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
const getTankColor = (tank: TankData, index: number) => {
  if (computedTanks.value.length === 1) {
    return tank.temp >= 0 ? '#ef4444' : '#3b82f6';
  }
  return palette[index % palette.length];
};

const historySeries = computed(() => {
  return computedTanks.value.map((tank, tIndex) => {
    const data = [];
    const baseT = tank.temp ?? 0;
    if (!startDate.value) return { tank, color: getTankColor(tank, tIndex), data: [] };
    
    const start = new Date(startDate.value);
    const days = diffDays.value;
    const seed = tIndex * 13.5;
    
    for (let d = 0; d < days; d++) {
      const curDate = new Date(start);
      curDate.setDate(curDate.getDate() + d);
      
      for (let i = 0; i < 24; i++) {
        const time = `${i.toString().padStart(2, '0')}:00`;
        const variation = Math.sin((i - 6) / 24 * Math.PI * 2) * (baseT < 0 ? 1.5 : 2.5);
        const dayVariation = Math.sin(d + seed) * 0.5;
        const noise = (Math.sin(i * 1.5 + seed + d) * 0.8);
        data.push({
          time,
          temp: parseFloat((baseT + variation + dayVariation + noise).toFixed(1)),
          hour: i,
          day: curDate.getDate(),
          month: curDate.getMonth() + 1,
          isNewDay: i === 0,
          tankName: tank.name
        });
      }
    }
    return {
      tank,
      color: getTankColor(tank, tIndex),
      data
    };
  });
});

const maxTemp = computed(() => {
  if (!historySeries.value.length) return 10;
  const allMaxes = historySeries.value.map(s => Math.max(...s.data.map(d => d.temp)));
  if (!allMaxes.length) return 10;
  return Math.ceil(Math.max(...allMaxes) + 1);
});

const minTemp = computed(() => {
  if (!historySeries.value.length) return -10;
  const allMins = historySeries.value.map(s => Math.min(...s.data.map(d => d.temp)));
  if (!allMins.length) return -10;
  return Math.floor(Math.min(...allMins) - 1);
});

function getBarHeight(temp: number) {
  const range = maxTemp.value - minTemp.value;
  if(range === 0) return 50; 
  return ((temp - minTemp.value) / range) * 100;
}

const seriesPoints = computed(() => {
  return historySeries.value.map((series) => {
    const total = series.data.length;
    const points = series.data.map((point, index) => {
      const x = (index / Math.max(1, total - 1)) * 100;
      const y = 100 - getBarHeight(point.temp);
      return { ...point, x, y };
    });
    
    const svgLine = points.length === 0 ? '' : points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const svgFill = points.length === 0 ? '' : `${svgLine} L 100 100 L 0 100 Z`;
    
    return {
      ...series,
      points,
      svgLine,
      svgFill
    };
  });
});

const isMultiLine = computed(() => computedTanks.value.length > 1);

// Helper for single line active fill
const getSingleFillGradient = (color: string) => {
  return color === '#ef4444' ? 'url(#lineFillRed)' : 'url(#lineFillBlue)';
};
</script>

<template>
  <div class="date-range-chart-container">
    <div class="chart-header">
      <div class="header-titles">
        <h3 class="header-title">기간별 모니터링</h3>
        <span class="tank-name" v-if="!isMultiLine && computedTanks.length === 1">{{ computedTanks[0].name }}</span>
      </div>
      <div class="header-controls">
        <div class="custom-date-picker">
          <input type="date" v-model="startDate" :max="today" @change="validateRange" />
          <span class="separator">~</span>
          <input type="date" v-model="endDate" :max="today" @change="validateRange" />
        </div>
        <button v-if="showExpand" class="expand-btn" @click="emit('navigate', 'mkr3')" title="장비 모니터링 페이지로 이동">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Legend for Multi-line -->
    <div class="legend-container" v-if="isMultiLine">
      <div class="legend-item" v-for="s in historySeries" :key="s.tank.id">
        <div class="legend-color" :style="{ backgroundColor: s.color }"></div>
        <span class="legend-name">{{ s.tank.name }}</span>
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
            
            <g v-for="series in seriesPoints" :key="series.tank.id">
              <path 
                v-if="!isMultiLine" 
                :d="series.svgFill" 
                :fill="getSingleFillGradient(series.color)" 
                class="chart-area-fill" 
              />
              <path 
                :d="series.svgLine" 
                fill="none" 
                :stroke="series.color" 
                stroke-width="2.5" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class="chart-line-stroke" 
                vector-effect="non-scaling-stroke" 
              />
            </g>
          </svg>

          <!-- Interactive Points -->
          <template v-for="series in seriesPoints" :key="'points-' + series.tank.id">
            <div 
              v-for="(p, index) in series.points" 
              :key="index"
              class="chart-point"
              :style="{ 
                left: `${p.x}%`, 
                top: `${p.y}%`,
                borderColor: series.color
              }"
            >
              <div class="point-tooltip">
                <span class="tt-name" v-if="isMultiLine">{{ p.tankName }}: </span>
                {{ p.temp }}°C ({{ p.time }})
              </div>
            </div>
          </template>
        </div>
        
        <!-- X-Axis Labels -->
        <div class="x-axis-container">
          <div 
            class="x-label" 
            v-for="(p, index) in (seriesPoints[0]?.points || [])" 
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
  margin-bottom: 12px;
}

.header-title {
  margin: 0;
  color: #1e293b;
  font-weight: 700;
  font-size: 1.1rem;
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.tank-name {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
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

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #f1f5f9;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.legend-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-name {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.dummy-chart {
  flex-grow: 1;
  display: flex;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px 24px 24px 10px;
  position: relative;
  min-height: 300px;
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
  width: 6px;
  height: 6px;
  background: #fff;
  border: 2px solid;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 10;
}

.chart-point:hover {
  transform: translate(-50%, -50%) scale(1.8);
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
  border-radius: 5px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.tt-name {
  font-weight: 700;
  color: #93c5fd;
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
