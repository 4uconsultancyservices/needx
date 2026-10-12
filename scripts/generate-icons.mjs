// One-off icon generator, run once during project setup (not a runtime
// dependency of the app). Renders a simple on-brand mark to every PWA icon
// size needed, so the manifest points at real files instead of placeholders.
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'apps', 'web', 'public', 'icons');

const INK = '#14213d';
const ACCENT = '#e7a93c';

function markSvg({ size, padding = 0 }) {
  const inner = size - padding * 2;
  const fontSize = Math.round(inner * 0.52);
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${INK}"/>
    <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle"
      font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-style="italic"
      font-size="${fontSize}" fill="${ACCENT}">N</text>
  </svg>`;
}

async function writePng(svg, size, filename) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(outDir, filename));
  console.log('wrote', filename);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await writePng(markSvg({ size: 192 }), 192, 'icon-192.png');
  await writePng(markSvg({ size: 512 }), 512, 'icon-512.png');
  // Maskable icons need a safe-zone margin (~10%) since OSes crop to shape.
  await writePng(markSvg({ size: 512, padding: 51 }), 512, 'icon-maskable-512.png');
  await writePng(markSvg({ size: 180 }), 180, 'apple-touch-icon.png');
  await writePng(markSvg({ size: 32 }), 32, 'favicon-32.png');
  await writePng(markSvg({ size: 16 }), 16, 'favicon-16.png');

  console.log('Icons generated at', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
