window.AppApi = (() => {
  const DEFAULT_TIMEOUT_MS = 8000;

  const isAbsoluteUrl = value => /^https?:\/\//i.test(value || '');

  const normalizeBaseUrl = value => (value || '').replace(/\/+$/, '');

  const normalizePath = value => (value || '').replace(/^\/+/, '');

  const resolveBaseUrl = explicitBase =>
    explicitBase || window.APP_API_BASE || document.body?.dataset?.apiBase || '';

  const buildUrl = (path, explicitBase) => {
    if (isAbsoluteUrl(path)) {
      return path;
    }

    const baseUrl = normalizeBaseUrl(resolveBaseUrl(explicitBase));
    const normalizedPath = normalizePath(path);

    if (!baseUrl) {
      return `/${normalizedPath}`;
    }

    return `${baseUrl}/${normalizedPath}`;
  };

  const fetchJson = async (path, options = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT_MS,
      baseUrl
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const requestHeaders = { ...headers };

    if (body && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(buildUrl(path, baseUrl), {
        method,
        headers: requestHeaders,
        body: body && typeof body !== 'string' ? JSON.stringify(body) : body,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return { fetchJson };
})();
