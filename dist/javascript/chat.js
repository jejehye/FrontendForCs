window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

const pageData = window.__PAGE_DATA__ || {};
const chatDataEndpoint = window.__APP_ENDPOINTS__?.chatData || '/api/chat';

const selectOne = (standardSelector, legacySelector) =>
  document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

const selectAll = (standardSelector, legacySelector) => {
  const standardNodes = Array.from(document.querySelectorAll(standardSelector));
  if (standardNodes.length) {
    return standardNodes;
  }
  return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
};

const defaultChatData = {
  kms_filters: ['전체', 'ISA', '해외주식', 'ETF', '연금', '세금'],
  kms_items: [
    {
      tag: 'ISA',
      title: 'ISA 계좌 비과세 혜택 안내',
      description: '일반형은 200만원, 서민형은 400만원까지 비과세가 적용됩니다. 초과분은 9.9% 분리과세로 일반 금융소득 대비 절세 효과가 큽니다.',
      updated_at: '2024-02-10'
    }
  ],
  recent_history_notes: [
    {
      title: 'ISA 계좌 개설 문의',
      channel: '채팅',
      badge_class: 'badge badge--chat-note',
      desc: 'ISA 계좌 비과세 혜택 및 가입 조건 안내 완료',
      owner: '상담사: 최서연',
      date: '2024-02-12 10:15'
    }
  ]
};

let chatData = { ...defaultChatData, ...pageData };

function bindKmsCardCopyToInput() {
  selectAll('[data-role="kms-card"]', '.kms-card').forEach(card => {
    if (card.dataset.boundKmsClick === 'true') {
      return;
    }

    card.dataset.boundKmsClick = 'true';
    card.addEventListener('click', function handleKmsClick() {
      const content = this.querySelector('p')?.textContent?.trim();
      const messageInput = selectOne('[data-role="chat-message-input"]', '.chat__input');

      if (content && messageInput) {
        messageInput.value = content;
        messageInput.focus();
      }
    });
  });
}

function createKmsFilterButton(filter, isActive = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `tab__item tab__item--chat-filter${isActive ? ' is-active primary-btn' : ''}`;
  button.textContent = filter || '';
  return button;
}

function createKmsCard(item) {
  const card = document.createElement('div');
  card.className = 'kms-card';
  card.setAttribute('data-role', 'kms-card');

  card.innerHTML = `
    <div class="kms-header-row">
      <div class="chat-inline-center">
        <span class="kms-tag">${item.tag || ''}</span>
        <span class="ui-title-sm">${item.title || ''}</span>
      </div>
      <button class="chat-text-muted" type="button">
        <i class="fa-solid fa-chevron-down"></i>
      </button>
    </div>
    <p class="chat-kms-description">${item.description || ''}</p>
    <div class="ui-between-center-meta-xxs">
      <span><i class="fa-solid fa-clock chat-icon-inline"></i>최종 수정: ${item.updated_at || ''}</span>
      <button class="chat-kms-copy-btn" type="button">
        <i class="fa-solid fa-copy chat-icon-inline"></i>복사
      </button>
    </div>
  `;

  return card;
}

function createRecentHistoryCard(note) {
  const card = document.createElement('div');
  card.className = 'chat-note-card';
  card.innerHTML = `
    <div class="chat-note-header">
      <span class="ui-title-xs">${note.title || ''}</span>
      <span class="${note.badge_class || ''}">${note.channel || ''}</span>
    </div>
    <p class="chat-history-desc">${note.desc || ''}</p>
    <div class="chat-note-meta">
      <span><i class="fa-solid fa-user chat-icon-inline"></i>${note.owner || ''}</span>
      <span>${note.date || ''}</span>
    </div>
  `;
  return card;
}

function renderChatDynamicBlocks(data) {
  const filters = Array.isArray(data.kms_filters) ? data.kms_filters : [];
  const items = Array.isArray(data.kms_items) ? data.kms_items : [];
  const notes = Array.isArray(data.recent_history_notes) ? data.recent_history_notes : [];

  const filterRow = document.querySelector('.chat-kms-filter-row');
  if (filterRow) {
    const buttons = filters.map((filter, index) => createKmsFilterButton(filter, index === 0));
    filterRow.replaceChildren(...buttons);
  }

  const kmsList = document.querySelector('#center-column .ui-stack-3');
  if (kmsList) {
    const cards = items.map(createKmsCard);
    kmsList.replaceChildren(...cards);
  }

  const historyList = document.querySelector('.chat-history-list');
  if (historyList) {
    const cards = notes.map(createRecentHistoryCard);
    historyList.replaceChildren(...cards);
  }

  bindKmsCardCopyToInput();
}

async function loadRemoteChatData() {
  if (window.AppApi?.isMockEnabled?.()) {
    return null;
  }

  if (!window.AppApi?.fetchJson) {
    return null;
  }

  try {
    const remoteData = await window.AppApi.fetchJson(chatDataEndpoint);
    if (!remoteData || typeof remoteData !== 'object') {
      return null;
    }

    return remoteData;
  } catch (error) {
    console.warn('[chat] failed to load remote data:', error);
    return null;
  }
}

function bindQuickReplyActions() {
  selectAll('[data-action="quick-reply"]', '.quick-reply').forEach(button => {
    if (button.dataset.boundQuickReply === 'true') {
      return;
    }
    button.dataset.boundQuickReply = 'true';
    button.addEventListener('click', function handleQuickReplyClick() {
      const messageInput = selectOne('[data-role="chat-message-input"]', '.chat__input');

      if (messageInput) {
        messageInput.value = this.textContent;
        messageInput.focus();
      }
    });
  });
}

const chatPageModule = window.PageModule?.create({
  name: 'chat',
  state: {
    data: chatData
  },
  data: {
    load: loadRemoteChatData,
    hydrate: loaded => {
      if (loaded && typeof loaded === 'object') {
        chatData = { ...chatData, ...loaded };
      }
    }
  },
  render: {
    all: () => {
      renderChatDynamicBlocks(chatData);
    }
  },
  events: {
    bind: () => {
      bindQuickReplyActions();
    }
  }
});

if (chatPageModule) {
  void chatPageModule.init();
} else {
  renderChatDynamicBlocks(chatData);
  bindQuickReplyActions();
  void loadRemoteChatData().then(loaded => {
    if (loaded && typeof loaded === 'object') {
      chatData = { ...chatData, ...loaded };
      renderChatDynamicBlocks(chatData);
    }
  });
}
