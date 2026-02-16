import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const pagesDir = path.join(rootDir, 'src', 'pages');
const partialsDir = path.join(rootDir, 'src', 'partials');
const distDir = path.join(rootDir, 'dist');

const appPageConfigs = {
  'main.njk': {
    title: 'CTI Agent Dashboard',
    pageCss: 'main.css',
    activePage: 'main.html',
    contentPartial: path.join(partialsDir, 'pages', 'main', 'content.njk'),
    scriptSrc: 'javascript/main.js',
  },
  'chat.njk': {
    title: '채팅 상담',
    pageCss: 'chat.css',
    activePage: 'chat.html',
    contentPartial: path.join(partialsDir, 'pages', 'chat', 'content.njk'),
    scriptSrc: 'javascript/chat.js',
  },
};

async function resolveIncludes(template, currentDir, includeStack = []) {
  const includeRegex = /\{%\s*include\s+"([^"]+)"\s*%\}/;
  let resolved = template;

  while (true) {
    const match = resolved.match(includeRegex);
    if (!match) {
      break;
    }

    const includePath = match[1];
    const absolutePath = includePath.startsWith('.')
      ? path.resolve(currentDir, includePath)
      : path.join(rootDir, 'src', includePath);

    if (includeStack.includes(absolutePath)) {
      throw new Error(`Circular include detected: ${includePath}`);
    }

    const includeContent = await fs.readFile(absolutePath, 'utf8');
    const nestedContent = await resolveIncludes(
      includeContent,
      path.dirname(absolutePath),
      [...includeStack, absolutePath],
    );

    resolved = resolved.replace(match[0], nestedContent);
  }

  return resolved;
}

function renderSidebar(activePage) {
  const navItems = [
    ['main.html', 'Main', 'fa-headset'],
    ['pds.html', 'PDS', 'fa-phone-volume'],
    ['sms.html', 'SMS', 'fa-comment-sms'],
    ['callback.html', 'Callback', 'fa-phone'],
    ['specific.html', 'Specific', 'fa-user-check'],
    ['chat.html', 'Chat', 'fa-comments'],
  ];

  const navMarkup = navItems
    .map(([page, title, icon]) => {
      const activeClass = activePage === page ? ' active' : '';
      return `  <div data-page="${page}" title="${title}" class="nav-item${activeClass}"><i class="fa-solid ${icon}"></i></div>`;
    })
    .join('\n');

  return `<div id="sidebar" class="column col-sidebar">
  <div class="mb-6">
    <div class="sidebar-logo">S</div>
  </div>
${navMarkup}
  <div title="Settings" class="nav-item mt-auto mb-4"><i class="fa-solid fa-gear"></i></div>
</div>`;
}

function renderAppShell({ title, pageCss, activePage, appContent, scriptSrc }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="./app.css">
  <link rel="stylesheet" href="./vendor/fontawesome/css/all.min.css">
  <script src="./vendor/fontawesome/js/all.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <link rel="stylesheet" href="css/${pageCss}">
</head>
<body>
  <div id="app-container" class="grid-layout">
${renderSidebar(activePage)}
${appContent}
  </div>
  <script src="${scriptSrc}"></script>
</body>
</html>
`;
}

async function renderLoginPage() {
  const form = await fs.readFile(path.join(partialsDir, 'pages', 'login', 'form.njk'), 'utf8');
  const footer = await fs.readFile(path.join(partialsDir, 'pages', 'login', 'footer.njk'), 'utf8');

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CTI Agent Login</title>
  <link rel="stylesheet" href="css/login.css">
</head>
<body>
<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <div class="logo-section">
        <div class="logo-text">신한투자증권</div>
        <div class="logo-subtext">CTI Web 상담환경</div>
      </div>
    </div>

    <div class="login-body">
      <div id="errorMessage" class="error-message">
        <span class="error-icon">!</span>
        <span id="errorText">사번 또는 비밀번호가 올바르지 않습니다.</span>
      </div>

${form}
${footer}
    </div>
  </div>
</div>
<script src="javascript/login.js"></script>
</body>
</html>
`;
}

await fs.mkdir(distDir, { recursive: true });
const entries = await fs.readdir(pagesDir, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.njk')) {
    continue;
  }

  const outputFileName = entry.name.replace(/\.njk$/, '.html');
  const outputPath = path.join(distDir, outputFileName);

  let html;
  if (entry.name === 'login.njk') {
    html = await renderLoginPage();
  } else if (appPageConfigs[entry.name]) {
    const cfg = appPageConfigs[entry.name];
    const appContent = await fs.readFile(cfg.contentPartial, 'utf8');
    html = renderAppShell({
      title: cfg.title,
      pageCss: cfg.pageCss,
      activePage: cfg.activePage,
      appContent,
      scriptSrc: cfg.scriptSrc,
    });
  } else {
    html = await fs.readFile(path.join(pagesDir, entry.name), 'utf8');
  }

  html = await resolveIncludes(html, pagesDir);
  await fs.writeFile(outputPath, html, 'utf8');
  console.log(`Rendered src/pages/${entry.name} -> dist/${outputFileName}`);
}
