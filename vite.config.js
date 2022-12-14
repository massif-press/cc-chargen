import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2021',
  },
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/**/*.ts', '!src/**/*.{d}.ts'],
      reportsDirectory: 'coverage',
      enabled: true,
      reporter: ['text', 'lcov', 'json'],
    },
  },
});
