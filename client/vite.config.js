import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  base:'./',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  //   https: mode === 'development'
  //     ? {
  //         key: fs.readFileSync(path.resolve(__dirname, "certs/server.key")),
  //         cert: fs.readFileSync(path.resolve(__dirname, "certs/server.cert")),
  //       }
  //     : false, 
   },
}));
