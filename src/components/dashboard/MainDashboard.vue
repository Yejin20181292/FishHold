<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['navigate']);

interface LogEntry {
  id: string;
  time: string;
  typeIcon: string;
  typeText: string;
  serialNumber: string;
  deviceName: string;
  deviceType: string;
  logType: string;
  content: string;
}

// Generate some realistic dummy data
const logs = ref<LogEntry[]>([
  { id: '1', time: '2026-04-10 오후 04:50:14', typeIcon: '📢', typeText: '알림', serialNumber: '00018378', deviceName: '신라 나오에로썬 UGW', deviceType: '게이트웨이', logType: '장비 연결(00001)', content: '장비의 통신이 시작되었습니다' },
  { id: '2', time: '2026-04-10 오후 04:50:14', typeIcon: '📢', typeText: '알림', serialNumber: '09018378', deviceName: '신라 나오에로썬 MKR-3', deviceType: 'MKR-3', logType: '장비 연결(00001)', content: '장비의 통신이 시작되었습니다' },
  { id: '3', time: '2026-04-10 오후 05:12:03', typeIcon: '⚠️', typeText: '경고', serialNumber: '00018382', deviceName: '원양 3호 UGW', deviceType: '게이트웨이', logType: '통신 불안정(E002)', content: '네트워크 응답 지연 경고' },
  { id: '4', time: '2026-04-10 오후 06:33:12', typeIcon: '📢', typeText: '알림', serialNumber: '09018441', deviceName: '원양 3호 MKR-2', deviceType: 'MKR-2', logType: '상태 패치(00020)', content: '센서 펌웨어 업데이트 완료' },
  { id: '5', time: '2026-04-11 오전 09:20:00', typeIcon: '❌', typeText: '에러', serialNumber: '00018378', deviceName: '신라 나오에로썬 UGW', deviceType: '게이트웨이', logType: '연결 끊김(E099)', content: '장치 오프라인 상태 지속' },
  { id: '6', time: '2026-04-11 오전 09:25:10', typeIcon: '📢', typeText: '알림', serialNumber: '00018378', deviceName: '신라 나오에로썬 UGW', deviceType: '게이트웨이', logType: '장비 연결(00001)', content: '장비 통신 복구 완료' },
  { id: '7', time: '2026-04-12 오후 01:10:45', typeIcon: '⚠️', typeText: '경고', serialNumber: '09018378', deviceName: '신라 나오에로썬 MKR-3', deviceType: 'MKR-3', logType: '온도 이상(E015)', content: '설정 허용 오차 온도 초과' },
  { id: '8', time: '2026-04-13 오전 11:05:30', typeIcon: '📢', typeText: '알림', serialNumber: '09018441', deviceName: '원양 3호 MKR-2', deviceType: 'MKR-2', logType: '스케줄 동작(00110)', content: '제상 모터 주기적 테스트 통과' },
  { id: '9', time: '2026-04-14 오후 03:40:22', typeIcon: '📢', typeText: '알림', serialNumber: '09018445', deviceName: '원양 4호 MKR-5', deviceType: 'MKR-5', logType: '장비 연결(00001)', content: '신규 장비 등록 됨' },
  { id: '10', time: '2026-04-15 오전 08:00:00', typeIcon: '❌', typeText: '에러', serialNumber: '00018500', deviceName: '테스트 시스템 UGW', deviceType: '게이트웨이', logType: '전원 결함(E200)', content: '비정상적 전압 강하 보고' }
]);

</script>

<template>
  <div class="main-dashboard-container">
    <div class="header">
      <h2 class="page-title">
        <span class="grid-icon">🎛️</span>
        Dashboard
      </h2>
    </div>

    <!-- Summary Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-header bg-blue">
          <span>⚙️ 총 선박 수</span>
        </div>
        <div class="stat-body">
          <span class="stat-number">4</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header bg-red">
          <span>🚨 상태 불량 장비 수</span>
        </div>
        <div class="stat-body">
          <span class="stat-number">2</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header bg-gray">
          <span>🔌 미 연결 장비 수</span>
        </div>
        <div class="stat-body">
          <span class="stat-number">0</span>
        </div>
      </div>
    </div>

    <!-- Integrated Logs Table -->
    <div class="card premium-card logs-card">
      <div class="logs-header">
        <h3 class="logs-title">통합 장비 로그</h3>
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

      <div class="table-responsive">
        <table class="logs-table">
          <thead>
            <tr>
              <th style="width: 20%">시간</th>
              <th style="width: 15%">타입</th>
              <th style="width: 25%">장비 이름</th>
              <th style="width: 20%">로그 타입</th>
              <th style="width: 20%">내용</th>
            </tr>
            <!-- Second header row for filters (mock UI) -->
            <tr class="filter-row">
              <td>
                <div class="filter-input-wrap">
                  <input type="text" class="filter-input" readonly />
                  <span class="filter-icon">🗓️</span>
                </div>
              </td>
              <td>
                <select class="filter-select"><option></option></select>
              </td>
              <td><input type="text" class="filter-input" /></td>
              <td>
                <select class="filter-select"><option></option></select>
              </td>
              <td><input type="text" class="filter-input" /></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="log-row">
              <td class="col-time">{{ log.time }}</td>
              <td class="col-type">
                <span class="type-icon">{{ log.typeIcon }}</span>
                <span class="type-text" :class="{'text-blue': log.typeText==='알림', 'text-red': log.typeText==='에러', 'text-orange': log.typeText==='경고'}">{{ log.typeText }}</span>
              </td>
              <td><a href="#" class="blue-link bold-link" @click.prevent="emit('navigate', 'mkr3')">{{ log.deviceName }}</a></td>
              <td class="col-center">{{ log.logType }}</td>
              <td class="col-content">{{ log.content }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-dashboard-container {
  padding: 32px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  overflow-y: auto;
  gap: 24px;
}

.header {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
}

.stat-header {
  padding: 12px 20px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bg-blue { background-color: #60a5fa; }
.bg-red { background-color: #f87171; }
.bg-gray { background-color: #94a3b8; }

.stat-body {
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
}

.stat-number {
  font-size: 32px;
  font-weight: 900;
  color: #1e293b;
}

/* Logs Table */
.logs-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.logs-header {
  background-color: #93c5fd;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logs-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e3a8a;
}

.export-btn {
  background: white;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
}

.table-responsive {
  flex-grow: 1;
  overflow-y: auto;
  background: #fff;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.logs-table th {
  background-color: #f8fafc;
  padding: 10px 16px;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  text-align: center;
}

.logs-table td {
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  border-right: 1px solid #f1f5f9;
}

.logs-table tr:last-child td {
  border-bottom: none;
}

.logs-table tr:hover {
  background-color: #f8fafc;
}

.filter-row td {
  padding: 6px 10px;
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.filter-input, .filter-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
  outline: none;
}

.filter-input:focus, .filter-select:focus {
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
  right: 8px;
  font-size: 14px;
}

.type-icon {
  margin-right: 6px;
}

.type-text {
  font-weight: 600;
}

.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.text-orange { color: #f59e0b; }

.blue-link {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.1s;
}

.blue-link:hover {
  color: #1d4ed8;
}

.bold-link {
  font-weight: 600;
}

.col-center {
  text-align: center;
}

.col-time, .col-type {
  white-space: nowrap;
}

.premium-card {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
</style>
