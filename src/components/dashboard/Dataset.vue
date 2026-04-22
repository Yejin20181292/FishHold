<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps<{
  selectedTanks: Array<{ id: string; name: string }>;
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

// 창고별 기본 온도 매핑 (24개 전체)
const tankBaseTemps: Record<string, number> = {
  'C No1 FH F': -10.0, 'SS No2 FH F': -1.7, 'PS No2 FH F': -1.9, 'SS No3 FH F': -1.9,
  'PS No3 FH F': -1.8, 'SS No4 FH F': 17.8, 'PS No4 FH F': -1.7, 'SS No5 FH F': -12.5,
  'PS No5 FH F': -13.3, 'SS No6 FH F': -13.2, 'PS No6 FH F': -7.2, 'SS No7 FH F': -13.0,
  'PS No7 FH F': -3.2, 'SS No8 FH F': -2.6, 'PS No8 FH F': -2.2, 'SS No9 FH F': -1.9,
  'PS No9 FH F': -15.6, 'SS No10 FH F': -14.4, 'PS No10 FH F': -14.7
};

// 선택된 창고에 따른 컬럼 정의 (항상 ID 순서대로 정렬하여 유지)
const columns = computed(() => {
  return [...props.selectedTanks]
    .sort((a, b) => parseInt(a.id) - parseInt(b.id))
    .map(t => t.name);
});

interface LogEntry {
  id: string;
  time: string;
  values: Record<string, string>; // 이름 기반 매핑으로 변경
}

// Generate realistic dummy data for temperatures
const generateRandomTemp = (base: number, variance: number) => {
  return (base + (Math.random() * variance * 2 - variance)).toFixed(1) + ' ℃';
};

const logs = ref<LogEntry[]>([]);

// Base time: 2026-04-20 10:47:06
let baseTime = new Date(2026, 3, 20, 10, 47, 6);

for (let i = 0; i < 30; i++) {
  const rowTime = new Date(baseTime.getTime() - i * 60000);
  const timeStr = `${rowTime.getFullYear()}-${String(rowTime.getMonth() + 1).padStart(2, '0')}-${String(rowTime.getDate()).padStart(2, '0')} ${rowTime.getHours() < 12 ? '오전' : '오후'} ${String(rowTime.getHours() % 12 || 12).padStart(2, '0')}:${String(rowTime.getMinutes()).padStart(2, '0')}:${String(rowTime.getSeconds()).padStart(2, '0')}`;
  
  const values: Record<string, string> = {};
  // 모든 가능한 창고에 대한 더미 데이터 미리 생성 (성능 위해)
  Object.keys(tankBaseTemps).forEach(name => {
    values[name] = generateRandomTemp(tankBaseTemps[name], 0.2);
  });
  
  logs.value.push({
    id: `log_${i}`,
    time: timeStr,
    values
  });
}

// ===== 커스텀 스크롤바 (모든 모바일에서 항상 표시) =====
const tableScrollRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const headerHeight = ref(0)
const tScrollLeft = ref(0)
const tScrollWidth = ref(0)
const tClientWidth = ref(0)

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

// 세로 스크롤 상태
const tScrollTop = ref(0)
const tScrollHeight = ref(0)
const tClientHeight = ref(0)

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
  const el = tableScrollRef.value
  tScrollLeft.value = el.scrollLeft
  tScrollWidth.value = el.scrollWidth
  tClientWidth.value = el.clientWidth
  
  if (headerRef.value) {
    headerHeight.value = headerRef.value.offsetHeight
  }
  
  const bodyEl = document.querySelector('.table-body-part')
  if (bodyEl) {
    tScrollTop.value = bodyEl.scrollTop
    tScrollHeight.value = bodyEl.scrollHeight
    tClientHeight.value = bodyEl.clientHeight
  }
}

function onTableScroll() {
  updateTableScrollInfo()
}

// 컬럼 변화 감지하여 스크롤 정보 업데이트
watch(() => props.selectedTanks, () => {
  nextTick(() => updateTableScrollInfo());
}, { deep: true });

// ===== 드래그 로직 (가로) =====
let tIsDragging = false
let tDragStartX = 0
let tDragStartScrollLeft = 0

function onTThumbStart(e: TouchEvent | MouseEvent) {
  tIsDragging = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  tDragStartX = clientX
  tDragStartScrollLeft = tableScrollRef.value?.scrollLeft ?? 0
  
  window.addEventListener('mousemove', onTDragMove)
  window.addEventListener('mouseup', onTDragEnd)
  window.addEventListener('touchmove', onTDragMove, { passive: false })
  window.addEventListener('touchend', onTDragEnd)
  
  if (e.cancelable) e.preventDefault()
}

function onTDragMove(e: MouseEvent | TouchEvent) {
  if (!tIsDragging || !tableScrollRef.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const dx = clientX - tDragStartX
  const maxScroll = tScrollWidth.value - tClientWidth.value
  const thumbTrackWidth = tClientWidth.value * (1 - tThumbWidth.value / 100)
  const scrollRatio = thumbTrackWidth > 0 ? maxScroll / thumbTrackWidth : 1
  tableScrollRef.value.scrollLeft = Math.max(0, Math.min(maxScroll, tDragStartScrollLeft + dx * scrollRatio))
  updateTableScrollInfo()
  if ('touches' in e && e.cancelable) e.preventDefault()
}

function onTDragEnd() {
  tIsDragging = false
  window.removeEventListener('mousemove', onTDragMove)
  window.removeEventListener('mouseup', onTDragEnd)
  window.removeEventListener('touchmove', onTDragMove)
  window.removeEventListener('touchend', onTDragEnd)
}

// ===== 드래그 로직 (세로) =====
let tVIsDragging = false
let tVDragStartY = 0
let tVDragStartScrollTop = 0

function onVThumbStart(e: TouchEvent | MouseEvent) {
  tVIsDragging = true
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  tVDragStartY = clientY
  const bodyEl = document.querySelector('.table-body-part')
  tVDragStartScrollTop = bodyEl?.scrollTop ?? 0
  
  window.addEventListener('mousemove', onVDragMove)
  window.addEventListener('mouseup', onVDragEnd)
  window.addEventListener('touchmove', onVDragMove, { passive: false })
  window.addEventListener('touchend', onVDragEnd)

  if (e.cancelable) e.preventDefault()
}

function onVDragMove(e: MouseEvent | TouchEvent) {
  if (!tVIsDragging) return
  const bodyEl = document.querySelector('.table-body-part') as HTMLElement
  if (!bodyEl) return

  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const dy = clientY - tVDragStartY
  const maxScroll = tScrollHeight.value - tClientHeight.value
  const thumbTrackHeight = tClientHeight.value * (1 - tVThumbHeight.value / 100)
  const scrollRatio = thumbTrackHeight > 0 ? maxScroll / thumbTrackHeight : 1
  bodyEl.scrollTop = Math.max(0, Math.min(maxScroll, tVDragStartScrollTop + dy * scrollRatio))
  updateTableScrollInfo()
  if ('touches' in e && e.cancelable) e.preventDefault()
}

function onVDragEnd() {
  tVIsDragging = false
  window.removeEventListener('mousemove', onVDragMove)
  window.removeEventListener('mouseup', onVDragEnd)
  window.removeEventListener('touchmove', onVDragMove)
  window.removeEventListener('touchend', onVDragEnd)
}

function onBodyScroll() {
  updateTableScrollInfo()
}

onMounted(() => {
  nextTick(() => updateTableScrollInfo())
  window.addEventListener('resize', updateTableScrollInfo)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTableScrollInfo)
  // 드래그 중 종료될 경우 리스너 제거
  onTDragEnd()
  onVDragEnd()
})
</script>

<template>
  <div class="dataset-container">
    <div class="header">
      <h2 class="page-title">
        기간별 데이터
      </h2>
      <div class="header-right">
        <div class="custom-date-picker">
          <input type="date" v-model="startDate" :max="today" @change="validateRange" />
          <span class="separator">~</span>
          <input type="date" v-model="endDate" :max="today" @change="validateRange" />
        </div>
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
    </div>

    <!-- 데이터셋 테이블 영역 (리팩토링됨) -->
    <div class="card premium-card logs-card">
      <!-- 전체 가로 스크롤을 담당하는 래퍼 -->
      <div class="table-horizontal-container" ref="tableScrollRef" @scroll="onTableScroll">
        <div class="table-content-fixed-width" :style="{ width: (180 + columns.length * 100) + 'px' }">
          
          <!-- (1) 고정 헤더 영역 -->
          <div class="table-header-part" ref="headerRef">
            <table class="logs-table header-only">
              <thead>
                <tr>
                  <th class="w-time">시간</th>
                  <th v-for="col in columns" :key="col" class="w-col">{{ col }}</th>
                </tr>
                <tr class="filter-row">
                  <td class="filter-cell w-time">
                    <div class="filter-input-wrap">
                      <input type="text" class="filter-input" :value="`${startDate} ~ ${endDate}`" readonly />
                      <span class="filter-icon" style="color: #3b82f6;">❌</span>
                    </div>
                  </td>
                  <td v-for="col in columns" :key="'filter_'+col" class="filter-cell w-col">
                    <input type="text" class="filter-input" />
                  </td>
                </tr>
              </thead>
            </table>
          </div>

          <!-- (2) 세로 스크롤 본문 영역 -->
          <div class="table-body-wrapper">
           <div class="table-body-part" @scroll="onBodyScroll">
            <table class="logs-table body-only">
              <tbody>
                <tr v-for="log in logs" :key="log.id" class="log-row">
                  <td class="col-time w-time">{{ log.time }}</td>
                  <td v-for="col in columns" :key="col" class="col-center w-col">
                    {{ log.values[col] || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
           </div>
          </div>
          
        </div>

        <!-- 커스텀 세로 스크롤바 (테이블 내부 우측에 고정) -->
        <div 
          class="table-vscrollbar-track" 
          v-if="tVIsScrollable"
          :style="{ 
            marginTop: headerHeight + 'px',
            height: `calc(100% - ${headerHeight}px)`
          }"
        >
          <div
            class="table-vscrollbar-thumb"
            :style="{ height: tVThumbHeight + '%', top: tVThumbTop + '%' }"
            @touchstart="onVThumbStart"
            @mousedown="onVThumbStart"
          ></div>
        </div>
      </div>

      <!-- 커스텀 가로 스크롤바 (하단에 항상 표시) -->
      <div class="table-custom-scrollbar-track" v-if="tIsScrollable">
        <div
          class="table-custom-scrollbar-thumb"
          :style="{ width: tThumbWidth + '%', left: tThumbLeft + '%' }"
          @touchstart="onTThumbStart"
          @mousedown="onTThumbStart"
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-date-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
}

.custom-date-picker input[type="date"] {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #1e3a8a;
  outline: none;
  cursor: pointer;
}

.custom-date-picker .separator {
  color: #94a3b8;
  font-weight: 500;
  font-size: 12px;
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

/* 가로 스크롤을 담당하는 최상위 컨테이너 */
.table-horizontal-container {
  display: flex; 
  flex-direction: row; /* 가로 방향 레이아웃으로 변경하여 sticky 지원 강화 */
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  background: #fff;
  min-height: 0;
  position: relative;
  /* 기본 스크롤바 숨김 (커스텀 사용) */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.table-horizontal-container::-webkit-scrollbar {
  display: none;
}

/* 고정 너비를 가진 내용물 (헤더+본문 포함) */
.table-content-fixed-width {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0; /* 가로로 줄어들지 않도록 */
}

/* 헤더 영역 (고정) */
.table-header-part {
  flex-shrink: 0;
  background: #f8fafc;
  z-index: 5;
}

/* 본문 영역 래퍼 */
.table-body-wrapper {
  position: relative;
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 본문 영역 (세로 스크롤) */
.table-body-part {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  /* 기본 스크롤바 숨김 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.table-body-part::-webkit-scrollbar {
  display: none;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
  table-layout: fixed; /* 컬럼 너비 고정 */
}

/* 컬럼 너비 정의 */
.w-time { width: 180px; min-width: 180px; }
.w-col { width: 100px; min-width: 100px; }

/* ===== 커스텀 세로 스크롤바 ===== */
.table-vscrollbar-track {
  position: sticky;
  right: 0;
  top: 0;
  height: 100%; /* 부모 컨테이너 높이와 일치 */
  width: 6px;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 6px;
  z-index: 100;
  flex-shrink: 0;
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

/* ===== 모바일: 레이아웃 조정 ===== */
@media (max-width: 768px) {
  .dataset-container {
    height: auto;
    overflow: visible;
  }

  .logs-card {
    overflow: visible;
  }

  .table-body-part {
    max-height: 60vh; /* 본문 영역만 60% 높이 제한 및 스크롤 */
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

/* ===== 커스텀 스크롤바 (항상 표시) ===== */
.table-custom-scrollbar-track {
  position: relative;
  width: calc(100% - 7px); /* 세로바 영역 제외 */
  height: 7px;
  background: #e2e8f0;
  border-radius: 7px;
  margin: 6px 0 4px;
  overflow: hidden;
  flex-shrink: 0;
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
