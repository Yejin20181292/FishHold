<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['navigate']);

// Generate columns
const columns = [
  'C No1 FH F', 'SS No2 FH F', 'PS No2 FH F', 'SS No3 FH F', 'PS No3 FH F', 
  'SS No4 FH F', 'PS No4 FH F', 'SS No5 FH F', 'PS No5 FH F', 'SS No6 FH F', 
  'PS No6 FH F', 'SS No7 FH F', 'PS No7 FH F', 'SS No8 FH F', 'PS No8 FH F', 'SS No9 FH F'
];

interface LogEntry {
  id: string;
  time: string;
  values: string[];
}

// Generate realistic dummy data for temperatures
const generateRandomTemp = (base: number, variance: number) => {
  return (base + (Math.random() * variance * 2 - variance)).toFixed(1) + ' ℃';
};

const baseTemps = [-10.0, -1.7, -1.9, -1.9, -1.8, 17.8, -1.7, -12.5, -13.3, -13.2, -7.2, -13.0, -3.2, -2.6, -2.2, -1.9];

const logs = ref<LogEntry[]>([]);

// Base time: 2026-04-20 10:47:06
let baseTime = new Date(2026, 3, 20, 10, 47, 6);

for (let i = 0; i < 30; i++) {
  const rowTime = new Date(baseTime.getTime() - i * 60000); // subtract 1 minute per row
  const timeStr = `${rowTime.getFullYear()}-${String(rowTime.getMonth() + 1).padStart(2, '0')}-${String(rowTime.getDate()).padStart(2, '0')} ${rowTime.getHours() < 12 ? '오전' : '오후'} ${String(rowTime.getHours() % 12 || 12).padStart(2, '0')}:${String(rowTime.getMinutes()).padStart(2, '0')}:${String(rowTime.getSeconds()).padStart(2, '0')}`;
  
  const values = baseTemps.map(base => generateRandomTemp(base, 0.2));
  
  logs.value.push({
    id: `log_${i}`,
    time: timeStr,
    values
  });
}

// ===== 커스텀 스크롤바 (모든 모바일에서 항상 표시) =====
const tableScrollRef = ref<HTMLElement | null>(null)
const tScrollLeft = ref(0)
const tScrollWidth = ref(0)
const tClientWidth = ref(0)

// 세로 스크롤 상태
const tScrollTop = ref(0)
const tScrollHeight = ref(0)
const tClientHeight = ref(0)

// 가로
const tIsScrollable = computed(() => tScrollWidth.value > tClientWidth.value + 2)
const tThumbWidth = computed(() => {
  if (tScrollWidth.value <= 0) return 100
  return Math.max(12, (tClientWidth.value / tScrollWidth.value) * 100)
})
const tThumbLeft = computed(() => {
  const maxScroll = tScrollWidth.value - tClientWidth.value
  if (maxScroll <= 0) return 0
  return (tScrollLeft.value / maxScroll) * (100 - tThumbWidth.value)
})

// 세로
const tVIsScrollable = computed(() => tScrollHeight.value > tClientHeight.value + 2)
const tVThumbHeight = computed(() => {
  if (tScrollHeight.value <= 0) return 100
  return Math.max(12, (tClientHeight.value / tScrollHeight.value) * 100)
})
const tVThumbTop = computed(() => {
  const maxScroll = tScrollHeight.value - tClientHeight.value
  if (maxScroll <= 0) return 0
  return (tScrollTop.value / maxScroll) * (100 - tVThumbHeight.value)
})

function updateTableScrollInfo() {
  if (!tableScrollRef.value) return
  tScrollLeft.value = tableScrollRef.value.scrollLeft
  tScrollWidth.value = tableScrollRef.value.scrollWidth
  tClientWidth.value = tableScrollRef.value.clientWidth
  tScrollTop.value = tableScrollRef.value.scrollTop
  tScrollHeight.value = tableScrollRef.value.scrollHeight
  tClientHeight.value = tableScrollRef.value.clientHeight
}

function onTableScroll() {
  updateTableScrollInfo()
}

// 가로 thumb 드래그
let tIsDragging = false
let tDragStartX = 0
let tDragStartScrollLeft = 0

function onTThumbTouchStart(e: TouchEvent) {
  tIsDragging = true
  tDragStartX = e.touches[0].clientX
  tDragStartScrollLeft = tableScrollRef.value?.scrollLeft ?? 0
  e.preventDefault()
}

function onTThumbTouchMove(e: TouchEvent) {
  if (!tIsDragging || !tableScrollRef.value) return
  const dx = e.touches[0].clientX - tDragStartX
  const maxScroll = tScrollWidth.value - tClientWidth.value
  const thumbTrackWidth = tClientWidth.value * (1 - tThumbWidth.value / 100)
  const scrollRatio = thumbTrackWidth > 0 ? maxScroll / thumbTrackWidth : 1
  tableScrollRef.value.scrollLeft = Math.max(0, Math.min(maxScroll, tDragStartScrollLeft + dx * scrollRatio))
  updateTableScrollInfo()
  e.preventDefault()
}

function onTThumbTouchEnd() { tIsDragging = false }

// 세로 thumb 드래그
let tVIsDragging = false
let tVDragStartY = 0
let tVDragStartScrollTop = 0

function onVThumbTouchStart(e: TouchEvent) {
  tVIsDragging = true
  tVDragStartY = e.touches[0].clientY
  tVDragStartScrollTop = tableScrollRef.value?.scrollTop ?? 0
  e.preventDefault()
}

function onVThumbTouchMove(e: TouchEvent) {
  if (!tVIsDragging || !tableScrollRef.value) return
  const dy = e.touches[0].clientY - tVDragStartY
  const maxScroll = tScrollHeight.value - tClientHeight.value
  const thumbTrackHeight = tClientHeight.value * (1 - tVThumbHeight.value / 100)
  const scrollRatio = thumbTrackHeight > 0 ? maxScroll / thumbTrackHeight : 1
  tableScrollRef.value.scrollTop = Math.max(0, Math.min(maxScroll, tVDragStartScrollTop + dy * scrollRatio))
  updateTableScrollInfo()
  e.preventDefault()
}

function onVThumbTouchEnd() { tVIsDragging = false }

onMounted(() => {
  nextTick(() => updateTableScrollInfo())
  window.addEventListener('resize', updateTableScrollInfo)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTableScrollInfo)
})
</script>

<template>
  <div class="dataset-container">
    <div class="header">
      <h2 class="page-title">
        기간별 데이터
      </h2>
      <button class="export-btn" title="엑셀로 다운로드">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </button>
    </div>

    <!-- 테이블 스크롤 영역 -->
    <div class="card premium-card logs-card">
      <!-- 가로+세로 스크롤 래퍼 -->
      <div class="table-scroll-wrapper">
        <div class="table-responsive" ref="tableScrollRef" @scroll="onTableScroll">
          <table class="logs-table">
            <thead>
              <tr>
                <th style="min-width: 180px">시간</th>
                <th v-for="col in columns" :key="col" style="min-width: 100px">{{ col }}</th>
              </tr>
              <tr class="filter-row">
                <td class="filter-cell">
                  <div class="filter-input-wrap">
                    <input type="text" class="filter-input" value="2026-04-20 ~ 2026-04-20" readonly />
                    <span class="filter-icon" style="color: #3b82f6;">❌</span>
                  </div>
                </td>
                <td v-for="col in columns" :key="'filter_'+col" class="filter-cell">
                  <input type="text" class="filter-input" />
                </td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id" class="log-row">
                <td class="col-time">{{ log.time }}</td>
                <td v-for="(val, index) in log.values" :key="index" class="col-center">{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 커스텀 세로 스크롤바 (오른쪽 고정) -->
        <div class="table-vscrollbar-track" v-if="tVIsScrollable">
          <div
            class="table-vscrollbar-thumb"
            :style="{ height: tVThumbHeight + '%', top: tVThumbTop + '%' }"
            @touchstart="onVThumbTouchStart"
            @touchmove="onVThumbTouchMove"
            @touchend="onVThumbTouchEnd"
          ></div>
        </div>
      </div>

      <!-- 커스텀 가로 스크롤바 (하단 고정) -->
      <div class="table-custom-scrollbar-track" v-if="tIsScrollable">
        <div
          class="table-custom-scrollbar-thumb"
          :style="{ width: tThumbWidth + '%', left: tThumbLeft + '%' }"
          @touchstart="onTThumbTouchStart"
          @touchmove="onTThumbTouchMove"
          @touchend="onTThumbTouchEnd"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dataset-container {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #dbeafe; /* Light blue header */
  padding: 12px 20px;
  border-radius: 8px 8px 0 0;
  border: 1px solid #bfdbfe;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e3a8a;
  display: flex;
  align-items: center;
}

.export-btn {
  background: white;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.logs-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 8px 8px;
}

/* 테이블 + 세로 스크롤바 래퍼 */
.table-scroll-wrapper {
  flex-grow: 1;
  position: relative;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.table-responsive {
  flex-grow: 1;
  overflow: auto;
  background: #fff;
  min-width: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-responsive::-webkit-scrollbar {
  display: none;
}

/* ===== 커스텀 세로 스크롤바 ===== */
.table-vscrollbar-track {
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 7px;
  background: #e2e8f0;
  border-radius: 7px;
  z-index: 5;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .table-vscrollbar-track {
    display: block;
  }
}

.table-vscrollbar-thumb {
  position: absolute;
  left: 0;
  width: 100%;
  min-height: 20px;
  background: linear-gradient(180deg, #3b82f6, #60a5fa);
  border-radius: 7px;
  cursor: pointer;
  transition: top 0.05s linear;
  box-shadow: 1px 0 4px rgba(59, 130, 246, 0.4);
}

.table-vscrollbar-thumb:active {
  background: linear-gradient(180deg, #2563eb, #3b82f6);
}

/* ===== 모바일: 세로 스크롤 활성화 ===== */
@media (max-width: 768px) {
  .dataset-container {
    height: auto;       /* 고정 높이 해제 */
    overflow: visible;  /* 클리핑 제거 */
  }

  .logs-card {
    overflow: visible; /* 카드 클리핑 해제 */
  }

  .table-responsive {
    max-height: 60vh; /* 화면의 60% 높이로 제한 → 세로 스크롤 활성화 */
    overflow: auto;   /* 가로 + 세로 모두 스크롤 */
  }
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px; /* Smaller font for dense data */
}

.logs-table th {
  background-color: #f8fafc;
  padding: 8px 12px;
  font-weight: 700;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logs-table td {
  padding: 6px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  border-right: 1px solid #f1f5f9;
  white-space: nowrap;
}

.logs-table tr:hover {
  background-color: #f8fafc;
}

.filter-row td {
  padding: 4px 8px;
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 35px; /* depends on th height */
  z-index: 9;
}

.filter-cell {
  background-color: #f8fafc;
}

.filter-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 11px;
  box-sizing: border-box;
  outline: none;
}

.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.filter-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  right: 6px;
  font-size: 12px;
  cursor: pointer;
}

.col-center {
  text-align: center;
}

.col-time {
  text-align: center;
  font-weight: 500;
}

.premium-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* ===== 커스텀 스크롤바 (모바일에서만 표시) ===== */
.table-custom-scrollbar-track {
  display: none;
  position: relative;
  width: calc(100% - 0px);
  height: 7px;
  background: #e2e8f0;
  border-radius: 7px;
  margin: 6px 0 4px;
  overflow: hidden;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .table-custom-scrollbar-track {
    display: block;
  }
}

.table-custom-scrollbar-thumb {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 7px;
  cursor: pointer;
  transition: left 0.05s linear;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.4);
}

.table-custom-scrollbar-thumb:active {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
}
</style>
