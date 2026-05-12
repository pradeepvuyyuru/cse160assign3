"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT = path.join(__dirname, "textures");
const SIZE = 128;

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const len = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([len, typeBuffer, data, crc]);
}

function png(name, pixel) {
  const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    raw[y * (SIZE * 4 + 1)] = 0;
    for (let x = 0; x < SIZE; x += 1) {
      const rgba = pixel(x, y);
      const i = y * (SIZE * 4 + 1) + 1 + x * 4;
      raw[i] = rgba[0];
      raw[i + 1] = rgba[1];
      raw[i + 2] = rgba[2];
      raw[i + 3] = rgba[3] == null ? 255 : rgba[3];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const file = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
  fs.writeFileSync(path.join(OUT, name), file);
}

function noise(x, y, seed) {
  const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return v - Math.floor(v);
}

fs.mkdirSync(OUT, { recursive: true });

png("wall.png", (x, y) => {
  const brickH = 16;
  const brickW = 32;
  const row = Math.floor(y / brickH);
  const offset = row % 2 === 0 ? 0 : brickW / 2;
  const mortar = ((x + offset) % brickW < 2) || (y % brickH < 2);
  const n = noise(x, y, 1) * 22;
  return mortar ? [84, 78, 70, 255] : [132 + n, 105 + n * 0.4, 82 + n * 0.2, 255];
});

png("road.png", (x, y) => {
  const n = noise(x, y, 2) * 16;
  const seam = x % 64 === 0 || y % 64 === 0;
  return seam ? [58, 60, 61, 255] : [28 + n, 31 + n, 33 + n, 255];
});

png("grass.png", (x, y) => {
  const blade = noise(Math.floor(x / 3), y, 3) > 0.62;
  const n = noise(x, y, 4) * 34;
  return blade ? [67, 138 + n, 79, 255] : [42, 105 + n, 60, 255];
});

png("crate.png", (x, y) => {
  const band = x < 10 || y < 10 || x > 117 || y > 117 || Math.abs(x - y) < 4 || Math.abs(x + y - 127) < 4;
  const n = noise(x, y, 5) * 20;
  return band ? [111 + n, 76 + n * 0.4, 39, 255] : [174 + n, 119 + n * 0.5, 61, 255];
});

png("metal.png", (x, y) => {
  const stripe = Math.floor((x + y) / 12) % 2 === 0;
  const n = noise(x, y, 6) * 18;
  return stripe ? [91 + n, 117 + n, 129 + n, 255] : [43 + n, 83 + n, 104 + n, 255];
});

png("fuel.png", (x, y) => {
  const ring = Math.hypot(x - 64, y - 64);
  const glow = Math.max(0, 1 - ring / 78);
  const pulse = Math.floor((x + y) / 10) % 2;
  return pulse ? [235 + glow * 20, 22, 20, 255] : [255, 92 + glow * 70, 64, 255];
});

png("sand.png", (x, y) => {
  const ripple = Math.sin((x + y * 0.45) / 8) * 14;
  const n = noise(x, y, 7) * 18;
  return [205 + ripple + n, 176 + ripple * 0.45 + n, 110 + n * 0.35, 255];
});

png("water.png", (x, y) => {
  const wave = Math.sin((x + y) / 6) * 18 + Math.sin(y / 4) * 10;
  const highlight = Math.abs((x + y * 2) % 34 - 17) < 2;
  return highlight ? [135, 220, 240, 255] : [34, 123 + wave, 176 + wave, 255];
});
