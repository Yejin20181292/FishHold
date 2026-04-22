<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

// 모바일 여부 판단
const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth <= 768 }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

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

const handleNavigate = (viewType: string) => {
  currentView.value = viewType
  sessionStorage.setItem('fishhold_view', viewType)
  if (viewType === 'dashboard') {
    currentTank.value = null
    sessionStorage.removeItem('fishhold_tank')
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

  <!-- 모바일: 오버레이 + 사이드바를 body 레벨로 Teleport (오버플로우 클리핑 회피) -->
  <Teleport to="body">
    <div v-if="isMobile" class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar"></div>
    <aside v-if="isMobile" class="mobile-sidebar" :class="{ 'mobile-sidebar-open': sidebarOpen }">
      <Sidebar :currentView="currentView" @navigate="handleNavigate" />
    </aside>
  </Teleport>

  <div class="app-container" :class="{ 'app-locked': !isLoggedIn }">
    <!-- 데스크탑에서만 보이는 사이드바 -->
    <Sidebar v-if="!isMobile" class="app-sidebar" :currentView="currentView" @navigate="handleNavigate" />
    <div class="app-main-wrapper">
      <Header class="app-header" :sidebarOpen="sidebarOpen" @toggle-sidebar="toggleSidebar" />
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

/* 사이드바 오버레이 (body에 Teleport된) */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(2px);
}
.sidebar-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

/* 모바일 사이드바 (body에 Teleport된, 항상 fixed) */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  z-index: 9999;
  background-color: #1a1e2b;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
  overflow-y: auto;
}
.mobile-sidebar-open {
  transform: translateX(0) !important;
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
  .sidebar-overlay {
    display: block;
  }

  .app-header {
    height: auto;
    min-height: 70px;
    padding: 12px 16px;
  }
}
</style>
