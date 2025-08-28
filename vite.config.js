import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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