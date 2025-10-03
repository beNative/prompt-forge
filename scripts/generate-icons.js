#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_DIR = path.join(__dirname, '..', 'build', 'icons');
const SVG_CANDIDATES = ['app-icon.svg', 'icon.svg'];
const PNG_SIZES = [1024, 512, 256, 128, 64, 48, 32, 24, 16];
const ICO_SIZES = [256, 128, 64, 48, 32, 24, 16];
const ICNS_TYPES = [
  { size: 16, type: 'icp4' },
  { size: 32, type: 'icp5' },
  { size: 64, type: 'icp6' },
  { size: 128, type: 'ic07' },
  { size: 256, type: 'ic08' },
  { size: 512, type: 'ic09' },
  { size: 1024, type: 'ic10' }
];
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="fallback-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f2937" />
      <stop offset="100%" stop-color="#4c1d95" />
    </linearGradient>
    <radialGradient id="fallback-glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
      <stop offset="60%" stop-color="#c4b5fd" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#312e81" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="112" fill="url(#fallback-bg)" />
  <circle cx="256" cy="208" r="176" fill="url(#fallback-glow)" />
  <rect x="120" y="320" width="272" height="72" rx="36" fill="#c7d2fe" fill-opacity="0.9" />
  <rect x="104" y="360" width="304" height="80" rx="40" fill="#0f172a" fill-opacity="0.82" />
  <rect x="232" y="120" width="48" height="140" rx="24" fill="#fef08a" fill-opacity="0.85" />
  <rect x="172" y="180" width="168" height="72" rx="36" fill="#f97316" fill-opacity="0.9" />
  <rect x="192" y="244" width="128" height="52" rx="26" fill="#4338ca" fill-opacity="0.92" />
  <circle cx="182" cy="412" r="28" fill="#4338ca" fill-opacity="0.9" />
  <circle cx="330" cy="412" r="28" fill="#4338ca" fill-opacity="0.9" />
  <circle cx="256" cy="156" r="44" fill="#fde68a" fill-opacity="0.95" />
  <circle cx="256" cy="156" r="22" fill="#fef3c7" />
</svg>`;

function findSvg() {
  for (const candidate of SVG_CANDIDATES) {
    const candidatePath = path.join(ASSETS_DIR, candidate);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }
  const svgFiles = fs
    .readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg'))
    .map((entry) => path.join(ASSETS_DIR, entry.name));
  return svgFiles[0];
}

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function validateSvg(svgContent) {
  if (typeof svgContent !== 'string') {
    console.warn('[icon] SVG validation failed: content is not a string.');
    return false;
  }

  const trimmed = svgContent.trim();
  if (!trimmed) {
    console.warn('[icon] SVG validation failed: content is empty.');
    return false;
  }

  const hasSvgTag = /<svg\b[^>]*>/i.test(trimmed);
  const hasClosingTag = /<\/svg>/i.test(trimmed);

  if (!hasSvgTag || !hasClosingTag) {
    console.warn('[icon] SVG validation failed: missing <svg> root element.');
    return false;
  }

  const forbiddenElements = trimmed.match(/<script\b|onload\s*=|onerror\s*=/i);
  if (forbiddenElements) {
    console.warn('[icon] SVG validation failed: potentially unsafe script content detected.');
    return false;
  }

  return true;
}

function parseAttributes(tag) {
  const attributes = {};
  const attrRegex = /([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*"([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(tag))) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

function parseColor(value) {
  if (!value || value === 'none') {
    return null;
  }

  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return [r / 255, g / 255, b / 255];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r / 255, g / 255, b / 255];
    }
  }

  const rgbMatch = value.match(/rgb\s*\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((part) => parseFloat(part.trim()) / 255);
    if (parts.length === 3) {
      return parts;
    }
  }

  return null;
}

function parseOpacity(value, defaultValue = 1) {
  if (value === undefined) {
    return defaultValue;
  }
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) {
    return defaultValue;
  }
  return Math.min(1, Math.max(0, numeric));
}

function parseGradientCoordinate(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  if (value.endsWith('%')) {
    return parseFloat(value) / 100;
  }
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) {
    return fallback;
  }
  return numeric;
}

function parseGradients(svgContent) {
  const gradients = { linear: {}, radial: {} };
  const defsMatch = svgContent.match(/<defs[\s\S]*?<\/defs>/i);
  if (!defsMatch) {
    return gradients;
  }

  const defs = defsMatch[0];

  const linearRegex = /<linearGradient\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/linearGradient>/gi;
  let linearMatch;
  while ((linearMatch = linearRegex.exec(defs))) {
    const id = linearMatch[1];
    const attributes = parseAttributes(linearMatch[0]);
    const stops = [];
    const stopRegex = /<stop\b[^>]*>/gi;
    let stopMatch;
    while ((stopMatch = stopRegex.exec(linearMatch[2]))) {
      const stopAttrs = parseAttributes(stopMatch[0]);
      const offsetString = stopAttrs.offset || '0%';
      const offset = offsetString.endsWith('%') ? parseFloat(offsetString) / 100 : parseFloat(offsetString);
      const color = parseColor(stopAttrs['stop-color']);
      const opacity = parseOpacity(stopAttrs['stop-opacity'], 1);
      if (color) {
        stops.push({ offset: Math.min(1, Math.max(0, offset)), color, opacity });
      }
    }
    stops.sort((a, b) => a.offset - b.offset);
    gradients.linear[id] = {
      x1: parseGradientCoordinate(attributes.x1 || '0%', 0),
      y1: parseGradientCoordinate(attributes.y1 || '0%', 0),
      x2: parseGradientCoordinate(attributes.x2 || '100%', 1),
      y2: parseGradientCoordinate(attributes.y2 || '0%', 0),
      stops
    };
  }

  const radialRegex = /<radialGradient\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/radialGradient>/gi;
  let radialMatch;
  while ((radialMatch = radialRegex.exec(defs))) {
    const id = radialMatch[1];
    const attributes = parseAttributes(radialMatch[0]);
    const stops = [];
    const stopRegex = /<stop\b[^>]*>/gi;
    let stopMatch;
    while ((stopMatch = stopRegex.exec(radialMatch[2]))) {
      const stopAttrs = parseAttributes(stopMatch[0]);
      const offsetString = stopAttrs.offset || '0%';
      const offset = offsetString.endsWith('%') ? parseFloat(offsetString) / 100 : parseFloat(offsetString);
      const color = parseColor(stopAttrs['stop-color']);
      const opacity = parseOpacity(stopAttrs['stop-opacity'], 1);
      if (color) {
        stops.push({ offset: Math.min(1, Math.max(0, offset)), color, opacity });
      }
    }
    stops.sort((a, b) => a.offset - b.offset);
    gradients.radial[id] = {
      cx: parseGradientCoordinate(attributes.cx || '50%', 0.5),
      cy: parseGradientCoordinate(attributes.cy || '50%', 0.5),
      r: parseGradientCoordinate(attributes.r || '50%', 0.5),
      stops
    };
  }

  return gradients;
}

function parseShapes(svgContent) {
  const shapes = [];
  const contentWithoutDefs = svgContent.replace(/<defs[\s\S]*?<\/defs>/gi, '');
  const shapeRegex = /<(rect|circle)\b[^>]*>/gi;
  let match;
  while ((match = shapeRegex.exec(contentWithoutDefs))) {
    const tag = match[0];
    if (/\/\s*>$/.test(tag) || tag.endsWith('>')) {
      const attributes = parseAttributes(tag);
      const fill = attributes.fill || '#000000';
      const opacity = parseOpacity(attributes.opacity, 1) * parseOpacity(attributes['fill-opacity'], 1);
      const fillRef = fill.startsWith('url(')
        ? { type: 'gradient', id: fill.replace(/^url\(#/, '').replace(/\)$/, '') }
        : { type: 'color', color: parseColor(fill) };

      if (fillRef.type === 'color' && !fillRef.color) {
        continue;
      }

      if (match[1] === 'rect') {
        const x = parseFloat(attributes.x || '0');
        const y = parseFloat(attributes.y || '0');
        const width = parseFloat(attributes.width || '0');
        const height = parseFloat(attributes.height || '0');
        if (width <= 0 || height <= 0) {
          continue;
        }
        const rx = attributes.rx ? parseFloat(attributes.rx) : 0;
        const ry = attributes.ry ? parseFloat(attributes.ry) : rx;
        shapes.push({
          type: 'rect',
          x,
          y,
          width,
          height,
          rx,
          ry,
          fill: fillRef,
          opacity,
          bbox: { x, y, width, height }
        });
      } else if (match[1] === 'circle') {
        const cx = parseFloat(attributes.cx || '0');
        const cy = parseFloat(attributes.cy || '0');
        const r = parseFloat(attributes.r || '0');
        if (r <= 0) {
          continue;
        }
        const bbox = { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
        shapes.push({
          type: 'circle',
          cx,
          cy,
          r,
          fill: fillRef,
          opacity,
          bbox
        });
      }
    }
  }
  return shapes;
}

function parseSvg(svgContent) {
  const svgTag = svgContent.match(/<svg\b[^>]*>/i);
  if (!svgTag) {
    throw new Error('SVG root element not found.');
  }
  const svgAttributes = parseAttributes(svgTag[0]);
  let viewBox;
  if (svgAttributes.viewBox) {
    viewBox = svgAttributes.viewBox.split(/[\s,]+/).map(Number);
  } else {
    const width = parseFloat(svgAttributes.width || '512');
    const height = parseFloat(svgAttributes.height || '512');
    viewBox = [0, 0, width, height];
  }

  const gradients = parseGradients(svgContent);
  const shapes = parseShapes(svgContent);
  return { viewBox, gradients, shapes };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sampleGradient(gradient, u, v) {
  if (!gradient || gradient.stops.length === 0) {
    return [0, 0, 0, 0];
  }

  let t;
  if (gradient.cx !== undefined) {
    const dx = u - gradient.cx;
    const dy = v - gradient.cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = gradient.r || 1;
    t = radius === 0 ? 0 : Math.min(1, Math.max(0, distance / radius));
  } else {
    const dx = gradient.x2 - gradient.x1;
    const dy = gradient.y2 - gradient.y1;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) {
      t = 0;
    } else {
      t = ((u - gradient.x1) * dx + (v - gradient.y1) * dy) / lengthSq;
      t = Math.min(1, Math.max(0, t));
    }
  }

  let lower = gradient.stops[0];
  let upper = gradient.stops[gradient.stops.length - 1];
  for (let i = 0; i < gradient.stops.length; i += 1) {
    if (gradient.stops[i].offset >= t) {
      upper = gradient.stops[i];
      lower = gradient.stops[i - 1] || gradient.stops[i];
      break;
    }
  }

  if (upper === lower) {
    const [r, g, b] = lower.color;
    return [r, g, b, lower.opacity];
  }

  const range = upper.offset - lower.offset || 1;
  const localT = (t - lower.offset) / range;
  const color = [
    lerp(lower.color[0], upper.color[0], localT),
    lerp(lower.color[1], upper.color[1], localT),
    lerp(lower.color[2], upper.color[2], localT)
  ];
  const opacity = lerp(lower.opacity, upper.opacity, localT);
  return [...color, opacity];
}

function sampleFill(fill, gradients, shape, x, y) {
  if (!fill) {
    return null;
  }

  if (fill.type === 'color') {
    return [...fill.color, 1];
  }

  const gradient = gradients.linear[fill.id] || gradients.radial[fill.id];
  if (!gradient) {
    return null;
  }

  const bbox = shape.bbox;
  const u = bbox.width === 0 ? 0 : (x - bbox.x) / bbox.width;
  const v = bbox.height === 0 ? 0 : (y - bbox.y) / bbox.height;
  return sampleGradient(gradient, u, v);
}

function isInsideRect(shape, x, y) {
  if (x < shape.x || x > shape.x + shape.width || y < shape.y || y > shape.y + shape.height) {
    return false;
  }

  if (shape.rx <= 0 && shape.ry <= 0) {
    return true;
  }

  const rx = Math.max(0, shape.rx);
  const ry = Math.max(0, shape.ry);
  const innerLeft = shape.x + rx;
  const innerRight = shape.x + shape.width - rx;
  const innerTop = shape.y + ry;
  const innerBottom = shape.y + shape.height - ry;

  if (x >= innerLeft && x <= innerRight) {
    return true;
  }
  if (y >= innerTop && y <= innerBottom) {
    return true;
  }

  const cornerX = x < innerLeft ? innerLeft : innerRight;
  const cornerY = y < innerTop ? innerTop : innerBottom;
  const dx = (x - cornerX) / rx;
  const dy = (y - cornerY) / ry;
  return dx * dx + dy * dy <= 1;
}

function isInsideCircle(shape, x, y) {
  const dx = x - shape.cx;
  const dy = y - shape.cy;
  return dx * dx + dy * dy <= shape.r * shape.r;
}

function renderSvgToBitmap(parsedSvg, size) {
  const { viewBox, gradients, shapes } = parsedSvg;
  const [minX, minY, width, height] = viewBox;
  const scaleX = width / size;
  const scaleY = height / size;
  const pixels = new Float32Array(size * size * 4);

  for (let py = 0; py < size; py += 1) {
    const svgY = minY + (py + 0.5) * scaleY;
    for (let px = 0; px < size; px += 1) {
      const svgX = minX + (px + 0.5) * scaleX;
      const pixelIndex = (py * size + px) * 4;

      for (const shape of shapes) {
        const inside = shape.type === 'rect' ? isInsideRect(shape, svgX, svgY) : isInsideCircle(shape, svgX, svgY);
        if (!inside) {
          continue;
        }
        const fillSample = sampleFill(shape.fill, gradients, shape, svgX, svgY);
        if (!fillSample) {
          continue;
        }
        const [r, g, b, a] = fillSample;
        const opacity = a * shape.opacity;
        if (opacity <= 0) {
          continue;
        }
        const srcR = r * opacity;
        const srcG = g * opacity;
        const srcB = b * opacity;
        const srcA = opacity;
        const dstR = pixels[pixelIndex];
        const dstG = pixels[pixelIndex + 1];
        const dstB = pixels[pixelIndex + 2];
        const dstA = pixels[pixelIndex + 3];
        const outA = srcA + dstA * (1 - srcA);
        const outR = srcR + dstR * (1 - srcA);
        const outG = srcG + dstG * (1 - srcA);
        const outB = srcB + dstB * (1 - srcA);
        pixels[pixelIndex] = outR;
        pixels[pixelIndex + 1] = outG;
        pixels[pixelIndex + 2] = outB;
        pixels[pixelIndex + 3] = outA;
      }
    }
  }

  const byteBuffer = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    const base = i * 4;
    const alpha = pixels[base + 3];
    if (alpha > 0) {
      byteBuffer[base] = Math.round((pixels[base] / alpha) * 255);
      byteBuffer[base + 1] = Math.round((pixels[base + 1] / alpha) * 255);
      byteBuffer[base + 2] = Math.round((pixels[base + 2] / alpha) * 255);
      byteBuffer[base + 3] = Math.round(alpha * 255);
    } else {
      byteBuffer[base] = 0;
      byteBuffer[base + 1] = 0;
      byteBuffer[base + 2] = 0;
      byteBuffer[base + 3] = 0;
    }
  }
  return byteBuffer;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const chunkType = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([chunkType, data]));
  crc.writeUInt32BE(crcValue, 0);
  return Buffer.concat([length, chunkType, data, crc]);
}

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return ~crc >>> 0;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function encodePng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const rowLength = width * 4;
  const rawData = Buffer.alloc((rowLength + 1) * height);
  for (let y = 0; y < height; y += 1) {
    rawData[y * (rowLength + 1)] = 0; // filter type none
    rgbaBuffer.copy(rawData, y * (rowLength + 1) + 1, y * rowLength, (y + 1) * rowLength);
  }
  const compressed = zlib.deflateSync(rawData);

  const chunks = [
    createChunk('IHDR', ihdrData),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat([signature, ...chunks]);
}

function renderPngs(svgContent) {
  const parsedSvg = parseSvg(svgContent);
  return PNG_SIZES.map((size) => {
    const bitmap = renderSvgToBitmap(parsedSvg, size);
    const pngBuffer = encodePng(size, size, bitmap);
    const pngPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
    fs.writeFileSync(pngPath, pngBuffer);
    return { size, path: pngPath, buffer: pngBuffer };
  });
}

function createIco(pngEntries) {
  const images = ICO_SIZES.map((size) => {
    const match = pngEntries.find((entry) => entry.size === size);
    if (!match) {
      throw new Error(`Missing PNG for ICO size ${size}`);
    }
    return { size, data: match.buffer };
  });

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry[0] = size === 256 ? 0 : size;
    entry[1] = size === 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  const fileBuffer = Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'icon.ico'), fileBuffer);
}

function createIcns(pngEntries) {
  const entries = ICNS_TYPES.map(({ size, type }) => {
    const match = pngEntries.find((entry) => entry.size === size);
    if (!match) {
      throw new Error(`Missing PNG for ICNS size ${size}`);
    }
    const header = Buffer.alloc(8);
    header.write(type, 0, 'ascii');
    header.writeUInt32BE(match.buffer.length + 8, 4);
    return Buffer.concat([header, match.buffer]);
  });

  const totalSize = entries.reduce((size, entry) => size + entry.length, 8);
  const fileHeader = Buffer.alloc(8);
  fileHeader.write('icns', 0, 'ascii');
  fileHeader.writeUInt32BE(totalSize, 4);
  const icnsBuffer = Buffer.concat([fileHeader, ...entries]);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'icon.icns'), icnsBuffer);
}

function writeLinuxIcon(pngEntries) {
  const largest = pngEntries.find((entry) => entry.size === 1024) || pngEntries[0];
  fs.writeFileSync(path.join(OUTPUT_DIR, 'icon.png'), largest.buffer);
}

function run() {
  try {
    ensureOutputDir();
    const svgPath = findSvg();
    let svgContent = svgPath ? fs.readFileSync(svgPath, 'utf8') : null;

    if (!svgContent || !validateSvg(svgContent)) {
      console.warn('[icon] Falling back to bundled SVG asset.');
      svgContent = FALLBACK_SVG;
    } else {
      console.log(`[icon] Using SVG icon at ${path.relative(process.cwd(), svgPath)}`);
    }

    const pngEntries = renderPngs(svgContent);
    createIco(pngEntries);
    createIcns(pngEntries);
    writeLinuxIcon(pngEntries);
    console.log('[icon] Generated icons at', path.relative(process.cwd(), OUTPUT_DIR));
  } catch (err) {
    console.error('[icon] Failed to generate icons:', err);
    process.exit(1);
  }
}

run();
