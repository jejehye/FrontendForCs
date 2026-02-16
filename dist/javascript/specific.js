document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    const targetPage = item.getAttribute('data-page');
    if (!targetPage) return;
    if (window.location.pathname.endsWith(targetPage)) return;
    window.location.href = targetPage;
  });
});

const registerBtn = document.getElementById('registerExcludeBtn');
const tableBody = document.getElementById('specificTableBody');
const searchInput = document.getElementById('specificSearch');
const filterButtons = document.querySelectorAll('.specific-filter-btn');

const historyBody = document.getElementById('specificHistoryBody');
const historyPagination = document.getElementById('historyPagination');
const historyDateFrom = document.getElementById('historyDateFrom');
const historyDateTo = document.getElementById('historyDateTo');
const historySearch = document.getElementById('historySearch');

const countAll = document.getElementById('countAll');
const countPending = document.getElementById('countPending');
const countApproved = document.getElementById('countApproved');
const countRejected = document.getElementById('countRejected');

let activeFilter = 'all';
let currentSearch = '';
let historyPage = 1;
const historyPageSize = 5;
let requestId = 4;

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

function formatDateTime(date) {
  return `${formatDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

const requests = [
  {
    id: 1,
    name: '박지민',
    category: '콜 미수신',
    time: '14:20',
    reason: '연결 실패 반복으로 재배정 요청',
    status: 'pending',
    requestedAt: `${getDateOffset(0)} 14:20`,
    processedAt: '',
  },
  {
    id: 2,
    name: '이수호',
    category: '교육/회의',
    time: '10:00',
    reason: '신규 상품 교육 참석',
    status: 'approved',
    requestedAt: `${getDateOffset(-1)} 10:00`,
    processedAt: `${getDateOffset(-1)} 10:12`,
  },
  {
    id: 3,
    name: '최영호',
    category: '기타',
    time: '11:30',
    reason: '사유 불충분으로 재요청 안내',
    status: 'rejected',
    requestedAt: `${getDateOffset(-2)} 11:30`,
    processedAt: `${getDateOffset(-2)} 11:41`,
  },
];

function getStatusLabel(status) {
  if (status === 'pending') return '승인대기';
  if (status === 'approved') return '승인완료';
  return '반려';
}

function renderStats() {
  const pending = requests.filter((item) => item.status === 'pending').length;
  const approved = requests.filter((item) => item.status === 'approved').length;
  const rejected = requests.filter((item) => item.status === 'rejected').length;

  countAll.textContent = String(requests.length);
  countPending.textContent = String(pending);
  countApproved.textContent = String(approved);
  countRejected.textContent = String(rejected);
}

function getFilteredRequests() {
  return requests.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    const keyword = currentSearch.toLowerCase();
    const matchesSearch =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      item.reason.toLowerCase().includes(keyword);
    return matchesFilter && matchesSearch;
  });
}

function renderTable() {
  const rows = getFilteredRequests();
  if (!rows.length) {
    tableBody.innerHTML =
      '<tr><td class="specific-empty" colspan="6">조회 결과가 없습니다.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows
    .map((item) => {
      const disabled = item.status !== 'pending';
      const actionButtons = disabled
        ? '<button class="specific-btn specific-btn-disabled" disabled>처리완료</button>'
        : `
          <div class="specific-row-actions">
            <button class="specific-btn specific-btn-secondary" data-action="reject" data-id="${item.id}">반려</button>
            <button class="specific-btn specific-btn-primary" data-action="approve" data-id="${item.id}">승인</button>
          </div>
        `;

      return `
        <tr>
          <td><span class="specific-badge specific-badge-${item.status}">${getStatusLabel(item.status)}</span></td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.time}</td>
          <td class="specific-reason" title="${item.reason}">${item.reason}</td>
          <td>${actionButtons}</td>
        </tr>
      `;
    })
    .join('');
}

function getFilteredHistory() {
  const from = historyDateFrom?.value || '';
  const to = historyDateTo?.value || '';
  const keyword = (historySearch?.value || '').trim().toLowerCase();

  return requests
    .filter((item) => {
    if (item.status === 'pending' || !item.processedAt) return false;
    const processedDate = item.processedAt.slice(0, 10);
    const matchesFrom = !from || processedDate >= from;
    const matchesTo = !to || processedDate <= to;
    const matchesSearch =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      item.reason.toLowerCase().includes(keyword);
      return matchesFrom && matchesTo && matchesSearch;
    })
    .sort((a, b) => b.processedAt.localeCompare(a.processedAt));
}

function renderHistoryPagination(totalItems) {
  if (!historyPagination) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / historyPageSize));
  if (historyPage > totalPages) historyPage = totalPages;

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const activeClass = page === historyPage ? ' is-active' : '';
    return `<button class="specific-page-btn${activeClass}" data-history-page="${page}">${page}</button>`;
  }).join('');

  historyPagination.innerHTML = `
    <button class="specific-page-btn" data-history-page-nav="prev" ${
      historyPage === 1 ? 'disabled' : ''
    }>&lt;</button>
    ${pageButtons}
    <button class="specific-page-btn" data-history-page-nav="next" ${
      historyPage === totalPages ? 'disabled' : ''
    }>&gt;</button>
  `;
}

function renderHistoryTable() {
  const rows = getFilteredHistory();
  const totalPages = Math.max(1, Math.ceil(rows.length / historyPageSize));
  if (historyPage > totalPages) historyPage = totalPages;
  if (historyPage < 1) historyPage = 1;

  const startIndex = (historyPage - 1) * historyPageSize;
  const pagedRows = rows.slice(startIndex, startIndex + historyPageSize);

  if (!rows.length) {
    historyBody.innerHTML =
      '<tr><td class="specific-empty" colspan="6">조건에 맞는 이전 처리내역이 없습니다.</td></tr>';
    renderHistoryPagination(0);
    return;
  }

  historyBody.innerHTML = pagedRows
    .map(
      (item) => `
      <tr>
        <td><span class="specific-badge specific-badge-${item.status}">${getStatusLabel(item.status)}</span></td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.requestedAt}</td>
        <td>${item.processedAt}</td>
        <td class="specific-reason" title="${item.reason}">${item.reason}</td>
      </tr>
    `
    )
    .join('');
  renderHistoryPagination(rows.length);
}

function renderAll() {
  renderStats();
  renderTable();
  renderHistoryTable();
}

if (registerBtn) {
  registerBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('agentName');
    const typeInput = document.getElementById('excludeType');
    const timeInput = document.getElementById('excludeTime');
    const reasonInput = document.getElementById('excludeReason');

    const name = nameInput?.value.trim();
    const category = typeInput?.value.trim();
    const time = timeInput?.value.trim();
    const reason = reasonInput?.value.trim();

    if (!name || !category || !time || !reason) {
      alert('상담원명, 제외 유형, 시간, 사유를 모두 입력해 주세요.');
      return;
    }

    requests.unshift({
      id: requestId++,
      name,
      category,
      time,
      reason,
      status: 'pending',
      requestedAt: `${formatDate(new Date())} ${time}`,
      processedAt: '',
    });

    nameInput.value = '';
    timeInput.value = '';
    reasonInput.value = '';
    activeFilter = 'all';
    filterButtons.forEach((btn) =>
      btn.classList.toggle('is-active', btn.dataset.filter === 'all')
    );
    renderAll();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    currentSearch = event.target.value.trim();
    renderTable();
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter || 'all';
    filterButtons.forEach((item) =>
      item.classList.toggle('is-active', item === btn)
    );
    renderTable();
  });
});

if (tableBody) {
  tableBody.addEventListener('click', (event) => {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) return;

    const action = actionButton.dataset.action;
    const id = Number(actionButton.dataset.id);
    const target = requests.find((item) => item.id === id);
    if (!target || target.status !== 'pending') return;

    if (action === 'approve') target.status = 'approved';
    if (action === 'reject') target.status = 'rejected';
    target.processedAt = formatDateTime(new Date());
    renderAll();
  });
}

if (historyDateFrom && historyDateTo) {
  historyDateFrom.value = getDateOffset(-30);
  historyDateTo.value = getDateOffset(0);

  historyDateFrom.addEventListener('change', () => {
    historyPage = 1;
    renderHistoryTable();
  });
  historyDateTo.addEventListener('change', () => {
    historyPage = 1;
    renderHistoryTable();
  });
}

if (historySearch) {
  historySearch.addEventListener('input', () => {
    historyPage = 1;
    renderHistoryTable();
  });
}

if (historyPagination) {
  historyPagination.addEventListener('click', (event) => {
    const pageButton = event.target.closest('button[data-history-page]');
    const navButton = event.target.closest('button[data-history-page-nav]');

    if (pageButton) {
      historyPage = Number(pageButton.dataset.historyPage);
      renderHistoryTable();
      return;
    }

    if (!navButton) return;
    if (navButton.dataset.historyPageNav === 'prev') historyPage -= 1;
    if (navButton.dataset.historyPageNav === 'next') historyPage += 1;
    renderHistoryTable();
  });
}

renderAll();
