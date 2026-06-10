// Generates football-themed placeholder PNG icons (192 + 512) with no deps,
// using Node's built-in zlib. Dark rounded background + white ball + green
// pentagon accents. Run: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(size, pixels /* Uint8Array RGBA */) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // rest 0
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter none
    pixels.subarray(y * stride, y * stride + stride).copy
      ? pixels.subarray(y * stride, y * stride + stride).copy(raw, y * (stride + 1) + 1)
      : Buffer.from(pixels.subarray(y * stride, y * stride + stride)).copy(
          raw,
          y * (stride + 1) + 1,
        );
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function makeIcon(size) {
  const px = new Uint8Array(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34; // ball radius
  const radius = size * 0.22; // rounded corner radius
  const set = (x, y, rr, gg, bb) => {
    const i = (y * size + x) * 4;
    px[i] = rr;
    px[i + 1] = gg;
    px[i + 2] = bb;
    px[i + 3] = 255;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // rounded-rect dark background
      const dx = Math.max(radius - x, x - (size - radius), 0);
      const dy = Math.max(radius - y, y - (size - radius), 0);
      const inRound = dx * dx + dy * dy <= radius * radius;
      if (!inRound) {
        const i = (y * size + x) * 4;
        px[i + 3] = 0; // transparent corner
        continue;
      }
      set(x, y, 8, 14, 11); // ink background
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r) {
        // ball: white with green pentagon-ish patches
        set(x, y, 245, 247, 246);
        const ang = Math.atan2(y - cy, x - cx);
        const seg = (Math.round((ang / Math.PI) * 2.5) % 5 + 5) % 5;
        const patch = d < r * 0.22 || (d > r * 0.55 && d < r * 0.72 && seg % 2 === 0);
        if (patch) set(x, y, 0, 230, 118); // pitch green patches
        // thin ring
        if (d > r - size * 0.012) set(x, y, 0, 200, 100);
      }
    }
  }
  return encodePng(size, px);
}

mkdirSync(new URL("../public/icons/", import.meta.url), { recursive: true });
for (const s of [192, 512]) {
  const buf = makeIcon(s);
  const out = new URL(`../public/icons/icon-${s}.png`, import.meta.url);
  writeFileSync(out, buf);
  console.log(`wrote public/icons/icon-${s}.png (${buf.length} bytes)`);
}
