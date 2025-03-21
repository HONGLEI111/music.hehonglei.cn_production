import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { wrapperEnv } from "./build/getEnv";
import { createProxy } from "./build/proxy";
import { createVitePlugins } from "./build/plugins";

export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);

  return {
    plugins: createVitePlugins(viteEnv),
    server: {
      port: 8089,
      host: true,
      proxy: createProxy(viteEnv.VITE_PROXY),
      },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    base: viteEnv.VITE_PUBLIC_PATH || '/music/', // 确保基础路径正确
    build: {
      rollupOptions: {
        output: {
          // 保持原有配置
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            // 保持原有分包逻辑
            if (id.includes('node_modules')) {
              return id.split(/node_modules|\.pnpm\/|\//)[2] || 'vendor'
            }
          }
        }
      },
      // Vercel部署建议配置
      ssr: false, // 如果使用SSR需要额外配置
      minify: 'terser',
      target: 'es2015'
    },
    // Vercel特定配置
    preview: {
      port: 8089,
      host: '0.0.0.0',
      strictPort: true
    }
  }
})
