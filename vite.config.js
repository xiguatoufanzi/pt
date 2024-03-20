import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000, //本地端口号
    proxy: {
      '/api': {
        target: 'https://api.canfire.net/', //目标url
        changeOrigin: true, //支持跨域
        rewrite: (path) => path.replace(/^\/api/, ""), 
          //重写路径,替换/api
      },
      '/weibo': {
        target: 'https://api.weibo.cn/', //目标url
        changeOrigin: true, //支持跨域
        rewrite: (path) => path.replace(/^\/weibo/, ""), 
          //重写路径,替换/api
      },
    }
  }
})
