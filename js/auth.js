/* ==========================================
   S&N PORTFOLIO - AUTHENTICATION MODULE
   ========================================== */

// Preloader Hide Failsafe Logic
(function() {
    function hideLoader() {
        const loader = document.getElementById('preloader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 300);
        }
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(hideLoader, 100);
    } else {
        document.addEventListener('DOMContentLoaded', hideLoader);
        window.addEventListener('load', hideLoader);
    }
    setTimeout(hideLoader, 400); // 400ms ultimate fallback
})();

// Credentials Database
const USERS = {
    'saeedullah': { password: 'saeed123', key: 'saeed', name: 'Saeed ullah' },
    'saeed': { password: 'saeed123', key: 'saeed', name: 'Saeed ullah' },
    'naeemurrahman': { password: 'naeem123', key: 'naeem', name: 'Naeem ur Rahman' },
    'naeem': { password: 'naeem123', key: 'naeem', name: 'Naeem ur Rahman' }
};

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('sn_logged_in') === 'true';
}

// Get current logged-in user key ('saeed' or 'naeem')
function getCurrentUser() {
    return localStorage.getItem('sn_user') || 'saeed';
}

// Login function
function login(username, password) {
    const userKey = username.toLowerCase().trim();
    if (USERS[userKey] && USERS[userKey].password === password) {
        localStorage.setItem('sn_logged_in', 'true');
        localStorage.setItem('sn_user', USERS[userKey].key);
        localStorage.setItem('sn_user_name', USERS[userKey].name);
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('sn_logged_in');
    localStorage.removeItem('sn_user');
    localStorage.removeItem('sn_user_name');
    window.location.href = 'login.html';
}

// Auth Protection Guard for Dashboard
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}