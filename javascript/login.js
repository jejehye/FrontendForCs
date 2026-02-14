const loginForm = document.getElementById('loginForm');
const employeeIdInput = document.getElementById('employeeId');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

if (localStorage.getItem('rememberedEmployeeId')) {
    employeeIdInput.value = localStorage.getItem('rememberedEmployeeId');
    rememberMeCheckbox.checked = true;
}

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

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

    const loginBtn = loginForm.querySelector('.login-btn');
    loginBtn.innerHTML = '<span class="spinner">⟳</span>로그인 중...';
    loginBtn.disabled = true;

    setTimeout(function () {
        window.location.href = 'dashboard.html';
    }, 1000);
});

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('show');

    setTimeout(function () {
        errorMessage.classList.remove('show');
    }, 3000);
}

employeeIdInput.addEventListener('input', function () {
    errorMessage.classList.remove('show');
});

passwordInput.addEventListener('input', function () {
    errorMessage.classList.remove('show');
});

passwordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});
