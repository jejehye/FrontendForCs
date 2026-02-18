window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

const pageData = window.__PAGE_DATA__ || {};
const smsDataEndpoint = window.__APP_ENDPOINTS__?.smsData || '/api/sms';

const selectOne = (standardSelector, legacySelector) =>
  document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

const selectAll = (standardSelector, legacySelector) => {
  const standardNodes = Array.from(document.querySelectorAll(standardSelector));
  if (standardNodes.length) {
    return standardNodes;
  }
  return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
};

const defaultSmsHistoryRecords = [
  { sentAt: '2024-01-20 14:35', templateName: '해외주식 거래 수수료 이벤트', status: '발송완료', phone: '01012345678' },
  { sentAt: '2024-01-19 10:22', templateName: 'ISA 계좌 만기 안내', status: '발송완료', phone: '01098765432' },
  { sentAt: '2024-01-18 11:20', templateName: 'PRIME 고객 투자 세미나', status: '발송완료', phone: '01012345678' },
  { sentAt: '2024-01-12 16:45', templateName: '계좌 비밀번호 변경 완료', status: '발송완료', phone: '01077778888' },
  { sentAt: '2024-01-10 13:30', templateName: '자산관리 상담 예약', status: '예약중', phone: '01012345678' }
];

const defaultSmsData = {
  recipients: [
    { name: '김신한', phone: '010-1234-5678' },
    { name: '이투자', phone: '010-9876-5432' }
  ],
  notices: [],
  templates: [],
  sms_history_records: defaultSmsHistoryRecords
};

let smsData = { ...defaultSmsData, ...pageData };
let smsHistoryRecords = Array.isArray(smsData.sms_history_records) && smsData.sms_history_records.length
  ? smsData.sms_history_records
  : defaultSmsHistoryRecords;

const messageTextarea = selectOne('[data-role="sms-message-input"]', 'textarea');
const charCounter = selectOne('[data-role="sms-char-counter"]', '.char-counter');

const templateList = selectOne('[data-role="template-list"]', '[data-template-list]');
const templatePagination = selectOne('[data-role="template-pagination"]', '[data-template-pagination]');
const templateFirstButton = selectOne('[data-action="template-nav-first"]', '[data-template-nav="first"]');
const templatePrevButton = selectOne('[data-action="template-nav-prev"]', '[data-template-nav="prev"]');
const templateNextButton = selectOne('[data-action="template-nav-next"]', '[data-template-nav="next"]');
const templateLastButton = selectOne('[data-action="template-nav-last"]', '[data-template-nav="last"]');
const templateSearchInput = selectOne('[data-role="template-search"]', '[data-template-search]');

const smsHistoryPhoneInput = selectOne('[data-role="sms-history-phone"]', '[data-sms-history-phone]');
const smsHistorySearchButton = selectOne('[data-action="sms-history-search"]', '[data-sms-history-search]');
const smsHistoryBody = selectOne('[data-role="sms-history-body"]', '[data-sms-history-body]');
const recipientInput = selectOne('[data-role="sms-recipient-input"]');
const recipientAddButton = selectOne('[data-action="sms-recipient-add"]');
const recipientList = document.querySelector('.sms-recipient-list');

const instantSendButton = selectOne('[data-action="sms-send-instant"]', '[data-sms-send="instant"]');
const scheduledSendButton = selectOne('[data-action="sms-send-scheduled"]', '[data-sms-send="scheduled"]');

let templatePageButtons = [];
let activeTemplatePage = 1;
const templatePageSize = 10;
let templatePages = [];

function createRecipientChip(recipient) {
  const chip = document.createElement('span');
  chip.className = 'recipient-chip recipient-chip-primary';
  chip.setAttribute('data-role', 'recipient-chip');
  chip.setAttribute('data-phone', recipient.phone || '');
  chip.innerHTML = `${recipient.name} (${recipient.phone}) <button type="button" class="sms-recipient-remove-btn" data-action="sms-recipient-remove" aria-label="수신자 삭제"><i class="fa-solid fa-xmark sms-icon-danger-hover"></i></button>`;
  return chip;
}

function createNoticeItem(notice) {
  const item = document.createElement('li');
  item.className = 'sms-notice-item';

  const text = document.createElement('span');
  text.className = 'sms-notice-text';

  if (notice.prefix_text) {
    const prefix = document.createElement('span');
    prefix.className = notice.prefix_class || '';
    prefix.textContent = notice.prefix_text;
    text.appendChild(prefix);
    text.appendChild(document.createTextNode(' '));
  }

  text.appendChild(document.createTextNode(notice.text || ''));

  if (notice.has_attachment) {
    const clip = document.createElement('i');
    clip.className = 'fa-solid fa-paperclip sms-notice-clip';
    text.appendChild(document.createTextNode(' '));
    text.appendChild(clip);
  }

  const date = document.createElement('span');
  date.className = 'sms-notice-date';
  date.textContent = notice.date || '';

  item.appendChild(text);
  item.appendChild(date);
  return item;
}

function createTemplateCard(template) {
  const card = document.createElement('div');
  card.className = 'template-card';
  card.setAttribute('data-action', 'template-select');
  if (template.id != null) {
    card.setAttribute('data-template', String(template.id));
  }

  const head = document.createElement('div');
  head.className = 'sms-template-card-head';

  const title = document.createElement('span');
  title.className = 'sms-template-card-title';
  title.textContent = template.title || '';

  const date = document.createElement('span');
  date.className = 'sms-template-card-date';
  date.textContent = template.date || '';

  head.appendChild(title);
  head.appendChild(date);

  const body = document.createElement('p');
  body.className = 'sms-template-card-body';
  body.textContent = template.body || '';

  const foot = document.createElement('div');
  foot.className = `sms-template-card-foot${template.spaced ? ' sms-template-card-foot--spaced' : ''}`;

  const count = document.createElement('span');
  count.className = 'sms-template-char-count';
  count.textContent = template.char_count || '';

  foot.appendChild(count);
  card.appendChild(head);
  card.appendChild(body);
  card.appendChild(foot);
  return card;
}

function renderSmsDynamicBlocks(data) {
  const recipients = Array.isArray(data.recipients) ? data.recipients : [];
  const notices = Array.isArray(data.notices) ? data.notices : [];
  const templates = Array.isArray(data.templates) ? data.templates : [];

  if (recipientList) {
    recipientList.replaceChildren(...recipients.map(createRecipientChip));
  }

  const noticeList = document.querySelector('.sms-notice-list');
  if (noticeList) {
    noticeList.replaceChildren(...notices.map(createNoticeItem));
  }

  if (templateList) {
    templateList.replaceChildren(...templates.map(createTemplateCard));
  }
}

function bindTemplateSelect() {
  selectAll('[data-action="template-select"]', '.template-card').forEach(card => {
    card.addEventListener('click', function handleTemplateSelect() {
      selectAll('[data-action="template-select"]', '.template-card').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');

      const templateText = this.querySelector('p')?.textContent?.trim() || '';

      if (messageTextarea) {
        messageTextarea.value = templateText;
      }

      if (charCounter) {
        charCounter.textContent = `${templateText.length} / 2000`;
      }
    });
  });
}

function initializeTemplatePagination() {
  if (!templateList || !templatePagination || !templateFirstButton || !templatePrevButton || !templateNextButton || !templateLastButton) {
    return;
  }

  const templateCards = Array.from(templateList.querySelectorAll('[data-action="template-select"], .template-card'));

  const buildTemplatePages = cards => {
    templatePages = [];
    for (let index = 0; index < cards.length; index += templatePageSize) {
      templatePages.push(cards.slice(index, index + templatePageSize));
    }
  };

  const setActiveTemplatePage = pageNumber => {
    if (!templatePages.length) {
      const emptyState = document.createElement('div');
      emptyState.className = 'text-xs text-gray-400 text-center py-6';
      emptyState.textContent = '검색 결과가 없습니다.';
      templateList.replaceChildren(emptyState);
      templatePageButtons.forEach(button => button.classList.remove('is-active'));
      templateFirstButton.disabled = true;
      templatePrevButton.disabled = true;
      templateNextButton.disabled = true;
      templateLastButton.disabled = true;
      return;
    }

    const maxPage = templatePages.length;
    activeTemplatePage = Math.min(maxPage, Math.max(1, pageNumber));
    templateList.replaceChildren(...templatePages[activeTemplatePage - 1]);

    templatePageButtons.forEach(button => {
      const page = Number(button.getAttribute('data-target') || button.getAttribute('data-template-page-btn'));
      button.classList.toggle('is-active', page === activeTemplatePage);
    });

    templateFirstButton.disabled = activeTemplatePage === 1;
    templatePrevButton.disabled = activeTemplatePage === 1;
    templateNextButton.disabled = activeTemplatePage === maxPage;
    templateLastButton.disabled = activeTemplatePage === maxPage;
  };

  const rebuildTemplateButtons = () => {
    templatePageButtons.forEach(button => button.remove());

    templatePageButtons = templatePages.map((_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-template-page-btn', String(index + 1));
      button.setAttribute('data-action', 'template-page-btn');
      button.setAttribute('data-target', String(index + 1));
      button.className = 'pagination__btn';
      button.textContent = String(index + 1);
      templatePagination.insertBefore(button, templateNextButton);
      return button;
    });

    templatePageButtons.forEach(button => {
      button.addEventListener('click', () => {
        setActiveTemplatePage(Number(button.getAttribute('data-target') || button.getAttribute('data-template-page-btn')));
      });
    });
  };

  const applyTemplateFilter = () => {
    const keyword = (templateSearchInput?.value || '').trim().toLowerCase();
    const filteredCards = templateCards.filter(card => card.textContent.toLowerCase().includes(keyword));
    buildTemplatePages(filteredCards);
    activeTemplatePage = 1;
    rebuildTemplateButtons();
    setActiveTemplatePage(1);
    bindTemplateSelect();
  };

  buildTemplatePages(templateCards);
  rebuildTemplateButtons();
  setActiveTemplatePage(1);
  bindTemplateSelect();

  templateFirstButton.addEventListener('click', () => setActiveTemplatePage(1));
  templatePrevButton.addEventListener('click', () => setActiveTemplatePage(activeTemplatePage - 1));
  templateNextButton.addEventListener('click', () => setActiveTemplatePage(activeTemplatePage + 1));
  templateLastButton.addEventListener('click', () => setActiveTemplatePage(templatePages.length));

  if (templateSearchInput) {
    templateSearchInput.addEventListener('input', applyTemplateFilter);
  }
}

const normalizePhone = value => value.replace(/[^0-9]/g, '');

const formatRecipientPhone = value => {
  const digits = normalizePhone(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

function addRecipientByPhone(phoneValue) {
  const digits = normalizePhone(phoneValue);
  if (digits.length < 10) {
    alert('전화번호를 정확히 입력해 주세요.');
    recipientInput?.focus();
    return;
  }

  const recipients = Array.isArray(smsData.recipients) ? smsData.recipients : [];
  const exists = recipients.some(item => normalizePhone(item.phone || '') === digits);
  if (exists) {
    alert('이미 추가된 수신자입니다.');
    recipientInput?.focus();
    return;
  }

  recipients.push({
    name: '고객',
    phone: formatRecipientPhone(digits)
  });
  smsData.recipients = recipients;
  renderSmsDynamicBlocks(smsData);

  if (recipientInput) {
    recipientInput.value = '';
    recipientInput.focus();
  }
}

function bindRecipientActions() {
  if (recipientInput) {
    recipientInput.addEventListener('input', () => {
      recipientInput.value = formatRecipientPhone(recipientInput.value);
    });

    recipientInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addRecipientByPhone(recipientInput.value);
      }
    });
  }

  if (recipientAddButton) {
    recipientAddButton.addEventListener('click', () => {
      addRecipientByPhone(recipientInput?.value || '');
    });
  }

  if (recipientList) {
    recipientList.addEventListener('click', event => {
      const removeButton = event.target.closest('[data-action="sms-recipient-remove"]');
      const fallbackIcon = event.target.closest('.sms-icon-danger-hover');
      if (!removeButton && !fallbackIcon) {
        return;
      }

      const chip = event.target.closest('[data-role="recipient-chip"]');
      if (!chip) {
        return;
      }

      const phone = normalizePhone(chip.getAttribute('data-phone') || chip.textContent || '');
      const recipients = Array.isArray(smsData.recipients) ? smsData.recipients : [];
      smsData.recipients = recipients.filter(item => normalizePhone(item.phone || '') !== phone);
      renderSmsDynamicBlocks(smsData);
    });
  }
}

function createHistoryMessageRow(message) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 3;
  cell.className = 'text-center text-xs text-gray-400 py-3';
  cell.textContent = message;
  row.appendChild(cell);
  return row;
}

function createHistoryRecordRow(record) {
  const row = document.createElement('tr');
  row.className = 'hover:bg-blue-50 cursor-pointer';

  const sentAtCell = document.createElement('td');
  sentAtCell.textContent = record.sentAt;
  row.appendChild(sentAtCell);

  const templateCell = document.createElement('td');
  templateCell.textContent = record.templateName;
  row.appendChild(templateCell);

  const statusCell = document.createElement('td');
  statusCell.textContent = record.status;
  row.appendChild(statusCell);

  return row;
}

function renderSmsHistoryRows(records) {
  if (!smsHistoryBody) {
    return;
  }

  if (!records.length) {
    smsHistoryBody.replaceChildren(createHistoryMessageRow('조회 결과가 없습니다.'));
    return;
  }

  smsHistoryBody.replaceChildren(...records.map(createHistoryRecordRow));
}

function handleSmsHistorySearch() {
  const keyword = normalizePhone(smsHistoryPhoneInput?.value || '');

  if (!keyword) {
    if (smsHistoryBody) {
      smsHistoryBody.replaceChildren(createHistoryMessageRow('조회할 고객전화번호를 입력해 주세요.'));
    }
    return;
  }

  const results = smsHistoryRecords.filter(record => record.phone.includes(keyword));
  renderSmsHistoryRows(results);
}

function getRecipientCount() {
  return selectAll('[data-role="recipient-chip"]', '.recipient-chip').length;
}

function validateSend() {
  const message = messageTextarea?.value.trim() || '';
  if (!message) {
    alert('메시지 내용을 입력해 주세요.');
    messageTextarea?.focus();
    return false;
  }

  if (!getRecipientCount()) {
    alert('수신자를 1명 이상 선택해 주세요.');
    return false;
  }

  return true;
}

function bindSendActions() {
  if (instantSendButton) {
    instantSendButton.addEventListener('click', () => {
      if (!validateSend()) return;
      alert(`${getRecipientCount()}명에게 즉시 발송되었습니다.`);
    });
  }

  if (scheduledSendButton) {
    scheduledSendButton.addEventListener('click', () => {
      if (!validateSend()) return;
      const scheduledAt = prompt('예약 발송 시간을 입력하세요. (예: 2024-01-25 09:00)', '2024-01-25 09:00');
      if (!scheduledAt) return;
      alert(`${getRecipientCount()}명에게 ${scheduledAt} 예약 발송되었습니다.`);
    });
  }
}

function bindBasicEvents() {
  if (messageTextarea) {
    messageTextarea.addEventListener('input', function handleMessageInput() {
      if (charCounter) {
        charCounter.textContent = `${this.value.length} / 2000`;
      }
    });
  }

  if (smsHistorySearchButton) {
    smsHistorySearchButton.addEventListener('click', handleSmsHistorySearch);
  }

  if (smsHistoryPhoneInput) {
    smsHistoryPhoneInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSmsHistorySearch();
      }
    });
  }
}

async function loadSmsData() {
  if (!window.AppApi?.fetchJson) {
    return pageData;
  }

  try {
    const remoteData = await window.AppApi.fetchJson(smsDataEndpoint);
    if (remoteData && typeof remoteData === 'object') {
      return remoteData;
    }
  } catch (error) {
    console.warn('[sms] API 데이터 로드 실패, 기본 데이터로 대체합니다.', error);
  }

  return pageData;
}

async function initSmsPage() {
  const loaded = await loadSmsData();
  smsData = { ...defaultSmsData, ...loaded };
  smsHistoryRecords = Array.isArray(smsData.sms_history_records) && smsData.sms_history_records.length
    ? smsData.sms_history_records
    : defaultSmsHistoryRecords;

  renderSmsDynamicBlocks(smsData);
  bindRecipientActions();
  bindBasicEvents();
  initializeTemplatePagination();
  bindSendActions();
}

initSmsPage();
