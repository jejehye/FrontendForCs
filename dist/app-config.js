(function setDefaultAppConfig(windowObject) {
  const defaults = {
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

  const apiBase = windowObject.APP_API_BASE || defaults.apiBase;
  const existingEndpoints = windowObject.__APP_ENDPOINTS__ || {};

  windowObject.APP_API_BASE = apiBase;
  windowObject.__APP_ENDPOINTS__ = {
    ...defaults.endpoints,
    ...existingEndpoints
  };
})(window);
