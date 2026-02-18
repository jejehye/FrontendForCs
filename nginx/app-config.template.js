(function setRuntimeAppConfig(windowObject) {
  const apiBase = '${APP_API_BASE}';
  const useMockRaw = '${USE_MOCK}';

  const runtimeEndpoints = {
    mainData: '${APP_ENDPOINT_MAIN_DATA}',
    chatData: '${APP_ENDPOINT_CHAT_DATA}',
    pdsData: '${APP_ENDPOINT_PDS_DATA}',
    smsData: '${APP_ENDPOINT_SMS_DATA}',
    callbackData: '${APP_ENDPOINT_CALLBACK_DATA}',
    specificData: '${APP_ENDPOINT_SPECIFIC_DATA}',
    mainTransferHts: '${APP_ENDPOINT_MAIN_TRANSFER_HTS}',
    mainTransferGoldnet: '${APP_ENDPOINT_MAIN_TRANSFER_GOLDNET}'
  };

  const defaults = {
    mainData: '/api/main',
    chatData: '/api/chat',
    pdsData: '/api/pds',
    smsData: '/api/sms',
    callbackData: '/api/callback',
    specificData: '/api/specific',
    mainTransferHts: '/api/main/transfer/hts',
    mainTransferGoldnet: '/api/main/transfer/goldnet'
  };

  const filteredRuntime = Object.entries(runtimeEndpoints).reduce((acc, [key, value]) => {
    if (value && String(value).trim()) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const parseBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
    }
    return fallback;
  };

  const useMock = parseBoolean(
    useMockRaw || windowObject.USE_MOCK || windowObject.APP_USE_MOCK,
    false
  );

  const existingEndpoints = windowObject.__APP_ENDPOINTS__ || {};
  windowObject.USE_MOCK = useMock;
  windowObject.APP_USE_MOCK = useMock;
  windowObject.APP_API_BASE = (apiBase && apiBase.trim()) || windowObject.APP_API_BASE || '';
  windowObject.__APP_ENDPOINTS__ = {
    ...defaults,
    ...existingEndpoints,
    ...filteredRuntime
  };
})(window);
