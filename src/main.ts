import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(vue3GoogleLogin, {
  clientId: '243107023418-eieu5qbiu81sht5r7f1sauvsij8n8e0k.apps.googleusercontent.com'
})

app.mount('#app')
