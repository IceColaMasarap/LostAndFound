import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Change this to any available port
    host: '127.0.0.1', // Use IPv4 instead of IPv6
  },
})
