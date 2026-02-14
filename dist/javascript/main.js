/* Extracted from main.html */

window.FontAwesomeConfig = {
        autoReplaceSvg: 'nest'
      };
      tailwind.config = {
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
      }

document.addEventListener('DOMContentLoaded', () => {
document.querySelectorAll('.nav-item').forEach(item =>
      {
        item.addEventListener('click', function()
        {
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

      const statusSelect = document.querySelector('.agent-status-bar select');
      const statusIndicator = document.querySelector('.status-indicator');

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
