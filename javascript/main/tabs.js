window.MainPageTabs = (() => {
  const HIDDEN_CLASS = 'is-hidden';

  const selectAll = (standardSelector, legacySelector) => {
    const standardNodes = Array.from(document.querySelectorAll(standardSelector));
    if (standardNodes.length) {
      return standardNodes;
    }
    return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
  };

  const initWarningTabs = () => {
    const warningTabs = selectAll('[data-action="warning-tab"]', '[data-warning-tab]');
    const warningPanels = selectAll('[data-target="warning-panel"]', '[data-warning-panel]');

    if (!warningTabs.length || !warningPanels.length) {
      return;
    }

    warningTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target') || tab.getAttribute('data-warning-tab');

        warningTabs.forEach(item => item.classList.remove('is-active'));
        tab.classList.add('is-active');

        warningPanels.forEach(panel => {
          const panelTarget = panel.getAttribute('data-target-value') || panel.getAttribute('data-warning-panel');
          const matches = panelTarget === target;
          panel.classList.toggle(HIDDEN_CLASS, !matches);
          panel.classList.toggle('is-active', matches);
        });
      });
    });
  };

  const initNavAndCustomerTabs = () => {
    selectAll('[data-role="nav-item"]', '.nav-item').forEach(item => {
      item.addEventListener('click', function onNavClick() {
        const targetPage = this.dataset.page;
        const isSamePage = window.AppUi?.isSamePagePath
          ? window.AppUi.isSamePagePath(targetPage)
          : window.location.pathname.endsWith(targetPage || '');

        if (targetPage && !isSamePage) {
          const href = window.AppUi?.resolvePageHref
            ? window.AppUi.resolvePageHref(targetPage)
            : targetPage;
          window.location.href = href;
          return;
        }

        const customerName = this.getAttribute('data-customer');
        if (!customerName) {
          return;
        }

        selectAll('[data-role="nav-item"]', '.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        this.classList.add('visited');

        selectAll('[data-role="customer-tab"]', '.customer-tab').forEach(tab => {
          if (tab.getAttribute('data-customer') !== customerName) {
            return;
          }

          selectAll('[data-role="customer-tab"]', '.customer-tab').forEach(t => {
            t.classList.remove('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
            t.classList.add('bg-gray-100', 'border-transparent', 'text-gray-500');
          });

          tab.classList.add('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
          tab.classList.remove('bg-gray-100', 'border-transparent', 'text-gray-500');
        });
      });
    });

    selectAll('[data-role="customer-tab"]', '.customer-tab').forEach(tab => {
      tab.addEventListener('click', function onCustomerTabClick(event) {
        if (event.target.classList.contains('close-tab')) {
          event.stopPropagation();
          const customerName = this.getAttribute('data-customer');
          this.remove();

          selectAll('[data-role="nav-item"]', '.nav-item').forEach(navItem => {
            if (navItem.getAttribute('data-customer') === customerName) {
              navItem.classList.remove('visited');
            }
          });
          return;
        }

        const customerName = this.getAttribute('data-customer');

        selectAll('[data-role="customer-tab"]', '.customer-tab').forEach(t => {
          t.classList.remove('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
          t.classList.add('bg-gray-100', 'border-transparent', 'text-gray-500');
        });

        this.classList.add('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
        this.classList.remove('bg-gray-100', 'border-transparent', 'text-gray-500');

        selectAll('[data-role="nav-item"]', '.nav-item').forEach(navItem => {
          if (navItem.getAttribute('data-customer') === customerName) {
            selectAll('[data-role="nav-item"]', '.nav-item').forEach(i => i.classList.remove('active'));
            navItem.classList.add('active');
          }
        });
      });
    });
  };

  const init = () => {
    initWarningTabs();
    initNavAndCustomerTabs();
  };

  return { init };
})();
