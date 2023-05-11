import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'medley',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'umd' ? 'index.umd.js' : 'index.js',
    }
  },
  plugins: [dts()]
})
