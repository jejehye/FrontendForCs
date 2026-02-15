import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src/pages', 'src/partials'];
const MAX_UTILITIES = 6;

const INLINE_UTILITY_TOKENS = new Set([
  'flex', 'grid', 'block', 'inline', 'inline-block', 'inline-flex', 'hidden',
  'relative', 'absolute', 'fixed', 'sticky', 'static',
  'truncate', 'sr-only', 'container',
  'uppercase', 'lowercase', 'capitalize',
  'transition', 'transform',
]);

const NON_UTILITY_PREFIXES = [
  'callback-', 'pds-', 'sms-', 'chat-', 'journey-', 'consultation-', 'kms-',
  'actionBtn', 'action-btn', 'nav-item', 'info-card', 'quick-reply', 'status-',
  'tab-item', 'shinhan-', 'login-', 'error-', 'logo-', 'input-group', 'checkbox-group',
  'panel', 'card', 'btn', 'badge', 'field', 'table', 'pagination',
  'ui-',
];

async function walkNunjucksFiles(dir) {
  const absDir = path.join(ROOT, dir);
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkNunjucksFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.njk')) {
      files.push(fullPath);
    }
  }

  return files;
}

function isUtilityClass(token) {
  if (!token) return false;
  if (NON_UTILITY_PREFIXES.some((prefix) => token.startsWith(prefix))) return false;
  if (/[A-Z]/.test(token)) return false;
  if (INLINE_UTILITY_TOKENS.has(token)) return true;

  const utilityPatterns = [
    /^[mp][trblxy]?-[^\s]+$/,
    /^space-[xy]-[^\s]+$/,
    /^(?:w|h|size)-[^\s]+$/,
    /^(?:min|max)-[wh]-[^\s]+$/,
    /^(?:text|font|leading|tracking|align)-[^\s]+$/,
    /^(?:bg|from|via|to|opacity)-[^\s]+$/,
    /^(?:border|rounded|shadow|ring)(?:-[^\s]+)?$/,
    /^(?:flex|grid)(?:-[^\s]+)?$/,
    /^(?:col|row|order|basis)-[^\s]+$/,
    /^(?:grow|shrink)(?:-[^\s]+)?$/,
    /^(?:items|justify|content|self|place|gap)-[^\s]+$/,
    /^overflow(?:-[^\s]+)?$/,
    /^(?:whitespace|break)-[^\s]+$/,
    /^(?:cursor|select|pointer-events)-[^\s]+$/,
    /^(?:z|top|right|bottom|left)-[^\s]+$/,
    /^inset(?:-[^\s]+)?$/,
    /^(?:hover|focus|active|disabled|group-hover):[^\s]+$/,
    /^(?:sm|md|lg|xl|2xl):[^\s]+$/,
  ];

  return utilityPatterns.some((pattern) => pattern.test(token));
}

function countLine(content, index) {
  return content.slice(0, index).split('\n').length;
}

function scanFile(filePath, content) {
  const violations = [];
  const classAttrRegex = /class\s*=\s*(["'])([\s\S]*?)\1/g;

  for (const match of content.matchAll(classAttrRegex)) {
    const raw = match[2].replace(/\s+/g, ' ').trim();
    if (!raw) continue;

    const tokens = raw.split(' ').filter(Boolean);
    const utilityCount = tokens.filter(isUtilityClass).length;

    if (utilityCount > MAX_UTILITIES) {
      violations.push({
        file: path.relative(ROOT, filePath),
        line: countLine(content, match.index),
        utilityCount,
        classes: raw,
      });
    }
  }

  return violations;
}

async function main() {
  const files = (await Promise.all(TARGET_DIRS.map((dir) => walkNunjucksFiles(dir)))).flat();
  const violations = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    violations.push(...scanFile(file, content));
  }

  if (violations.length) {
    console.error(`Found ${violations.length} class-length violation(s) (>${MAX_UTILITIES} utility classes):`);
    for (const violation of violations) {
      console.error(`- ${violation.file}:${violation.line} (${violation.utilityCount}) ${violation.classes}`);
    }
    process.exit(1);
  }

  console.log(`OK: scanned ${files.length} template file(s); no class-length violations found.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
