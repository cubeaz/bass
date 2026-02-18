
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 关键配置：设置 base 为 './'，使得打包后的 index.html 可以直接在本地打开，
  // 或者部署在非根目录的服务器路径下。
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist', // 打包输出目录
    sourcemap: false, // 生产环境关闭 source map 减小体积
    rollupOptions: {
        output: {
            // 手动分包，将第三方库单独打包，提高加载速度
            manualChunks: {
                vendor: ['react', 'react-dom', 'lucide-react'],
                audio: ['./services/AudioEngine.ts'] // 音频引擎逻辑较多，单独分包
            }
        }
    }
  }
});
