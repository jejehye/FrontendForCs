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
