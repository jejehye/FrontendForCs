#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function remToPx(cssText) {
  return cssText.replace(/(-?\d*\.?\d+)rem\b/g, (_, value) => {
    const px = Number(value) * 16;
    const rounded = Number(px.toFixed(2));
    return `${rounded}px`;
  });
}

async function convertFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const original = await readFile(absolutePath, "utf8");
  const converted = remToPx(original);

  if (converted !== original) {
    await writeFile(absolutePath, converted, "utf8");
    console.log(`Converted rem->px: ${filePath}`);
  } else {
    console.log(`No rem values found: ${filePath}`);
  }
}

async function main() {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.error("Usage: node scripts/convert-rem-to-px.mjs <file...>");
    process.exit(1);
  }

  for (const target of targets) {
    await convertFile(target);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
