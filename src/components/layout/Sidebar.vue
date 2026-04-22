<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  currentView?: string;
}>();

const emit = defineEmits(['navigate']);

// 드롭다운 상태 관리
const expandedMenus = reactive({
  monitoring: false,
  status: false
});

const toggleMenu = (menu: 'monitoring' | 'status') => {
  expandedMenus[menu] = !expandedMenus[menu];
};

// 현재 뷰에 따라 드롭다운 자동 펼침
watch(() => props.currentView, (newView) => {
  if (newView === 'mkr3') {
    expandedMenus.monitoring = true;
  } else if (newView === 'dashboard' || newView === 'tankDetail') {
    expandedMenus.status = true;
  }
}, { immediate: true });
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
              <div class="nav-link-main">
                <span class="icon">📊</span>
                Dashboard
              </div>
            </div>
          </li>
          <li class="nav-item">
            <div class="nav-link" :class="{ active: currentView === 'mkr3' }" @click="toggleMenu('monitoring')">
              <div class="nav-link-main">
                <span class="icon">🖥️</span>
                장비 모니터링
              </div>
              <span class="chevron" :class="{ expanded: expandedMenus.monitoring }">▼</span>
            </div>
            <div class="dropdown-wrapper" :class="{ expanded: expandedMenus.monitoring }">
              <ul class="sub-nav-list">
                <li class="sub-nav-item" :class="{ active: currentView === 'mkr3' }" @click="emit('navigate', 'mkr3')">신라 나오에로썬 MKR-3</li>
              </ul>
            </div>
          </li>
          <li class="nav-item">
            <div class="nav-link" :class="{ active: currentView === 'dashboard' || currentView === 'tankDetail' }" @click="toggleMenu('status')">
              <div class="nav-link-main">
                <span class="icon">🚢</span>
                장비 현황판
              </div>
              <span class="chevron" :class="{ expanded: expandedMenus.status }">▼</span>
            </div>
            <div class="dropdown-wrapper" :class="{ expanded: expandedMenus.status }">
              <ul class="sub-nav-list">
                <li class="sub-nav-item" :class="{ active: currentView === 'dashboard' || currentView === 'tankDetail' }" @click="emit('navigate', 'dashboard')">신라 나오에로썬 FISH...</li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <h3 class="nav-section-title">MANAGEMENT</h3>
        <ul class="nav-list">
          <li class="nav-item">
            <a href="#" class="nav-link">
              <div class="nav-link-main">
                <span class="icon">📁</span> 장비 관리
              </div>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">
              <div class="nav-link-main">
                <span class="icon">🔧</span> 수리 이력 관리
              </div>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">
              <div class="nav-link-main">
                <span class="icon">📝</span> 정기점검 관리
              </div>
            </a>
          </li>
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
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background-color: #121520;
  border-bottom: 1px solid #1a1e2b;
}
.sidebar-header .logo {
  height: 32px;
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
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 24px 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  justify-content: space-between; /* 꺽쇠 아이콘을 우측으로 밀기 위해 추가 */
  padding: 8px 24px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-link-main {
  display: flex;
  align-items: center;
}
.nav-link:hover {
  background-color: #272d3f;
  color: #fff;
}
.nav-link.active {
  background-color: #2d3748;
  color: #fff;
  border-left: 3px solid #3b82f6;
}
.chevron {
  font-size: 0.6rem;
  transition: transform 0.2s ease;
  color: #64748b;
}
.chevron.expanded {
  transform: rotate(180deg);
}
/* 드롭다운 애니메이션 (Grid 방식 - 가장 부드러움) */
.dropdown-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease-out, opacity 0.2s ease;
  overflow: hidden;
  opacity: 0;
}
.dropdown-wrapper.expanded {
  grid-template-rows: 1fr;
  opacity: 1;
}
.sub-nav-list {
  min-height: 0;
  background-color: #121520;
  padding: 0;
}
.dropdown-wrapper.expanded .sub-nav-list {
  padding: 8px 0;
}
.icon {
  margin-right: 12px;
  font-size: 1rem;
  flex-shrink: 0;
}
.sub-nav-list {
  background-color: #121520;
  padding: 8px 0;
}
.sub-nav-item {
  padding: 6px 24px 6px 48px;
  font-size: 0.8rem;
  color: #94a3b8;
  cursor: pointer;
}
.sub-nav-item:hover {
  color: #fff;
}
.sub-nav-item.active {
  color: #fff;
  font-weight: 500;
  background-color: #1a1f33;
}

/* ===== 모바일에서만 compact 스타일 (140px 너비 대응) ===== */
@media (max-width: 768px) {
  .sidebar-header {
    height: 52px;
    padding: 0 12px;
  }
  .sidebar-header .logo {
    height: 26px;
  }
  .nav-section-title {
    font-size: 0.62rem;
    margin: 0 12px 6px;
    letter-spacing: 0.5px;
  }
  .nav-link {
    padding: 7px 12px;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
  }
  .icon {
    margin-right: 6px;
    font-size: 0.85rem;
  }
  .sub-nav-item {
    padding: 5px 8px 5px 28px;
    font-size: 0.68rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
