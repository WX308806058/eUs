import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 配置 vite-plugin-electron
import electron from 'vite-plugin-electron'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      // 主进程入口文件
      entry: 'background.js'
    })
  ],
  /*开发服务器选项*/
  server: {
    // 端口
    port: 3000,
  }
})