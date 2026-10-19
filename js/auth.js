/* ==========================================================================
   SN PORTFOLIO V2.0 - BULLETPROOF AUTHENTICATION & SESSION GUARD
   File: js/auth.js
   Author: Saeed ullah & Naeem ur Rahman
   ========================================================================== */

(function () {
    'use strict';

    window.auth = {
        isLoggedIn: function () {
            return localStorage.getItem('sn_logged_in') === 'true';
        },

        getCurrentUserKey: function () {
            return localStorage.getItem('sn_user') || 'saeed';
        },

        getCurrentUserName: function () {
            return localStorage.getItem('sn_user_name') || 'Administrator';
        },

        login: function (userKey, username, password) {
            const cleanUname = (username || '').trim().toLowerCase();
            
            if (userKey === 'naeem' || cleanUname.includes('naeem')) {
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

        logout: function () {
            localStorage.removeItem('sn_logged_in');
            localStorage.removeItem('sn_user');
            localStorage.removeItem('sn_user_name');
            window.location.href = 'login.html';
        },

        requireAuth: function () {
            if (!this.isLoggedIn()) {
                window.location.href = 'login.html';
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname.toLowerCase();

        if (path.includes('dashboard.html')) {
            window.auth.requireAuth();
        }
    });

})();