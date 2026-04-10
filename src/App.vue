<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import FishHoldMonitor from '@/components/dashboard/FishHoldMonitor.vue'
</script>

<template>
  <div class="app-container">
    <Sidebar class="app-sidebar" />
    <div class="app-main-wrapper">
      <Header class="app-header" />
      <main class="app-content">
        <FishHoldMonitor />
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
  height: 60px;
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
</style>
