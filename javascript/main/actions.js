window.MainPageActions = (() => {
  const initStatusControl = () => {
    const statusSelect = document.querySelector('.agent-status-bar select');
    const statusIndicator = document.querySelector('.status-indicator');

    if (!statusSelect || !statusIndicator) {
      return;
    }

    statusSelect.addEventListener('change', function onStatusChange() {
      statusIndicator.classList.remove('status-ready', 'status-away', 'status-busy');

      switch (this.value) {
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
        default:
          break;
      }
    });
  };

  const initSoftphoneScripts = () => {
    const callToggleButton = document.querySelector('[data-call-toggle]');
    const scriptButtons = Array.from(document.querySelectorAll('[data-softphone-script]'));
    const scriptOutput = document.querySelector('[data-softphone-output]');

    let isCallActive = false;

    const setScriptOutput = (message, mode) => {
      if (!scriptOutput) {
        return;
      }

      scriptOutput.textContent = message;
      scriptOutput.classList.remove('is-playing', 'is-warn');
      if (mode) {
        scriptOutput.classList.add(mode);
      }
    };

    const syncCallUi = () => {
      if (callToggleButton) {
        callToggleButton.textContent = isCallActive ? '통화중 ON' : '통화중 OFF';
        callToggleButton.classList.toggle('is-active', isCallActive);
      }

      scriptButtons.forEach(button => {
        button.disabled = !isCallActive;
      });

      if (!isCallActive) {
        setScriptOutput('통화중 상태에서 버튼을 누르면 멘트가 송출됩니다.', '');
      }
    };

    if (callToggleButton) {
      callToggleButton.addEventListener('click', () => {
        isCallActive = !isCallActive;
        syncCallUi();
      });
    }

    scriptButtons.forEach(button => {
      button.addEventListener('click', () => {
        const scriptName = button.getAttribute('data-softphone-script') || '안내 멘트';

        if (!isCallActive) {
          setScriptOutput('통화중 상태가 아닙니다. 통화중 ON 후 멘트를 송출해 주세요.', 'is-warn');
          return;
        }

        setScriptOutput(`"${scriptName}" 멘트 송출 중입니다.`, 'is-playing');
      });
    });

    syncCallUi();
  };

  const init = () => {
    initStatusControl();
    initSoftphoneScripts();
  };

  return { init };
})();
