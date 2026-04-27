<script setup lang="ts">
import { ref, watch } from 'vue'
import DateRangeChart from './DateRangeChart.vue'
import Dataset from './Dataset.vue'

// LocalStorage에서 이전 탭 상태 불러오기 (없으면 'monitoring' 기본값)
const activeTab = ref(localStorage.getItem('mkr3_active_tab') || 'monitoring')


// 탭 변경 시마다 LocalStorage에 저장
watch(activeTab, (newTab) => {
  localStorage.setItem('mkr3_active_tab', newTab)
})

// --- 창고 선택 초기화 로직 (외부 전송 데이터 우선) ---
const getInitialSelection = (): TankData[] => {
  const initialName = localStorage.getItem('mkr3_initial_selection');
  if (initialName) {
    // 공백 및 대소문자 무시 매칭 (더 확실한 매칭 위해)
    const normalizedTarget = initialName.replace(/\s+/g, '').toLowerCase();
    const found = allTanks.value.find(t => 
      t.name.replace(/\s+/g, '').toLowerCase() === normalizedTarget
    );
    
    // 사용 후 즉시 제거
    localStorage.removeItem('mkr3_initial_selection');
    
    if (found) return [found];
  }
  // 기본값: PS No10 FH F (인덱스 18)
  return [allTanks.value[18]];
};

interface TankData {
  id: string;
  name: string;
  temp: number;
}

// Generate realistic mocked tanks mimicking the screenshot
const allTanks = ref<TankData[]>([
  { id: '1', name: 'C No1 FH F', temp: -15.2 },
  { id: '2', name: 'SS No2 FH F', temp: -14.8 },
  { id: '3', name: 'PS No2 FH F', temp: -15.5 },
  { id: '4', name: 'SS No3 FH F', temp: -16.0 },
  { id: '5', name: 'PS No3 FH F', temp: -15.9 },
  { id: '6', name: 'SS No4 FH F', temp: -14.5 },
  { id: '7', name: 'PS No4 FH F', temp: -14.2 },
  { id: '8', name: 'SS No5 FH F', temp: -15.1 },
  { id: '9', name: 'PS No5 FH F', temp: -15.0 },
  { id: '10', name: 'SS No6 FH F', temp: -14.9 },
  { id: '11', name: 'PS No6 FH F', temp: -15.3 },
  { id: '12', name: 'SS No7 FH F', temp: -15.8 },
  { id: '13', name: 'PS No7 FH F', temp: -16.2 },
  { id: '14', name: 'SS No8 FH F', temp: -15.4 },
  { id: '15', name: 'PS No8 FH F', temp: -15.7 },
  { id: '16', name: 'SS No9 FH F', temp: -16.1 },
  { id: '17', name: 'PS No9 FH F', temp: -15.6 },
  { id: '18', name: 'SS No10 FH F', temp: -14.4 },
  { id: '19', name: 'PS No10 FH F', temp: -14.7 } // Equivalent to "No.10 Fish Hold (P)"
]);

// Initialize with selection logic
const selectedTanks = ref<TankData[]>(getInitialSelection());

// Dataset 전용 선택 상태 (기본값 전체 선택)
const datasetSelectedTanks = ref<TankData[]>([...allTanks.value]);

const checkLimit = (event: Event, tank: TankData, isDataset = false) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    if (!isDataset && selectedTanks.value.length > 4) {
      alert('최대 4개까지만 선택 가능합니다.');
      selectedTanks.value = selectedTanks.value.filter(t => t.id !== tank.id);
      target.checked = false;
    }
  }
};
</script>

<template>
  <div class="mkr3-container">
    <div class="header">
      <h2 class="title">신라 나오에로썬 MKR-3</h2>
    </div>

    <!-- TABS -->
    <div class="tabs-container">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'monitoring' }" 
        @click="activeTab = 'monitoring'"
      >
        모니터링
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'dataset' }" 
        @click="activeTab = 'dataset'"
      >
        데이터 셋
      </div>
    </div>

    <div class="content" v-if="activeTab === 'monitoring'">
      <div class="card premium-card full-chart-card">
        <DateRangeChart :tanks="selectedTanks" />
      </div>

      <div class="card premium-card selector-card">
        <h4 class="selector-title">조회하고 싶은 창고들을 선택해 주세요. (최대 4개 선택 가능)</h4>
        <div class="checkbox-grid">
          <label class="checkbox-label" v-for="t in allTanks" :key="t.id">
            <input 
              type="checkbox" 
              :value="t" 
              v-model="selectedTanks" 
              @change="checkLimit($event, t)"
              class="custom-checkbox"
            />
            <span class="checkbox-text">{{ t.name }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="content dataset-content" v-else-if="activeTab === 'dataset'">
      <Dataset :selectedTanks="datasetSelectedTanks" />

      <div class="card premium-card selector-card" style="margin-top: 24px;">
        <h4 class="selector-title">데이터 표에 노출하고 싶은 창고를 선택해 주세요. (가로 스크롤 최소화 가능)</h4>
        <div class="checkbox-grid">
          <label class="checkbox-label" v-for="t in allTanks" :key="t.id">
            <input 
              type="checkbox" 
              :value="t" 
              v-model="datasetSelectedTanks" 
              @change="checkLimit($event, t, true)"
              class="custom-checkbox"
            />
            <span class="checkbox-text">{{ t.name }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-container {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-item {
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.tab-item:hover {
  color: #3b82f6;
}

.tab-item.active {
  color: #1e3a8a;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #3b82f6;
  border-radius: 3px 3px 0 0;
}

.dataset-content {
  display: block; /* flex 제거 — 자식 높이가 자연스럽게 늘어나도록 */
}
.mkr3-container {
  padding: 32px;
  min-height: 100%; /* height:100% → min-height:100%: 콘텐츠가 많으면 늘어나도록 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  /* overflow-y:auto 제거 — 스크롤은 부모 .app-content가 담당 */
}

@media (max-width: 1280px) {
  .mkr3-container {
    padding: 16px;
  }
}

.header {
  margin-bottom: 24px;
}

@media (max-width: 1280px) {
  .header {
    margin-bottom: 12px;
  }
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

@media (max-width: 1280px) {
  .title {
    font-size: 22px;
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 1280px) {
  .content {
    gap: 16px;
  }
}

/* dataset-content 내부는 block 흐름으로 */
.dataset-content .card {
  margin-bottom: 24px;
}

.full-chart-card {
  display: flex;
  flex-direction: column;
}

.selector-card {
  display: flex;
  flex-direction: column;
  padding: 32px 40px;
}

@media (max-width: 1280px) {
  .selector-card {
    padding: 20px;
  }
}

.selector-title {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  column-gap: 24px;
  row-gap: 20px;
}

@media (max-width: 1280px) {
  .checkbox-grid {
    grid-template-columns: 1fr 1fr;
    column-gap: 12px;
    row-gap: 12px;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6; 
}

.checkbox-text {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
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
