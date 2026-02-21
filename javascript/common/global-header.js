(() => {
  const ROLE = {
    header: 'app-global-header',
    user: 'app-global-user',
    logout: 'app-global-logout'
  };

  const resolveLoginHref = () => {
    const useHtml = window.location.protocol === 'file:' || window.location.pathname.endsWith('.html');
    return useHtml ? 'login.html' : '/login';
  };

  const syncSidebarWidth = () => {
    const sidebar = document.querySelector('#sidebar');
    const width = sidebar?.offsetWidth || 60;
    document.documentElement.style.setProperty('--global-sidebar-w', `${width}px`);
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
    bindLogout();
  };

  document.addEventListener('DOMContentLoaded', () => {
    ensureHeader();
    window.addEventListener('resize', syncSidebarWidth);
    window.addEventListener('storage', syncUserDisplay);
  });
})();
