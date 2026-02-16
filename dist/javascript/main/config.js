window.FontAwesomeConfig = {
  autoReplaceSvg: 'nest'
};

if (window.tailwind) {
  window.tailwind.config = {
    theme: {
      extend: {
        colors: {
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
          'sidebar-bg': '#1e293b'
        },
        fontFamily: {
          sans: ['Pretendard', 'Malgun Gothic', 'Dotum', 'sans-serif']
        },
        fontSize: {
          xxs: '0.65rem'
        }
      }
    }
  };
}
