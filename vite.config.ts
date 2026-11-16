import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      {
        name: 'serve-app-html-in-dev',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const urlPath = req.url?.split('?')[0];
            if (urlPath === '/' || urlPath === '/index.html') {
              req.url = '/app.html';
            }
            next();
          });
        },
      },
      react(),
      tailwindcss(),
      viteSingleFile({
        outputFileName: 'index.html',
      }),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
      // Emits compiled single-file index.html and .nojekyll directly to repository root
      // for GitHub Pages "Deploy from a branch" (main / root) without external assets/.
      {
        name: 'publish-root-pages',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const distIndexHtml = path.resolve(distDir, 'index.html');
          if (fs.existsSync(distIndexHtml)) {
            fs.copyFileSync(distIndexHtml, path.resolve(__dirname, 'index.html'));
          }

          const distNoJekyll = path.resolve(distDir, '.nojekyll');
          const rootNoJekyll = path.resolve(__dirname, '.nojekyll');
          if (fs.existsSync(distNoJekyll)) {
            fs.copyFileSync(distNoJekyll, rootNoJekyll);
          } else if (!fs.existsSync(rootNoJekyll)) {
            fs.writeFileSync(rootNoJekyll, '', 'utf-8');
          }
        },
      },
    ],
    build: {
      cssMinify: 'esbuild' as const,
      rollupOptions: {
        input: path.resolve(__dirname, 'app.html'),
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
