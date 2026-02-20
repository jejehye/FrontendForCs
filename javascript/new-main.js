/* New-main page bootstrap entry */

document.addEventListener('DOMContentLoaded', async () => {
  const customerInfoSection = document.querySelector('#customer-info');
  if (customerInfoSection) {
    customerInfoSection.remove();
  }

  const chatColumn = document.querySelector('#chat-column');
  if (chatColumn && !chatColumn.querySelector('[data-role="new-main-topbar"]')) {
    const topbar = document.createElement('section');
    topbar.className = 'new-main-topbar';
    topbar.setAttribute('data-role', 'new-main-topbar');
    topbar.innerHTML = `
      <div class="new-main-topbar-left">
        <button type="button" class="new-main-work-btn" aria-label="업무 상태">
          <span class="new-main-work-dot"></span>
          <span>업무</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <button type="button" class="new-main-vertical-btn" aria-label="그룹전환">
          <i class="fa-solid fa-arrows-rotate"></i>
          <span>그룹전환</span>
        </button>
        <button type="button" class="new-main-vertical-btn" aria-label="아웃바운드">
          <i class="fa-solid fa-phone"></i>
          <span>아웃바운드</span>
        </button>
      </div>
    `;
    chatColumn.prepend(topbar);
  }

  const verifyFormSection = document.querySelector('#verify-form');
  if (verifyFormSection && !document.querySelector('[data-role="new-main-warning"]')) {
    const warningSection = document.createElement('section');
    warningSection.className = 'new-main-warning-slot';
    warningSection.setAttribute('data-role', 'new-main-warning');
    warningSection.innerHTML = `
      <div class="new-main-warning-panel">
        <div class="new-main-warning-title">
          <i class="fa-solid fa-triangle-exclamation"></i>
          주의고객정보
        </div>
        <div class="new-main-warning-content">고액거래 고객 - 담당PB 연결 필수 | 개인정보 보호 강화 대상 - 본인확인 철저</div>
      </div>
    `;
    verifyFormSection.insertAdjacentElement('afterend', warningSection);
  }

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
