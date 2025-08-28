import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateSitemap = () => {
  const pagesDir = resolve(process.cwd(), 'src');
  const files = readdirSync(pagesDir).filter(file => file.endsWith('.html'));
  const today = getToday();
  const baseUrl = 'https://rahul-gupta-au.web.app'; // <-- This is the updated line

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${files
    .map(file => {
      const pageName = file.replace(/\.html$/, '');
      const path = pageName === 'index' ? '' : `/${pageName}`;
      return `<url><loc>${baseUrl}${path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    })
    .join('\n  ')}
</urlset>`;

  writeFileSync(resolve(pagesDir, 'sitemap.xml'), sitemapContent);
  console.log('Sitemap generated successfully!');
};

generateSitemap();