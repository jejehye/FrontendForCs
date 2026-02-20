/* New-main page bootstrap entry */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.MainPageData && typeof window.MainPageData.load === 'function') {
    await window.MainPageData.load();
  }

  const modules = [
    window.MainPageCustomerInfo,
    window.MainPageTabs,
    window.MainPageHistory,
    window.MainPageActions
  ];

  modules.forEach(module => {
    if (module && typeof module.init === 'function') {
      module.init();
    }
  });
});
