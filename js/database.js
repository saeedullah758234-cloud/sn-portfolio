// Default Portfolio Data for Saeed & Naeem
const defaultData = {
    saeed: {
        name: 'Saeed ullah',
        title: 'Web Developer',
        about: 'Hi, I am Saeed ullah. I build high-performance, responsive websites with modern web designs.',
        email: 'saeed@example.com',
        bank: 'Meezan Bank | Acc: 1234567890',
        whatsapp: '923000000000',
        profileImage: '',
        projects: [
            {
                id: 1,
                title: 'E-Commerce Store',
                description: 'Full-featured modern online store with sleek shopping experience.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            },
            {
                id: 2,
                title: 'Corporate Website',
                description: 'Responsive business portfolio website with animated elements.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            }
        ]
    },
    naeem: {
        name: 'Naeem ur Rahman',
        title: 'Video Editor',
        about: 'Hi, I am Naeem ur Rahman. Professional video editor specializing in cinematic cuts and storytelling.',
        email: 'naeem@example.com',
        bank: 'HBL Bank | Acc: 0987654321',
        whatsapp: '923000000000',
        profileImage: '',
        projects: [
            {
                id: 1,
                title: 'Cinematic Wedding Highlight',
                description: 'Color-graded high-energy wedding reel.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            },
            {
                id: 2,
                title: 'YouTube Commercial Edit',
                description: 'Dynamic commercial edit designed for social media branding.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            }
        ]
    }
};

// Data Layer Handler
const db = {
    getUser: function(userId) {
        return new Promise((resolve) => {
            try {
                const data = localStorage.getItem(`portfolio_${userId}`);
                if (data) {
                    resolve(JSON.parse(data));
                } else {
                    resolve(defaultData[userId] || defaultData['saeed']);
                }
            } catch (error) {
                console.error("Localstorage read error:", error);
                resolve(defaultData[userId] || defaultData['saeed']);
            }
        });
    },

    saveUser: function(userId, data) {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(`portfolio_${userId}`, JSON.stringify(data));
                resolve(true);
            } catch (error) {
                console.error("Localstorage write error:", error);
                reject(error);
            }
        });
    },

    checkAuth: function() {
        return localStorage.getItem('admin_token');
    },

    logout: function() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    }
};