import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      "7395-2409-40e3-104c-4834-5850-2cb6-765d-cc6.ngrok-free.app"
    ]
  }
})
