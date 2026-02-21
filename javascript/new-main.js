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
  historyEditor: 'new-main-history-editor',
  schedulePanel: 'new-main-schedule',
  scheduleBody: 'new-main-schedule-body',
  schedulePagination: 'new-main-schedule-pagination',
  scheduleTabs: 'new-main-schedule-page-tabs',
  linkedName: 'new-main-linked-name',
  linkedAccount: 'new-main-linked-account',
  linkedResident: 'new-main-linked-resident'
};

const ACTION = {
  openGroupSwitch: 'main-open-group-switch-modal',
  openCallTransfer: 'main-open-call-transfer-modal',
  openOutbound: 'main-open-outbound-modal',
  callTransfer: 'new-main-call-transfer',
  schedulePrev: 'schedule-prev',
  scheduleNext: 'schedule-next',
  schedulePage: 'schedule-page'
};

const SCHEDULE_PAGE_SIZE = 4;

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
          <select class="new-main-status-control new-main-status-control--hidden" data-role="agent-status-select" aria-label="업무상태">
            <option value="ready" selected>업무</option>
            <option value="busy">대기</option>
            <option value="away">이석</option>
            <option value="meeting">교육</option>
            <option value="break">식사</option>
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
      <button type="button" class="softphone-outbound-btn new-main-topbar-action new-main-action-btn new-main-action-btn--secondary" data-action="${ACTION.openGroupSwitch}" aria-label="지점전환">
        <i class="fa-solid fa-building"></i>
        지점전환
      </button>
      <button type="button" class="softphone-outbound-btn new-main-topbar-action new-main-action-btn new-main-action-btn--primary" data-action="${ACTION.openOutbound}" aria-label="아웃바운드">
        <i class="fa-solid fa-phone"></i>
        아웃바운드
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
          <button type="button" class="btn--history-reset btn-common-action btn-common-action--reset">초기화</button>
          <button type="button" class="btn--history-reset history-editor-save-btn btn-common-action btn-common-action--save">저장</button>
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

  const topbarStatusSelect = document.querySelector('.new-main-topbar [data-role="agent-status-select"]');
  const statusSegments = Array.from(document.querySelectorAll('.new-main-topbar .new-main-status-segment'));
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

  if (historyArea && !historyArea.querySelector(`[data-role="${ROLE.historyEditor}"]`)) {
    historyArea.innerHTML = historyEditorTemplate();
    setupHistoryLinkedCustomer(historyArea);
  }

  if (window.MainPageData && typeof window.MainPageData.load === 'function') {
    await window.MainPageData.load();
  }

  renderTodaySchedulePanel();
  promoteHeaderWeight();
  initMainModules();
});
