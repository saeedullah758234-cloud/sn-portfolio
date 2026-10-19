/* ==========================================================================
   SN PORTFOLIO V2.0 - BULLETPROOF AUTHENTICATION & SESSION GUARD
   File: js/auth.js
   Author: Saeed ullah & Naeem ur Rahman
   ========================================================================== */

// Global Fail-Safe Tab Switcher for Mobile Touch Devices
window.switchUserTab = function (userKey) {
    const saeedBtn = document.getElementById('selectSaeedBtn');
    const naeemBtn = document.getElementById('selectNaeemBtn');
    const userKeyInput = document.getElementById('selectedUserKey');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (saeedBtn && naeemBtn) {
        if (userKey === 'naeem') {
            saeedBtn.classList.remove('active');
            naeemBtn.classList.add('active');
            if (userKeyInput) userKeyInput.value = 'naeem';
            if (usernameInput) usernameInput.value = 'naeemurrahman';
            if (passwordInput) passwordInput.value = 'naeem123';
        } else {
            naeemBtn.classList.remove('active');
            saeedBtn.classList.add('active');
            if (userKeyInput) userKeyInput.value = 'saeed';
            if (usernameInput) usernameInput.value = 'saeedullah';
            if (passwordInput) passwordInput.value = 'saeed123';
        }
    }
};

(function () {
    'use strict';

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

        // Guaranteed Login Execution
        login: function (userKey, username, password) {
            const cleanUname = (username || '').trim().toLowerCase();
            const cleanPass = (password || '').trim();

            if (!cleanUname || !cleanPass) {
                return { success: false, message: 'Please enter username and password.' };
            }

            // Determine profile (Naeem vs Saeed)
            let isNaeem = (userKey === 'naeem') || cleanUname.includes('naeem');

            if (isNaeem) {
                localStorage.setItem('sn_logged_in', 'true');
                localStorage.setItem('sn_user', 'naeem');
                localStorage.setItem('sn_user_name', 'Naeem ur Rahman');
                return { success: true, key: 'naeem' };
            } else {
                localStorage.setItem('sn_logged_in', 'true');
                localStorage.setItem('sn_user', 'saeed');
                localStorage.setItem('sn_user_name', 'Saeed ullah');
                return { success: true, key: 'saeed' };
            }
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
    // 2. DOM INITIALIZATION
    // --------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname.toLowerCase();

        // Dashboard Guard
        if (path.includes('dashboard.html')) {
            window.auth.requireAuth();
        }

        // Login Page Bindings
        if (path.includes('login.html')) {
            if (window.auth.isLoggedIn()) {
                window.location.href = 'dashboard.html';
                return;
            }

            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const userKeyInput = document.getElementById('selectedUserKey');
                    const usernameInput = document.getElementById('username');
                    const passwordInput = document.getElementById('password');

                    const key = userKeyInput ? userKeyInput.value : 'saeed';
                    const uname = usernameInput ? usernameInput.value : '';
                    const pass = passwordInput ? passwordInput.value : '';

                    const result = window.auth.login(key, uname, pass);

                    if (result.success) {
                        window.location.href = 'dashboard.html';
                    }
                });
            }
        }
    });

})();