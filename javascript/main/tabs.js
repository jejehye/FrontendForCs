window.MainPageTabs = (() => {
  const initWarningTabs = () => {
    const warningTabs = Array.from(document.querySelectorAll('[data-warning-tab]'));
    const warningPanels = Array.from(document.querySelectorAll('[data-warning-panel]'));

    if (!warningTabs.length || !warningPanels.length) {
      return;
    }

    warningTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-warning-tab');

        warningTabs.forEach(item => item.classList.remove('is-active'));
        tab.classList.add('is-active');

        warningPanels.forEach(panel => {
          const matches = panel.getAttribute('data-warning-panel') === target;
          panel.classList.toggle('hidden', !matches);
          panel.classList.toggle('is-active', matches);
        });
      });
    });
  };

  const initNavAndCustomerTabs = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function onNavClick() {
        const targetPage = this.dataset.page;
        if (targetPage && !window.location.pathname.endsWith(targetPage)) {
          window.location.href = targetPage;
          return;
        }

        const customerName = this.getAttribute('data-customer');
        if (!customerName) {
          return;
        }

        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        this.classList.add('visited');

        document.querySelectorAll('.customer-tab').forEach(tab => {
          if (tab.getAttribute('data-customer') !== customerName) {
            return;
          }

          document.querySelectorAll('.customer-tab').forEach(t => {
            t.classList.remove('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
            t.classList.add('bg-gray-100', 'border-transparent', 'text-gray-500');
          });

          tab.classList.add('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
          tab.classList.remove('bg-gray-100', 'border-transparent', 'text-gray-500');
        });
      });
    });

    document.querySelectorAll('.customer-tab').forEach(tab => {
      tab.addEventListener('click', function onCustomerTabClick(event) {
        if (event.target.classList.contains('close-tab')) {
          event.stopPropagation();
          const customerName = this.getAttribute('data-customer');
          this.remove();

          document.querySelectorAll('.nav-item').forEach(navItem => {
            if (navItem.getAttribute('data-customer') === customerName) {
              navItem.classList.remove('visited');
            }
          });
          return;
        }

        const customerName = this.getAttribute('data-customer');

        document.querySelectorAll('.customer-tab').forEach(t => {
          t.classList.remove('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
          t.classList.add('bg-gray-100', 'border-transparent', 'text-gray-500');
        });

        this.classList.add('active-tab', 'bg-white', 'border-gray-300', 'border-b-white', 'text-blue-600');
        this.classList.remove('bg-gray-100', 'border-transparent', 'text-gray-500');

        document.querySelectorAll('.nav-item').forEach(navItem => {
          if (navItem.getAttribute('data-customer') === customerName) {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
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
