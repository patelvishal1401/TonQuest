import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  rollupOptions: {
    external: ["react", /^react\/.*/, "react-dom", /react-dom\/.*/],
    output: {
      globals: {
        'react-dom': 'ReactDom',
        react: 'React',
        'react/jsx-runtime': 'ReactJsxRuntime',
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  define: {
    global: 'window', // Make global available for browser
  },
})
