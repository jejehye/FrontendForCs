window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

const selectOne = (standardSelector, legacySelector) =>
  document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

const selectAll = (standardSelector, legacySelector) => {
  const standardNodes = Array.from(document.querySelectorAll(standardSelector));
  if (standardNodes.length) {
    return standardNodes;
  }
  return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
};

const messageTextarea = selectOne('[data-role="sms-message-input"]', 'textarea');
const charCounter = selectOne('[data-role="sms-char-counter"]', '.char-counter');

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

if (messageTextarea) {
  messageTextarea.addEventListener('input', function handleMessageInput() {
    if (charCounter) {
      charCounter.textContent = `${this.value.length} / 2000`;
    }
  });
}

const templateList = selectOne('[data-role="template-list"]', '[data-template-list]');
const templatePagination = selectOne('[data-role="template-pagination"]', '[data-template-pagination]');
const templateFirstButton = selectOne('[data-action="template-nav-first"]', '[data-template-nav="first"]');
const templatePrevButton = selectOne('[data-action="template-nav-prev"]', '[data-template-nav="prev"]');
const templateNextButton = selectOne('[data-action="template-nav-next"]', '[data-template-nav="next"]');
const templateLastButton = selectOne('[data-action="template-nav-last"]', '[data-template-nav="last"]');
const templateSearchInput = selectOne('[data-role="template-search"]', '[data-template-search]');

let templatePageButtons = selectAll('[data-action="template-page-btn"]', '[data-template-page-btn]');
let activeTemplatePage = 1;
const templatePageSize = 10;
let templatePages = [];

if (templateList && templatePagination && templateFirstButton && templatePrevButton && templateNextButton && templateLastButton) {
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

    templateFirstButton.classList.toggle('opacity-40', activeTemplatePage === 1);
    templatePrevButton.classList.toggle('opacity-40', activeTemplatePage === 1);
    templateNextButton.classList.toggle('opacity-40', activeTemplatePage === maxPage);
    templateLastButton.classList.toggle('opacity-40', activeTemplatePage === maxPage);
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
  };

  templatePagination.classList.remove('hidden');
  buildTemplatePages(templateCards);
  rebuildTemplateButtons();
  setActiveTemplatePage(1);

  templateFirstButton.addEventListener('click', () => setActiveTemplatePage(1));
  templatePrevButton.addEventListener('click', () => setActiveTemplatePage(activeTemplatePage - 1));
  templateNextButton.addEventListener('click', () => setActiveTemplatePage(activeTemplatePage + 1));
  templateLastButton.addEventListener('click', () => setActiveTemplatePage(templatePages.length));

  if (templateSearchInput) {
    templateSearchInput.addEventListener('input', applyTemplateFilter);
  }
}

const smsHistoryPhoneInput = selectOne('[data-role="sms-history-phone"]', '[data-sms-history-phone]');
const smsHistorySearchButton = selectOne('[data-action="sms-history-search"]', '[data-sms-history-search]');
const smsHistoryBody = selectOne('[data-role="sms-history-body"]', '[data-sms-history-body]');
const smsHistoryRecords = [
  { sentAt: '2024-01-20 14:35', templateName: '해외주식 거래 수수료 이벤트', status: '발송완료', phone: '01012345678' },
  { sentAt: '2024-01-19 10:22', templateName: 'ISA 계좌 만기 안내', status: '발송완료', phone: '01098765432' },
  { sentAt: '2024-01-18 11:20', templateName: 'PRIME 고객 투자 세미나', status: '발송완료', phone: '01012345678' },
  { sentAt: '2024-01-12 16:45', templateName: '계좌 비밀번호 변경 완료', status: '발송완료', phone: '01077778888' },
  { sentAt: '2024-01-10 13:30', templateName: '자산관리 상담 예약', status: '예약중', phone: '01012345678' }
];

const normalizePhone = value => value.replace(/[^0-9]/g, '');

const createHistoryMessageRow = message => {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 3;
  cell.className = 'text-center text-xs text-gray-400 py-3';
  cell.textContent = message;
  row.appendChild(cell);
  return row;
};

const createHistoryRecordRow = record => {
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
};

const renderSmsHistoryRows = records => {
  if (!smsHistoryBody) {
    return;
  }

  if (!records.length) {
    smsHistoryBody.replaceChildren(createHistoryMessageRow('조회 결과가 없습니다.'));
    return;
  }

  smsHistoryBody.replaceChildren(...records.map(createHistoryRecordRow));
};

const handleSmsHistorySearch = () => {
  const keyword = normalizePhone(smsHistoryPhoneInput?.value || '');

  if (!keyword) {
    if (smsHistoryBody) {
      smsHistoryBody.replaceChildren(createHistoryMessageRow('조회할 고객전화번호를 입력해 주세요.'));
    }
    return;
  }

  const results = smsHistoryRecords.filter(record => record.phone.includes(keyword));
  renderSmsHistoryRows(results);
};

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

const instantSendButton = selectOne('[data-action="sms-send-instant"]', '[data-sms-send="instant"]');
const scheduledSendButton = selectOne('[data-action="sms-send-scheduled"]', '[data-sms-send="scheduled"]');

const getRecipientCount = () => selectAll('[data-role="recipient-chip"]', '.recipient-chip').length;

const validateSend = () => {
  const message = messageTextarea?.value.trim() || '';
  if (!message) {
    alert('메시지 내용을 입력해 주세요.');
    messageTextarea?.focus();
    return false;
  }

  const recipientCount = getRecipientCount();
  if (!recipientCount) {
    alert('수신자를 1명 이상 선택해 주세요.');
    return false;
  }

  return true;
};

if (instantSendButton) {
  instantSendButton.addEventListener('click', () => {
    if (!validateSend()) {
      return;
    }

    alert(`${getRecipientCount()}명에게 즉시 발송되었습니다.`);
  });
}

if (scheduledSendButton) {
  scheduledSendButton.addEventListener('click', () => {
    if (!validateSend()) {
      return;
    }

    const scheduledAt = prompt('예약 발송 시간을 입력하세요. (예: 2024-01-25 09:00)', '2024-01-25 09:00');
    if (!scheduledAt) {
      return;
    }

    alert(`${getRecipientCount()}명에게 ${scheduledAt} 예약 발송되었습니다.`);
  });
}
