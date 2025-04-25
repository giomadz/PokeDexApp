import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/PokeDexApp/', 

  server: {
    host: '0.0.0.0',         // Allow LAN/Ngrok access
    port: 3000,              // Your preferred port
    strictPort: true,
    allowedHosts: ['.ngrok-free.app'], // Allow dynamic Ngrok domains
  },
})
