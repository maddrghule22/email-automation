import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const staticDir = path.join(rootDir, '.vercel', 'output', 'static');
const nextStaticDir = path.join(rootDir, '.next', 'static');
const nextAppDir = path.join(rootDir, '.next', 'server', 'app');
const publicDir = path.join(rootDir, 'public');
const workerSrc = path.join(rootDir, 'cloudflare', 'worker.js');
const workerDest = path.join(staticDir, '_worker.js');

console.log('--- Preparing Cloudflare Pages Bundle ---');

// Ensure output directories exist
fs.mkdirSync(staticDir, { recursive: true });
fs.mkdirSync(path.join(staticDir, '_next', 'static'), { recursive: true });

// Copy public directory
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, staticDir, { recursive: true });
  console.log('✓ Copied public assets');
}

// Copy .next/static directory
if (fs.existsSync(nextStaticDir)) {
  fs.cpSync(nextStaticDir, path.join(staticDir, '_next', 'static'), { recursive: true });
  console.log('✓ Copied .next/static assets');
}

// Copy .next/server/app html and rsc
if (fs.existsSync(nextAppDir)) {
  const files = fs.readdirSync(nextAppDir);
  for (const file of files) {
    if (file.endsWith('.html') || file.endsWith('.rsc')) {
      const srcPath = path.join(nextAppDir, file);
      const destPath = path.join(staticDir, file);
      fs.copyFileSync(srcPath, destPath);

      // Create subdirectory index fallback
      if (file.endsWith('.html') && !file.startsWith('_') && file !== 'index.html' && file !== '404.html' && file !== '500.html') {
        const slug = file.replace('.html', '');
        const slugDir = path.join(staticDir, slug);
        fs.mkdirSync(slugDir, { recursive: true });
        fs.copyFileSync(srcPath, path.join(slugDir, 'index.html'));
      }
    }
  }
  console.log('✓ Copied Next.js compiled pages and RSC manifests');
}

// Copy worker.js
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest);
  console.log('✓ Installed Advanced Cloudflare Edge Worker (_worker.js)');
}

// Write _routes.json
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: ['/_next/static/*', '/images/*', '/*.svg', '/robots.txt'],
};
fs.writeFileSync(path.join(staticDir, '_routes.json'), JSON.stringify(routesConfig, null, 2));
console.log('✓ Written Cloudflare _routes.json');

console.log('--- Cloudflare Pages bundle preparation complete ---');
