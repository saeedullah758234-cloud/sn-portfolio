/* ==========================================
   SAEED & NAEEM PORTFOLIO - AUTHENTICATION
   Login, Session, Logout, Route Protection
   ========================================== */

const Auth = (() => {

    const SESSION_KEY = 'sn_admin_session';

    // ---- LOGIN ----
    function login(username, password) {
        const result = Database.authenticate(username, password);

        if (result.success) {
            const session = {
                adminId: result.adminId,
                fullName: result.fullName,
                role: result.role,
                loginTime: new Date().toISOString()
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return { success: true };
        }

        return { success: false, message: result.message };
    }

    // ---- LOGOUT ----
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    }

    // ---- GET CURRENT SESSION ----
    function getSession() {
        const data = sessionStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    }

    // ---- CHECK IF LOGGED IN ----
    function isLoggedIn() {
        return getSession() !== null;
    }

    // ---- GET CURRENT ADMIN ID ----
    function getCurrentAdminId() {
        const session = getSession();
        return session ? session.adminId : null;
    }

    // ---- PROTECT ROUTE ----
    // Call this on admin-only pages (dashboard.html)
    function protectRoute() {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // ---- REDIRECT IF ALREADY LOGGED IN ----
    // Call this on login page
    function redirectIfLoggedIn() {
        if (isLoggedIn()) {
            window.location.href = 'dashboard.html';
            return true;
        }
        return false;
    }

    return {
        login,
        logout,
        getSession,
        isLoggedIn,
        getCurrentAdminId,
        protectRoute,
        redirectIfLoggedIn
    };

})();

// =============================================
//  LOGIN PAGE LOGIC
// =============================================
document.addEventListener('DOMContentLoaded', () => {

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // If on login page
    if (currentPage === 'login.html') {
        // Redirect if already logged in
        Auth.redirectIfLoggedIn();
        initLoginPage();
    }

    // If on dashboard page, protect it
    if (currentPage === 'dashboard.html') {
        if (!Auth.protectRoute()) return;
    }

    function initLoginPage() {
        const form = document.getElementById('loginForm');
        const errorDiv = document.getElementById('loginError');
        const errorText = document.getElementById('loginErrorText');
        const btnLoader = document.getElementById('btnLoader');
        const toggleBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('loginPassword');

        if (!form) return;

        // Toggle password visibility
        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                toggleBtn.innerHTML = type === 'password'
                    ? '<i class="fas fa-eye"></i>'
                    : '<i class="fas fa-eye-slash"></i>';
            });
        }

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('loginUsername').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;

            // Hide previous errors
            if (errorDiv) errorDiv.classList.remove('show');

            // Show loader
            if (btnLoader) btnLoader.style.display = 'block';

            // Simulate network delay for UX
            setTimeout(() => {
                const result = Auth.login(username, password);

                if (btnLoader) btnLoader.style.display = 'none';

                if (result.success) {
                    // Success — redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    // Show error
                    if (errorText) errorText.textContent = result.message || 'Invalid credentials';
                    if (errorDiv) errorDiv.classList.add('show');

                    // Shake animation
                    form.style.animation = 'none';
                    form.offsetHeight; // trigger reflow
                    form.style.animation = 'shake 0.5s ease';
                }
            }, 800);
        });
    }
});

// ---- SHAKE ANIMATION (injected via JS) ----
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);