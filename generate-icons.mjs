#!/usr/bin/env node
// generate-icons.mjs
// Roda UMA VEZ localmente para gerar os ícones PWA a partir do favicon.png
// Requer: npm install sharp -D

import sharp from "sharp";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

const INPUT = "./client/public/favicon.png";
const OUTPUT_DIR = "./client/public/icons";

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  if (!existsSync(INPUT)) {
    console.error(`❌ Arquivo não encontrado: ${INPUT}`);
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const size of SIZES) {
    const outPath = `${OUTPUT_DIR}/icon-${size}.png`;
    await sharp(INPUT)
      .resize(size, size, { fit: "contain", background: { r: 15, g: 15, b: 15, alpha: 1 } })
      .png()
      .toFile(outPath);
    console.log(`✅ Gerado: icon-${size}.png`);
  }

  console.log("\n✨ Ícones gerados em", OUTPUT_DIR);
  console.log("👉 Atualize o manifest.json se quiser mais tamanhos.");
}

main().catch(console.error);
