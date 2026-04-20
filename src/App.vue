<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import FishHoldMonitor from '@/components/dashboard/FishHoldMonitor.vue'
import FishHoldDetail from '@/components/dashboard/FishHoldDetail.vue'
import EquipmentMonitorMkr3 from '@/components/dashboard/EquipmentMonitorMkr3.vue'
import Dataset from '@/components/dashboard/Dataset.vue'
import MainDashboard from '@/components/dashboard/MainDashboard.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn } = useAuth()
const savedView = localStorage.getItem('fishhold_view') || 'dashboard'
const savedTankStr = localStorage.getItem('fishhold_tank')

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
const validViews = ['dashboard', 'mkr3', 'tankDetail', 'mainDashboard', 'dataset']
const initialView = validViews.includes(savedView) ? savedView : 'dashboard'
const currentView = ref<string>(initialView)

// 안전 장치: 만약 tankDetail 로 들어왔는데 초기 탱크 정보가 유실되었다면 대시보드로 보냄
if (currentView.value === 'tankDetail' && !currentTank.value) {
  currentView.value = 'dashboard'
}

const handleTankSelect = (tank: any) => {
  currentTank.value = tank
  currentView.value = 'tankDetail'
  localStorage.setItem('fishhold_view', 'tankDetail')
  localStorage.setItem('fishhold_tank', JSON.stringify(tank))
}

const handleBack = () => {
  currentTank.value = null
  currentView.value = 'dashboard'
  localStorage.setItem('fishhold_view', 'dashboard')
  localStorage.removeItem('fishhold_tank')
}

const handleNavigate = (viewType: string) => {
  currentView.value = viewType
  localStorage.setItem('fishhold_view', viewType)
  if (viewType === 'dashboard') {
    currentTank.value = null
    localStorage.removeItem('fishhold_tank')
  }
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

  <div class="app-container" :class="{ 'app-locked': !isLoggedIn }">
    <Sidebar class="app-sidebar" :currentView="currentView" @navigate="handleNavigate" />
    <div class="app-main-wrapper">
      <Header class="app-header" />
      <main class="app-content">
        <MainDashboard v-if="currentView === 'mainDashboard'" @navigate="handleNavigate" />
        <FishHoldMonitor v-else-if="currentView === 'dashboard'" @select-tank="handleTankSelect" />
        <FishHoldDetail v-else-if="currentView === 'tankDetail' && currentTank" :tank="currentTank" @back="handleBack" @navigate="handleNavigate" />
        <Dataset v-else-if="currentView === 'dataset'" />
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
}

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
}

.app-header {
  height: 160px;
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.app-content {
  flex-grow: 1;
  background-color: #fdfce3; /* The light yellow background of the blueprint area */
  position: relative;
  overflow: auto; /* Allow scrolling */
}

/* 비로그인 시 화면 잠금 */
.app-locked {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
}
</style>
