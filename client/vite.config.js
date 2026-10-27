import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Any request starting with /api is passed on to the Express server on port 5000.
// That way the React app and the server feel like one website.
const apiProxy = { '/api': 'http://localhost:5000' };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: apiProxy },
  preview: { port: 5173, proxy: apiProxy },
});
