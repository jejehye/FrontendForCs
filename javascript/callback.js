window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

const selectOne = (standardSelector, legacySelector) =>
  document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

const selectAll = (standardSelector, legacySelector) => {
  const standardNodes = Array.from(document.querySelectorAll(standardSelector));
  if (standardNodes.length) {
    return standardNodes;
  }
  return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
};

function getModal() {
  return selectOne('[data-role="callback-modal"]', '#callbackModal');
}

function getOutboundModal() {
  return selectOne('[data-role="outbound-modal"]', '#outboundCallModal');
}

function openCallbackModal() {
  const modal = getModal();
  if (!modal) {
    return;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCallbackModal() {
  const modal = getModal();
  if (!modal) {
    return;
  }

  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function openOutboundModal() {
  const modal = getOutboundModal();
  if (!modal) {
    return;
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOutboundModal() {
  const modal = getOutboundModal();
  if (!modal) {
    return;
  }
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function formatPhoneNumber(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function submitOutboundCall() {
  const phoneInput = selectOne('[data-role="outbound-phone-input"]');
  const callerIdInputs = selectAll('[data-role="callback-outbound-callerid"]');
  const formattedPhone = formatPhoneNumber(phoneInput?.value || '');
  const selectedCallerId = callerIdInputs.find(input => input.checked)?.value || '';
  if (!formattedPhone || formattedPhone.length < 12) {
    alert('발신할 전화번호를 정확히 입력해 주세요.');
    phoneInput?.focus();
    return;
  }
  if (!selectedCallerId) {
    alert('발신 표시번호를 선택해 주세요.');
    return;
  }
  alert(`${formattedPhone} 번호로 아웃바운드 콜을 발신합니다. (표시번호: ${selectedCallerId})`);
  closeOutboundModal();
}

function completeCallback() {
  alert('콜백 처리가 완료되었습니다.');
  closeCallbackModal();
}

selectAll('[data-action="callback-open-modal"]', '.callback-card .callback-call-btn').forEach(button => {
  button.addEventListener('click', function handleCallButtonClick() {
    const card = this.closest('[data-callback-id], [data-target="callback-card"]');
    const callbackId = card ? card.dataset.callbackId : null;
    if (callbackId) {
      openCallbackModal(callbackId);
      return;
    }
    openCallbackModal();
  });
});

const modalCloseButton = selectOne('[data-action="callback-modal-close"]', '#callbackModal .callback-modal-header button');
if (modalCloseButton) {
  modalCloseButton.addEventListener('click', closeCallbackModal);
}

const modalCancelButton = selectOne('[data-action="callback-modal-cancel"]', '#callbackModal .callback-modal-actions button:first-child');
if (modalCancelButton) {
  modalCancelButton.addEventListener('click', closeCallbackModal);
}

const modalCompleteButton = selectOne('[data-action="callback-modal-complete"]', '#callbackModal .callback-modal-actions button:last-child');
if (modalCompleteButton) {
  modalCompleteButton.addEventListener('click', completeCallback);
}

const callbackModal = getModal();
if (callbackModal) {
  callbackModal.addEventListener('click', function onModalOverlayClick(event) {
    if (event.target === this) {
      closeCallbackModal();
    }
  });
}

const outboundOpenButton = selectOne('[data-action="callback-open-outbound-modal"]');
if (outboundOpenButton) {
  outboundOpenButton.addEventListener('click', openOutboundModal);
}

const outboundCloseButton = selectOne('[data-action="outbound-modal-close"]');
if (outboundCloseButton) {
  outboundCloseButton.addEventListener('click', closeOutboundModal);
}

const outboundCancelButton = selectOne('[data-action="outbound-modal-cancel"]');
if (outboundCancelButton) {
  outboundCancelButton.addEventListener('click', closeOutboundModal);
}

const outboundSubmitButton = selectOne('[data-action="outbound-call-submit"]');
if (outboundSubmitButton) {
  outboundSubmitButton.addEventListener('click', submitOutboundCall);
}

const outboundPhoneInput = selectOne('[data-role="outbound-phone-input"]');
if (outboundPhoneInput) {
  outboundPhoneInput.addEventListener('input', event => {
    event.target.value = formatPhoneNumber(event.target.value);
  });
}

const outboundModal = getOutboundModal();
if (outboundModal) {
  outboundModal.addEventListener('click', function onOutboundOverlayClick(event) {
    if (event.target === this) {
      closeOutboundModal();
    }
  });
}
