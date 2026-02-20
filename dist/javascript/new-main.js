/* New-main page bootstrap entry */

document.addEventListener('DOMContentLoaded', async () => {
  document.body.classList.add('new-main-mode');

  const renderTodaySchedulePanel = () => {
    const noticeArea = document.querySelector('#notice-area');
    if (!noticeArea) {
      return;
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const todayLabel = `${yyyy}년 ${Number(mm)}월 ${Number(dd)}일`;
    const todayRowLabel = `${yyyy}.${mm}.${dd}`;
    const currentStamp = `${yyyy}-${mm}-${dd} ${hh}:${min}:00`;

    const scheduleRows = Array.from({ length: 12 }, (_, index) => ({
      no: index + 1,
      title: `${todayRowLabel} (${['업무', '점검', '안내'][index % 3]}) 일정`,
      updated: currentStamp
    }));

    noticeArea.innerHTML = `
      <section class="new-main-schedule-panel" data-role="new-main-schedule">
        <header class="new-main-schedule-header">
          <h3 class="new-main-schedule-title">주요일정</h3>
          <button type="button" class="new-main-schedule-close" aria-label="주요일정 닫기">×</button>
        </header>
        <div class="new-main-schedule-body">
          <p class="new-main-schedule-date">${todayLabel} 당일일정</p>
          <ul class="new-main-schedule-list">
            <li><strong>[공지사항]</strong></li>
            <li>한국거래소 거래시스템 한시적 인하 종목 안내 (시행일: ${mm}/${dd})</li>
            <li>개인연금 주요 약관 변경 및 수익률 공지</li>
            <li>해외주식 주문 가능시간 / 수수료 안내</li>
          </ul>
        </div>
        <div class="new-main-schedule-table-wrap">
          <table class="new-main-schedule-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>주요일정</th>
                <th>수정일시</th>
              </tr>
            </thead>
            <tbody data-role="new-main-schedule-body"></tbody>
          </table>
          <div class="new-main-schedule-pagination" data-role="new-main-schedule-pagination">
            <button type="button" class="new-main-schedule-page-btn" data-action="schedule-prev" aria-label="이전 페이지">
              <i class="fa-solid fa-angle-left"></i>
            </button>
            <div class="new-main-schedule-page-tabs" data-role="new-main-schedule-page-tabs"></div>
            <button type="button" class="new-main-schedule-page-btn" data-action="schedule-next" aria-label="다음 페이지">
              <i class="fa-solid fa-angle-right"></i>
            </button>
          </div>
        </div>
      </section>
    `;

    const pageSize = 4;
    const totalPages = Math.ceil(scheduleRows.length / pageSize);
    let currentPage = 1;

    const scheduleBody = noticeArea.querySelector('[data-role="new-main-schedule-body"]');
    const pageTabs = noticeArea.querySelector('[data-role="new-main-schedule-page-tabs"]');
    const prevBtn = noticeArea.querySelector('[data-action="schedule-prev"]');
    const nextBtn = noticeArea.querySelector('[data-action="schedule-next"]');

    if (!scheduleBody || !pageTabs || !prevBtn || !nextBtn) {
      return;
    }

    const renderPage = page => {
      currentPage = Math.min(totalPages, Math.max(1, page));
      const start = (currentPage - 1) * pageSize;
      const rows = scheduleRows.slice(start, start + pageSize);

      scheduleBody.innerHTML = rows.map(row => `
        <tr>
          <td>${row.no}</td>
          <td>${row.title}</td>
          <td>${row.updated}</td>
        </tr>
      `).join('');

      pageTabs.innerHTML = Array.from({ length: totalPages }, (_, idx) => {
        const pageNo = idx + 1;
        const activeClass = pageNo === currentPage ? ' is-active' : '';
        return `<button type="button" class="new-main-schedule-page-btn${activeClass}" data-action="schedule-page" data-page="${pageNo}">${pageNo}</button>`;
      }).join('');

      pageTabs.querySelectorAll('[data-action="schedule-page"]').forEach(button => {
        button.addEventListener('click', () => renderPage(Number(button.dataset.page)));
      });

      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;
    };

    prevBtn.addEventListener('click', () => renderPage(currentPage - 1));
    nextBtn.addEventListener('click', () => renderPage(currentPage + 1));
    renderPage(1);
  };

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
      <div class="new-main-topbar-statuses">
        <div class="new-main-status-item">
          <span class="new-main-status-label">업무상태</span>
          <span class="new-main-status-value is-ready">업무</span>
        </div>
        <div class="new-main-status-item">
          <span class="new-main-status-label">로그인여부</span>
          <span class="new-main-status-value is-on">로그인</span>
        </div>
        <div class="new-main-status-item">
          <span class="new-main-status-label">호전환</span>
          <span class="new-main-status-value is-ready">대기</span>
        </div>
        <div class="new-main-status-item">
          <span class="new-main-status-label">지점전환</span>
          <span class="new-main-status-value is-ready">가능</span>
        </div>
      </div>
      <div class="new-main-topbar-actions">
        <button type="button" class="softphone-outbound-btn new-main-topbar-action" data-action="main-open-group-switch-modal" aria-label="그룹전환">
          <i class="fa-solid fa-arrows-rotate"></i>
          그룹전환
        </button>
        <button type="button" class="softphone-outbound-btn new-main-topbar-action" data-action="main-open-outbound-modal" aria-label="아웃바운드">
          <i class="fa-solid fa-phone"></i>
          아웃바운드
        </button>
      </div>
    `;
    chatColumn.prepend(topbar);
  }

  const rightColumn = document.querySelector('#right-column');
  if (rightColumn) {
    rightColumn.querySelectorAll('[data-action="main-open-group-switch-modal"], [data-action="main-open-outbound-modal"]').forEach(button => {
      button.remove();
    });
  }

  const verifyFormSection = document.querySelector('#verify-form');
  if (verifyFormSection && !document.querySelector('[data-role="new-main-status-row"]')) {
    const statusRowSection = document.createElement('section');
    statusRowSection.className = 'new-main-status-row-wrap';
    statusRowSection.setAttribute('data-role', 'new-main-status-row');
    statusRowSection.innerHTML = `
      <div class="chat-status-row">
        <span class="status-badge status-ib">
          <i class="fa-solid fa-headset customer-icon-gap-1"></i>
          I/B
        </span>
        <span class="customer-status-text">
          신한 고객센터 &gt; 투자상담
        </span>
      </div>
    `;
    verifyFormSection.insertAdjacentElement('beforebegin', statusRowSection);
  }

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
  if (historyArea && !document.querySelector('[data-role="new-main-routing-utterance"]')) {
    const utteranceSection = document.createElement('section');
    utteranceSection.className = 'new-main-routing-slot';
    utteranceSection.setAttribute('data-role', 'new-main-routing-utterance');
    utteranceSection.innerHTML = `
      <div class="new-main-routing-panel">
        <div class="new-main-routing-title">음성봇 라우팅 발화</div>
        <div class="new-main-routing-list">
          <article class="new-main-routing-item">
            <div class="new-main-routing-item-head">
              <span class="new-main-routing-speaker">고객</span>
              <span class="new-main-routing-time">17:08:44</span>
            </div>
            <div class="new-main-routing-text">수수료</div>
          </article>
        </div>
      </div>
    `;
    historyArea.parentElement?.insertBefore(utteranceSection, historyArea);
  }

  const warningTabsWrap = document.querySelector('#coaching-area .main-center-warning-wrap');
  if (warningTabsWrap) {
    warningTabsWrap.remove();
  }

  const chatArea = document.querySelector('#chat-area');
  const coachingArea = document.querySelector('#coaching-area');
  if (chatArea && coachingArea && coachingArea.parentElement) {
    chatArea.classList.add('new-main-chat-relocated');
    coachingArea.parentElement.insertBefore(chatArea, coachingArea);
  }

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

  renderTodaySchedulePanel();

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
