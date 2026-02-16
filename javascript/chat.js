window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

document.querySelectorAll('.kms-card').forEach((card) => {
  card.addEventListener('click', function handleKmsClick() {
    const content = this.querySelector('p')?.textContent?.trim();
    const messageInput = document.querySelector('.chat__input');

    if (content && messageInput) {
      messageInput.value = content;
      messageInput.focus();
    }
  });
});

document.querySelectorAll('.quick-reply').forEach((button) => {
  button.addEventListener('click', function handleQuickReplyClick() {
    const messageInput = document.querySelector('.chat__input');

    if (messageInput) {
      messageInput.value = this.textContent;
      messageInput.focus();
    }
  });
});
