import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import LoginRegister from '../pages/LoginRegister.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: LoginRegister }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
