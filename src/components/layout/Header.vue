<script setup lang="ts">
// Header component showing breadcrumbs and current time
</script>

<template>
  <header class="header">
    <div class="breadcrumb">
      <span class="icon">🏠</span>
      <span class="separator">/</span>
      <span>장비 현황판</span>
      <span class="separator">-</span>
      <span class="current">[신라 나오에로썬 FISH HOLD MONITOR 🖊️]</span>
    </div>
    
    <div class="header-right">
      <div class="date-time">
        2026-04-10 (금) 15:08:58
      </div>
      <div class="user-profile">
        <div class="avatar"></div>
      </div>
      <div class="actions">
        <button class="action-btn">🔒</button>
        <button class="action-btn">⚙️</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}
.separator {
  margin: 0 8px;
  color: #cbd5e1;
}
.current {
  color: #0f172a;
  font-weight: 600;
  margin-left: 4px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.date-time {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 500;
}
.user-profile .avatar {
  width: 24px;
  height: 24px;
  background-color: #3b82f6;
  border-radius: 50%;
}
.actions {
  display: flex;
  gap: 8px;
  border-left: 1px solid #e2e8f0;
  padding-left: 16px;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.action-btn:hover {
  background-color: #f1f5f9;
}
</style>
