import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env, // This ensures environment variables are loaded properly.
  },
  envPrefix: 'VITE_', // Make sure only variables prefixed with 'VITE_' are exposed to your code
});
