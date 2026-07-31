import sharp from 'sharp'
import { mkdirSync } from 'fs'

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#030712"/>
  <circle cx="256" cy="256" r="180" fill="#22c55e" opacity="0.15"/>
  <circle cx="256" cy="256" r="120" fill="#22c55e" opacity="0.25"/>
  <circle cx="256" cy="256" r="60" fill="#22c55e"/>
  <text x="256" y="280" font-size="80" text-anchor="middle" fill="white">🌍</text>
  <text x="256" y="420" font-size="36" font-weight="bold" text-anchor="middle" fill="#22c55e" font-family="Arial">PRITHVI PULSE</text>
</svg>
`

try { mkdirSync('public', { recursive: true }) } catch {}

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icon-512.png')

console.log('✅ Icons generated!')