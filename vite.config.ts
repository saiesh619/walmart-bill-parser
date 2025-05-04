import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/walmart-bill-parser/", // replace with your repo name
  plugins: [react()]
});
