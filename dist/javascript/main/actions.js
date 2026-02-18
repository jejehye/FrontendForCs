window.MainPageActions = (() => {
  const selectOne = (standardSelector, legacySelector) =>
    document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

  const selectAll = (standardSelector, legacySelector) => {
    const standardNodes = Array.from(document.querySelectorAll(standardSelector));
    if (standardNodes.length) {
      return standardNodes;
    }
    return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
  };

  const initStatusControl = () => {
    const statusSelect = selectOne('[data-role="agent-status-select"]', '.agent-status-bar select');
    const statusIndicator = selectOne('[data-role="status-indicator"]', '.status-indicator');

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

  const initLogoutAction = () => {
    const logoutButton = selectOne('[data-action="main-logout"]');
    if (!logoutButton) {
      return;
    }

    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('currentAgentId');
      localStorage.removeItem('currentAgentName');
      window.location.assign('/login');
    });
  };

  const initCustomerTransferActions = () => {
    const htsButton = selectOne('[data-action="main-transfer-hts"]', '.verify-transfer-actions .verify-transfer-btn:not(.verify-transfer-btn-goldnet)');
    const goldnetButton = selectOne('[data-action="main-transfer-goldnet"]', '.verify-transfer-actions .verify-transfer-btn-goldnet');

    if (!htsButton && !goldnetButton) {
      return;
    }

    const resolveApiUrl = path => {
      if (!path) {
        return '';
      }

      if (/^https?:\/\//i.test(path)) {
        return path;
      }

      const base = (window.APP_API_BASE || document.body?.dataset?.apiBase || '').replace(/\/+$/, '');
      const normalizedPath = String(path).replace(/^\/+/, '');
      return base ? `${base}/${normalizedPath}` : `/${normalizedPath}`;
    };

    const gatherCustomerPayload = () => ({
      customerName: document.querySelector('#account-owner')?.value?.trim() || '',
      accountNumber: document.querySelector('#account-number')?.value?.trim() || '',
      residentId: document.querySelector('#resident-id')?.value?.trim() || '',
      accountPassword: document.querySelector('#account-password')?.value?.trim() || '',
      transmittedAt: new Date().toISOString()
    });

    const sendCustomerInfo = async (endpoint, channelLabel, buttonNode) => {
      const url = resolveApiUrl(endpoint);
      if (!url) {
        alert(`${channelLabel} 전송 API URL이 설정되지 않았습니다.`);
        return;
      }

      const originalDisabled = buttonNode?.disabled;
      if (buttonNode) {
        buttonNode.disabled = true;
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gatherCustomerPayload())
        });

        if (response.status === 200) {
          alert(`${channelLabel} 고객정보 전송이 완료되었습니다. (200 OK)`);
          return;
        }

        alert(`${channelLabel} 전송 실패: HTTP ${response.status}`);
      } catch (error) {
        alert(`${channelLabel} 전송 실패: 네트워크 오류`);
      } finally {
        if (buttonNode) {
          buttonNode.disabled = Boolean(originalDisabled);
        }
      }
    };

    const htsEndpoint = window.__APP_ENDPOINTS__?.mainTransferHts || '/api/main/transfer/hts';
    const goldnetEndpoint = window.__APP_ENDPOINTS__?.mainTransferGoldnet || '/api/main/transfer/goldnet';

    if (htsButton) {
      htsButton.addEventListener('click', () => {
        void sendCustomerInfo(htsEndpoint, 'HTS', htsButton);
      });
    }

    if (goldnetButton) {
      goldnetButton.addEventListener('click', () => {
        void sendCustomerInfo(goldnetEndpoint, '골드넷+', goldnetButton);
      });
    }
  };

  const initSoftphoneScripts = () => {
    const callToggleButton = selectOne('[data-action="softphone-toggle"]', '[data-call-toggle]');
    const scriptButtons = selectAll('[data-action="softphone-script"]', '[data-softphone-script]');
    const scriptOutput = selectOne('[data-role="softphone-output"]', '[data-softphone-output]');

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
        const scriptName = button.getAttribute('data-target') || button.getAttribute('data-softphone-script') || '안내 멘트';

        if (!isCallActive) {
          setScriptOutput('통화중 상태가 아닙니다. 통화중 ON 후 멘트를 송출해 주세요.', 'is-warn');
          return;
        }

        setScriptOutput(`"${scriptName}" 멘트 송출 중입니다.`, 'is-playing');
      });
    });

    syncCallUi();
  };

  const initOutboundDialer = () => {
    const modal = selectOne('[data-role="main-outbound-modal"]');
    const openButton = selectOne('[data-action="main-open-outbound-modal"]');
    const closeButtons = selectAll('[data-action="main-close-outbound-modal"]');
    const submitButton = selectOne('[data-action="main-submit-outbound-call"]');
    const phoneInput = selectOne('[data-role="main-outbound-phone-input"]');
    const callerIdInputs = selectAll('[data-role="main-outbound-callerid"]');

    if (!modal || !openButton || !phoneInput) {
      return;
    }

    const formatPhoneNumber = value => {
      const digits = (value || '').replace(/\D/g, '').slice(0, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    };

    const openModal = () => {
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      phoneInput.focus();
    };

    const closeModal = () => {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const submitOutboundCall = () => {
      const formattedPhone = formatPhoneNumber(phoneInput.value);
      const selectedCallerId = callerIdInputs.find(input => input.checked)?.value || '';
      if (formattedPhone.length < 12) {
        alert('발신할 번호를 정확히 입력해 주세요.');
        phoneInput.focus();
        return;
      }
      if (!selectedCallerId) {
        alert('발신 표시번호를 선택해 주세요.');
        return;
      }
      alert(`${formattedPhone} 번호로 아웃바운드 콜을 발신합니다. (표시번호: ${selectedCallerId})`);
      closeModal();
    };

    openButton.addEventListener('click', openModal);
    closeButtons.forEach(button => {
      button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });

    phoneInput.addEventListener('input', event => {
      event.target.value = formatPhoneNumber(event.target.value);
    });

    phoneInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitOutboundCall();
      }
    });

    if (submitButton) {
      submitButton.addEventListener('click', submitOutboundCall);
    }
  };

  const initGroupSwitchModal = () => {
    const modal = selectOne('[data-role="main-group-switch-modal"]');
    const openButton = selectOne('[data-action="main-open-group-switch-modal"]');
    const closeButtons = selectAll('[data-action="main-close-group-switch-modal"]');
    const submitButton = selectOne('[data-action="main-submit-group-switch"]');
    const skillSelect = selectOne('[data-role="main-group-skill-select"]');
    const numberInput = selectOne('[data-role="main-group-switch-number"]');

    if (!modal || !openButton || !skillSelect || !numberInput) {
      return;
    }

    const normalizeNumber = value => (value || '').replace(/\D/g, '').slice(0, 8);

    const openModal = () => {
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      numberInput.focus();
    };

    const closeModal = () => {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const submitGroupSwitch = () => {
      const targetSkill = skillSelect.value || '';
      const targetNumber = normalizeNumber(numberInput.value);

      if (!targetSkill) {
        alert('전환할 그룹을 선택해 주세요.');
        skillSelect.focus();
        return;
      }

      if (!targetNumber) {
        alert('전환 번호를 입력해 주세요.');
        numberInput.focus();
        return;
      }

      alert(`${targetSkill} (${targetNumber}) 그룹으로 전환합니다.`);
      closeModal();
    };

    openButton.addEventListener('click', openModal);

    closeButtons.forEach(button => {
      button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });

    numberInput.addEventListener('input', event => {
      event.target.value = normalizeNumber(event.target.value);
    });

    numberInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitGroupSwitch();
      }
    });

    if (submitButton) {
      submitButton.addEventListener('click', submitGroupSwitch);
    }
  };

  const init = () => {
    initStatusControl();
    initLogoutAction();
    initCustomerTransferActions();
    initSoftphoneScripts();
    initOutboundDialer();
    initGroupSwitchModal();
  };

  return { init };
})();
