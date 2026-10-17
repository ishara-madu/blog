import fs from 'node:fs';
import path from 'node:path';

const clientDir = path.join(process.cwd(), 'dist/client');
const distDir = path.join(process.cwd(), 'dist');

if (fs.existsSync(clientDir)) {
  const items = fs.readdirSync(clientDir);
  for (const item of items) {
    const src = path.join(clientDir, item);
    const dest = path.join(distDir, item);
    fs.cpSync(src, dest, { recursive: true });
  }
  console.log(`[postbuild] Copied ${items.length} static assets from dist/client to dist root for Cloudflare Pages compatibility.`);
}
