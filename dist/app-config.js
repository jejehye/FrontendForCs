(function setDefaultAppConfig(windowObject) {
  const defaults = {
    useMock: true,
    apiBase: '',
    endpoints: {
      mainData: '/api/main',
      chatData: '/api/chat',
      pdsData: '/api/pds',
      smsData: '/api/sms',
      callbackData: '/api/callback',
      specificData: '/api/specific',
      mainTransferHts: '/api/main/transfer/hts',
      mainTransferGoldnet: '/api/main/transfer/goldnet'
    }
  };

  const parseBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
    }
    return fallback;
  };

  const apiBase = windowObject.APP_API_BASE || defaults.apiBase;
  const useMock = parseBoolean(
    windowObject.USE_MOCK ?? windowObject.APP_USE_MOCK,
    defaults.useMock
  );
  const existingEndpoints = windowObject.__APP_ENDPOINTS__ || {};

  windowObject.USE_MOCK = useMock;
  windowObject.APP_USE_MOCK = useMock;
  windowObject.APP_API_BASE = apiBase;
  windowObject.__APP_ENDPOINTS__ = {
    ...defaults.endpoints,
    ...existingEndpoints
  };
})(window);
