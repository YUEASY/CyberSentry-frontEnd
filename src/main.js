import { createApp } from 'vue'
import App from './App.vue'
import { router } from './route/router'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'; // 需要引入 CSS
import { createPinia } from 'pinia';


createApp(App)
.use(createPinia())
.use(ArcoVue)
.use(router)
.mount('#app')
