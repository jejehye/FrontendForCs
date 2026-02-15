/* Extracted from main.html */

window.FontAwesomeConfig = {
  autoReplaceSvg: 'nest'
};

if (window.tailwind) {
  window.tailwind.config = {
        theme:
        {
          extend:
          {
            colors:
            {
              primary: '#0046ff',
              secondary: '#6c757d',
              success: '#28a745',
              danger: '#dc3545',
              warning: '#ffc107',
              info: '#17a2b8',
              light: '#f8f9fa',
              dark: '#343a40',
              'chat-bg': '#f0f4f8',
              'agent-bubble': '#ffffff',
              'customer-bubble': '#eef1f6',
              'panel-border': '#e2e8f0',
              'highlight-blue': '#e6f0ff',
              'tag-blue': '#0046ff',
              'sidebar-bg': '#1e293b',
            },
            fontFamily:
            {
              sans: ['Pretendard', 'Malgun Gothic', 'Dotum', 'sans-serif'],
            },
            fontSize:
            {
              'xxs': '0.65rem',
            }
          }
        }
      };
}

document.addEventListener('DOMContentLoaded', () => {
      const accountNumberInput = document.getElementById('account-number');
      const residentIdInput = document.getElementById('resident-id');

      const formatAccountNumber = value => value
        .replace(/[^0-9]/g, '')
        .slice(0, 14)
        .replace(/(\d{3})(\d{0,3})(\d{0,8})/, (_, p1, p2, p3) =>
        [p1, p2, p3].filter(Boolean).join('-'));

      const formatResidentId = value => value
        .replace(/[^0-9]/g, '')
        .slice(0, 13)
        .replace(/(\d{6})(\d{0,7})/, (_, p1, p2) =>
        [p1, p2].filter(Boolean).join('-'));

      if (accountNumberInput) {
        accountNumberInput.addEventListener('input', () => {
          accountNumberInput.value = formatAccountNumber(accountNumberInput.value);
        });
      }

      if (residentIdInput) {
        residentIdInput.addEventListener('input', () => {
          residentIdInput.value = formatResidentId(residentIdInput.value);
        });
      }

document.querySelectorAll('.nav-item').forEach(item =>
      {
        item.addEventListener('click', function()
        {
          const targetPage = this.dataset.page;
          if (targetPage && !window.location.pathname.endsWith(targetPage))
          {
            window.location.href = targetPage;
            return;
          }

          const customerName = this.getAttribute('data-customer');

          if (customerName)
          {
            document.querySelectorAll('.nav-item').forEach(i => i
              .classList.remove('active'));
            this.classList.add('active');
            this.classList.add('visited');

            document.querySelectorAll('.customer-tab').forEach(tab =>
            {
              if (tab.getAttribute('data-customer') ===
                customerName)
              {
                document.querySelectorAll('.customer-tab').forEach(
                  t =>
                  {
                    t.classList.remove('active-tab', 'bg-white',
                      'border-gray-300', 'border-b-white',
                      'text-blue-600');
                    t.classList.add('bg-gray-100',
                      'border-transparent', 'text-gray-500');
                  });

                tab.classList.add('active-tab', 'bg-white',
                  'border-gray-300', 'border-b-white',
                  'text-blue-600');
                tab.classList.remove('bg-gray-100',
                  'border-transparent', 'text-gray-500');
              }
            });
          }
        });
      });

      document.querySelectorAll('.customer-tab').forEach(tab =>
      {
        tab.addEventListener('click', function(e)
        {
          if (e.target.classList.contains('close-tab'))
          {
            e.stopPropagation();
            const customerName = this.getAttribute('data-customer');
            this.remove();

            document.querySelectorAll('.nav-item').forEach(navItem =>
            {
              if (navItem.getAttribute('data-customer') ===
                customerName)
              {
                navItem.classList.remove('visited');
              }
            });

            return;
          }

          const customerName = this.getAttribute('data-customer');

          document.querySelectorAll('.customer-tab').forEach(t =>
          {
            t.classList.remove('active-tab', 'bg-white',
              'border-gray-300', 'border-b-white', 'text-blue-600'
            );
            t.classList.add('bg-gray-100', 'border-transparent',
              'text-gray-500');
          });

          this.classList.add('active-tab', 'bg-white',
            'border-gray-300', 'border-b-white', 'text-blue-600');
          this.classList.remove('bg-gray-100', 'border-transparent',
            'text-gray-500');

          document.querySelectorAll('.nav-item').forEach(navItem =>
          {
            if (navItem.getAttribute('data-customer') ===
              customerName)
            {
              document.querySelectorAll('.nav-item').forEach(i => i
                .classList.remove('active'));
              navItem.classList.add('active');
            }
          });
        });
      });

      const noticePages = Array.from(document.querySelectorAll('[data-notice-page]'));
      const noticePrevButton = document.querySelector('[data-notice-nav="prev"]');
      const noticeNextButton = document.querySelector('[data-notice-nav="next"]');
      const noticeNavContainer = noticePrevButton?.parentElement || null;
      let noticePageButtons = Array.from(document.querySelectorAll('[data-notice-page-btn]'));
      let activeNoticePage = 1;

      const paginateNoticeItems = pageSize => {
        if (!noticePages.length) {
          return;
        }

        const allNoticeItems = noticePages.flatMap(page =>
          Array.from(page.children).filter(item => item.classList.contains('bg-white'))
        );

        if (!allNoticeItems.length) {
          return;
        }

        noticePages.forEach(page => {
          page.innerHTML = '';
          page.classList.add('hidden');
        });

        const requiredPages = Math.ceil(allNoticeItems.length / pageSize);
        const pageClassName = noticePages[0].className;

        for (let index = noticePages.length; index < requiredPages; index += 1) {
          const newPage = document.createElement('div');
          newPage.className = pageClassName;
          newPage.setAttribute('data-notice-page', String(index + 1));
          noticePages[0].parentElement.appendChild(newPage);
          noticePages.push(newPage);
        }

        for (let pageIndex = 0; pageIndex < requiredPages; pageIndex += 1) {
          const start = pageIndex * pageSize;
          const end = start + pageSize;
          allNoticeItems.slice(start, end).forEach(item => {
            noticePages[pageIndex].appendChild(item);
          });
        }

        noticePages.slice(requiredPages).forEach(extraPage => {
          extraPage.remove();
        });

        noticePages.splice(requiredPages);
      };

      const rebuildNoticeButtons = () => {
        if (!noticeNavContainer || !noticePrevButton || !noticeNextButton) {
          return;
        }

        noticePageButtons.forEach(button => button.remove());

        noticePageButtons = noticePages.map((_, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.setAttribute('data-notice-page-btn', String(index + 1));
          button.className = 'w-6 h-6 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs';
          button.textContent = String(index + 1);
          noticeNavContainer.insertBefore(button, noticeNextButton);
          return button;
        });
      };

      const setActiveNoticePage = pageNumber => {
        if (!noticePages.length || !noticePageButtons.length) {
          return;
        }

        const maxPage = noticePages.length;
        activeNoticePage = Math.min(maxPage, Math.max(1, pageNumber));

        noticePages.forEach(page => {
          const current = Number(page.getAttribute('data-notice-page'));
          page.classList.toggle('hidden', current !== activeNoticePage);
        });

        noticePageButtons.forEach(button => {
          const page = Number(button.getAttribute('data-notice-page-btn'));
          button.classList.remove('bg-blue-600', 'text-white', 'font-bold');
          button.classList.add('border', 'border-gray-300', 'bg-white', 'text-gray-700', 'hover:bg-gray-100');

          if (page === activeNoticePage) {
            button.classList.remove('border', 'border-gray-300', 'bg-white', 'text-gray-700', 'hover:bg-gray-100');
            button.classList.add('bg-blue-600', 'text-white', 'font-bold');
          }
        });

        if (noticePrevButton) {
          noticePrevButton.disabled = activeNoticePage === 1;
          noticePrevButton.classList.toggle('opacity-40', activeNoticePage === 1);
        }

        if (noticeNextButton) {
          noticeNextButton.disabled = activeNoticePage === maxPage;
          noticeNextButton.classList.toggle('opacity-40', activeNoticePage === maxPage);
        }
      };

      paginateNoticeItems(5);
      rebuildNoticeButtons();

      noticePageButtons.forEach(button => {
        button.addEventListener('click', () => {
          setActiveNoticePage(Number(button.getAttribute('data-notice-page-btn')));
        });
      });

      if (noticePrevButton) {
        noticePrevButton.addEventListener('click', () => setActiveNoticePage(activeNoticePage - 1));
      }

      if (noticeNextButton) {
        noticeNextButton.addEventListener('click', () => setActiveNoticePage(activeNoticePage + 1));
      }

      setActiveNoticePage(1);

      const statusSelect = document.querySelector('.agent-status-bar select');
      const statusIndicator = document.querySelector('.status-indicator');

      if (!statusSelect || !statusIndicator) {
        return;
      }

      statusSelect.addEventListener('change', function()
      {
        statusIndicator.classList.remove('status-ready', 'status-away',
          'status-busy');

        switch (this.value)
        {
          case 'ready':
            statusIndicator.classList.add('status-ready');
            break;
          case 'away':
          case 'break':
          case 'meeting':
            statusIndicator.classList.add('status-away');
            break;
          case 'busy':
            statusIndicator.classList.add('status-busy');
            break;
        }
      });
});
