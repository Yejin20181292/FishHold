<script setup lang="ts">
defineProps<{
  currentView?: string;
}>();

const emit = defineEmits(['navigate']);
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="@/assets/logo.png" alt="Okomo Logo" class="logo" />
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <h3 class="nav-section-title">MONITORING</h3>
        <ul class="nav-list">
          <li class="nav-item">
            <div class="nav-link" :class="{ active: currentView === 'mainDashboard' }" @click="emit('navigate', 'mainDashboard')">
              <span class="icon">📊</span>
              Dashboard
            </div>
          </li>
          <li class="nav-item">
            <div class="nav-link" :class="{ active: currentView === 'mkr3' }" @click="emit('navigate', 'mkr3')">
              <span class="icon">🖥️</span>
              장비 모니터링
            </div>
            <ul class="sub-nav-list">
              <li class="sub-nav-item" :class="{ active: currentView === 'mkr3' }" @click="emit('navigate', 'mkr3')">신라 나오에로썬 MKR-3</li>
            </ul>
          </li>
          <li class="nav-item">
            <div class="nav-link" :class="{ active: currentView === 'dashboard' || currentView === 'tankDetail' }" @click="emit('navigate', 'dashboard')">
              <span class="icon">🚢</span>
              장비 현황판
            </div>
            <ul class="sub-nav-list">
              <li class="sub-nav-item" :class="{ active: currentView === 'dashboard' || currentView === 'tankDetail' }" @click="emit('navigate', 'dashboard')">신라 나오에로썬 FISH...</li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <h3 class="nav-section-title">MANAGEMENT</h3>
        <ul class="nav-list">
          <li class="nav-item"><a href="#" class="nav-link"><span class="icon">📁</span> 장비 관리</a></li>
          <li class="nav-item"><a href="#" class="nav-link"><span class="icon">🔧</span> 수리 이력 관리</a></li>
          <li class="nav-item"><a href="#" class="nav-link"><span class="icon">📝</span> 정기점검 관리</a></li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.sidebar-header {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background-color: #121520;
  border-bottom: 1px solid #1a1e2b;
}
.sidebar-header .logo {
  height: 26px;
  max-width: 100%;
  object-fit: contain;
}
.sidebar-nav {
  padding: 16px 0;
  overflow-y: auto;
}
.nav-section {
  margin-bottom: 24px;
}
.nav-section-title {
  font-size: 0.62rem;
  color: #64748b;
  margin: 0 12px 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.nav-list, .sub-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-item {
  margin: 2px 0;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 7px 12px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
}
.nav-link:hover {
  background-color: #272d3f;
  color: #fff;
}
.nav-link.active {
  background-color: #2d3748;
  color: #fff;
  border-left: 3px solid #3b82f6; /* Accent color */
}
.icon {
  margin-right: 6px;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.sub-nav-list {
  background-color: #121520;
  padding: 8px 0;
}
.sub-nav-item {
  padding: 5px 8px 5px 28px;
  font-size: 0.68rem;
  color: #94a3b8;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sub-nav-item:hover {
  color: #fff;
}
.sub-nav-item.active {
  color: #fff;
  font-weight: 500;
  background-color: #1a1f33;
}
</style>
