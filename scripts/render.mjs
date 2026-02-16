import fs from 'node:fs/promises';
import path from 'node:path';
import nunjucks from 'nunjucks';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const srcDir = path.join(rootDir, 'src');
const pagesDir = path.join(srcDir, 'pages');
const distDir = path.join(rootDir, 'dist');

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(srcDir, {
  noCache: true,
}), {
  autoescape: false,
  trimBlocks: false,
  lstripBlocks: false,
});

function renderTemplate(templatePath, context = {}) {
  return new Promise((resolve, reject) => {
    env.render(templatePath, context, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

await fs.mkdir(distDir, { recursive: true });
const entries = await fs.readdir(pagesDir, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.njk')) {
    continue;
  }

  const pageTemplate = path.posix.join('pages', entry.name);
  const outputFileName = entry.name.replace(/\.njk$/, '.html');
  const outputPath = path.join(distDir, outputFileName);
  const html = await renderTemplate(pageTemplate);

  await fs.writeFile(outputPath, html, 'utf8');
  console.log(`Rendered src/${pageTemplate} -> dist/${outputFileName}`);
}
