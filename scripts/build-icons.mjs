/**
 * Renders every brand asset from brand/glow-logo.jpg.
 *
 * The delivered artwork is a single flat JPEG: slate line art on off-white
 * paper, with the mark stacked above the GLOW wordmark. Everything the app
 * needs is cut from it here, so the artwork only ever has to be replaced in
 * one place.
 *
 *   node scripts/build-icons.mjs
 *
 * Two families come out:
 *
 *   public/brand/*   transparent, off-white ink - for the dark UI
 *   public/icons/*   slate on paper, as delivered - for the home screen
 *
 * plus two files that have to sit at the site root to be found: the Apple
 * touch icon and og.png, the card a shared invite link unfurls into.
 *
 * The paper is keyed out into real alpha rather than thresholded, so the thin
 * antialiased strokes survive. A hard cutoff turns this artwork into a jagged
 * stencil at the sizes it is actually used.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'brand/glow-logo.jpg');

/** Measured from the artwork: the paper it is printed on and the ink it uses. */
const PAPER = { r: 251, g: 251, b: 251 };
const INK = { r: 57, g: 67, b: 79 };
const PAPER_LUMA = 251;
const INK_LUMA = 65;

/** The two pieces of the lockup, as pixel boxes in the source. */
const REGIONS = {
  mark: { left: 176, top: 75, width: 286, height: 329 },
  wordmark: { left: 115, top: 449, width: 408, height: 76 },
  lockup: { left: 115, top: 75, width: 408, height: 450 },
};

/**
 * The ink is not as dark as the darkest pixel in it.
 *
 * A straight luma-to-alpha key leaves the stroke bodies at about 78% opaque -
 * four fifths of the ink pixels land between 0.70 and 0.90 - because most of
 * the line sits at luma ~95 while the single darkest pixel is at 65. Against a
 * near-black background that reads as grey rather than as a drawn line.
 *
 * So the key is a levels remap rather than a ratio: everything at or past
 * SOLID becomes fully opaque, and the ramp below it keeps the antialiased
 * edges soft. FLOOR is under the JPEG mottling in the paper.
 */
const FLOOR = 0.06;
const SOLID = 0.78;

async function alphaMask(region) {
  const { data, info } = await sharp(SOURCE)
    .extract(region)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0, p = 0; i < data.length; i += info.channels, p += 1) {
    const luma = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const t = (PAPER_LUMA - luma) / (PAPER_LUMA - INK_LUMA);
    const levelled = (t - FLOOR) / (SOLID - FLOOR);
    alpha[p] = Math.round((levelled < 0 ? 0 : levelled > 1 ? 1 : levelled) * 255);
  }
  return { alpha, width: info.width, height: info.height };
}

/** The region as flat colour plus that alpha, at its native size. */
async function tinted(region, colour) {
  const { alpha, width, height } = await alphaMask(region);
  const rgba = Buffer.alloc(width * height * 4);
  for (let p = 0; p < alpha.length; p += 1) {
    rgba[p * 4] = colour.r;
    rgba[p * 4 + 1] = colour.g;
    rgba[p * 4 + 2] = colour.b;
    rgba[p * 4 + 3] = alpha[p];
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } });
}

/**
 * The lockup on a wide sheet of paper, for link previews.
 *
 * The artwork is portrait and the card is landscape, so the art is sized by
 * height and left to float in the middle. The empty paper on either side is
 * the point - a crowded preview card reads as an ad.
 */
async function banner(region, { width, height, pad, ink, ground }) {
  const innerHeight = Math.round(height * (1 - pad * 2));
  const art = await (await tinted(region, ink))
    .resize(null, innerHeight, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  return sharp({ create: { width, height, channels: 4, background: ground } })
    .composite([{ input: art, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Fits art inside a square of `size`, leaving `pad` of the square empty. */
async function plate(region, { size, pad, ink, ground }) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await (await tinted(region, ink))
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const canvas = sharp({
    create: { width: size, height: size, channels: 4, background: ground },
  });
  return canvas.composite([{ input: art, gravity: 'center' }]).png().toBuffer();
}

const write = (relative, buffer) => {
  const target = join(root, relative);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buffer);
  console.log(`wrote ${relative}`);
};

// --- the dark UI: off-white ink, no ground ----------------------------------
// Rendered at 3x the largest place they appear, so they stay sharp on a phone.
const LIGHT = { r: 244, g: 242, b: 236 };

for (const [name, region, width] of [
  ['mark', REGIONS.mark, 420],
  ['wordmark', REGIONS.wordmark, 720],
  ['lockup', REGIONS.lockup, 720],
]) {
  const scale = width / region.width;
  write(
    `public/brand/${name}.png`,
    await (await tinted(region, LIGHT))
      .resize(width, Math.round(region.height * scale), { kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );
}

// --- the home screen: as delivered ------------------------------------------
const GROUND = { ...PAPER, alpha: 1 };

write('public/icons/icon-192.png', await plate(REGIONS.lockup, { size: 192, pad: 0.12, ink: INK, ground: GROUND }));
write('public/icons/icon-512.png', await plate(REGIONS.lockup, { size: 512, pad: 0.12, ink: INK, ground: GROUND }));
// iOS probes /apple-touch-icon.png at the site root when a page declares no
// apple icon of its own, so this one lives at the root rather than in /icons.
write('public/apple-touch-icon.png', await plate(REGIONS.lockup, { size: 180, pad: 0.12, ink: INK, ground: GROUND }));

// Android crops adaptive icons to a circle, so this one keeps a wider margin
// and drops the wordmark - at the size a launcher renders it, the word is a
// smudge and the mark alone is legible.
write('public/icons/icon-maskable.png', await plate(REGIONS.mark, { size: 512, pad: 0.26, ink: INK, ground: GROUND }));

// The browser tab. Small enough that only the mark reads.
write('public/icons/favicon.png', await plate(REGIONS.mark, { size: 64, pad: 0.08, ink: INK, ground: GROUND }));

// --- link previews ----------------------------------------------------------
// Invite links get pasted into WhatsApp, so the card a member sees before they
// tap is the club's first impression. It carries the mark and nothing else:
// no name, no schedule, nothing about whoever sent it.
write(
  'public/og.png',
  await banner(REGIONS.lockup, { width: 1200, height: 630, pad: 0.14, ink: INK, ground: GROUND }),
);
