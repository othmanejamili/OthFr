import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Polyfill process/browser for some CJS modules
import process from 'process'

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx,js,ts}",
    })
  ],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    include: ['react-apexcharts', 'apexcharts'], // pre-bundle CJS
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      process: 'process/browser', // ✅ Node polyfill
    },
  },
  define: {
    global: "globalThis", // ✅ fixes exports/global issues
  },
  server: {
    port: 3000,
  }
})
