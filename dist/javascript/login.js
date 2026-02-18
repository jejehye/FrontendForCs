const selectOne = (standardSelector, legacySelector) =>
  document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

const loginForm = selectOne('[data-role="login-form"]', '#loginForm');
const employeeIdInput = selectOne('[data-role="employee-id"]', '#employeeId');
const passwordInput = selectOne('[data-role="password"]', '#password');
const rememberMeCheckbox = selectOne('[data-role="remember-me"]', '#rememberMe');
const errorMessage = selectOne('[data-role="error-message"]', '#errorMessage');
const errorText = selectOne('[data-role="error-text"]', '#errorText');

if (!loginForm || !employeeIdInput || !passwordInput || !rememberMeCheckbox || !errorMessage || !errorText) {
  throw new Error('Login DOM hooks are missing.');
}

if (localStorage.getItem('rememberedEmployeeId')) {
  employeeIdInput.value = localStorage.getItem('rememberedEmployeeId');
  rememberMeCheckbox.checked = true;
}

loginForm.addEventListener('submit', function onLoginSubmit(event) {
  event.preventDefault();

  const employeeId = employeeIdInput.value.trim();
  const password = passwordInput.value.trim();

  if (!employeeId || !password) {
    showError('사번과 비밀번호를 모두 입력해주세요.');
    return;
  }

  if (employeeId.length < 4) {
    showError('사번은 4자리 이상이어야 합니다.');
    return;
  }

  if (password.length < 4) {
    showError('비밀번호는 4자리 이상이어야 합니다.');
    return;
  }

  if (rememberMeCheckbox.checked) {
    localStorage.setItem('rememberedEmployeeId', employeeId);
  } else {
    localStorage.removeItem('rememberedEmployeeId');
  }
  localStorage.setItem('currentAgentId', employeeId);

  const loginBtn = selectOne('[data-action="login-submit"]', '.login-btn');
  if (loginBtn) {
    loginBtn.innerHTML = '<span class="spinner">⟳</span>로그인 중...';
    loginBtn.disabled = true;
  }

  setTimeout(function redirectToMain() {
    const mainPageUrl = new URL('./main', window.location.href);
    window.location.assign(mainPageUrl.href);
  }, 1000);
});

function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.add('show');

  setTimeout(function hideError() {
    errorMessage.classList.remove('show');
  }, 3000);
}

employeeIdInput.addEventListener('input', function onEmployeeIdInput() {
  errorMessage.classList.remove('show');
});

passwordInput.addEventListener('input', function onPasswordInput() {
  errorMessage.classList.remove('show');
});

passwordInput.addEventListener('keypress', function onPasswordKeypress(event) {
  if (event.key === 'Enter') {
    loginForm.requestSubmit();
  }
});
