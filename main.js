import piniaPersist from 'pinia-plugin-persist'
import CToast from '@/components/CToast'
import '@/components/CToast/themes/bootstrap/index.scss'
import './router/guard'
import App from './App.vue'

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)

app.directive('sk', directives.skeleton)
app.directive('slide-in', directives.slideIn)

app.use(CToast)
app.use(pinia)
app.use(router)

app.mount('#app')
