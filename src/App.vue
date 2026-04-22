<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import FishHoldMonitor from '@/components/dashboard/FishHoldMonitor.vue'
import FishHoldDetail from '@/components/dashboard/FishHoldDetail.vue'
import EquipmentMonitorMkr3 from '@/components/dashboard/EquipmentMonitorMkr3.vue'
import MainDashboard from '@/components/dashboard/MainDashboard.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import { useAuth } from '@/composables/useAuth'

const sidebarOpen = ref(false)
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
const closeSidebar = () => { sidebarOpen.value = false }

const { isLoggedIn } = useAuth()
const savedView = sessionStorage.getItem('fishhold_view') || 'dashboard'
const savedTankStr = sessionStorage.getItem('fishhold_tank')

let initialTank = null
if (savedTankStr && savedTankStr !== 'undefined') {
  try {
    initialTank = JSON.parse(savedTankStr)
  } catch (e) {
    console.error('Failed to parse saved tank', e)
    initialTank = null
  }
}

const currentTank = ref<any>(initialTank)
const validViews = ['dashboard', 'mkr3', 'tankDetail', 'mainDashboard']
const initialView = validViews.includes(savedView) ? savedView : 'dashboard'
const currentView = ref<string>(initialView)

// 안전 장치: 만약 tankDetail 로 들어왔는데 초기 탱크 정보가 유실되었다면 대시보드로 보냄
if (currentView.value === 'tankDetail' && !currentTank.value) {
  currentView.value = 'dashboard'
}

const handleTankSelect = (tank: any) => {
  currentTank.value = tank
  currentView.value = 'tankDetail'
  sessionStorage.setItem('fishhold_view', 'tankDetail')
  sessionStorage.setItem('fishhold_tank', JSON.stringify(tank))
}

const handleBack = () => {
  currentTank.value = null
  currentView.value = 'dashboard'
  sessionStorage.setItem('fishhold_view', 'dashboard')
  sessionStorage.removeItem('fishhold_tank')
}

// FishHoldMonitor ID (10p, 5s 등)를 MKR-3에서 사용하는 이름으로 변환
const mapTankIdToMkr3Name = (id: string) => {
  if (id === '1') return 'C No1 FH F';
  const num = id.match(/\d+/)?.[0];
  if (id.endsWith('p')) return `PS No${num} FH F`;
  if (id.endsWith('s')) return `SS No${num} FH F`;
  return null;
}

const handleNavigate = (viewType: string) => {
  currentView.value = viewType
  sessionStorage.setItem('fishhold_view', viewType)
  
  if (viewType === 'dashboard') {
    currentTank.value = null
    sessionStorage.removeItem('fishhold_tank')
  }

  // 장비 현황판의 플러스(+) 버튼 등을 통해 MKR-3로 넘어올 때 매핑된 정보 전달
  if (viewType === 'mkr3') {
    localStorage.setItem('mkr3_active_tab', 'monitoring')
    
    // 현재 상세 페이지에서 보고 있던 탱크가 있다면, MKR-3 진입 시 자동으로 선택되도록 정보 저장
    if (currentTank.value) {
      const targetName = mapTankIdToMkr3Name(currentTank.value.id)
      if (targetName) {
        localStorage.setItem('mkr3_initial_selection', targetName)
      }
    }
  }

  closeSidebar() // 모바일: 메뉴 선택 시 자동으로 사이드바 닫기
}
</script>

<template>
  <!-- 비로그인 시 강제 로그인 모달 (닫기 불가) -->
  <AuthModal
    v-if="!isLoggedIn"
    mode="login"
    :closable="false"
    @close="() => {}"
  />

  <!--
    모바일 사이드바: Teleport로 body에 렌더링.
    v-if 없이 항상 DOM에 존재, CSS 미디어쿼리로만 show/hide 컨트롤.
  -->
  <Teleport to="body">
    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar"></div>
    <aside class="mobile-sidebar" :class="{ 'mobile-sidebar-open': sidebarOpen }">
      <Sidebar :currentView="currentView" @navigate="handleNavigate" />
    </aside>
  </Teleport>

  <div class="app-container" :class="{ 'app-locked': !isLoggedIn }">
    <!-- 데스크탑에서만 CSS로 보여지는 사이드바 -->
    <Sidebar class="app-sidebar" :currentView="currentView" @navigate="handleNavigate" />
    <div class="app-main-wrapper">
      <Header class="app-header" :sidebarOpen="sidebarOpen" :currentView="currentView" @toggle-sidebar="toggleSidebar" />
      <main class="app-content">
        <MainDashboard v-if="currentView === 'mainDashboard'" @navigate="handleNavigate" />
        <FishHoldMonitor v-else-if="currentView === 'dashboard'" @select-tank="handleTankSelect" />
        <FishHoldDetail v-else-if="currentView === 'tankDetail' && currentTank" :tank="currentTank" @back="handleBack" @navigate="handleNavigate" />
        <EquipmentMonitorMkr3 v-else-if="currentView === 'mkr3'" />
      </main>
    </div>
  </div>
</template>

<style>
/* Base Styles */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
  color: #333;
}

.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* ========================================
   모바일 오버레이 (Teleport로 body에 렌더링)
   데스크탑에서는 포인터이벤트로만 숨김
======================================== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}
.sidebar-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

/* ========================================
   모바일 사이드바 (Teleport로 body에 렌더링)
   데스크탑에서는 숨김, 모바일에서만 표시
======================================== */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 140px;
  height: 100vh;
  z-index: 9999;
  background-color: #1a1e2b;
  color: #fff;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
  overflow-y: auto;
  /* 데스크탑에서는 보이지 않음 */
  display: none;
}
.mobile-sidebar.mobile-sidebar-open {
  transform: translateX(0);
}

/* 데스크탑 사이드바 */
.app-sidebar {
  width: 250px;
  flex-shrink: 0;
  background-color: #1a1e2b;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.app-main-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.app-header {
  height: 160px;
  flex-shrink: 0;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.app-content {
  flex-grow: 1;
  min-height: 0;
  background-color: #fdfce3;
  position: relative;
  overflow: auto;
}

/* 비로그인 시 화면 잠금 */
.app-locked {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
}

/* ===== 모바일 반응형 (768px 이하) ===== */
@media (max-width: 768px) {
  /* 모바일에서 데스크탑 사이드바 숨김 (!important로 scoped CSS 특이도 우선순위 문제 해결) */
  .app-sidebar {
    display: none !important;
  }

  /* 모바일 사이드바 활성화 */
  .mobile-sidebar {
    display: flex;
    flex-direction: column;
  }

  .app-header {
    height: auto;
    min-height: 70px;
    padding: 12px 16px;
  }
}
</style>
