import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { VitePWA } from 'vite-plugin-pwa';

// --- Helper Plugin for Sitemap ---
function updateSitemapDate() {
  return {
    name: 'update-sitemap-lastmod',
    closeBundle() {
      const sitemapPath = resolve(__dirname, 'dist', 'sitemap.xml');
      const today = new Date().toISOString().split('T')[0];
      try {
        let sitemapContent = readFileSync(sitemapPath, 'utf-8');
        sitemapContent = sitemapContent.replace(/<lastmod>.*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
        writeFileSync(sitemapPath, sitemapContent);
        console.log('sitemap.xml lastmod dates updated successfully.');
      } catch (error) {
        console.error('Error updating sitemap.xml:', error);
      }
    }
  };
}
// ---------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));

const input = readdirSync(resolve(__dirname, 'src'))
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = file.substring(0, file.length - 5);
    acc[name] = resolve(__dirname, 'src', file);
    return acc;
  }, {});

export default defineConfig({
  root: 'src',
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src', '_partials'),
    }),
    viteStaticCopy({
      targets: [
        { src: 'data', dest: '.' },
        { src: 'assets', dest: '.' },
        { src: 'images', dest: '.' },
        { src: 'sw.js', dest: '.' },
        { src: 'robots.txt', dest: '.' },
        { src: 'sitemap.xml', dest: '.' },
        { src: 'css', dest: '.' },
      ]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*'],
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2,json}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://cdnjs.cloudflare.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fontawesome-cache',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Australian PR Journey',
        short_name: 'PR Journey',
        description: 'A personal dashboard tracking my journey to Australian Permanent Residency.',
        theme_color: '#00529B',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/assets/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    updateSitemapDate()
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input,
    },
  },
});