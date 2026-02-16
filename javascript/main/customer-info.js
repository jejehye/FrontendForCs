window.MainPageCustomerInfo = (() => {
  const pad2 = number => String(number).padStart(2, '0');

  const formatCurrentDateTime = date =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

  const formatCurrentDateKor = date =>
    `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  const formatAccountNumber = value =>
    value
      .replace(/[^0-9]/g, '')
      .slice(0, 10)
      .replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join('-'));

  const formatResidentId = value =>
    value
      .replace(/[^0-9]/g, '')
      .slice(0, 13)
      .replace(/(\d{6})(\d{0,7})/, (_, p1, p2) => [p1, p2].filter(Boolean).join('-'));

  const initDateDisplays = () => {
    const now = new Date();

    document.querySelectorAll('[data-current-datetime]').forEach(node => {
      node.textContent = formatCurrentDateTime(now);
    });

    document.querySelectorAll('[data-current-date-kor]').forEach(node => {
      node.textContent = formatCurrentDateKor(now);
    });
  };

  const initInputFormatters = () => {
    const accountNumberInput = document.getElementById('account-number');
    const residentIdInput = document.getElementById('resident-id');

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
  };

  const initAgentDisplay = () => {
    const agentDisplayNode = document.querySelector('[data-agent-display]');
    if (!agentDisplayNode) {
      return;
    }

    const currentAgentId = localStorage.getItem('currentAgentId') || localStorage.getItem('rememberedEmployeeId') || '204075';
    const currentAgentName = localStorage.getItem('currentAgentName') || '김민수';

    agentDisplayNode.textContent = `${currentAgentName}(${currentAgentId})`;
  };

  const init = () => {
    initDateDisplays();
    initInputFormatters();
    initAgentDisplay();
  };

  return { init };
})();
