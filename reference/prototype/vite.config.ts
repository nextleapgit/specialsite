import { defineConfig } from 'vitest/config';
export default defineConfig({
  base: './',
  build: { rolldownOptions: { input: { main: 'index.html', academy: 'academy.html' } } },
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
