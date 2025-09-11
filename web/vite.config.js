import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            open: false
        })
    ],
    /*build: {
      rollupOptions: {
        external: ['hls.js', 'jsqr'],
        output: {
          globals: {
            'hls.js': 'Hls',
            'jsqr': 'jsQR',
          },
        },
      },
    },*/
    server: {
        host: true,
        port: 5173,
    }
})
