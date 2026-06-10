import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}', 'server/**/*.{test,spec}.js'],
    pool: 'forks',
    maxWorkers: 1,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
