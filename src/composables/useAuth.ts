import { ref, computed } from 'vue'

// --- Types ---
interface User {
  email: string
  name: string
}

interface StoredUser {
  email: string
  name: string
  password: string
}

// --- Reactive State (Singleton) ---
const currentUser = ref<User | null>(null)
const isInitialized = ref(false)

// Storage keys
const USERS_KEY = 'fishhold_users'
const SESSION_KEY = 'fishhold_session'

// --- Helper Functions ---
function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// --- Validation ---
function validateEmail(email: string): string | null {
  if (!email.trim()) return '이메일을 입력해주세요.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다.'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return '비밀번호를 입력해주세요.'
  if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.'
  return null
}

function validateName(name: string): string | null {
  if (!name.trim()) return '이름을 입력해주세요.'
  if (name.trim().length < 2) return '이름은 2자 이상이어야 합니다.'
  return null
}

// --- Composable ---
export function useAuth() {
  // Initialize session on first use
  if (!isInitialized.value) {
    currentUser.value = loadSession()
    isInitialized.value = true
  }

  const isLoggedIn = computed(() => currentUser.value !== null)
  const userName = computed(() => currentUser.value?.name ?? '')
  const userEmail = computed(() => currentUser.value?.email ?? '')
  const userInitial = computed(() => {
    const name = currentUser.value?.name
    return name ? name.charAt(0).toUpperCase() : ''
  })

  function login(email: string, password: string): { success: boolean; error?: string } {
    // Validate
    const emailErr = validateEmail(email)
    if (emailErr) return { success: false, error: emailErr }
    const passErr = validatePassword(password)
    if (passErr) return { success: false, error: passErr }

    // Check credentials
    const users = getStoredUsers()
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return { success: false, error: '등록되지 않은 이메일입니다.' }
    if (found.password !== password) return { success: false, error: '비밀번호가 일치하지 않습니다.' }

    // Success
    const user: User = { email: found.email, name: found.name }
    currentUser.value = user
    saveSession(user)
    return { success: true }
  }

  function register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): { success: boolean; error?: string } {
    // Validate
    const nameErr = validateName(name)
    if (nameErr) return { success: false, error: nameErr }
    const emailErr = validateEmail(email)
    if (emailErr) return { success: false, error: emailErr }
    const passErr = validatePassword(password)
    if (passErr) return { success: false, error: passErr }
    if (password !== confirmPassword) return { success: false, error: '비밀번호가 일치하지 않습니다.' }

    // Check duplicate
    const users = getStoredUsers()
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (exists) return { success: false, error: '이미 등록된 이메일입니다.' }

    // Register
    users.push({ email, name: name.trim(), password })
    saveStoredUsers(users)

    // Auto-login after registration
    const user: User = { email, name: name.trim() }
    currentUser.value = user
    saveSession(user)
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    clearSession()
  }

  return {
    currentUser,
    isLoggedIn,
    userName,
    userEmail,
    userInitial,
    login,
    register,
    logout
  }
}
