import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  base:'./',
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
      }
    },
  //   https: mode === 'development'
  //     ? {
  //         key: fs.readFileSync(path.resolve(__dirname, "certs/server.key")),
  //         cert: fs.readFileSync(path.resolve(__dirname, "certs/server.cert")),
  //       }
  //     : false, 
   },
}));
