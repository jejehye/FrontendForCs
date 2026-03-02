(() => {
  const ROLE = {
    header: 'app-global-header',
    stats: 'app-global-stats',
    center: 'app-global-center',
    statusSegmented: 'app-global-status-segmented',
    statusSelect: 'app-global-status-select',
    user: 'app-global-user',
    logout: 'app-global-logout'
  };

  const resolveLoginHref = () => {
    const useHtml = window.location.protocol === 'file:' || window.location.pathname.endsWith('.html');
    return useHtml ? 'login.html' : '/login';
  };

  const syncSidebarWidth = () => {
    const sidebar = document.querySelector('#sidebar');
    const header = document.querySelector(`[data-role="${ROLE.header}"]`);
    if (!sidebar) {
      document.documentElement.style.setProperty('--global-sidebar-w', '60px');
      document.documentElement.style.setProperty('--global-header-left', '60px');
      if (header) {
        header.style.left = '60px';
        header.style.width = 'calc(100vw - 60px)';
      }
      return;
    }

    const width = Math.round(sidebar.offsetWidth || 60);
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarRight = Math.round(sidebarRect.right || width || 60);
    const headerLeft = Math.max(width, sidebarRight, 60);

    document.documentElement.style.setProperty('--global-sidebar-w', `${width}px`);
    document.documentElement.style.setProperty('--global-header-left', `${headerLeft}px`);
    if (header) {
      header.style.left = `${headerLeft}px`;
      header.style.width = `calc(100vw - ${headerLeft}px)`;
    }
  };

  const syncUserDisplay = () => {
    const userNode = document.querySelector(`[data-role="${ROLE.user}"]`);
    if (!userNode) {
      return;
    }

    const agentId = (localStorage.getItem('currentAgentId') || '').trim();
    const agentName = (localStorage.getItem('currentAgentName') || '').trim();

    if (agentName && agentId) {
      userNode.textContent = `${agentName}(${agentId})`;
      return;
    }
    if (agentName) {
      userNode.textContent = agentName;
      return;
    }
    if (agentId) {
      userNode.textContent = `상담원(${agentId})`;
      return;
    }
    userNode.textContent = '상담원';
  };

  const bindLogout = () => {
    const logoutButton = document.querySelector(`[data-role="${ROLE.logout}"]`);
    if (!logoutButton || logoutButton.dataset.bound === 'true') {
      return;
    }

    logoutButton.dataset.bound = 'true';
    logoutButton.addEventListener('click', () => {
      const shouldLogout = window.confirm('로그아웃하시겠습니까?');
      if (!shouldLogout) {
        return;
      }
      localStorage.removeItem('currentAgentId');
      localStorage.removeItem('currentAgentName');
      window.location.assign(resolveLoginHref());
    });
  };

  const isMainPage = () => {
    const path = (window.location.pathname || '').toLowerCase();
    return path.endsWith('/main') || path.endsWith('/main/') || path.endsWith('/main.html');
  };

  const syncStatsDisplay = () => {
    const statsNode = document.querySelector(`[data-role="${ROLE.stats}"]`);
    if (!statsNode) return;

    if (!isMainPage()) {
      statsNode.hidden = true;
      return;
    }

    statsNode.hidden = false;
    const defaults = {
      todayCount: '24건',
      callDuration: '03:42:15',
      waitCustomers: '5명',
      waitDuration: '01:28'
    };
    const pageStats = (window.__PAGE_DATA__ && window.__PAGE_DATA__.globalStats) || {};
    const stats = { ...defaults, ...pageStats };

    const values = statsNode.querySelectorAll('[data-role="app-global-stat-value"]');
    if (values.length < 4) return;
    values[0].textContent = stats.todayCount;
    values[1].textContent = stats.callDuration;
    values[2].textContent = stats.waitCustomers;
    values[3].textContent = stats.waitDuration;
  };

  const bindGlobalStatusSegment = () => {
    const segmented = document.querySelector(`[data-role="${ROLE.statusSegmented}"]`);
    const statusSelect = document.querySelector(`[data-role="${ROLE.statusSelect}"]`);
    if (!segmented || !statusSelect || segmented.dataset.bound === 'true') {
      return;
    }

    segmented.dataset.bound = 'true';
    const buttons = Array.from(segmented.querySelectorAll('[data-status-value]'));
    const savedStatus = (localStorage.getItem('agentWorkStatus') || '').trim();
    if (savedStatus && Array.from(statusSelect.options).some(option => option.value === savedStatus)) {
      statusSelect.value = savedStatus;
    }

    const syncButtons = value => {
      buttons.forEach(button => {
        const isActive = button.getAttribute('data-status-value') === value;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    };

    syncButtons(statusSelect.value);
    statusSelect.addEventListener('change', event => {
      const value = event.target.value;
      localStorage.setItem('agentWorkStatus', value);
      syncButtons(value);
    });

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const value = button.getAttribute('data-status-value');
        if (!value || statusSelect.value === value) {
          return;
        }
        statusSelect.value = value;
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  };

  const ensureHeader = () => {
    const appContainer = document.querySelector('#app-container.grid-layout');
    if (!appContainer) {
      return;
    }

    const existingHeader = document.querySelector(
      `[data-role="${ROLE.header}"], [data-role="new-main-global-header"]`
    );

    if (!existingHeader) {
      const header = document.createElement('div');
      header.className = 'app-global-header';
      header.setAttribute('data-role', ROLE.header);
      header.innerHTML = `
        <div class="app-global-header__inner">
          <div class="app-global-header__stats" data-role="${ROLE.stats}" hidden>
            <span class="app-global-header__stat"><span class="app-global-header__stat-label">금일상담</span><strong data-role="app-global-stat-value">24건</strong></span>
            <span class="app-global-header__divider" aria-hidden="true"></span>
            <span class="app-global-header__stat"><span class="app-global-header__stat-label">통화시간</span><strong data-role="app-global-stat-value">03:42:15</strong></span>
            <span class="app-global-header__divider" aria-hidden="true"></span>
            <span class="app-global-header__stat"><span class="app-global-header__stat-label">고객대기</span><strong data-role="app-global-stat-value">5명</strong></span>
            <span class="app-global-header__divider" aria-hidden="true"></span>
            <span class="app-global-header__stat"><span class="app-global-header__stat-label">대기시간</span><strong data-role="app-global-stat-value">01:28</strong></span>
          </div>
          <div class="app-global-header__center" data-role="${ROLE.center}">
            <div class="app-global-status-segmented" data-role="${ROLE.statusSegmented}" role="group" aria-label="업무상태 전환">
              <button type="button" class="app-global-status-segment is-active" data-status-value="ready" aria-pressed="true">업무</button>
              <button type="button" class="app-global-status-segment" data-status-value="busy" aria-pressed="false">대기</button>
              <button type="button" class="app-global-status-segment" data-status-value="away" aria-pressed="false">이석</button>
              <button type="button" class="app-global-status-segment" data-status-value="meeting" aria-pressed="false">교육</button>
              <button type="button" class="app-global-status-segment" data-status-value="break" aria-pressed="false">식사</button>
              <button type="button" class="app-global-status-segment" data-status-value="hold" aria-pressed="false">보류</button>
              <select class="app-global-status-select app-global-status-select--hidden" data-role="${ROLE.statusSelect}" aria-label="업무상태">
                <option value="ready" selected>업무</option>
                <option value="busy">대기</option>
                <option value="away">이석</option>
                <option value="meeting">교육</option>
                <option value="break">식사</option>
                <option value="hold">보류</option>
              </select>
            </div>
          </div>
          <div class="app-global-header__user-wrap">
            <span class="app-global-header__user" data-role="${ROLE.user}">상담원</span>
            <button type="button" class="app-global-header__logout" data-role="${ROLE.logout}" aria-label="로그아웃">로그아웃</button>
          </div>
        </div>
      `;
      appContainer.insertAdjacentElement('beforebegin', header);
    }

    document.body.classList.add('has-global-header');
    syncSidebarWidth();
    syncUserDisplay();
    syncStatsDisplay();
    bindGlobalStatusSegment();
    bindLogout();
  };

  document.addEventListener('DOMContentLoaded', () => {
    ensureHeader();
    window.addEventListener('resize', syncSidebarWidth);
    window.addEventListener('storage', syncUserDisplay);
  });
})();
