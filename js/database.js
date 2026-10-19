// Default data for both admins
const defaultData = {
    saeed: {
        name: 'Saeed ullah',
        title: 'Web Developer',
        about: 'Hi, I am Saeed ullah, a passionate Web Developer creating modern and responsive websites.',
        email: 'saeed@example.com',
        bank: 'Bank Name: Meezan Bank, Acc: 1234567890',
        whatsapp: '923000000000', // Replace with actual number
        profileImage: '', // Base64 image will go here
        projects: [
            {
                id: 1,
                title: 'E-commerce Website',
                description: 'A full-featured online store built with modern web technologies.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            },
            {
                id: 2,
                title: 'Portfolio Design',
                description: 'A sleek and responsive personal portfolio template.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            }
        ]
    },
    naeem: {
        name: 'Naeem ur Rahman',
        title: 'Video Editor',
        about: 'Hi, I am Naeem ur Rahman, a professional Video Editor specializing in cinematic cuts and color grading.',
        email: 'naeem@example.com',
        bank: 'Bank Name: HBL, Acc: 0987654321',
        whatsapp: '923000000000', // Replace with actual number
        profileImage: '', // Base64 image will go here
        projects: [
            {
                id: 1,
                title: 'Wedding Highlight',
                description: 'Cinematic wedding highlight reel with emotional storytelling.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            },
            {
                id: 2,
                title: 'YouTube Vlog Edit',
                description: 'High-energy edit for a popular travel vlogger.',
                image: 'https://via.placeholder.com/300x200',
                link: '#'
            }
        ]
    }
};

// Database simulation using localStorage (Will be replaced by Firebase)
const db = {
    // Get user data (Returns default if not found)
    getUser: function(userId) {
        return new Promise((resolve) => {
            try {
                const data = localStorage.getItem(`portfolio_${userId}`);
                if (data) {
                    resolve(JSON.parse(data));
                } else {
                    resolve(defaultData[userId]);
                }
            } catch (error) {
                console.error("Error reading from database:", error);
                resolve(defaultData[userId]); // Fallback to default on error
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
                console.error("Error saving to database:", error);
                reject(error);
            }
        });
    },

    // Get auth token (simulated)
    checkAuth: function() {
        return localStorage.getItem('admin_token');
    },

    logout: function() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    }
};