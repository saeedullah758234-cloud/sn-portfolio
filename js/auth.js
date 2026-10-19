// ============================================
// S&N PORTFOLIO - AUTHENTICATION
// Handles login.html and redirects
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (typeof db !== 'undefined' && db.checkAuth()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Set Theme
    const htmlEl = document.documentElement;
    if(typeof db !== 'undefined' && db.getTheme) {
        htmlEl.setAttribute('data-theme', db.getTheme());
    }

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userVal = document.getElementById('username').value.trim();
            const passVal = document.getElementById('password').value.trim();
            
            errorMsg.style.display = 'none';

            if (typeof db === 'undefined') {
                errorMsg.textContent = "Database connection error!";
                errorMsg.style.display = 'block';
                return;
            }

            const loggedInUser = db.login(userVal, passVal);
            
            if (loggedInUser) {
                // Success
                window.location.href = 'dashboard.html';
            } else {
                // Failed
                errorMsg.textContent = "Invalid username or password!";
                errorMsg.style.display = 'block';
            }
        });
    }
});