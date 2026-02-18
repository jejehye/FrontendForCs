window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

const pageData = window.__PAGE_DATA__ || {};
const callbackDataEndpoint = window.__APP_ENDPOINTS__?.callbackData || '/api/callback';

const selectOne = (standardSelector, legacySelector) =>
  document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

const selectAll = (standardSelector, legacySelector) => {
  const standardNodes = Array.from(document.querySelectorAll(standardSelector));
  if (standardNodes.length) {
    return standardNodes;
  }
  return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
};

const defaultCallbackData = {
  callback_requests: [
    {
      id: 1,
      name: '이지현',
      priority: '긴급',
      elapsed: '15분 전',
      phone: '010-2345-6789',
      description: '해외주식 ISA 계좌 이전 관련 긴급 문의사항 있습니다.',
      requested_at: '2024-01-20 14:20',
      status: 'pending',
      customer_grade: 'S-CLASS',
      risk_profile: '적극투자형'
    },
    {
      id: 2,
      name: '박민수',
      priority: '일반',
      elapsed: '1시간 전',
      phone: '010-8765-4321',
      description: 'S-CLASS 멤버십 혜택 문의드립니다.',
      requested_at: '2024-01-20 13:35',
      status: 'pending',
      customer_grade: 'S-CLASS',
      risk_profile: '적극투자형'
    },
    {
      id: 3,
      name: '최서연',
      priority: '일반',
      elapsed: '2시간 전',
      phone: '010-5555-7777',
      description: '연금저축펀드 추천 상담 요청',
      requested_at: '2024-01-20 12:50',
      status: 'pending',
      customer_grade: 'GOLD',
      risk_profile: '중립투자형'
    },
    {
      id: 4,
      name: '강동훈',
      priority: '완료',
      elapsed: '어제',
      phone: '010-9999-8888',
      description: '신한 알파 랩 서비스 가입 문의',
      requested_at: '2024-01-19 15:55',
      status: 'completed',
      processed_at: '2024-01-19 16:30',
      customer_grade: 'S-CLASS',
      risk_profile: '적극투자형'
    },
    {
      id: 5,
      name: '윤정아',
      priority: '완료',
      elapsed: '어제',
      phone: '010-3333-4444',
      description: '해외 ETF 투자 상담',
      requested_at: '2024-01-19 13:45',
      status: 'completed',
      processed_at: '2024-01-19 14:15',
      customer_grade: 'GOLD',
      risk_profile: '적극투자형'
    }
  ],
  notices: [
    {
      prefix_text: '[고정]',
      prefix_class: 'callback-notice-fixed',
      text: '[일반] 고정공지사항 제목입니다.',
      date: '2021-05-03 14:00',
      has_attachment: true
    },
    {
      prefix_text: '[긴급]',
      prefix_class: 'callback-notice-urgent',
      text: '긴급공지사항 제목입니다.',
      date: '2021-05-03 14:00',
      has_attachment: true
    },
    {
      prefix_text: '',
      prefix_class: '',
      text: '[일반] 일반공지사항 입니다. 확인요청드립니다.',
      date: '2021-05-03 14:00',
      has_attachment: true
    }
  ],
  recent_callback_histories: [
    {
      name: '강동훈',
      status: '완료',
      desc: '신한 알파 랩 서비스 가입 문의 - 상담 완료 및 가입 진행',
      phone: '010-9999-8888',
      date: '2024-01-19 16:30'
    },
    {
      name: '윤정아',
      status: '완료',
      desc: '해외 ETF 투자 상담 - 맞춤형 포트폴리오 제안',
      phone: '010-3333-4444',
      date: '2024-01-19 14:15'
    }
  ],
  callback_request_histories: [
    { requested_at: '2024-01-20 14:20', content: '해외주식 ISA 계좌 이전', status_text: '대기중', status_class: 'pending', processed_at: '-' },
    { requested_at: '2024-01-18 11:30', content: 'S-CLASS 멤버십 문의', status_text: '완료', status_class: 'completed', processed_at: '2024-01-18 15:45' }
  ]
};

let callbackData = { ...defaultCallbackData, ...pageData };
let callbackRequests = Array.isArray(callbackData.callback_requests) && callbackData.callback_requests.length
  ? callbackData.callback_requests.map(item => ({ ...item }))
  : defaultCallbackData.callback_requests.map(item => ({ ...item }));
let activeFilter = 'pending';
let activeCallbackId = null;

function getModal() {
  return selectOne('[data-role="callback-modal"]', '#callbackModal');
}

function getOutboundModal() {
  return selectOne('[data-role="outbound-modal"]', '#outboundCallModal');
}

function formatPhoneNumber(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function nowTimestamp() {
  const date = new Date();
  const pad2 = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function openCallbackModal(callbackId) {
  const modal = getModal();
  if (!modal) return;

  activeCallbackId = callbackId || null;
  const request = callbackRequests.find(item => String(item.id) === String(callbackId));

  const nameNode = document.getElementById('modalCustomerName');
  const phoneNode = document.getElementById('modalCustomerPhone');
  const contentNode = document.getElementById('modalCallbackContent');
  const requestTimeNode = document.getElementById('modalRequestTime');

  if (nameNode) nameNode.textContent = request?.name || '고객';
  if (phoneNode) phoneNode.textContent = request?.phone || '-';
  if (contentNode) contentNode.textContent = request?.description || '요청 내용이 없습니다.';
  if (requestTimeNode) requestTimeNode.textContent = request?.requested_at || '-';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCallbackModal() {
  const modal = getModal();
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function openOutboundModal() {
  const modal = getOutboundModal();
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOutboundModal() {
  const modal = getOutboundModal();
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function renderCallbackFilters() {
  const pendingCount = callbackRequests.filter(item => item.status === 'pending').length;
  const completedCount = callbackRequests.filter(item => item.status === 'completed').length;
  const filterButtons = selectAll('.callback-request-filter-row button');

  if (!filterButtons.length) return;

  const [pendingButton, completedButton] = filterButtons;
  if (pendingButton) {
    pendingButton.innerHTML = `<i class="fa-solid fa-clock callback-icon-inline"></i>대기중 (${pendingCount})`;
    pendingButton.className = activeFilter === 'pending' ? 'callback-request-filter-btn-active' : 'callback-request-filter-btn';
  }

  if (completedButton) {
    completedButton.innerHTML = `<i class="fa-solid fa-check callback-icon-inline"></i>완료 (${completedCount})`;
    completedButton.className = activeFilter === 'completed' ? 'callback-request-filter-btn-active' : 'callback-request-filter-btn';
  }
}

function createCallbackCard(item) {
  const card = document.createElement('div');
  card.className = `callback-card${item.priority === '긴급' ? ' urgent' : ''}${item.status === 'completed' ? ' completed' : ''}`;
  card.setAttribute('data-callback-id', String(item.id));

  const badgeClass = item.status === 'completed'
    ? 'callback-request-type-badge-completed'
    : item.priority === '긴급'
      ? 'callback-request-type-badge-urgent'
      : 'callback-request-type-badge-normal';

  const statusRow = item.status === 'completed'
    ? `<span class="callback-request-meta-text"><i class="fa-solid fa-check-circle callback-icon-inline"></i>완료: ${item.processed_at || '-'}</span><span class="callback-done-label">상담완료</span>`
    : `<span class="callback-request-meta-text"><i class="fa-regular fa-clock callback-icon-inline"></i>요청: ${item.requested_at || '-'}</span><button class="shinhan-btn callback-call-btn" data-action="callback-open-modal"><i class="fa-solid fa-phone callback-icon-inline"></i>콜백 걸기</button>`;

  const phoneIconClass = item.status === 'completed'
    ? 'callback-icon-phone-completed'
    : item.priority === '긴급'
      ? 'callback-icon-phone-urgent'
      : 'callback-icon-phone-default';

  card.innerHTML = `
    <div class="callback-card-header-row">
      <div class="callback-card-header-left">
        <span class="callback-card-title">${item.name || '-'}</span>
        <span class="${badgeClass}">${item.status === 'completed' ? '완료' : item.priority || '일반'}</span>
      </div>
      <span class="callback-card-time">${item.elapsed || ''}</span>
    </div>
    <div class="callback-card-contact-row">
      <i class="fa-solid fa-phone ${phoneIconClass}"></i>
      <span class="callback-card-phone">${item.phone || '-'}</span>
    </div>
    <p class="callback-card-desc">${item.description || ''}</p>
    <div class="callback-card-footer">${statusRow}</div>
  `;

  return card;
}

function renderCallbackCards() {
  const list = document.querySelector('#sms-column .callback-request-list');
  if (!list) return;

  const filtered = callbackRequests.filter(item =>
    activeFilter === 'pending' ? item.status !== 'completed' : item.status === 'completed'
  );

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'callback-card';
    empty.innerHTML = '<p class="callback-card-desc">표시할 콜백 요청이 없습니다.</p>';
    list.replaceChildren(empty);
    return;
  }

  list.replaceChildren(...filtered.map(createCallbackCard));
}

function renderNotices() {
  const list = document.querySelector('.callback-notice-list');
  if (!list) return;
  const notices = Array.isArray(callbackData.notices) ? callbackData.notices : [];

  const items = notices.map(notice => {
    const item = document.createElement('li');
    item.className = 'callback-notice-item';
    item.innerHTML = `
      <span class="callback-notice-text">
        ${notice.prefix_text ? `<span class="${notice.prefix_class || ''}">${notice.prefix_text}</span>` : ''}
        ${notice.text || ''}
        ${notice.has_attachment ? '<i class="fa-solid fa-paperclip callback-icon-attachment"></i>' : ''}
      </span>
      <span class="callback-notice-date">${notice.date || ''}</span>
    `;
    return item;
  });

  list.replaceChildren(...items);
}

function renderRecentHistories() {
  const list = document.querySelector('#center-column .callback-request-list');
  if (!list) return;
  const histories = Array.isArray(callbackData.recent_callback_histories)
    ? callbackData.recent_callback_histories
    : [];

  const cards = histories.map(history => {
    const card = document.createElement('div');
    card.className = 'callback-history-card';
    card.innerHTML = `
      <div class="callback-card-header-row">
        <span class="callback-card-title">${history.name || '-'}</span>
        <span class="callback-status-success-badge">${history.status || ''}</span>
      </div>
      <p class="callback-history-desc">${history.desc || ''}</p>
      <div class="callback-history-meta-row">
        <span><i class="fa-solid fa-phone callback-icon-inline"></i>${history.phone || '-'}</span>
        <span>${history.date || '-'}</span>
      </div>
    `;
    return card;
  });

  list.replaceChildren(...cards);
}

function renderRequestHistories() {
  const body = document.querySelector('.callback-history-body');
  if (!body) return;
  const histories = Array.isArray(callbackData.callback_request_histories)
    ? callbackData.callback_request_histories
    : [];

  const rows = histories.map(row => {
    const tr = document.createElement('tr');
    tr.className = 'callback-history-row';
    tr.innerHTML = `
      <td>${row.requested_at || '-'}</td>
      <td>${row.content || '-'}</td>
      <td${row.status_class === 'unhandled' ? ' class="callback-unhandled-cell"' : ''}>
        <span class="callback-history-badge callback-history-badge--${row.status_class || 'pending'}">${row.status_text || '-'}</span>
      </td>
      <td${row.processed_at === '-' ? ' class="callback-history-empty"' : ''}>${row.processed_at || '-'}</td>
    `;
    return tr;
  });

  body.replaceChildren(...rows);
}

function renderStats() {
  const pending = callbackRequests.filter(item => item.status === 'pending').length;
  const completed = callbackRequests.filter(item => item.status === 'completed').length;
  const processing = Math.max(0, Math.round(pending * 0.5));

  const cards = selectAll('.callback-stats-grid .callback-stat-card .text-2xl, .callback-stats-grid .callback-stat-card > div:first-child');
  if (cards.length >= 3) {
    cards[0].textContent = String(pending);
    cards[1].textContent = String(processing);
    cards[2].textContent = String(completed);
  }

  const summaryValues = selectAll('.callback-summary-value');
  if (summaryValues.length >= 2) {
    summaryValues[0].textContent = pending ? '8분 32초' : '0분 00초';
    const total = pending + completed;
    const rate = total ? ((completed / total) * 100).toFixed(1) : '0.0';
    summaryValues[1].textContent = `${rate}%`;
  }
}

function bindFilterActions() {
  const filterButtons = selectAll('.callback-request-filter-row button');
  if (filterButtons.length < 2) return;

  filterButtons[0].addEventListener('click', () => {
    activeFilter = 'pending';
    renderCallbackFilters();
    renderCallbackCards();
    bindCardActions();
  });

  filterButtons[1].addEventListener('click', () => {
    activeFilter = 'completed';
    renderCallbackFilters();
    renderCallbackCards();
    bindCardActions();
  });
}

function bindCardActions() {
  selectAll('[data-action="callback-open-modal"]', '.callback-card .callback-call-btn').forEach(button => {
    button.addEventListener('click', function handleCallButtonClick() {
      const card = this.closest('[data-callback-id], [data-target="callback-card"]');
      const callbackId = card ? card.dataset.callbackId : null;
      openCallbackModal(callbackId);
    });
  });
}

function submitOutboundCall() {
  const phoneInput = selectOne('[data-role="outbound-phone-input"]');
  const callerIdInputs = selectAll('[data-role="callback-outbound-callerid"]');
  const formattedPhone = formatPhoneNumber(phoneInput?.value || '');
  const selectedCallerId = callerIdInputs.find(input => input.checked)?.value || '';
  if (!formattedPhone || formattedPhone.length < 12) {
    alert('발신할 전화번호를 정확히 입력해 주세요.');
    phoneInput?.focus();
    return;
  }
  if (!selectedCallerId) {
    alert('발신 표시번호를 선택해 주세요.');
    return;
  }
  alert(`${formattedPhone} 번호로 아웃바운드 콜을 발신합니다. (표시번호: ${selectedCallerId})`);
  closeOutboundModal();
}

function completeCallback() {
  if (activeCallbackId != null) {
    const target = callbackRequests.find(item => String(item.id) === String(activeCallbackId));
    if (target) {
      target.status = 'completed';
      target.priority = '완료';
      target.processed_at = nowTimestamp();
      callbackData.callback_request_histories = [
        {
          requested_at: target.requested_at || '-',
          content: target.description || '-',
          status_text: '완료',
          status_class: 'completed',
          processed_at: target.processed_at
        },
        ...(Array.isArray(callbackData.callback_request_histories) ? callbackData.callback_request_histories : [])
      ];
      renderStats();
      renderCallbackFilters();
      renderCallbackCards();
      renderRequestHistories();
      bindCardActions();
    }
  }

  alert('콜백 처리가 완료되었습니다.');
  closeCallbackModal();
}

function bindModalActions() {
  const modalCloseButton = selectOne('[data-action="callback-modal-close"]', '#callbackModal .callback-modal-header button');
  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeCallbackModal);
  }

  const modalCancelButton = selectOne('[data-action="callback-modal-cancel"]', '#callbackModal .callback-modal-actions button:first-child');
  if (modalCancelButton) {
    modalCancelButton.addEventListener('click', closeCallbackModal);
  }

  const modalCompleteButton = selectOne('[data-action="callback-modal-complete"]', '#callbackModal .callback-modal-actions button:last-child');
  if (modalCompleteButton) {
    modalCompleteButton.addEventListener('click', completeCallback);
  }

  const callbackModal = getModal();
  if (callbackModal) {
    callbackModal.addEventListener('click', function onModalOverlayClick(event) {
      if (event.target === this) closeCallbackModal();
    });
  }

  const outboundOpenButton = selectOne('[data-action="callback-open-outbound-modal"]');
  if (outboundOpenButton) {
    outboundOpenButton.addEventListener('click', openOutboundModal);
  }

  const outboundCloseButton = selectOne('[data-action="outbound-modal-close"]');
  if (outboundCloseButton) {
    outboundCloseButton.addEventListener('click', closeOutboundModal);
  }

  const outboundCancelButton = selectOne('[data-action="outbound-modal-cancel"]');
  if (outboundCancelButton) {
    outboundCancelButton.addEventListener('click', closeOutboundModal);
  }

  const outboundSubmitButton = selectOne('[data-action="outbound-call-submit"]');
  if (outboundSubmitButton) {
    outboundSubmitButton.addEventListener('click', submitOutboundCall);
  }

  const outboundPhoneInput = selectOne('[data-role="outbound-phone-input"]');
  if (outboundPhoneInput) {
    outboundPhoneInput.addEventListener('input', event => {
      event.target.value = formatPhoneNumber(event.target.value);
    });
  }

  const outboundModal = getOutboundModal();
  if (outboundModal) {
    outboundModal.addEventListener('click', function onOutboundOverlayClick(event) {
      if (event.target === this) closeOutboundModal();
    });
  }
}

function applyCallbackData(data) {
  callbackData = { ...defaultCallbackData, ...data };
  callbackRequests = Array.isArray(callbackData.callback_requests) && callbackData.callback_requests.length
    ? callbackData.callback_requests.map(item => ({ ...item }))
    : defaultCallbackData.callback_requests.map(item => ({ ...item }));
}

async function loadCallbackData() {
  if (!window.AppApi?.fetchJson) {
    return pageData;
  }

  try {
    const remoteData = await window.AppApi.fetchJson(callbackDataEndpoint);
    if (remoteData && typeof remoteData === 'object') {
      return remoteData;
    }
  } catch (error) {
    console.warn('[callback] API 데이터 로드 실패, 기본 데이터로 대체합니다.', error);
  }

  return pageData;
}

function renderAll() {
  renderNotices();
  renderRecentHistories();
  renderRequestHistories();
  renderStats();
  renderCallbackFilters();
  renderCallbackCards();
}

async function initCallbackPage() {
  const loaded = await loadCallbackData();
  applyCallbackData(loaded);
  renderAll();
  bindFilterActions();
  bindCardActions();
  bindModalActions();
}

const callbackPageModule = window.PageModule?.create({
  name: 'callback',
  state: {
    data: callbackData
  },
  data: {
    load: loadCallbackData,
    hydrate: loaded => {
      applyCallbackData(loaded);
    }
  },
  render: {
    all: () => {
      renderAll();
    }
  },
  events: {
    bind: () => {
      bindFilterActions();
      bindCardActions();
      bindModalActions();
    }
  }
});

if (callbackPageModule) {
  void callbackPageModule.init();
} else {
  initCallbackPage();
}
