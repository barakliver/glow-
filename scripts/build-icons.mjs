/**
 * Renders the app icon set from public/icons/icon.svg.
 *
 * The SVG is the single source of truth; every PNG below is generated, so the
 * artwork only ever has to be edited in one place.
 *
 *   node scripts/build-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'public/icons/icon.svg'));

/** Android adaptive icons crop to a circle, so the art needs a safe margin. */
async function maskable(size) {
  const inset = Math.round(size * 0.16);
  const art = await sharp(source)
    .resize(size - inset * 2, size - inset * 2)
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 13, g: 16, b: 15, alpha: 1 },
    },
  })
    .composite([{ input: art, top: inset, left: inset }])
    .png()
    .toBuffer();
}

const targets = [
  ['icon-192.png', () => sharp(source).resize(192, 192).png().toBuffer()],
  ['icon-512.png', () => sharp(source).resize(512, 512).png().toBuffer()],
  ['apple-touch-icon.png', () => sharp(source).resize(180, 180).png().toBuffer()],
  ['icon-maskable.png', () => maskable(512)],
];

for (const [name, render] of targets) {
  writeFileSync(join(root, 'public/icons', name), await render());
  console.log(`wrote public/icons/${name}`);
}
