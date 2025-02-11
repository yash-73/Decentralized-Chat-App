import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/server.cert")),
    },
    host: true, // Allow access from any IP
    port: 5173,      // Default Vite port, can be customized
  },
})
