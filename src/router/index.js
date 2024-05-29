import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/start',// 重定向
    },
    {
        path: '/start',
        name: 'start',
        component: () => import('../views/start/start.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router