<script setup lang="ts">
// Using lucide-vue-next for icons (as an example, though not fully installed yet we just text mock)
import { ref } from 'vue'

const activeMenu = ref('장비 모니터링')
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
            <a href="#" class="nav-link">
              <span class="icon">📊</span>
              Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link">
              <span class="icon">🖥️</span>
              장비 모니터링
            </a>
          </li>
          <li class="nav-item">
            <div class="nav-link active">
              <span class="icon">🚢</span>
              장비 현황판
            </div>
            <ul class="sub-nav-list">
              <li class="sub-nav-item active">신라 나오에로썬 FISH...</li>
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
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background-color: #121520; /* Slightly darker header */
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
  padding: 8px 24px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
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
  margin-right: 12px;
  font-size: 1rem;
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
</style>
