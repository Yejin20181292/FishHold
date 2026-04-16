<script setup lang="ts">
import { ref, watch } from 'vue'
import { decodeCredential, GoogleLogin } from 'vue3-google-login'
import { useAuth } from '@/composables/useAuth'

const props = withDefaults(defineProps<{
  mode: 'login' | 'register'
  closable?: boolean
}>(), {
  closable: true
})

const emit = defineEmits<{
  close: []
}>()


const { login, register, loginWithGoogle } = useAuth()

// Form state
const activeTab = ref<'login' | 'register'>(props.mode)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

// Reset form when switching tabs
watch(activeTab, () => {
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
})

function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  // Simulate brief network delay for UX
  setTimeout(() => {
    const result = login(email.value, password.value)
    isLoading.value = false

    if (result.success) {
      successMessage.value = '로그인 성공!'
      setTimeout(() => emit('close'), 600)
    } else {
      errorMessage.value = result.error || '로그인에 실패했습니다.'
    }
  }, 400)
}

function handleRegister() {
  errorMessage.value = ''
  isLoading.value = true

  setTimeout(() => {
    const result = register(name.value, email.value, password.value, confirmPassword.value)
    isLoading.value = false

    if (result.success) {
      successMessage.value = '회원가입 성공! 환영합니다!'
      setTimeout(() => emit('close'), 800)
    } else {
      errorMessage.value = result.error || '회원가입에 실패했습니다.'
    }
  }, 400)
}

function handleGoogleLogin(response: any) {
  try {
    const userData = decodeCredential(response.credential) as any
    const result = loginWithGoogle(userData.email, userData.name, userData.picture)
    
    if (result.success) {
      successMessage.value = '구글 로그인 성공!'
      setTimeout(() => emit('close'), 600)
    } else {
      errorMessage.value = result.error || '구글 로그인 처리에 실패했습니다.'
    }
  } catch (error) {
    errorMessage.value = '구글 인증 정보를 처리에 실패했습니다.'
  }
}

function handleOverlayClick(e: MouseEvent) {
  if (props.closable && (e.target as HTMLElement).classList.contains('modal-overlay')) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="modal-overlay" @click="handleOverlayClick">
        <Transition name="modal-scale" appear>
          <div class="modal-container">
            <!-- Close button -->
            <button v-if="closable" class="modal-close" @click="emit('close')" aria-label="닫기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Header / Logo area -->
            <div class="modal-header">
              <div class="modal-logo">
                <span class="logo-icon">🚢</span>
              </div>
              <h2 class="modal-title">Fish Hold Monitor</h2>
              <p class="modal-subtitle">어선 어창 온도 모니터링 시스템</p>
            </div>

            <!-- Tab switcher -->
            <div class="tab-switcher">
              <button
                :class="['tab-btn', { active: activeTab === 'login' }]"
                @click="activeTab = 'login'"
              >
                로그인
              </button>
              <button
                :class="['tab-btn', { active: activeTab === 'register' }]"
                @click="activeTab = 'register'"
              >
                회원가입
              </button>
              <div class="tab-indicator" :class="{ 'tab-right': activeTab === 'register' }"></div>
            </div>

            <!-- Error / Success Messages -->
            <Transition name="msg-slide">
              <div v-if="errorMessage" class="message error-message">
                <span class="msg-icon">⚠️</span>
                {{ errorMessage }}
              </div>
            </Transition>
            <Transition name="msg-slide">
              <div v-if="successMessage" class="message success-message">
                <span class="msg-icon">✅</span>
                {{ successMessage }}
              </div>
            </Transition>

            <!-- Login Form -->
            <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="handleLogin">
              <div class="google-login-wrapper">
                <GoogleLogin :callback="handleGoogleLogin" prompt />
              </div>
              
              <div class="divider">
                <span>또는 이메일로 로그인</span>
              </div>

              <div class="input-group">
                <label for="login-email">이메일</label>
                <div class="input-wrapper">
                  <span class="input-icon">📧</span>
                  <input
                    id="login-email"
                    v-model="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    autocomplete="email"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label for="login-password">비밀번호</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input
                    id="login-password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="비밀번호를 입력하세요"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                    :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
                  >
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <button type="submit" class="submit-btn" :disabled="isLoading">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>로그인</span>
              </button>

              <p class="switch-text">
                계정이 없으신가요?
                <button type="button" class="link-btn" @click="activeTab = 'register'">회원가입</button>
              </p>
            </form>

            <!-- Register Form -->
            <form v-else class="auth-form" @submit.prevent="handleRegister">
              <div class="google-login-wrapper">
                <GoogleLogin :callback="handleGoogleLogin" />
              </div>
              
              <div class="divider">
                <span>또는 이메일로 가입</span>
              </div>

              <div class="input-group">
                <label for="register-name">이름</label>
                <div class="input-wrapper">
                  <span class="input-icon">👤</span>
                  <input
                    id="register-name"
                    v-model="name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    autocomplete="name"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label for="register-email">이메일</label>
                <div class="input-wrapper">
                  <span class="input-icon">📧</span>
                  <input
                    id="register-email"
                    v-model="email"
                    type="email"
                    placeholder="이메일을 입력하세요"
                    autocomplete="email"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label for="register-password">비밀번호</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input
                    id="register-password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="6자 이상 입력하세요"
                    autocomplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <div class="input-group">
                <label for="register-confirm">비밀번호 확인</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input
                    id="register-confirm"
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="비밀번호를 다시 입력하세요"
                    autocomplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    {{ showConfirmPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <button type="submit" class="submit-btn" :disabled="isLoading">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>회원가입</span>
              </button>

              <p class="switch-text">
                이미 계정이 있으신가요?
                <button type="button" class="link-btn" @click="activeTab = 'login'">로그인</button>
              </p>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* --- Overlay --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* --- Modal Container --- */
.modal-container {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 16px;
  padding: 36px 32px 32px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

/* Decorative gradient accent at top */
.modal-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6);
}

/* --- Close Button --- */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-close:hover {
  background: #f1f5f9;
  color: #475569;
  transform: rotate(90deg);
}

/* --- Header --- */
.modal-header {
  text-align: center;
  margin-bottom: 24px;
}
.modal-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  border-radius: 16px;
  font-size: 1.5rem;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}
.modal-title {
  margin: 0 0 4px;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.modal-subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 400;
}

/* --- Tab Switcher --- */
.tab-switcher {
  position: relative;
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}
.tab-btn {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.3s;
}
.tab-btn.active {
  color: #0f172a;
}
.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-indicator.tab-right {
  transform: translateX(100%);
}

/* --- Messages --- */
.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 500;
  margin-bottom: 16px;
}
.msg-icon {
  flex-shrink: 0;
  font-size: 0.9rem;
}
.error-message {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.success-message {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

/* --- Form --- */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.google-login-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 4px 0;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}
.divider span {
  padding: 0 10px;
  color: #94a3b8;
  font-size: 0.8rem;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  letter-spacing: 0.02em;
}
.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 12px;
  transition: all 0.2s;
}
.input-wrapper:focus-within {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.input-icon {
  font-size: 0.9rem;
  margin-right: 8px;
  flex-shrink: 0;
}
.input-wrapper input {
  flex: 1;
  padding: 11px 0;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
  font-family: inherit;
}
.input-wrapper input::placeholder {
  color: #94a3b8;
}
.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  border-radius: 4px;
  transition: transform 0.2s;
}
.toggle-password:hover {
  transform: scale(1.15);
}

/* --- Submit Button --- */
.submit-btn {
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.925rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 4px;
  position: relative;
  overflow: hidden;
}
.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  opacity: 0;
  transition: opacity 0.3s;
}
.submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.submit-btn span {
  position: relative;
  z-index: 1;
}

/* --- Spinner --- */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* --- Switch text --- */
.switch-text {
  text-align: center;
  font-size: 0.82rem;
  color: #64748b;
  margin: 4px 0 0;
}
.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.82rem;
  padding: 0 2px;
  transition: color 0.2s;
  font-family: inherit;
}
.link-btn:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* --- Transitions --- */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-scale-leave-active {
  transition: all 0.2s ease-in;
}
.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(16px);
}
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.msg-slide-enter-active {
  transition: all 0.3s ease-out;
}
.msg-slide-leave-active {
  transition: all 0.2s ease-in;
}
.msg-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
