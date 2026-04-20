<script setup lang="ts">
import { ref } from 'vue'

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

    <!-- Integrated Logs Table -->
    <div class="card premium-card logs-card">
      <div class="table-responsive">
        <table class="logs-table">
          <thead>
            <tr>
              <th style="min-width: 180px">시간</th>
              <th v-for="col in columns" :key="col" style="min-width: 100px">{{ col }}</th>
            </tr>
            <!-- Second header row for filters (mock UI) -->
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

.table-responsive {
  flex-grow: 1;
  overflow: auto;
  background: #fff;
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
</style>
