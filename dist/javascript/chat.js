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

selectAll('[data-role="kms-card"]', '.kms-card').forEach(card => {
  card.addEventListener('click', function handleKmsClick() {
    const content = this.querySelector('p')?.textContent?.trim();
    const messageInput = selectOne('[data-role="chat-message-input"]', '.chat__input');

    if (content && messageInput) {
      messageInput.value = content;
      messageInput.focus();
    }
  });
});

selectAll('[data-action="quick-reply"]', '.quick-reply').forEach(button => {
  button.addEventListener('click', function handleQuickReplyClick() {
    const messageInput = selectOne('[data-role="chat-message-input"]', '.chat__input');

    if (messageInput) {
      messageInput.value = this.textContent;
      messageInput.focus();
    }
  });
});
