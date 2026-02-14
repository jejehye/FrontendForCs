document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', function handleNavClick() {
    document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
    this.classList.add('active');
  });
});

document.querySelectorAll('.tab-item').forEach((tab) => {
  tab.addEventListener('click', function handleTabClick() {
    document.querySelectorAll('.tab-item').forEach((item) => item.classList.remove('active'));
    this.classList.add('active');
  });
});

document.querySelectorAll('.kms-card').forEach((card) => {
  card.addEventListener('click', function handleKmsClick() {
    const content = this.querySelector('p')?.textContent?.trim();
    const messageInput = document.querySelector('input[type="text"][placeholder="메시지를 입력하세요..."]');

    if (content && messageInput) {
      messageInput.value = content;
      messageInput.focus();
    }
  });
});

document.querySelectorAll('.quick-reply').forEach((button) => {
  button.addEventListener('click', function handleQuickReplyClick() {
    const messageInput = document.querySelector('input[type="text"][placeholder="메시지를 입력하세요..."]');

    if (messageInput) {
      messageInput.value = this.textContent;
      messageInput.focus();
    }
  });
});
