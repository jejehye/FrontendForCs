window.AppUi?.initSidebarNavigation();

(function initCustomerSatisfactionPage() {
  const pageData = window.__PAGE_DATA__ || {};
  const sourceRows = Array.isArray(pageData.csat_rows) ? pageData.csat_rows : [];
  const state = {
    rows: sourceRows.slice(),
    filteredRows: sourceRows.slice(),
    currentPage: 1,
    pageSize: 7
  };

  const hooks = {
    dateFrom: document.querySelector('[data-role="csat-date-from"]'),
    dateTo: document.querySelector('[data-role="csat-date-to"]'),
    agentFilter: document.querySelector('[data-role="csat-agent-filter"]'),
    customerFilter: document.querySelector('[data-role="csat-customer-filter"]'),
    ratingFilter: document.querySelector('[data-role="csat-rating-filter"]'),
    tableBody: document.querySelector('[data-role="csat-table-body"]'),
    pagination: document.querySelector('[data-role="csat-pagination"]'),
    totalCount: document.querySelector('[data-role="csat-total-count"]'),
    resetButton: document.querySelector('[data-action="csat-reset"]'),
    searchButton: document.querySelector('[data-action="csat-search"]')
  };

  if (!hooks.tableBody || !hooks.pagination) {
    return;
  }

  function parseDate(dateText) {
    const parsed = new Date(dateText);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatDateOnly(value) {
    const parsed = parseDate(value);
    if (!parsed) {
      return '';
    }
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  }

  function getRatingClass(rating) {
    if (rating === '매우만족') return 'badge--io-in';
    if (rating === '만족') return 'badge--io-out';
    if (rating === '보통') return 'badge--io-neutral';
    return 'badge--io-alert';
  }

  function buildAgentOptions() {
    if (!hooks.agentFilter) {
      return;
    }
    const currentAgentName = (localStorage.getItem('currentAgentName') || '').trim();
    const uniqueAgents = Array.from(new Set(state.rows.map(row => row.agent))).sort((a, b) => a.localeCompare(b, 'ko'));

    hooks.agentFilter.innerHTML = '<option value="">전체</option>';
    uniqueAgents.forEach(agent => {
      const option = document.createElement('option');
      option.value = agent;
      option.textContent = agent;
      hooks.agentFilter.appendChild(option);
    });

    if (currentAgentName && uniqueAgents.includes(currentAgentName)) {
      hooks.agentFilter.value = currentAgentName;
    }
  }

  function applyFilters() {
    const from = hooks.dateFrom?.value || '';
    const to = hooks.dateTo?.value || '';
    const selectedAgent = (hooks.agentFilter?.value || '').trim();
    const customerKeyword = (hooks.customerFilter?.value || '').trim().toLowerCase();
    const rating = hooks.ratingFilter?.value || '';

    state.filteredRows = state.rows.filter(row => {
      const dateOnly = formatDateOnly(row.timestamp);
      const matchesDateFrom = !from || dateOnly >= from;
      const matchesDateTo = !to || dateOnly <= to;
      const matchesAgent = !selectedAgent || row.agent === selectedAgent;
      const matchesCustomer = !customerKeyword || String(row.customer || '').toLowerCase().includes(customerKeyword);
      const matchesRating = !rating || row.rating === rating;
      return matchesDateFrom && matchesDateTo && matchesAgent && matchesCustomer && matchesRating;
    });

    state.currentPage = 1;
    render();
  }

  function createEmptyRow() {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'tbl__cell csat-empty';
    cell.textContent = '조회 결과가 없습니다.';
    row.appendChild(cell);
    return row;
  }

  function renderTable() {
    hooks.tableBody.innerHTML = '';

    if (!state.filteredRows.length) {
      hooks.tableBody.appendChild(createEmptyRow());
      return;
    }

    const start = (state.currentPage - 1) * state.pageSize;
    const pageRows = state.filteredRows.slice(start, start + state.pageSize);

    pageRows.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.className = 'tbl__row';
      tr.innerHTML = `
        <td class="tbl__cell">${start + index + 1}</td>
        <td class="tbl__cell">${row.timestamp || '-'}</td>
        <td class="tbl__cell">${row.agent || '-'}</td>
        <td class="tbl__cell tbl__cell--strong">${row.customer || '-'}</td>
        <td class="tbl__cell"><span class="${getRatingClass(row.rating)}">${row.rating || '-'}</span></td>
        <td class="tbl__cell csat-review-cell" title="${row.review || ''}">${row.review || '-'}</td>
      `;
      hooks.tableBody.appendChild(tr);
    });
  }

  function renderPagination() {
    hooks.pagination.innerHTML = '';

    const totalPages = Math.max(1, Math.ceil(state.filteredRows.length / state.pageSize));
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    const createButton = (label, page, disabled, isActive) => {
      const button = document.createElement('button');
      button.className = `pagination__btn${isActive ? ' is-active' : ''}`;
      button.textContent = label;
      button.disabled = Boolean(disabled);
      if (!disabled) {
        button.addEventListener('click', () => {
          state.currentPage = page;
          render();
        });
      }
      return button;
    };

    hooks.pagination.appendChild(createButton('<<', 1, state.currentPage === 1, false));
    hooks.pagination.appendChild(createButton('<', state.currentPage - 1, state.currentPage === 1, false));

    for (let page = 1; page <= totalPages; page += 1) {
      hooks.pagination.appendChild(createButton(String(page), page, false, page === state.currentPage));
    }

    hooks.pagination.appendChild(createButton('>', state.currentPage + 1, state.currentPage === totalPages, false));
    hooks.pagination.appendChild(createButton('>>', totalPages, state.currentPage === totalPages, false));
  }

  function renderTotalCount() {
    if (!hooks.totalCount) {
      return;
    }
    hooks.totalCount.textContent = `(총 ${state.filteredRows.length}건)`;
  }

  function render() {
    renderTable();
    renderPagination();
    renderTotalCount();
  }

  function resetFilters() {
    const defaultFrom = pageData.default_date_from || '';
    const defaultTo = pageData.default_date_to || '';

    if (hooks.dateFrom) hooks.dateFrom.value = defaultFrom;
    if (hooks.dateTo) hooks.dateTo.value = defaultTo;
    if (hooks.customerFilter) hooks.customerFilter.value = '';
    if (hooks.ratingFilter) hooks.ratingFilter.value = '';

    const currentAgentName = (localStorage.getItem('currentAgentName') || '').trim();
    if (hooks.agentFilter) {
      if (currentAgentName && Array.from(hooks.agentFilter.options).some(option => option.value === currentAgentName)) {
        hooks.agentFilter.value = currentAgentName;
      } else {
        hooks.agentFilter.value = '';
      }
    }

    applyFilters();
  }

  buildAgentOptions();

  hooks.searchButton?.addEventListener('click', applyFilters);
  hooks.resetButton?.addEventListener('click', resetFilters);
  hooks.customerFilter?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFilters();
    }
  });

  [hooks.dateFrom, hooks.dateTo, hooks.agentFilter, hooks.ratingFilter].forEach(node => {
    node?.addEventListener('change', applyFilters);
  });

  applyFilters();
})();
