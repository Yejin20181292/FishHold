<script setup lang="ts">
import { ref } from 'vue'
import DateRangeChart from './DateRangeChart.vue'

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
  { id: '19', name: 'PS No10 FH F', temp: -14.7 }, // Equivalent to "No.10 Fish Hold (P)"
  { id: '20', name: 'S20', temp: -15.0 },
  { id: '21', name: 'S21', temp: -15.2 },
  { id: '22', name: 'S22', temp: -15.1 },
  { id: '23', name: 'S23', temp: -14.9 },
  { id: '24', name: 'S24', temp: -14.8 }
]);

// Initialize with one selected tank
const selectedTanks = ref<TankData[]>([allTanks.value[18]]); // Defaulting to PS No10 FH F

const checkLimit = (event: Event, tank: TankData) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    if (selectedTanks.value.length > 4) {
      alert('최대 4개까지만 선택 가능합니다.');
      // Remove the newly added item from the ref array
      selectedTanks.value = selectedTanks.value.filter(t => t.id !== tank.id);
      target.checked = false;
    }
  } else {
    // If unchecked and length is 0, we could theoretically prevent it or handle it.
    // For now we allow 0 items (shows empty chart)
  }
};
</script>

<template>
  <div class="mkr3-container">
    <div class="header">
      <h2 class="title">MKR-3 데이터 모니터링</h2>
    </div>

    <div class="content">
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
  overflow-y: auto;
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
  display: flex;
  flex-direction: column;
  gap: 24px;
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
