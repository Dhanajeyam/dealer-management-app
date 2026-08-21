import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      jspdf: path.resolve(__dirname, 'node_modules/jspdf/dist/jspdf.umd.min.js'),
      'jspdf-autotable': path.resolve(__dirname, 'node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs')
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
