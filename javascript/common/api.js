window.AppApi = (() => {
  const DEFAULT_TIMEOUT_MS = 8000;
  const DEFAULT_RETRY_COUNT = 1;
  const DEFAULT_RETRY_DELAY_MS = 300;
  let pendingRequestCount = 0;

  const isAbsoluteUrl = value => /^https?:\/\//i.test(value || '');

  const normalizeBaseUrl = value => (value || '').replace(/\/+$/, '');

  const normalizePath = value => (value || '').replace(/^\/+/, '');

  const parseBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
    }
    return fallback;
  };

  const isMockEnabled = () => parseBoolean(window.USE_MOCK ?? window.APP_USE_MOCK, false);

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

  const setGlobalLoadingState = isLoading => {
    if (document?.documentElement) {
      document.documentElement.dataset.apiLoading = isLoading ? 'true' : 'false';
    }

    window.dispatchEvent(new CustomEvent('app:api-loading', {
      detail: {
        isLoading,
        pending: pendingRequestCount
      }
    }));
  };

  const beginRequest = () => {
    pendingRequestCount += 1;
    if (pendingRequestCount === 1) {
      setGlobalLoadingState(true);
    }
  };

  const endRequest = () => {
    pendingRequestCount = Math.max(0, pendingRequestCount - 1);
    if (pendingRequestCount === 0) {
      setGlobalLoadingState(false);
    }
  };

  const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  const createApiError = ({ message, status, code, url, method, cause }) => {
    const error = new Error(message);
    error.name = 'AppApiError';
    error.status = status ?? null;
    error.code = code || null;
    error.url = url || null;
    error.method = method || null;
    error.cause = cause || null;
    error.isNetworkError = code === 'NETWORK_ERROR';
    error.isTimeoutError = code === 'TIMEOUT';
    error.userMessage = (() => {
      if (error.isTimeoutError) return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
      if (error.isNetworkError) return '네트워크 연결을 확인해 주세요.';
      if (status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      if (status === 404) return '요청한 데이터를 찾을 수 없습니다.';
      if (status === 401 || status === 403) return '접근 권한이 없습니다.';
      return '요청 처리 중 오류가 발생했습니다.';
    })();
    return error;
  };

  const shouldRetryRequest = ({ method, retryUnsafe, retryableStatusCodes }, error) => {
    const upperMethod = String(method || 'GET').toUpperCase();
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(upperMethod) || retryUnsafe === true;
    if (!isSafeMethod) {
      return false;
    }

    if (error.isTimeoutError || error.isNetworkError) {
      return true;
    }

    if (typeof error.status === 'number') {
      const defaultRetryableStatuses = [408, 429, 500, 502, 503, 504];
      const targetStatuses = Array.isArray(retryableStatusCodes) && retryableStatusCodes.length
        ? retryableStatusCodes
        : defaultRetryableStatuses;
      return targetStatuses.includes(error.status);
    }

    return false;
  };

  const parseErrorResponse = async response => {
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        if (json && typeof json === 'object') {
          return json.message || json.error || '';
        }
      }
      const text = await response.text();
      return (text || '').slice(0, 200);
    } catch (error) {
      return '';
    }
  };

  const fetchJson = async (path, options = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT_MS,
      baseUrl,
      retries = DEFAULT_RETRY_COUNT,
      retryDelay = DEFAULT_RETRY_DELAY_MS,
      retryUnsafe = false,
      retryableStatusCodes = null
    } = options;

    const requestHeaders = { ...headers };
    const requestUrl = buildUrl(path, baseUrl);

    if (body && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    beginRequest();
    try {
      const maxAttempts = Math.max(1, Number(retries) + 1);
      let lastError = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(requestUrl, {
            method,
            headers: requestHeaders,
            body: body && typeof body !== 'string' ? JSON.stringify(body) : body,
            signal: controller.signal
          });

          if (!response.ok) {
            const apiMessage = await parseErrorResponse(response);
            throw createApiError({
              message: apiMessage || `HTTP ${response.status}`,
              status: response.status,
              code: 'HTTP_ERROR',
              url: requestUrl,
              method
            });
          }

          if (response.status === 204) {
            return null;
          }

          return await response.json();
        } catch (error) {
          const wrappedError = (() => {
            if (error?.name === 'AppApiError') {
              return error;
            }

            if (error?.name === 'AbortError') {
              return createApiError({
                message: 'Request timeout',
                code: 'TIMEOUT',
                url: requestUrl,
                method,
                cause: error
              });
            }

            return createApiError({
              message: error?.message || 'Network error',
              code: 'NETWORK_ERROR',
              url: requestUrl,
              method,
              cause: error
            });
          })();

          lastError = wrappedError;
          const canRetry = attempt < maxAttempts
            && shouldRetryRequest({ method, retryUnsafe, retryableStatusCodes }, wrappedError);

          if (!canRetry) {
            throw wrappedError;
          }

          await sleep(retryDelay);
        } finally {
          clearTimeout(timeoutId);
        }
      }

      throw lastError || createApiError({
        message: 'Unknown API error',
        code: 'UNKNOWN_ERROR',
        url: requestUrl,
        method
      });
    } finally {
      endRequest();
    }
  };

  return { fetchJson, isMockEnabled };
})();
