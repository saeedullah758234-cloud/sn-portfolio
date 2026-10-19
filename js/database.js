// ============================================
// S&N PORTFOLIO - FIREBASE CLOUD DATABASE
// Connected to Google Realtime Database
// ============================================

// Firebase Configuration Keys
const firebaseConfig = {
    apiKey: "AIzaSyD9TwGnhUGg92qWiv5zROJ50Ze0CbVgp_Q",
    authDomain: "sn-portfolio.firebaseapp.com",
    databaseURL: "https://sn-portfolio-default-rtdb.firebaseio.com",
    projectId: "sn-portfolio",
    storageBucket: "sn-portfolio.firebasestorage.app",
    messagingSenderId: "691206200263",
    appId: "1:691206200263:web:b70e58712d39c4787997e2",
    measurementId: "G-RS8BCD1VG0"
};

// Default Fallback Data for Both Admins
const defaultData = {
    saeed: {
        name: 'Saeed ullah',
        title: 'Full Stack Web Developer',
        profileImage: '',
        coverImage: '',
        intro: 'Building modern, responsive, and high-performance websites.',
        about: 'Hi, I am Saeed ullah, a passionate Full Stack Web Developer with expertise in creating modern, responsive, and user-friendly websites. I love turning ideas into reality through clean code and beautiful design.',
        email: 'saeed@example.com',
        phone: '+92 300 0000000',
        location: 'Pakistan',
        website: 'https://saeed-portfolio.com',
        bank: 'Meezan Bank | Acc: 1234567890',
        whatsapp: '923000000000',
        education: [
            {
                id: 1,
                degree: 'Bachelor of Computer Science',
                institution: 'University of Technology',
                field: 'Software Engineering',
                startYear: '2018',
                endYear: '2022',
                description: 'Specialized in web development and software architecture.'
            }
        ],
        experience: [
            {
                id: 1,
                jobTitle: 'Senior Web Developer',
                company: 'Tech Solutions Inc.',
                employmentType: 'Full-time',
                startDate: '2022-06',
                endDate: '',
                currentlyWorking: true,
                description: 'Developing enterprise web applications with React, Node.js, and modern frameworks.'
            }
        ],
        skills: [
            { id: 1, name: 'HTML & CSS', level: 'Expert', category: 'Technical' },
            { id: 2, name: 'JavaScript', level: 'Expert', category: 'Technical' },
            { id: 3, name: 'React.js', level: 'Advanced', category: 'Technical' },
            { id: 4, name: 'Node.js', level: 'Advanced', category: 'Technical' },
            { id: 5, name: 'VS Code', level: 'Expert', category: 'Software' }
        ],
        projects: [
            {
                id: 1,
                title: 'E-Commerce Platform',
                description: 'A full-featured online store with payment integration and admin panel.',
                image: 'https://via.placeholder.com/400x250/00f3ff/0a0a1a?text=E-Commerce',
                technologies: 'React, Node.js, MongoDB',
                link: '#',
                github: '#'
            },
            {
                id: 2,
                title: 'Portfolio Website',
                description: 'Modern responsive portfolio with dark mode and smooth animations.',
                image: 'https://via.placeholder.com/400x250/7b2cbf/ffffff?text=Portfolio',
                technologies: 'HTML, CSS, JavaScript',
                link: '#',
                github: '#'
            }
        ],
        services: [
            {
                id: 1,
                title: 'Website Development',
                description: 'Custom responsive websites built with modern technologies.',
                icon: 'fa-code',
                skills: 'HTML, CSS, JavaScript, React'
            }
        ],
        certifications: [],
        social: {
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            facebook: '',
            instagram: '',
            youtube: '',
            twitter: ''
        },
        languages: 'English, Urdu, Pashto',
        interests: 'Coding, Tech, Reading',
        goals: 'To build innovative web solutions.',
        resume: ''
    },

    naeem: {
        name: 'Naeem ur Rahman',
        title: 'Professional Video Editor',
        profileImage: '',
        coverImage: '',
        intro: 'Creating cinematic stories through professional video editing.',
        about: 'Hi, I am Naeem ur Rahman, a professional Video Editor with years of experience in creating cinematic videos, wedding highlights, YouTube content, and commercial advertisements.',
        email: 'naeem@example.com',
        phone: '+92 300 0000000',
        location: 'Pakistan',
        website: 'https://naeem-portfolio.com',
        bank: 'HBL Bank | Acc: 0987654321',
        whatsapp: '923000000000',
        education: [
            {
                id: 1,
                degree: 'Diploma in Film Production',
                institution: 'Film Academy',
                field: 'Video Production & Editing',
                startYear: '2019',
                endYear: '2021',
                description: 'Specialized in cinematic video editing and color grading.'
            }
        ],
        experience: [
            {
                id: 1,
                jobTitle: 'Senior Video Editor',
                company: 'Creative Studios',
                employmentType: 'Full-time',
                startDate: '2021-08',
                endDate: '',
                currentlyWorking: true,
                description: 'Editing commercials, wedding videos, and YouTube content.'
            }
        ],
        skills: [
            { id: 1, name: 'Adobe Premiere Pro', level: 'Expert', category: 'Software' },
            { id: 2, name: 'After Effects', level: 'Advanced', category: 'Software' },
            { id: 3, name: 'DaVinci Resolve', level: 'Advanced', category: 'Software' },
            { id: 4, name: 'Color Grading', level: 'Expert', category: 'Technical' }
        ],
        projects: [
            {
                id: 1,
                title: 'Cinematic Wedding Film',
                description: 'A romantic wedding highlight reel with color grading.',
                image: 'https://via.placeholder.com/400x250/7b2cbf/ffffff?text=Wedding+Film',
                technologies: 'Premiere Pro, After Effects',
                link: '#',
                github: ''
            }
        ],
        services: [
            {
                id: 1,
                title: 'Video Editing',
                description: 'Professional video editing for YouTube and commercials.',
                icon: 'fa-video',
                skills: 'Premiere Pro, After Effects'
            }
        ],
        certifications: [],
        social: {
            linkedin: 'https://linkedin.com',
            github: '',
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            youtube: 'https://youtube.com',
            twitter: ''
        },
        languages: 'English, Urdu, Pashto',
        interests: 'Film Making, Photography',
        goals: 'To create inspiring visual stories.',
        resume: ''
    }
};

// --- DYNAMIC FIREBASE LOADER ---
let isFirebaseInitialized = false;
let firebaseDb = null;

function loadFirebaseScripts() {
    return new Promise((resolve, reject) => {
        if (window.firebase) {
            resolve();
            return;
        }

        const scriptApp = document.createElement('script');
        scriptApp.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
        scriptApp.onload = () => {
            const scriptDb = document.createElement('script');
            scriptDb.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
            scriptDb.onload = () => {
                resolve();
            };
            scriptDb.onerror = reject;
            document.head.appendChild(scriptDb);
        };
        scriptApp.onerror = reject;
        document.head.appendChild(scriptApp);
    });
}

async function initFirebase() {
    if (isFirebaseInitialized && firebaseDb) return firebaseDb;

    try {
        await loadFirebaseScripts();
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        firebaseDb = firebase.database();
        isFirebaseInitialized = true;
        return firebaseDb;
    } catch (err) {
        console.error("Firebase init failed, using localStorage fallback:", err);
        return null;
    }
}

// Database Operations Manager
const db = {
    // Get user data (Reads from Firebase Cloud, falls back to localStorage/default)
    getUser: async function(userId) {
        try {
            const fb = await initFirebase();
            if (fb) {
                const snapshot = await fb.ref('users/' + userId).once('value');
                if (snapshot.exists()) {
                    const cloudData = snapshot.val();
                    const merged = { ...defaultData[userId], ...cloudData };
                    localStorage.setItem(`portfolio_${userId}`, JSON.stringify(merged));
                    return merged;
                }
            }
        } catch (error) {
            console.warn("Could not fetch from Firebase, checking localStorage:", error);
        }

        // Local Storage / Default Fallback
        try {
            const localData = localStorage.getItem(`portfolio_${userId}`);
            if (localData) {
                return JSON.parse(localData);
            }
        } catch (e) {
            console.error("LocalStorage error:", e);
        }

        return defaultData[userId] || defaultData['saeed'];
    },

    // Save user data (Writes to Firebase Cloud AND LocalStorage)
    saveUser: async function(userId, data) {
        let firebaseSuccess = false;

        // 1. Try Firebase Cloud Save
        try {
            const fb = await initFirebase();
            if (fb) {
                await fb.ref('users/' + userId).set(data);
                firebaseSuccess = true;
            }
        } catch (error) {
            console.error("Error saving to Firebase Cloud:", error);
        }

        // 2. LocalStorage Backup Save
        try {
            localStorage.setItem(`portfolio_${userId}`, JSON.stringify(data));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }

        return true;
    },

    // Auth Utilities
    checkAuth: function() {
        return localStorage.getItem('admin_token');
    },

    getCurrentUser: function() {
        return localStorage.getItem('admin_user');
    },

    login: function(username, password) {
        const credentials = {
            'saeedullah': { pass: 'saeed123', user: 'saeed' },
            'naeemurrahman': { pass: 'naeem123', user: 'naeem' }
        };

        if (credentials[username] && credentials[username].pass === password) {
            localStorage.setItem('admin_token', 'auth_' + Date.now());
            localStorage.setItem('admin_user', credentials[username].user);
            return credentials[username].user;
        }
        return null;
    },

    logout: function() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    },

    // Theme Manager
    getTheme: function() {
        return localStorage.getItem('theme') || 'dark';
    },

    setTheme: function(theme) {
        localStorage.setItem('theme', theme);
    }
};