import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public', // Output dir for build files
  },
  /*
  server: {
    port: 5173, // Sett porten du ønsker
  },
  */
})