/* New-main page bootstrap entry */

const SELECTOR = {
  chatColumn: '#chat-column',
  rightColumn: '#right-column',
  verifyForm: '#verify-form',
  historyArea: '#history-area',
  chatArea: '#chat-area',
  coachingArea: '#coaching-area',
  noticeArea: '#notice-area',
  customerInfo: '#customer-info',
  rightHistoryEditor: '#right-column .history-editor-panel',
  warningTabsWrap: '#coaching-area .main-center-warning-wrap',
  accountOwner: '#account-owner',
  accountNumber: '#account-number',
  residentId: '#resident-id'
};

const ROLE = {
  topbar: 'new-main-topbar',
  statusRow: 'new-main-status-row',
  warning: 'new-main-warning',
  routingUtterance: 'new-main-routing-utterance',
  csatFeed: 'new-main-csat-feed',
  csatBody: 'new-main-csat-body',
  csatTabs: 'new-main-csat-page-tabs',
  historyEditor: 'new-main-history-editor',
  schedulePanel: 'new-main-schedule',
  scheduleBody: 'new-main-schedule-body',
  schedulePagination: 'new-main-schedule-pagination',
  scheduleTabs: 'new-main-schedule-page-tabs',
  historyLookupModal: 'new-main-history-lookup-modal',
  linkedName: 'new-main-linked-name',
  linkedAccount: 'new-main-linked-account',
  linkedResident: 'new-main-linked-resident'
};

const ACTION = {
  openGroupSwitch: 'main-open-group-switch-modal',
  openCallTransfer: 'main-open-call-transfer-modal',
  openBranchTransfer: 'main-open-branch-transfer-modal',
  openOutbound: 'main-open-outbound-modal',
  callTransfer: 'new-main-call-transfer',
  schedulePrev: 'schedule-prev',
  scheduleNext: 'schedule-next',
  schedulePage: 'schedule-page',
  csatPrev: 'csat-prev',
  csatNext: 'csat-next',
  csatPage: 'csat-page',
  openHistoryLookup: 'new-main-open-history-lookup',
  closeHistoryLookup: 'new-main-close-history-lookup'
};

const SCHEDULE_PAGE_SIZE = 4;
const CSAT_PAGE_SIZE = 4;

function createSection({ className, role, html }) {
  const section = document.createElement('section');
  if (className) {
    section.className = className;
  }
  if (role) {
    section.setAttribute('data-role', role);
  }
  section.innerHTML = html;
  return section;
}

function ensureSection({ anchor, existsSelector, position, section }) {
  if (!anchor || (existsSelector && document.querySelector(existsSelector))) {
    return;
  }

  if (position === 'beforebegin') {
    anchor.insertAdjacentElement('beforebegin', section);
    return;
  }

  if (position === 'afterend') {
    anchor.insertAdjacentElement('afterend', section);
    return;
  }

  if (position === 'prepend') {
    anchor.prepend(section);
  }
}

function mountStatusSegmentToGlobalHeader() {
  const statusWrap = document.querySelector('.new-main-topbar-statuses');
  const segmented = document.querySelector('.new-main-topbar .new-main-status-segmented');
  const headerCenter = document.querySelector('[data-role="app-global-center"]');
  const globalSegmented = headerCenter?.querySelector('.app-global-status-segmented');

  if (!headerCenter) {
    return;
  }

  // Global header now owns the status segmented control for all tabs.
  // In new_main, drop the duplicate topbar status block.
  if (globalSegmented) {
    statusWrap?.remove();
    return;
  }

  if (!segmented) {
    return;
  }
  if (!headerCenter.querySelector('.new-main-status-segmented')) {
    headerCenter.appendChild(segmented);
  }
  if (statusWrap && !statusWrap.querySelector('.new-main-status-segmented')) {
    statusWrap.remove();
  }
}

function bindVerifyClearButton() {
  const clearButton = document.querySelector('[data-action="new-main-clear-verify"]');
  const verifyForm = document.querySelector(SELECTOR.verifyForm);
  if (!clearButton || !verifyForm || clearButton.dataset.bound === 'true') {
    return;
  }

  clearButton.dataset.bound = 'true';
  clearButton.addEventListener('click', () => {
    const fields = verifyForm.querySelectorAll('#account-number, #account-password, #account-owner, #resident-id');
    fields.forEach(field => {
      field.value = '';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });
    verifyForm.querySelector('#account-number')?.focus();
  });
}

function bindAccountPasswordAuthButton() {
  const verifyForm = document.querySelector(SELECTOR.verifyForm);
  const authButton = verifyForm?.querySelector('[data-action="new-main-auth-account-password"]');
  const passwordInput = verifyForm?.querySelector('#account-password');

  if (!verifyForm || !authButton || !passwordInput || authButton.dataset.bound === 'true') {
    return;
  }

  authButton.dataset.bound = 'true';
  authButton.addEventListener('click', () => {
    const accountPassword = passwordInput.value.trim();
    if (!accountPassword) {
      alert('계좌비번을 입력해 주세요.');
      passwordInput.focus();
      return;
    }

    if (!/^\d{4}$/.test(accountPassword)) {
      alert('계좌비번은 숫자 4자리로 입력해 주세요.');
      passwordInput.focus();
      return;
    }

    verifyForm.dataset.accountPasswordVerified = 'true';
    verifyForm.dataset.accountPasswordVerifiedAt = new Date().toISOString();
    verifyForm.dispatchEvent(new CustomEvent('new-main:account-password-verified', { bubbles: true }));
    alert('계좌비번만 인증되었습니다.');
  });
}

function ensureHistoryLookupModal(historyPanel) {
  if (!historyPanel || document.querySelector(`[data-role="${ROLE.historyLookupModal}"]`)) {
    return;
  }

  const historyPanelCopy = historyPanel.cloneNode(true);
  const modal = document.createElement('div');
  modal.className = 'main-outbound-modal new-main-history-lookup-modal';
  modal.setAttribute('data-role', ROLE.historyLookupModal);
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="main-outbound-modal__dialog new-main-history-lookup-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="newMainHistoryLookupTitle">
      <div class="main-outbound-modal__header">
        <h4 id="newMainHistoryLookupTitle" class="main-outbound-modal__title">상담이력 조회</h4>
        <button type="button" class="main-outbound-modal__close" data-action="${ACTION.closeHistoryLookup}" aria-label="닫기">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="main-outbound-modal__body new-main-history-lookup-modal__body"></div>
    </div>
  `;

  modal.querySelector('.new-main-history-lookup-modal__body')?.appendChild(historyPanelCopy);
  document.body.appendChild(modal);
}

function bindHistoryLookupModal() {
  const openButtons = Array.from(document.querySelectorAll(`[data-action="${ACTION.openHistoryLookup}"]`));
  const modal = document.querySelector(`[data-role="${ROLE.historyLookupModal}"]`);

  if (!openButtons.length || !modal) {
    return;
  }

  const closeModal = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
  };

  const openModal = () => {
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
  };

  openButtons.forEach(button => {
    if (button.dataset.bound === 'true') {
      return;
    }
    button.dataset.bound = 'true';
    button.addEventListener('click', openModal);
  });

  modal.querySelectorAll(`[data-action="${ACTION.closeHistoryLookup}"]`).forEach(button => {
    button.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

function getCurrentDateTokens() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  return {
    yyyy,
    mm,
    dd,
    hh,
    min,
    todayLabel: `${yyyy}년 ${Number(mm)}월 ${Number(dd)}일`,
    todayRowLabel: `${yyyy}.${mm}.${dd}`,
    currentStamp: `${yyyy}-${mm}-${dd} ${hh}:${min}:00`
  };
}

function buildScheduleRows(dateTokens) {
  return Array.from({ length: 12 }, (_, index) => ({
    no: index + 1,
    title: `${dateTokens.todayRowLabel} (${['업무', '점검', '안내'][index % 3]}) 일정`,
    updated: dateTokens.currentStamp
  }));
}

function formatTime(value) {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  const seconds = String(value.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function buildCsatRows() {
  const now = new Date();
  const ratings = [
    { label: '매우만족', tone: 'excellent', score: 5 },
    { label: '만족', tone: 'good', score: 4 },
    { label: '보통', tone: 'normal', score: 3 },
    { label: '불만족', tone: 'bad', score: 2 }
  ];
  const source = [
    { agent: '김다은', customer: '박민수', detail: '상품 설명이 명확해서 좋았습니다.' },
    { agent: '이수현', customer: '최지연', detail: '응대가 빨라서 만족합니다.' },
    { agent: '정유진', customer: '송도윤', detail: '추가 확인이 늦어 아쉬웠습니다.' },
    { agent: '박하늘', customer: '한예림', detail: '필요한 안내를 한 번에 받아 좋았습니다.' },
    { agent: '오지훈', customer: '윤서준', detail: '다음 상담 예약 안내가 도움이 되었습니다.' },
    { agent: '최서윤', customer: '김하린', detail: '해결까지 시간이 조금 오래 걸렸습니다.' }
  ];

  return source.map((item, index) => {
    const rating = ratings[index % ratings.length];
    const timestamp = new Date(now.getTime() - (index + 1) * 3 * 60 * 1000);
    return {
      time: formatTime(timestamp),
      agent: item.agent,
      customer: item.customer,
      ratingLabel: rating.label,
      ratingTone: rating.tone,
      score: rating.score,
      detail: item.detail
    };
  });
}

function csatTemplate() {
  return `
    <section class="new-main-csat-panel">
      <header class="new-main-schedule-header">
        <h3 class="new-main-schedule-title new-main-header-strong">고객만족도 결과</h3>
      </header>
      <div class="panel--history-table">
        <div class="main-history-table-wrap new-main-csat-table-wrap">
          <table class="tbl table--history new-main-csat-table" aria-label="고객만족도 결과 목록">
            <thead class="main-history-thead">
            <tr>
              <th class="table__head table__head--time">시간</th>
              <th class="table__head">상담원</th>
              <th class="table__head">고객</th>
              <th class="table__head table__head--io">만족도</th>
              <th class="table__head table__head--summary">남긴 내용</th>
            </tr>
            </thead>
            <tbody class="main-history-body" data-role="${ROLE.csatBody}"></tbody>
          </table>
        </div>
        <div class="new-main-schedule-pagination">
          <button type="button" class="new-main-schedule-page-btn" data-action="${ACTION.csatPrev}" aria-label="이전 페이지">
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <div class="new-main-schedule-page-tabs" data-role="${ROLE.csatTabs}"></div>
          <button type="button" class="new-main-schedule-page-btn" data-action="${ACTION.csatNext}" aria-label="다음 페이지">
            <i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderCsatPagination(csatFeed, rows, pageSize = CSAT_PAGE_SIZE) {
  const csatBody = csatFeed.querySelector(`[data-role="${ROLE.csatBody}"]`);
  const pageTabs = csatFeed.querySelector(`[data-role="${ROLE.csatTabs}"]`);
  const prevBtn = csatFeed.querySelector(`[data-action="${ACTION.csatPrev}"]`);
  const nextBtn = csatFeed.querySelector(`[data-action="${ACTION.csatNext}"]`);

  if (!csatBody || !pageTabs || !prevBtn || !nextBtn) {
    return;
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  let currentPage = 1;

  const renderPage = page => {
    currentPage = Math.min(totalPages, Math.max(1, page));
    const start = (currentPage - 1) * pageSize;
    const visibleRows = rows.slice(start, start + pageSize);

    csatBody.innerHTML = visibleRows
      .map(
        row => `
          <tr class="tbl__row">
            <td class="tbl__cell">${row.time}</td>
            <td class="tbl__cell">${row.agent}</td>
            <td class="tbl__cell tbl__cell--strong">${row.customer}</td>
            <td class="tbl__cell">
              <span class="new-main-csat-badge is-${row.ratingTone}">
                ${row.ratingLabel} (${row.score}/5)
              </span>
            </td>
            <td class="tbl__cell new-main-csat-review">${row.detail}</td>
          </tr>
        `
      )
      .join('');

    pageTabs.innerHTML = Array.from({ length: totalPages }, (_, idx) => {
      const pageNo = idx + 1;
      const activeClass = pageNo === currentPage ? ' is-active' : '';
      return `<button type="button" class="new-main-schedule-page-btn${activeClass}" data-action="${ACTION.csatPage}" data-page="${pageNo}">${pageNo}</button>`;
    }).join('');

    pageTabs.querySelectorAll(`[data-action="${ACTION.csatPage}"]`).forEach(button => {
      button.addEventListener('click', () => renderPage(Number(button.dataset.page)));
    });

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  };

  prevBtn.addEventListener('click', () => renderPage(currentPage - 1));
  nextBtn.addEventListener('click', () => renderPage(currentPage + 1));
  renderPage(1);
}

function scheduleTemplate(dateTokens) {
  return `
    <section class="new-main-schedule-panel" data-role="${ROLE.schedulePanel}">
      <header class="new-main-schedule-header">
        <h3 class="new-main-schedule-title new-main-header-strong">주요일정</h3>
        <button type="button" class="new-main-schedule-close" aria-label="주요일정 닫기">×</button>
      </header>
      <div class="new-main-schedule-body">
        <p class="new-main-schedule-date">${dateTokens.todayLabel} 당일일정</p>
        <ul class="new-main-schedule-list">
          <li><strong>[공지사항]</strong></li>
          <li>한국거래소 거래시스템 한시적 인하 종목 안내 (시행일: ${dateTokens.mm}/${dateTokens.dd})</li>
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
          <tbody data-role="${ROLE.scheduleBody}"></tbody>
        </table>
        <div class="new-main-schedule-pagination" data-role="${ROLE.schedulePagination}">
          <button type="button" class="new-main-schedule-page-btn" data-action="${ACTION.schedulePrev}" aria-label="이전 페이지">
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <div class="new-main-schedule-page-tabs" data-role="${ROLE.scheduleTabs}"></div>
          <button type="button" class="new-main-schedule-page-btn" data-action="${ACTION.scheduleNext}" aria-label="다음 페이지">
            <i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderSchedulePagination(noticeArea, rows, pageSize = SCHEDULE_PAGE_SIZE) {
  const scheduleBody = noticeArea.querySelector(`[data-role="${ROLE.scheduleBody}"]`);
  const pageTabs = noticeArea.querySelector(`[data-role="${ROLE.scheduleTabs}"]`);
  const prevBtn = noticeArea.querySelector(`[data-action="${ACTION.schedulePrev}"]`);
  const nextBtn = noticeArea.querySelector(`[data-action="${ACTION.scheduleNext}"]`);

  if (!scheduleBody || !pageTabs || !prevBtn || !nextBtn) {
    return;
  }

  const totalPages = Math.ceil(rows.length / pageSize);
  let currentPage = 1;

  const renderPage = page => {
    currentPage = Math.min(totalPages, Math.max(1, page));
    const start = (currentPage - 1) * pageSize;
    const visibleRows = rows.slice(start, start + pageSize);

    scheduleBody.innerHTML = visibleRows
      .map(row => `
        <tr>
          <td>${row.no}</td>
          <td>${row.title}</td>
          <td>${row.updated}</td>
        </tr>
      `)
      .join('');

    pageTabs.innerHTML = Array.from({ length: totalPages }, (_, idx) => {
      const pageNo = idx + 1;
      const activeClass = pageNo === currentPage ? ' is-active' : '';
      return `<button type="button" class="new-main-schedule-page-btn${activeClass}" data-action="${ACTION.schedulePage}" data-page="${pageNo}">${pageNo}</button>`;
    }).join('');

    pageTabs.querySelectorAll(`[data-action="${ACTION.schedulePage}"]`).forEach(button => {
      button.addEventListener('click', () => renderPage(Number(button.dataset.page)));
    });

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  };

  prevBtn.addEventListener('click', () => renderPage(currentPage - 1));
  nextBtn.addEventListener('click', () => renderPage(currentPage + 1));
  renderPage(1);
}

function renderTodaySchedulePanel() {
  const noticeArea = document.querySelector(SELECTOR.noticeArea);
  if (!noticeArea) {
    return;
  }

  const dateTokens = getCurrentDateTokens();
  const scheduleRows = buildScheduleRows(dateTokens);

  noticeArea.innerHTML = scheduleTemplate(dateTokens);
  renderSchedulePagination(noticeArea, scheduleRows);
}

function topbarTemplate() {
  return `
    <div class="new-main-topbar-statuses">
      <div class="new-main-status-item new-main-status-item--work">
        <div class="new-main-status-segmented" role="group" aria-label="업무상태 전환">
          <button type="button" class="new-main-status-segment is-active" data-status-value="ready" aria-pressed="true">업무</button>
          <button type="button" class="new-main-status-segment" data-status-value="busy" aria-pressed="false">대기</button>
          <button type="button" class="new-main-status-segment" data-status-value="away" aria-pressed="false">이석</button>
          <button type="button" class="new-main-status-segment" data-status-value="meeting" aria-pressed="false">교육</button>
          <button type="button" class="new-main-status-segment" data-status-value="break" aria-pressed="false">식사</button>
          <button type="button" class="new-main-status-segment" data-status-value="hold" aria-pressed="false">보류</button>
          <select class="new-main-status-control new-main-status-control--hidden" data-role="agent-status-select" aria-label="업무상태">
            <option value="ready" selected>업무</option>
            <option value="busy">대기</option>
            <option value="away">이석</option>
            <option value="meeting">교육</option>
            <option value="break">식사</option>
            <option value="hold">보류</option>
          </select>
        </div>
      </div>
    </div>
    <div class="new-main-topbar-actions">
      <button type="button" class="softphone-outbound-btn new-main-topbar-action new-main-action-btn new-main-action-btn--secondary" data-action="${ACTION.openGroupSwitch}" aria-label="그룹전환">
        <i class="fa-solid fa-arrows-rotate"></i>
        그룹전환
      </button>
      <button type="button" class="softphone-outbound-btn new-main-topbar-action new-main-action-btn new-main-action-btn--secondary" data-action="${ACTION.openCallTransfer}" aria-label="호전환">
        <i class="fa-solid fa-phone-volume"></i>
        호전환
      </button>
      <button type="button" class="softphone-outbound-btn new-main-topbar-action new-main-action-btn new-main-action-btn--secondary" data-action="${ACTION.openBranchTransfer}" aria-label="지점전환">
        <i class="fa-solid fa-building"></i>
        지점전환
      </button>
      <button type="button" class="softphone-outbound-btn new-main-topbar-action new-main-action-btn new-main-action-btn--primary" data-action="${ACTION.openOutbound}" aria-label="아웃바운드">
        <i class="fa-solid fa-phone"></i>
        아웃바운드
      </button>
      <button type="button" class="softphone-outbound-btn new-main-topbar-action new-main-action-btn new-main-action-btn--secondary" data-action="${ACTION.openHistoryLookup}" aria-label="상담이력">
        <i class="fa-solid fa-clock-rotate-left"></i>
        상담이력
      </button>
    </div>
  `;
}

function statusRowTemplate() {
  return `
    <div class="chat-status-row">
      <span class="status-badge status-ib">
        <i class="fa-solid fa-headset customer-icon-gap-1"></i>
        I/B
      </span>
      <span class="customer-status-text">
        신한 고객센터 &gt; 투자상담
      </span>
      <span class="new-main-login-inline" data-role="new-main-login-chip">
        <span class="new-main-login-inline-dot"></span>
        <span data-role="new-main-login-chip-text">로그인</span>
      </span>
    </div>
  `;
}

function warningTemplate() {
  return `
    <div class="new-main-warning-panel">
      <div class="new-main-warning-head">
        <div class="new-main-warning-title new-main-header-strong">
          <i class="fa-solid fa-triangle-exclamation"></i>
          주의고객정보
        </div>
        <span class="new-main-warning-badge">HIGH RISK</span>
      </div>
      <div class="new-main-warning-content">
        <span class="new-main-warning-item">자주 민원을 제기하는 고객으로 상담 시 주의가 필요합니다.</span>
      </div>
    </div>
  `;
}

function routingTemplate() {
  return `
    <div class="new-main-routing-panel">
      <div class="new-main-routing-title new-main-header-strong">음성봇 라우팅 발화</div>
      <div class="new-main-routing-list">
        <article class="new-main-routing-item">
          <div class="new-main-routing-item-head">
            <span class="new-main-routing-speaker">고객</span>
            <span class="new-main-routing-time">17:08:44</span>
          </div>
          <div class="new-main-routing-text">수수료 문의</div>
        </article>
      </div>
    </div>
  `;
}

function historyEditorTemplate() {
  return `
    <div class="new-main-history-editor" data-role="${ROLE.historyEditor}">
      <div class="main-section-header">
        <h3 class="history-editor-title heading-reset new-main-header-strong">
          <i class="fa-solid fa-pen-to-square history-editor-icon-brand"></i>
          상담이력 입력
        </h3>
        <div class="history-editor-actions history-editor-actions--inline">
          <button
            type="button"
            class="history-editor-lookup-btn"
            data-action="${ACTION.openHistoryLookup}"
            aria-label="상담이력 조회 열기"
            title="상담이력 조회"
          >
            <i class="fa-solid fa-clock-rotate-left"></i>
          </button>
          <button type="button" class="btn--history-reset btn-common-action btn-common-action--reset">
            <i class="fa-solid fa-rotate-left history-action-icon-gap"></i>초기화
          </button>
          <button type="button" class="btn--history-reset history-editor-save-btn btn-common-action btn-common-action--save">
            <i class="fa-solid fa-save history-action-icon-gap"></i>저장
          </button>
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
              <span class="new-main-linked-value" data-role="${ROLE.linkedName}">-</span>
            </div>
            <div class="new-main-linked-item">
              <span class="new-main-linked-label">계좌번호</span>
              <span class="new-main-linked-value" data-role="${ROLE.linkedAccount}">-</span>
            </div>
            <div class="new-main-linked-item">
              <span class="new-main-linked-label">주민번호</span>
              <span class="new-main-linked-value" data-role="${ROLE.linkedResident}">-</span>
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
}

function setupHistoryLinkedCustomer(historyArea) {
  const accountOwnerInput = document.querySelector(SELECTOR.accountOwner);
  const accountNumberInput = document.querySelector(SELECTOR.accountNumber);
  const residentIdInput = document.querySelector(SELECTOR.residentId);

  const linkedName = historyArea.querySelector(`[data-role="${ROLE.linkedName}"]`);
  const linkedAccount = historyArea.querySelector(`[data-role="${ROLE.linkedAccount}"]`);
  const linkedResident = historyArea.querySelector(`[data-role="${ROLE.linkedResident}"]`);

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

function promoteHeaderWeight() {
  const headerTargets = document.querySelectorAll(
    '.account-panel-title, .main-my-history-title, #chat-area .main-live-header .weight-semibold, #coaching-area .main-coaching-header .weight-semibold'
  );

  headerTargets.forEach(element => {
    element.classList.add('new-main-header-strong');
  });
}

function syncLoginChipState() {
  const loginChip = document.querySelector('[data-role="new-main-login-chip"]');
  const loginChipText = document.querySelector('[data-role="new-main-login-chip-text"]');
  if (!loginChip || !loginChipText) {
    return;
  }

  const agentId = (localStorage.getItem('currentAgentId') || '').trim();
  const agentName = (localStorage.getItem('currentAgentName') || '').trim();
  const isLoggedIn = Boolean(agentId || agentName);

  loginChip.classList.toggle('is-online', isLoggedIn);
  loginChip.classList.toggle('is-offline', !isLoggedIn);
  loginChipText.textContent = isLoggedIn ? '로그인' : '로그오프';
}

function initMainModules() {
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
}

document.addEventListener('DOMContentLoaded', async () => {
  document.body.classList.add('new-main-mode');

  document.querySelector(SELECTOR.customerInfo)?.remove();

  const chatColumn = document.querySelector(SELECTOR.chatColumn);
  const rightColumn = document.querySelector(SELECTOR.rightColumn);
  const verifyFormSection = document.querySelector(SELECTOR.verifyForm);
  const historyArea = document.querySelector(SELECTOR.historyArea);
  const chatArea = document.querySelector(SELECTOR.chatArea);
  const coachingArea = document.querySelector(SELECTOR.coachingArea);
  const myHistoryPanel = rightColumn?.querySelector('.main-my-history-panel');
  const rightTopBarSection = rightColumn?.querySelector('.panel-header-actions-only')?.closest('section');

  rightTopBarSection?.remove();

  ensureSection({
    anchor: chatColumn,
    existsSelector: `[data-role="${ROLE.topbar}"]`,
    position: 'prepend',
    section: createSection({
      className: 'new-main-topbar',
      role: ROLE.topbar,
      html: topbarTemplate()
    })
  });

  const topbarStatusSelect = document.querySelector('.new-main-status-segmented [data-role="agent-status-select"]');
  const statusSegments = Array.from(document.querySelectorAll('.new-main-status-segmented .new-main-status-segment'));
  if (topbarStatusSelect && statusSegments.length) {
    const syncStatusSegments = value => {
      statusSegments.forEach(segment => {
        const isActive = segment.getAttribute('data-status-value') === value;
        segment.classList.toggle('is-active', isActive);
        segment.setAttribute('aria-pressed', String(isActive));
      });
    };

    syncStatusSegments(topbarStatusSelect.value);
    topbarStatusSelect.addEventListener('change', event => {
      syncStatusSegments(event.target.value);
    });

    statusSegments.forEach(segment => {
      segment.addEventListener('click', () => {
        const value = segment.getAttribute('data-status-value');
        if (!value || topbarStatusSelect.value === value) {
          return;
        }
        topbarStatusSelect.value = value;
        topbarStatusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  mountStatusSegmentToGlobalHeader();
  bindVerifyClearButton();
  bindAccountPasswordAuthButton();

  rightColumn?.querySelectorAll(`[data-action="${ACTION.openGroupSwitch}"], [data-action="${ACTION.openOutbound}"]`)
    .forEach(button => button.remove());

  ensureSection({
    anchor: verifyFormSection,
    existsSelector: `[data-role="${ROLE.statusRow}"]`,
    position: 'beforebegin',
    section: createSection({
      className: 'new-main-status-row-wrap',
      role: ROLE.statusRow,
      html: statusRowTemplate()
    })
  });
  syncLoginChipState();
  window.addEventListener('storage', syncLoginChipState);

  ensureSection({
    anchor: verifyFormSection,
    existsSelector: `[data-role="${ROLE.warning}"]`,
    position: 'afterend',
    section: createSection({
      className: 'new-main-warning-slot',
      role: ROLE.warning,
      html: warningTemplate()
    })
  });

  ensureSection({
    anchor: historyArea,
    existsSelector: `[data-role="${ROLE.routingUtterance}"]`,
    position: 'beforebegin',
    section: createSection({
      className: 'new-main-routing-slot',
      role: ROLE.routingUtterance,
      html: routingTemplate()
    })
  });

  document.querySelector(SELECTOR.rightHistoryEditor)?.remove();
  document.querySelector(SELECTOR.warningTabsWrap)?.remove();

  if (chatArea && coachingArea && coachingArea.parentElement) {
    chatArea.classList.add('new-main-chat-relocated');
    coachingArea.parentElement.insertBefore(chatArea, coachingArea);
  }

  if (coachingArea && myHistoryPanel) {
    myHistoryPanel.replaceWith(coachingArea);
  } else if (coachingArea && rightColumn && !rightColumn.contains(coachingArea)) {
    rightColumn.appendChild(coachingArea);
  }

  ensureHistoryLookupModal(myHistoryPanel);

  if (coachingArea && coachingArea.parentElement) {
    const csatRows = buildCsatRows();
    ensureSection({
      anchor: coachingArea,
      existsSelector: `[data-role="${ROLE.csatFeed}"]`,
      position: 'beforebegin',
      section: createSection({
        className: 'new-main-csat-slot',
        role: ROLE.csatFeed,
        html: csatTemplate()
      })
    });
    const csatFeed = document.querySelector(`[data-role="${ROLE.csatFeed}"]`);
    if (csatFeed) {
      renderCsatPagination(csatFeed, csatRows);
    }
  }

  if (historyArea && !historyArea.querySelector(`[data-role="${ROLE.historyEditor}"]`)) {
    historyArea.innerHTML = historyEditorTemplate();
    setupHistoryLinkedCustomer(historyArea);
  }
  bindHistoryLookupModal();

  if (window.MainPageData && typeof window.MainPageData.load === 'function') {
    await window.MainPageData.load();
  }

  renderTodaySchedulePanel();
  promoteHeaderWeight();
  initMainModules();
});
