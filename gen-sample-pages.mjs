import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'comics')

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const head = Buffer.alloc(4)
  head.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const tail = Buffer.alloc(4)
  tail.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([head, typeBuf, data, tail])
}

function writePng(file, width, height, pixel) {
  const raw = Buffer.alloc((width * 3 + 1) * height)
  let p = 0
  for (let y = 0; y < height; y++) {
    raw[p++] = 0
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y, width, height)
      raw[p++] = r
      raw[p++] = g
      raw[p++] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, png)
  return png.length
}

function panelRects(seed) {
  const shift = (seed % 3) * 0.04
  return [
    [0.06, 0.06 + shift, 0.88, 0.3],
    [0.06, 0.4, 0.44, 0.52],
    [0.54, 0.4, 0.4, 0.52],
    [0.06, 0.76, 0.88, 0.18],
  ]
}

function pagePixel(seed, hue) {
  const rects = panelRects(seed)
  return (x, y, w, h) => {
    for (let i = 0; i < rects.length; i++) {
      const [rx, ry, rw, rh] = rects[i]
      const inX = x >= rx * w && x < (rx + rw) * w
      const inY = y >= ry * h && y < (ry + rh) * h
      if (!inX || !inY) continue
      const edge = x < rx * w + 4 || x > (rx + rw) * w - 6 || y < ry * h + 4 || y > (ry + rh) * h - 6
      const tone = edge ? 24 : 150 + (((x >> 4) + (y >> 4) + seed * 7 + i * 11) % 5) * 16
      return [tone, tone, tone]
    }
    const paper = 232 - ((seed * 3) % 4)
    return [paper, paper - hue, paper - hue * 2]
  }
}

function coverPixel(hue) {
  return (x, y, w, h) => {
    const t = y / h
    const band = x > 0.1 * w && x < 0.9 * w && t > 0.55 && t < 0.72
    if (band) return [40, 40, 48]
    const r = Math.round(90 + 120 * t)
    const g = Math.round(70 + 90 * t - hue * 20)
    const b = Math.round(140 - 60 * t + hue * 10)
    return [r, g, b]
  }
}

const PLAN = [
  { comic: '示例作品-A', cover: true, chapters: [['第01话', 8], ['第02话', 6], ['第03话', 10]] },
  { comic: '示例作品-B', cover: true, chapters: [['第01话', 5]] },
  { comic: '条漫示例-C', strip: true, cover: false, chapters: [['第01话', 6]] },
]

let count = 0
let bytes = 0
for (const entry of PLAN) {
  const comicDir = path.join(ROOT, entry.comic)
  if (entry.cover) {
    const w = 600
    const h = 840
    bytes += writePng(path.join(comicDir, 'cover.png'), w, h, coverPixel(count % 3))
    count++
  }
  let seed = 0
  for (const [chapter, pages] of entry.chapters) {
    for (let i = 1; i <= pages; i++) {
      const w = entry.strip ? 480 : 620
      const h = entry.strip ? 1600 : 880
      const file = path.join(comicDir, chapter, `${String(i).padStart(3, '0')}.png`)
      bytes += writePng(file, w, h, pagePixel(seed, seed % 3))
      seed++
      count++
    }
  }
}

console.log(`生成 ${count} 个占位图片，共 ${(bytes / 1024).toFixed(0)} KB`)
console.log(`输出目录：${ROOT}`)
