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

const countAll = document.getElementById('countAll');
const countPending = document.getElementById('countPending');
const countApproved = document.getElementById('countApproved');
const countRejected = document.getElementById('countRejected');

let activeFilter = 'all';
let currentSearch = '';
let requestId = 4;

const requests = [
  {
    id: 1,
    name: '박지민',
    category: '콜 미수신',
    time: '14:20',
    reason: '연결 실패 반복으로 재배정 요청',
    status: 'pending',
  },
  {
    id: 2,
    name: '이수호',
    category: '교육/회의',
    time: '10:00',
    reason: '신규 상품 교육 참석',
    status: 'approved',
  },
  {
    id: 3,
    name: '최영호',
    category: '기타',
    time: '11:30',
    reason: '사유 불충분으로 재요청 안내',
    status: 'rejected',
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

function renderAll() {
  renderStats();
  renderTable();
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
    renderAll();
  });
}

renderAll();
