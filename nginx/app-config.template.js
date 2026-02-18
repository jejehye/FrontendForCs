(function setRuntimeAppConfig(windowObject) {
  const apiBase = '${APP_API_BASE}';

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

  const existingEndpoints = windowObject.__APP_ENDPOINTS__ || {};
  windowObject.APP_API_BASE = (apiBase && apiBase.trim()) || windowObject.APP_API_BASE || '';
  windowObject.__APP_ENDPOINTS__ = {
    ...defaults,
    ...existingEndpoints,
    ...filteredRuntime
  };
})(window);
