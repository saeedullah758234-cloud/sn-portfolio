// ============================================
// COMPLETE DATABASE SYSTEM FOR S&N PORTFOLIO
// Supports: Full Profiles, Projects, Education, 
// Experience, Skills, Services, Certifications
// ============================================

const defaultData = {
    saeed: {
        // Basic Information
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

        // Education Array
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

        // Work Experience Array
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

        // Skills Array
        skills: [
            { id: 1, name: 'HTML & CSS', level: 'Expert', category: 'Technical' },
            { id: 2, name: 'JavaScript', level: 'Expert', category: 'Technical' },
            { id: 3, name: 'React.js', level: 'Advanced', category: 'Technical' },
            { id: 4, name: 'Node.js', level: 'Advanced', category: 'Technical' },
            { id: 5, name: 'VS Code', level: 'Expert', category: 'Software' },
            { id: 6, name: 'Problem Solving', level: 'Expert', category: 'Professional' }
        ],

        // Projects Array
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

        // Services Array
        services: [
            {
                id: 1,
                title: 'Website Development',
                description: 'Custom responsive websites built with modern technologies.',
                icon: 'fa-code',
                skills: 'HTML, CSS, JavaScript, React'
            },
            {
                id: 2,
                title: 'E-Commerce Solutions',
                description: 'Complete online store development with payment integration.',
                icon: 'fa-shopping-cart',
                skills: 'Shopify, WooCommerce, Custom Solutions'
            }
        ],

        // Certifications Array
        certifications: [
            {
                id: 1,
                name: 'Full Stack Web Development',
                organization: 'Coursera',
                issueDate: '2022-05',
                url: '#'
            }
        ],

        // Social Media Links
        social: {
            linkedin: 'https://linkedin.com',
            github: 'https://github.com',
            facebook: '',
            instagram: '',
            youtube: '',
            twitter: ''
        },

        // Additional Information
        languages: 'English, Urdu, Pashto',
        interests: 'Coding, Learning New Tech, Reading',
        goals: 'To build innovative web solutions that make a difference.',
        resume: ''
    },

    naeem: {
        // Basic Information
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
            { id: 4, name: 'Color Grading', level: 'Expert', category: 'Technical' },
            { id: 5, name: 'Motion Graphics', level: 'Advanced', category: 'Technical' },
            { id: 6, name: 'Storytelling', level: 'Expert', category: 'Professional' }
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
            },
            {
                id: 2,
                title: 'YouTube Commercial',
                description: 'High-energy commercial edit for brand marketing.',
                image: 'https://via.placeholder.com/400x250/00f3ff/0a0a1a?text=Commercial',
                technologies: 'Premiere Pro, DaVinci Resolve',
                link: '#',
                github: ''
            }
        ],

        services: [
            {
                id: 1,
                title: 'Wedding Videography',
                description: 'Cinematic wedding films that tell your love story.',
                icon: 'fa-heart',
                skills: 'Premiere Pro, Color Grading'
            },
            {
                id: 2,
                title: 'YouTube Content Editing',
                description: 'Professional editing for YouTubers and content creators.',
                icon: 'fa-video',
                skills: 'Motion Graphics, Sound Design'
            }
        ],

        certifications: [
            {
                id: 1,
                name: 'Adobe Certified Expert',
                organization: 'Adobe',
                issueDate: '2021-10',
                url: '#'
            }
        ],

        social: {
            linkedin: 'https://linkedin.com',
            github: '',
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            youtube: 'https://youtube.com',
            twitter: ''
        },

        languages: 'English, Urdu, Pashto',
        interests: 'Film Making, Photography, Music',
        goals: 'To create visual stories that inspire and entertain.',
        resume: ''
    }
};

// Database Operations
const db = {
    // Get user data
    getUser: function(userId) {
        return new Promise((resolve) => {
            try {
                const data = localStorage.getItem(`portfolio_${userId}`);
                if (data) {
                    const parsed = JSON.parse(data);
                    // Merge with defaults to ensure all keys exist
                    const merged = { ...defaultData[userId], ...parsed };
                    resolve(merged);
                } else {
                    resolve(defaultData[userId] || defaultData['saeed']);
                }
            } catch (error) {
                console.error("Database read error:", error);
                resolve(defaultData[userId] || defaultData['saeed']);
            }
        });
    },

    // Save user data
    saveUser: function(userId, data) {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(`portfolio_${userId}`, JSON.stringify(data));
                resolve(true);
            } catch (error) {
                console.error("Database save error:", error);
                reject(error);
            }
        });
    },

    // Authentication
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

    // Theme Management
    getTheme: function() {
        return localStorage.getItem('theme') || 'dark';
    },

    setTheme: function(theme) {
        localStorage.setItem('theme', theme);
    }
};