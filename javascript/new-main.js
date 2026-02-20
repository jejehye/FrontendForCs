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
        <div class="new-main-warning-head">
          <div class="new-main-warning-title">
            <i class="fa-solid fa-triangle-exclamation"></i>
            주의고객정보
          </div>
          <span class="new-main-warning-badge">HIGH RISK</span>
        </div>
        <div class="new-main-warning-content">
          <span class="new-main-warning-item">고액거래 고객</span>
          <span class="new-main-warning-sep">|</span>
          <span class="new-main-warning-item">담당PB 연결 필수</span>
          <span class="new-main-warning-sep">|</span>
          <span class="new-main-warning-item">개인정보 보호 강화 대상</span>
          <span class="new-main-warning-sep">|</span>
          <span class="new-main-warning-item">본인확인 철저</span>
        </div>
      </div>
    `;
    verifyFormSection.insertAdjacentElement('afterend', warningSection);
  }

  const historyArea = document.querySelector('#history-area');
  if (historyArea && !historyArea.querySelector('[data-role="new-main-history-editor"]')) {
    historyArea.innerHTML = `
      <div class="new-main-history-editor" data-role="new-main-history-editor">
        <div class="main-section-header">
          <h3 class="history-editor-title heading-reset">
            <i class="fa-solid fa-pen-to-square history-editor-icon-brand"></i>
            상담이력 입력
          </h3>
          <div class="history-editor-actions history-editor-actions--inline">
            <button type="button" class="btn--history-reset">초기화</button>
            <button type="button" class="btn--history-reset history-editor-save-btn">저장</button>
            <span class="history-editor-timestamp" data-role="current-datetime"></span>
          </div>
        </div>
        <div class="new-main-history-body">
          <div class="new-main-linked-customer">
            <div class="new-main-linked-title">
              <i class="fa-solid fa-link"></i>
              고객정보 자동연동
            </div>
            <div class="new-main-linked-grid">
              <div class="new-main-linked-item">
                <span class="new-main-linked-label">고객명</span>
                <span class="new-main-linked-value" data-role="new-main-linked-name">-</span>
              </div>
              <div class="new-main-linked-item">
                <span class="new-main-linked-label">계좌번호</span>
                <span class="new-main-linked-value" data-role="new-main-linked-account">-</span>
              </div>
              <div class="new-main-linked-item">
                <span class="new-main-linked-label">주민번호</span>
                <span class="new-main-linked-value" data-role="new-main-linked-resident">-</span>
              </div>
            </div>
          </div>
          <div class="history-category-grid">
            <div>
              <label class="history-field-label">대분류</label>
              <select class="field consultation-category-select">
                <option selected>투자상담</option>
                <option>업무처리</option>
                <option>민원/클레임</option>
              </select>
            </div>
            <div>
              <label class="history-field-label">중분류</label>
              <select class="field consultation-category-select">
                <option selected>해외투자</option>
                <option>국내주식</option>
                <option>펀드/ETF</option>
                <option>ISA/연금</option>
              </select>
            </div>
            <div>
              <label class="history-field-label">소분류</label>
              <select class="field consultation-category-select">
                <option selected>해외주식 매수문의</option>
                <option>해외주식 수수료</option>
                <option>환전/외화입출금</option>
                <option>해외시장 운영시간</option>
              </select>
            </div>
          </div>
          <div class="history-note-header">
            <label class="history-note-title">
              <i class="fa-regular fa-note-sticky history-note-icon"></i>상담내용
            </label>
            <span class="history-note-limit">최대 500자</span>
          </div>
          <textarea
            rows="4"
            maxlength="500"
            placeholder="1) 고객 문의사항&#10;2) 안내한 내용&#10;3) 후속 조치(있다면)"
            class="consultation-note field consultation-note-input consultation-note-field"
          ></textarea>
        </div>
      </div>
    `;

    const accountOwnerInput = document.querySelector('#account-owner');
    const accountNumberInput = document.querySelector('#account-number');
    const residentIdInput = document.querySelector('#resident-id');
    const linkedName = historyArea.querySelector('[data-role="new-main-linked-name"]');
    const linkedAccount = historyArea.querySelector('[data-role="new-main-linked-account"]');
    const linkedResident = historyArea.querySelector('[data-role="new-main-linked-resident"]');

    const syncLinkedCustomer = () => {
      if (linkedName) {
        linkedName.textContent = accountOwnerInput?.value?.trim() || '박지민';
      }
      if (linkedAccount) {
        linkedAccount.textContent = accountNumberInput?.value?.trim() || '567-890-1234';
      }
      if (linkedResident) {
        linkedResident.textContent = residentIdInput?.value?.trim() || '920315-2******';
      }
    };

    [accountOwnerInput, accountNumberInput, residentIdInput].forEach(input => {
      if (input) {
        input.addEventListener('input', syncLinkedCustomer);
      }
    });
    syncLinkedCustomer();
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
