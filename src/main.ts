import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(vue3GoogleLogin, {
  clientId: 'YOUR_GOOGLE_CLIENT_ID_HERE' // 사용자분께서 발급받은 실제 Client ID로 변경해주세요
})

app.mount('#app')
