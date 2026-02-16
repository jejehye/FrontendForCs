document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    const targetPage = item.getAttribute('data-page');
    if (!targetPage) return;

    if (window.location.pathname.endsWith(targetPage)) {
      return;
    }
    window.location.href = targetPage;
  });
});

const registerBtn = document.getElementById('registerExcludeBtn');
const pendingList = document.getElementById('pendingList');
const historyList = document.getElementById('historyList');

function createBadge(type) {
  const span = document.createElement('span');
  span.className = `specific-badge specific-badge-${type}`;
  if (type === 'approved') span.textContent = '승인완료';
  if (type === 'rejected') span.textContent = '반려';
  if (type === 'pending') span.textContent = '승인대기';
  return span;
}

function createHistoryItem(name, category, reason, status) {
  const item = document.createElement('article');
  item.className = 'specific-item';
  item.innerHTML = `
    <div class="specific-item-head">
      <strong>${name}</strong>
    </div>
    <p>유형: ${category}</p>
    <p>사유: ${reason}</p>
  `;
  item.querySelector('.specific-item-head').appendChild(createBadge(status));
  historyList.prepend(item);
}

function wireApprovalActions(scope = document) {
  scope.querySelectorAll('[data-action="approve"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.specific-item');
      if (!item) return;

      const name = item.querySelector('strong')?.textContent?.trim() || '상담원';
      const lines = item.querySelectorAll('p');
      const category = (lines[0]?.textContent || '').replace('유형: ', '');
      const reason = (lines[1]?.textContent || '').replace('사유: ', '');

      item.remove();
      createHistoryItem(name, category, reason, 'approved');
    });
  });

  scope.querySelectorAll('[data-action="reject"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.specific-item');
      if (!item) return;

      const name = item.querySelector('strong')?.textContent?.trim() || '상담원';
      const lines = item.querySelectorAll('p');
      const category = (lines[0]?.textContent || '').replace('유형: ', '');
      const reason = (lines[1]?.textContent || '').replace('사유: ', '');

      item.remove();
      createHistoryItem(name, category, reason, 'rejected');
    });
  });
}

if (registerBtn && pendingList) {
  registerBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('agentName');
    const typeInput = document.getElementById('excludeType');
    const reasonInput = document.getElementById('excludeReason');

    const name = nameInput?.value.trim();
    const category = typeInput?.value.trim();
    const reason = reasonInput?.value.trim();

    if (!name || !category || !reason) {
      alert('상담원명, 제외 유형, 사유를 모두 입력해 주세요.');
      return;
    }

    const item = document.createElement('article');
    item.className = 'specific-item';
    item.innerHTML = `
      <div class="specific-item-head">
        <strong>${name}</strong>
      </div>
      <p>유형: ${category}</p>
      <p>사유: ${reason}</p>
      <div class="specific-item-actions">
        <button class="specific-btn specific-btn-secondary" data-action="reject">반려</button>
        <button class="specific-btn specific-btn-primary" data-action="approve">승인</button>
      </div>
    `;
    item.querySelector('.specific-item-head').appendChild(createBadge('pending'));
    pendingList.prepend(item);
    wireApprovalActions(item);

    nameInput.value = '';
    reasonInput.value = '';
  });
}

wireApprovalActions(document);
