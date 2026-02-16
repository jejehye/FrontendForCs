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
const myRequestBody = document.getElementById('myRequestBody');
const searchInput = document.getElementById('specificSearch');
const filterButtons = document.querySelectorAll('.specific-filter-btn');

const historyBody = document.getElementById('specificHistoryBody');
const historyPagination = document.getElementById('historyPagination');
const historyDateFrom = document.getElementById('historyDateFrom');
const historyDateTo = document.getElementById('historyDateTo');
const historySearch = document.getElementById('historySearch');
const myDateFrom = document.getElementById('myDateFrom');
const myDateTo = document.getElementById('myDateTo');

const countAll = document.getElementById('countAll');
const countPending = document.getElementById('countPending');
const countApproved = document.getElementById('countApproved');
const countRejected = document.getElementById('countRejected');

let activeFilter = 'all';
let currentSearch = '';
let historyPage = 1;
const historyPageSize = 5;
let requestId = 4;
const currentAgentName = localStorage.getItem('currentAgentName') || '김민수';
const currentAgentEmpNo = localStorage.getItem('currentAgentEmpNo') || '204075';

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

function timeToMinutes(timeText) {
  const [hours, minutes] = timeText.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatDuration(startTime, endTime) {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (minutes === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${minutes}분`;
}

function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

const requests = [
  {
    id: 1,
    name: currentAgentName,
    empNo: currentAgentEmpNo,
    category: '콜 미수신',
    time: '09:00~11:00 (2시간)',
    reason: '연결 실패 반복으로 재배정 요청',
    status: 'pending',
    requestedAt: `${getDateOffset(0)} 09:00`,
    processedAt: '',
  },
  {
    id: 2,
    name: currentAgentName,
    empNo: currentAgentEmpNo,
    category: '교육/회의',
    time: '13:00~14:30 (1시간 30분)',
    reason: '신규 상품 교육 참석',
    status: 'approved',
    requestedAt: `${getDateOffset(-1)} 13:00`,
    processedAt: `${getDateOffset(-1)} 10:12`,
  },
  {
    id: 3,
    name: '최영호',
    empNo: '203114',
    category: '기타',
    time: '15:00~16:00 (1시간)',
    reason: '사유 불충분으로 재요청 안내',
    status: 'rejected',
    requestedAt: `${getDateOffset(-2)} 15:00`,
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
      (item.empNo || '').toLowerCase().includes(keyword) ||
      item.reason.toLowerCase().includes(keyword);
    return matchesFilter && matchesSearch;
  });
}

function renderTable() {
  const rows = getFilteredRequests();
  if (!rows.length) {
    tableBody.innerHTML =
      '<tr><td class="specific-empty" colspan="7">조회 결과가 없습니다.</td></tr>';
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
          <td>${item.empNo || '-'}</td>
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

function renderMyRequestTable() {
  if (!myRequestBody) return;
  const rows = requests
    .filter((item) => {
      const from = myDateFrom?.value || '';
      const to = myDateTo?.value || '';
      const requestedDate = item.requestedAt.slice(0, 10);
      const matchesFrom = !from || requestedDate >= from;
      const matchesTo = !to || requestedDate <= to;
      return matchesFrom && matchesTo;
    })
    .filter((item) => item.name === currentAgentName && item.empNo === currentAgentEmpNo)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  if (!rows.length) {
    myRequestBody.innerHTML =
      '<tr><td class="specific-empty" colspan="5">본인이 신청한 내역이 없습니다.</td></tr>';
    return;
  }

  myRequestBody.innerHTML = rows
    .map(
      (item) => `
      <tr>
        <td><span class="specific-badge specific-badge-${item.status}">${getStatusLabel(item.status)}</span></td>
        <td>${item.category}</td>
        <td>${item.time}</td>
        <td>${item.requestedAt}</td>
        <td class="specific-reason" title="${item.reason}">${item.reason}</td>
      </tr>
    `
    )
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
      (item.empNo || '').toLowerCase().includes(keyword) ||
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
      '<tr><td class="specific-empty" colspan="7">조건에 맞는 이전 처리내역이 없습니다.</td></tr>';
    renderHistoryPagination(0);
    return;
  }

  historyBody.innerHTML = pagedRows
    .map(
      (item) => `
      <tr>
        <td><span class="specific-badge specific-badge-${item.status}">${getStatusLabel(item.status)}</span></td>
        <td>${item.empNo || '-'}</td>
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
  renderMyRequestTable();
  renderTable();
  renderHistoryTable();
}

if (registerBtn) {
  registerBtn.addEventListener('click', () => {
    const empNoInput = document.getElementById('agentEmpNo');
    const nameInput = document.getElementById('agentName');
    const typeInput = document.getElementById('excludeType');
    const dateInput = document.getElementById('excludeDate');
    const startTimeInput = document.getElementById('excludeStartTime');
    const endTimeInput = document.getElementById('excludeEndTime');
    const reasonInput = document.getElementById('excludeReason');

    const empNo = empNoInput?.value.trim();
    const name = nameInput?.value.trim();
    const category = typeInput?.value.trim();
    const date = dateInput?.value.trim();
    const startTime = startTimeInput?.value.trim();
    const endTime = endTimeInput?.value.trim();
    const reason = reasonInput?.value.trim();

    if (!empNo || !name || !category || !date || !startTime || !endTime || !reason) {
      alert('사번, 상담원명, 특이사항 유형, 일자, 시작/종료시간, 사유를 모두 입력해 주세요.');
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      alert('종료시간은 시작시간보다 늦어야 합니다.');
      return;
    }

    const durationText = formatDuration(startTime, endTime);
    const time = `${startTime}~${endTime} (${durationText})`;

    requests.unshift({
      id: requestId++,
      name,
      empNo,
      category,
      time,
      reason,
      status: 'pending',
      requestedAt: `${date} ${startTime}`,
      processedAt: '',
    });

    startTimeInput.value = '';
    endTimeInput.value = '';
    reasonInput.value = '';
    activeFilter = 'all';
    filterButtons.forEach((btn) =>
      btn.classList.toggle('is-active', btn.dataset.filter === 'all')
    );
    renderAll();
  });
}

const agentNameInput = document.getElementById('agentName');
if (agentNameInput && !agentNameInput.value.trim()) {
  agentNameInput.value = currentAgentName;
}

const agentEmpNoInput = document.getElementById('agentEmpNo');
if (agentEmpNoInput && !agentEmpNoInput.value.trim()) {
  agentEmpNoInput.value = currentAgentEmpNo;
}

const excludeDateInput = document.getElementById('excludeDate');
if (excludeDateInput && !excludeDateInput.value) {
  excludeDateInput.value = getDateOffset(0);
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

if (myDateFrom && myDateTo) {
  myDateFrom.value = getDateOffset(-30);
  myDateTo.value = getDateOffset(0);
  myDateFrom.addEventListener('change', renderMyRequestTable);
  myDateTo.addEventListener('change', renderMyRequestTable);
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
