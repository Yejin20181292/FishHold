<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import AuthModal from '@/components/auth/AuthModal.vue'

const { isLoggedIn, userName, userInitial, logout } = useAuth()

// --- Mobile sidebar toggle ---
defineProps<{ sidebarOpen?: boolean }>()
const emit2 = defineEmits(['toggle-sidebar'])

// --- Real-time clock ---
const currentDateTime = ref('')     

function updateDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = dayNames[now.getDay()]
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentDateTime.value = `${year}-${month}-${day} (${dayName}) ${hours}:${minutes}:${seconds}`
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// --- Auth Modal ---
const showModal = ref(false)
const modalMode = ref<'login' | 'register'>('login')

function openModal(mode: 'login' | 'register') {
  modalMode.value = mode
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleLogout() {
  logout()
}
</script>

<template>
  <header class="header">
    <!-- 모바일: 햄버거 버튼 -->
    <button class="hamburger-btn" @click="emit2('toggle-sidebar')" aria-label="메뉴">
      <span class="hamburger-icon" :class="{ open: sidebarOpen }">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <div class="breadcrumb">
      <span class="icon">🏠</span>
      <span class="separator">/</span>
      <span>장비 현황판</span>
      <span class="separator">-</span>
      <span class="current">[신라 나오에로썬 FISH HOLD MONITOR 🖊️]</span>
    </div>
    
    <div class="header-right">
      <div class="date-time">
        {{ currentDateTime }}
      </div>

      <!-- 비로그인 상태 -->
      <div v-if="!isLoggedIn" class="auth-buttons">
        <button id="btn-login" class="btn-login" @click="openModal('login')">
          <span class="btn-icon">🔑</span>
          로그인
        </button>
        <button id="btn-register" class="btn-register" @click="openModal('register')">
          <span class="btn-icon">✨</span>
          회원가입
        </button>
      </div>

      <!-- 로그인 상태 -->
      <div v-else class="user-info">
        <div class="user-badge">
          <div class="avatar">{{ userInitial }}</div>
          <span class="user-name">{{ userName }}</span>
        </div>
        <button id="btn-logout" class="btn-logout" @click="handleLogout">
          로그아웃
        </button>
      </div>
    </div>
  </header>

  <!-- Auth Modal -->
  <AuthModal
    v-if="showModal"
    :mode="modalMode"
    @close="closeModal"
  />
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
}

/* 햄버거 버튼 - 데스크탑에서는 숨김 */
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: background 0.2s;
}
.hamburger-btn:hover {
  background: #f1f5f9;
}
.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 22px;
}
.hamburger-icon span {
  display: block;
  height: 2px;
  background: #334155;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}
/* X 모양으로 변환 */
.hamburger-icon.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger-icon.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
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
  flex-shrink: 0;
}
.date-time {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* --- Auth Buttons (비로그인) --- */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 1px solid #e2e8f0;
  padding-left: 20px;
}
.btn-icon {
  font-size: 0.8rem;
}
.btn-login {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: transparent;
  color: #3b82f6;
  border: 1.5px solid #3b82f6;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.btn-login:hover {
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.btn-register {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}
.btn-register:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

/* --- User Info (로그인 상태) --- */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 1px solid #e2e8f0;
  padding-left: 20px;
}
.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  background: #f1f5f9;
  border-radius: 24px;
}
.avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
}
.btn-logout {
  padding: 6px 12px;
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-logout:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

/* ===== 모바일 반응형 (768px 이하) ===== */
@media (max-width: 768px) {
  .hamburger-btn {
    display: block;
  }
  .breadcrumb {
    font-size: 0.75rem;
  }
  .current {
    display: none; /* 모바일에서 긴 텍스트 숨김 */
  }
  .date-time {
    font-size: 0.72rem;
  }
  .btn-login, .btn-register {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
  .user-name {
    display: none; /* 아바타만 보여줌 */
  }
  .auth-buttons, .user-info {
    padding-left: 10px;
    gap: 6px;
  }
  .header-right {
    gap: 8px;
  }
}
</style>
