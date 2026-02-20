import fs from 'node:fs/promises';
import path from 'node:path';
import nunjucks from 'nunjucks';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const srcDir = path.join(rootDir, 'src');
const pagesDir = path.join(srcDir, 'pages');
const dataDir = path.join(srcDir, 'data');
const distDir = path.join(rootDir, 'dist');

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(srcDir, {
  noCache: true,
}), {
  autoescape: false,
  trimBlocks: false,
  lstripBlocks: false,
});
env.addFilter('tojson', value => JSON.stringify(value ?? {}));
const assetVersion = process.env.ASSET_VERSION || Date.now().toString();
env.addGlobal('asset', (assetPath) => {
  if (typeof assetPath !== 'string' || assetPath.length === 0) {
    return assetPath;
  }
  const delimiter = assetPath.includes('?') ? '&' : '?';
  return `${assetPath}${delimiter}v=${encodeURIComponent(assetVersion)}`;
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

async function loadPageData(pageFileName) {
  const dataFileName = pageFileName.replace(/\.njk$/, '.json');
  const dataPath = path.join(dataDir, dataFileName);

  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

await fs.mkdir(distDir, { recursive: true });
const entries = await fs.readdir(pagesDir, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.njk')) {
    continue;
  }

  const pageTemplate = path.posix.join('pages', entry.name);
  const pageName = entry.name.replace(/\.njk$/, '');
  const outputFileName = entry.name.replace(/\.njk$/, '.html');
  const outputPath = path.join(distDir, outputFileName);
  const pageData = await loadPageData(entry.name);
  const html = await renderTemplate(pageTemplate, { page_data: pageData });

  await fs.writeFile(outputPath, html, 'utf8');
  console.log(`Rendered src/${pageTemplate} -> dist/${outputFileName}`);

  // Also emit pretty-URL entry points so /page works on static servers without rewrite rules.
  if (pageName !== 'index') {
    const prettyDir = path.join(distDir, pageName);
    const prettyIndexPath = path.join(prettyDir, 'index.html');
    await fs.mkdir(prettyDir, { recursive: true });
    await fs.writeFile(prettyIndexPath, html, 'utf8');
    console.log(`Rendered src/${pageTemplate} -> dist/${pageName}/index.html`);
  }
}
