window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

const pdsDataEndpoint = window.__APP_ENDPOINTS__?.pdsData || '/api/pds';

const getHook = key =>
  document.querySelector(`[data-role="${key}"]`) || document.getElementById(key);

const getOne = selector => document.querySelector(selector);

const pad2 = value => String(value).padStart(2, '0');

const formatTime = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${pad2(mins)}:${pad2(secs)}`;
};

const nowKoreanDateTime = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
};

const defaultCustomers = [
  { id: 1, name: '김재현', tier: 'VIP', phone: '010-1234-5678', campaign: 'VIP 자산관리 서비스', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 },
  { id: 2, name: '이수진', tier: '일반', phone: '010-2345-6789', campaign: '신규 펀드 상품 안내', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 },
  { id: 3, name: '박민호', tier: 'VIP', phone: '010-3456-7890', campaign: 'VIP 자산관리 서비스', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 },
  { id: 4, name: '최윤아', tier: '일반', phone: '010-4567-8901', campaign: 'ISA 계좌 만기 안내', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 },
  { id: 5, name: '정하늘', tier: '일반', phone: '010-5678-9012', campaign: '신규 펀드 상품 안내', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 },
  { id: 6, name: '강서현', tier: 'VIP', phone: '010-6789-0123', campaign: 'VIP 자산관리 서비스', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 },
  { id: 7, name: '윤준서', tier: '일반', phone: '010-7890-1234', campaign: 'ISA 계좌 만기 안내', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 },
  { id: 8, name: '송지우', tier: '일반', phone: '010-8901-2345', campaign: '신규 펀드 상품 안내', assignedAt: '2024-01-20 09:00', status: 'ready', attempts: 0 }
];

let pdsData = {
  customers: defaultCustomers,
  campaigns: ['VIP 자산관리 서비스', '신규 펀드 상품 안내', 'ISA 계좌 만기 안내']
};

let customers = [];
let isDialing = false;
let callTimerInterval = null;
let callSeconds = 0;
let dialAttempts = 0;
let dialSuccess = 0;
let dialFailed = 0;

const startButton = getHook('startDialingBtn');
const pauseButton = getHook('pauseDialingBtn');
const customerList = getOne('#customerList');
const campaignSelect = getOne('.pds-campaign-select');

function setText(key, value) {
  const node = getHook(key);
  if (node) node.textContent = String(value);
}

function getStatusLabel(status) {
  if (status === 'calling') return '발신중';
  if (status === 'oncall') return '통화중';
  if (status === 'failed') return '연결실패';
  if (status === 'completed') return '완료';
  return '대기';
}

function getDialBadgeClass(status) {
  if (status === 'calling') return 'calling';
  if (status === 'failed') return 'failed';
  if (status === 'oncall' || status === 'completed') return 'completed';
  return 'ready';
}

function renderCampaignOptions() {
  if (!campaignSelect) return;

  const values = Array.isArray(pdsData.campaigns) && pdsData.campaigns.length
    ? pdsData.campaigns
    : ['VIP 자산관리 서비스', '신규 펀드 상품 안내', 'ISA 계좌 만기 안내'];

  const fragment = document.createDocumentFragment();
  values.forEach(campaign => {
    const option = document.createElement('option');
    option.textContent = `캠페인: ${campaign}`;
    fragment.appendChild(option);
  });
  campaignSelect.replaceChildren(fragment);
}

function createCustomerRow(customer) {
  const row = document.createElement('div');
  row.className = `customer-row${customer.status === 'calling' ? ' calling' : ''}${customer.status === 'completed' || customer.status === 'failed' ? ' completed' : ''}`;
  row.setAttribute('data-role', 'customer-row');
  row.setAttribute('data-customer-id', String(customer.id));
  row.setAttribute('data-status', customer.status);

  const tierClass = customer.tier === 'VIP' ? 'pds-tier-badge--vip' : 'pds-tier-badge--general';

  row.innerHTML = `
    <div class="pds-row-head">
      <div class="pds-inline-center-2">
        <span class="dial-status ${getDialBadgeClass(customer.status)}"></span>
        <span class="pds-customer-name">${customer.name}</span>
        <span class="pds-tier-badge ${tierClass}">${customer.tier}</span>
      </div>
      <span class="pds-meta-xxs">${getStatusLabel(customer.status)}</span>
    </div>
    <div class="pds-row-contact">
      <i class="fa-solid fa-phone pds-icon-muted"></i>
      <span class="pds-contact-text">${customer.phone}</span>
    </div>
    <p class="pds-campaign-text">
      <i class="fa-solid fa-bullhorn pds-icon-inline-sm"></i>${customer.campaign}
    </p>
    <div class="pds-row-foot">
      <span class="pds-row-meta">배정: ${customer.assignedAt}</span>
      <span class="pds-row-meta">시도: ${customer.attempts || 0}회</span>
    </div>
  `;

  return row;
}

function renderCustomers() {
  if (!customerList) return;
  customerList.replaceChildren(...customers.map(createCustomerRow));
}

function addLog(message, level = 'muted') {
  const log = getHook('dialingLog');
  if (!log) return;

  const line = document.createElement('div');
  if (level === 'ok') line.className = 'pds-log-line--ok';
  else if (level === 'error') line.className = 'pds-log-line--error';
  else line.className = 'pds-log-line--muted';
  line.textContent = `[${nowKoreanDateTime()}] ${message}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function updateSummary() {
  const total = customers.length;
  const completed = customers.filter(item => item.status === 'completed' || item.status === 'failed').length;
  const remain = Math.max(0, total - completed);
  const progress = total ? Math.round((completed / total) * 100) : 0;

  setText('totalCount', total);
  setText('completedCount', completed);
  setText('remainCount', remain);
  setText('dialAttempts', dialAttempts);
  setText('dialSuccess', dialSuccess);
  setText('dialFailed', dialFailed);
  setText('progressPercent', `${progress}%`);

  const circle = getHook('progressCircle');
  if (circle) {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (progress / 100) * circumference;
    circle.style.strokeDashoffset = String(offset);
  }
}

function setCurrentCustomer(customer) {
  if (!customer) {
    setText('currentCustomerName', '대기중');
    setText('currentCustomerPhone', '-');
    setText('callStatus', '연결 대기');
    setText('detailCustomerName', '-');
    setText('detailCustomerPhone', '-');
    setText('detailCustomerGrade', '-');
    setText('detailCampaign', '-');
    const assignNode = getHook('detailAssignTime');
    if (assignNode) assignNode.textContent = '-';
    return;
  }

  setText('currentCustomerName', customer.name);
  setText('currentCustomerPhone', customer.phone);
  setText('detailCustomerName', customer.name);
  setText('detailCustomerPhone', customer.phone);
  setText('detailCustomerGrade', customer.tier);
  setText('detailCampaign', customer.campaign);
  const assignNode = getHook('detailAssignTime');
  if (assignNode) assignNode.textContent = customer.assignedAt || '-';
}

function stopCallTimer() {
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }
}

function startCallTimer() {
  stopCallTimer();
  callSeconds = 0;
  setText('callTimer', '00:00');
  callTimerInterval = setInterval(() => {
    callSeconds += 1;
    setText('callTimer', formatTime(callSeconds));
  }, 1000);
}

function getNextReadyCustomer() {
  return customers.find(item => item.status === 'ready');
}

function completeCurrentCall(customer, success) {
  stopCallTimer();
  customer.status = success ? 'completed' : 'failed';
  setText('callStatus', success ? '연결 대기' : '연결 실패');
  setText('callTimer', '00:00');
  renderCustomers();
  updateSummary();
  setCurrentCustomer(null);

  addLog(
    success
      ? `[완료] ${customer.name} 통화 종료 (${formatTime(callSeconds)})`
      : `[실패] ${customer.name} 연결 실패`,
    success ? 'ok' : 'error'
  );

  setTimeout(() => {
    processNextCustomer();
  }, 800);
}

function processNextCustomer() {
  if (!isDialing) return;

  const target = getNextReadyCustomer();
  if (!target) {
    addLog('[시스템] 모든 고객에 대한 다이얼링이 완료되었습니다.', 'ok');
    pauseDialing();
    return;
  }

  target.status = 'calling';
  target.attempts = (target.attempts || 0) + 1;
  dialAttempts += 1;
  renderCustomers();
  updateSummary();

  setCurrentCustomer(target);
  setText('callStatus', '발신중...');
  addLog(`[발신] ${target.name} (${target.phone}) 연결 시도중...`, 'muted');

  setTimeout(() => {
    if (!isDialing) return;

    const success = Math.random() > 0.3;
    if (success) {
      dialSuccess += 1;
      target.status = 'oncall';
      renderCustomers();
      updateSummary();
      setText('callStatus', '통화중');
      addLog(`[성공] ${target.name} 연결 성공 - 통화 시작`, 'ok');
      startCallTimer();

      setTimeout(() => {
        completeCurrentCall(target, true);
      }, Math.floor(Math.random() * 5000) + 3000);
    } else {
      dialFailed += 1;
      completeCurrentCall(target, false);
    }
  }, 2000);
}

function startDialing() {
  if (isDialing) return;
  isDialing = true;

  if (startButton) {
    startButton.disabled = true;
    startButton.style.opacity = '0.5';
  }
  if (pauseButton) {
    pauseButton.disabled = false;
    pauseButton.style.opacity = '1';
  }

  addLog('[시스템] 자동 다이얼링을 시작합니다...', 'ok');
  processNextCustomer();
}

function pauseDialing() {
  isDialing = false;
  stopCallTimer();

  if (startButton) {
    startButton.disabled = false;
    startButton.style.opacity = '1';
  }
  if (pauseButton) {
    pauseButton.disabled = true;
    pauseButton.style.opacity = '0.5';
  }

  setText('callStatus', '연결 대기');
  addLog('[시스템] 다이얼링이 일시정지되었습니다.', 'muted');
}

function parseCustomersFromDom() {
  const rows = Array.from(document.querySelectorAll('#customerList .customer-row'));
  if (!rows.length) {
    return defaultCustomers.map(item => ({ ...item }));
  }

  return rows.map((row, index) => {
    const name = row.querySelector('.pds-customer-name')?.textContent?.trim() || `고객${index + 1}`;
    const tier = row.querySelector('.pds-tier-badge')?.textContent?.trim() || '일반';
    const phone = row.querySelector('.pds-contact-text')?.textContent?.trim() || '-';
    const campaignText = row.querySelector('.pds-campaign-text')?.textContent?.trim() || '';
    const campaign = campaignText.replace(/^📢\s*/, '').trim();
    const assignText = row.querySelector('.pds-row-foot .pds-row-meta')?.textContent?.trim() || '';
    const assignedAt = assignText.replace(/^배정:\s*/, '') || '-';
    const status = row.getAttribute('data-status') || 'ready';

    return {
      id: Number(row.getAttribute('data-customer-id')) || index + 1,
      name,
      tier,
      phone,
      campaign,
      assignedAt,
      status,
      attempts: 0
    };
  });
}

async function loadPdsData() {
  if (!window.AppApi?.fetchJson) {
    return {};
  }

  try {
    const remoteData = await window.AppApi.fetchJson(pdsDataEndpoint);
    if (remoteData && typeof remoteData === 'object') {
      return remoteData;
    }
  } catch (error) {
    console.warn('[pds] API 데이터 로드 실패, 기본 데이터로 대체합니다.', error);
  }

  return {};
}

function applyPdsData(data) {
  pdsData = {
    ...pdsData,
    ...data
  };

  const sourceCustomers = Array.isArray(data.customers) && data.customers.length
    ? data.customers
    : parseCustomersFromDom();

  customers = sourceCustomers.map((item, index) => ({
    id: Number(item.id) || index + 1,
    name: item.name || `고객${index + 1}`,
    tier: item.tier || '일반',
    phone: item.phone || '-',
    campaign: item.campaign || '일반 상담',
    assignedAt: item.assignedAt || nowKoreanDateTime(),
    status: item.status || 'ready',
    attempts: Number(item.attempts) || 0
  }));
}

function initRealtimeClock() {
  setText('currentTime', nowKoreanDateTime());
  setInterval(() => {
    setText('currentTime', nowKoreanDateTime());
  }, 1000);
}

function bindActions() {
  startButton?.addEventListener('click', startDialing);
  pauseButton?.addEventListener('click', pauseDialing);
}

async function initPdsPage() {
  const loaded = await loadPdsData();
  applyPdsData(loaded);
  renderCampaignOptions();
  renderCustomers();
  updateSummary();
  setCurrentCustomer(null);
  bindActions();
  initRealtimeClock();
}

initPdsPage();
