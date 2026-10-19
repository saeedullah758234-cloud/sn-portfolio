/* ==========================================================================
   SN PORTFOLIO V2.0 - AUTHENTICATION & SESSION GUARD
   File: js/auth.js
   Author: Saeed ullah & Naeem ur Rahman
   ========================================================================== */

(function () {
    'use strict';

    // Credentials Configuration
    const USERS = {
        saeed: {
            username: 'saeedullah',
            password: 'saeed123',
            name: 'Saeed ullah',
            key: 'saeed'
        },
        naeem: {
            username: 'naeemurrahman',
            password: 'naeem123',
            name: 'Naeem ur Rahman',
            key: 'naeem'
        }
    };

    // --------------------------------------------------------------------------
    // 1. PUBLIC AUTH METHODS
    // --------------------------------------------------------------------------
    window.auth = {
        // Check if session is active
        isLoggedIn: function () {
            return localStorage.getItem('sn_logged_in') === 'true';
        },

        // Get current logged in user key ('saeed' | 'naeem')
        getCurrentUserKey: function () {
            return localStorage.getItem('sn_user') || 'saeed';
        },

        // Get current user display name
        getCurrentUserName: function () {
            return localStorage.getItem('sn_user_name') || 'Administrator';
        },

        // Validate Credentials & Create Session
        login: function (userKey, username, password) {
            const account = USERS[userKey];
            if (!account) {
                return { success: false, message: 'Invalid profile selection.' };
            }

            if (username.trim() === account.username && password.trim() === account.password) {
                localStorage.setItem('sn_logged_in', 'true');
                localStorage.setItem('sn_user', account.key);
                localStorage.setItem('sn_user_name', account.name);
                return { success: true };
            }

            return { success: false, message: 'Incorrect username or password.' };
        },

        // End Session
        logout: function () {
            localStorage.removeItem('sn_logged_in');
            localStorage.removeItem('sn_user');
            localStorage.removeItem('sn_user_name');
            window.location.href = 'login.html';
        },

        // Route Guard for Protected Pages (dashboard.html)
        requireAuth: function () {
            if (!this.isLoggedIn()) {
                window.location.href = 'login.html';
            }
        }
    };

    // --------------------------------------------------------------------------
    // 2. LOGIN PAGE EVENT HANDLERS
    // --------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname.toLowerCase();

        // Dashboard Route Guard
        if (path.includes('dashboard.html')) {
            window.auth.requireAuth();
        }

        // Login Page Controller
        if (path.includes('login.html')) {
            // Auto redirect if already logged in
            if (window.auth.isLoggedIn()) {
                window.location.href = 'dashboard.html';
                return;
            }

            setupLoginPage();
        }
    });

    function setupLoginPage() {
        const selectorBtns = document.querySelectorAll('.selector-btn');
        const userKeyInput = document.getElementById('selectedUserKey');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginForm = document.getElementById('loginForm');
        const errorBox = document.getElementById('loginError');
        const errorText = document.getElementById('errorText');

        // Toggle Saeed / Naeem selector
        selectorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectorBtns.forEach(b => b.classList.remove('active'));
                const targetBtn = e.currentTarget;
                targetBtn.classList.add('active');

                const key = targetBtn.getAttribute('data-user');
                if (userKeyInput) userKeyInput.value = key;

                // Auto-fill credentials for smooth user experience
                if (USERS[key]) {
                    if (usernameInput) usernameInput.value = USERS[key].username;
                    if (passwordInput) passwordInput.value = USERS[key].password;
                }

                if (errorBox) errorBox.classList.add('hidden');
            });
        });

        // Form Submit
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (errorBox) errorBox.classList.add('hidden');

                const key = userKeyInput ? userKeyInput.value : 'saeed';
                const uname = usernameInput ? usernameInput.value : '';
                const pass = passwordInput ? passwordInput.value : '';

                const result = window.auth.login(key, uname, pass);

                if (result.success) {
                    window.location.href = 'dashboard.html';
                } else {
                    if (errorText) errorText.textContent = result.message;
                    if (errorBox) errorBox.classList.remove('hidden');
                }
            });
        }
    }

})();