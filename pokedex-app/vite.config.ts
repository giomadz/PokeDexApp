import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows access from the network
    port: 3000, // Ensure it matches your ngrok tunnel
    strictPort: true, // Ensures the port doesn't change
    allowedHosts: ['.ngrok-free.app'], // Allows ngrok's dynamic URLs
  },
},
)
