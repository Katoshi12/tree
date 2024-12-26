import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
