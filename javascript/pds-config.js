        window.FontAwesomeConfig = { autoReplaceSvg: 'nest' };
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#0046ff',
                        secondary: '#6c757d',
                        success: '#00c73c',
                        danger: '#ff3b30',
                        warning: '#ff9500',
                        info: '#007aff',
                        light: '#f8f9fa',
                        dark: '#1d1d1f',
                        'chat-bg': '#f5f5f7',
                        'agent-bubble': '#ffffff',
                        'customer-bubble': '#e8e8ed',
                        'panel-border': '#d2d2d7',
                        'highlight-blue': '#e5edff',
                        'tag-blue': '#0046ff',
                        'sidebar-bg': '#0046ff',
                    },
                    fontFamily: {
                        sans: ['Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
                    },
                    fontSize: {
                        'xxs': '0.65rem',
                    }
                }
            }
        }
