/**
 * Login & Signup Controller
 */
const LoginApp = {
    init() {
        // Redirect if already logged in
        if (localStorage.getItem('userId')) {
            window.location.href = '/';
            return;
        }

        this.bindEvents();
    },

    bindEvents() {
        const tabLogin = document.getElementById('tabLogin');
        const tabSignup = document.getElementById('tabSignup');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        });

        tabSignup.addEventListener('click', () => {
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    },

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        if (!email || !password) return;

        const submitBtn = document.querySelector('#loginForm .btn-submit');
        submitBtn.disabled = true;

        try {
            const user = await API.login(email, password);
            this.success(user);
        } catch (err) {
            this.showToast(err.message || 'Login failed', 'error');
            submitBtn.disabled = false;
        }
    },

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const ageInput = document.getElementById('signupAge').value.trim();
        const age = ageInput ? parseInt(ageInput, 10) : undefined;

        if (!name || !email || !password) return;

        const submitBtn = document.querySelector('#signupForm .btn-submit');
        submitBtn.disabled = true;

        try {
            const user = await API.createUser({ name, email, password, age });
            this.success(user);
        } catch (err) {
            this.showToast(err.message || 'Signup failed', 'error');
            submitBtn.disabled = false;
        }
    },

    success(user) {
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
        this.showToast('Success! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        // Required minimal CSS for toasts is already in style.css or we can rely on it if previously present.
        // Assuming toast-exit is still needed, it takes 300ms.
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => LoginApp.init());
