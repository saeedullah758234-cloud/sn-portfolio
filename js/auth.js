/* ==========================================================================
   SN PORTFOLIO V2.0 - AUTHENTICATION & SESSION GUARD
   File: js/auth.js
   Author: Saeed ullah & Naeem ur Rahman
   ========================================================================== */

(function () {
    'use strict';

    // Flexible User Credentials Mapping
    const USERS = {
        saeed: {
            validUsernames: ['saeedullah', 'saeed', 'saeed123', 'saeedullah758234'],
            validPasswords: ['saeed123', 'saeed'],
            name: 'Saeed ullah',
            key: 'saeed'
        },
        naeem: {
            validUsernames: ['naeemurrahman', 'naeem', 'naeem123'],
            validPasswords: ['naeem123', 'naeem'],
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

        // Validate Credentials & Create Session (Super Flexible & Case Insensitive)
        login: function (userKey, username, password) {
            const cleanUname = (username || '').trim().toLowerCase();
            const cleanPass = (password || '').trim();

            if (!cleanUname || !cleanPass) {
                return { success: false, message: 'Please fill in both username and password.' };
            }

            // Determine profile target (Selected key or auto-detect based on username)
            let targetKey = userKey || 'saeed';
            
            // Auto-detect if username clearly belongs to naeem or saeed
            if (cleanUname.includes('naeem')) {
                targetKey = 'naeem';
            } else if (cleanUname.includes('saeed')) {
                targetKey = 'saeed';
            }

            const account = USERS[targetKey];
            if (!account) {
                return { success: false, message: 'Invalid profile selection.' };
            }

            const isUsernameValid = account.validUsernames.some(u => u.toLowerCase() === cleanUname);
            const isPasswordValid = account.validPasswords.some(p => p === cleanPass);

            if (isUsernameValid && isPasswordValid) {
                localStorage.setItem('sn_logged_in', 'true');
                localStorage.setItem('sn_user', account.key);
                localStorage.setItem('sn_user_name', account.name);
                return { success: true, key: account.key };
            }

            // Fallback: Check if credentials match the OTHER account
            const otherKey = targetKey === 'saeed' ? 'naeem' : 'saeed';
            const otherAccount = USERS[otherKey];
            const isOtherUsernameValid = otherAccount.validUsernames.some(u => u.toLowerCase() === cleanUname);
            const isOtherPasswordValid = otherAccount.validPasswords.some(p => p === cleanPass);

            if (isOtherUsernameValid && isOtherPasswordValid) {
                localStorage.setItem('sn_logged_in', 'true');
                localStorage.setItem('sn_user', otherAccount.key);
                localStorage.setItem('sn_user_name', otherAccount.name);
                return { success: true, key: otherAccount.key };
            }

            return { success: false, message: 'Incorrect username or password. Please try again.' };
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
                if (key === 'saeed') {
                    if (usernameInput) usernameInput.value = 'saeedullah';
                    if (passwordInput) passwordInput.value = 'saeed123';
                } else if (key === 'naeem') {
                    if (usernameInput) usernameInput.value = 'naeemurrahman';
                    if (passwordInput) passwordInput.value = 'naeem123';
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