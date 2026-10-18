/* ==========================================
   SAEED & NAEEM PORTFOLIO - DATABASE LAYER
   LocalStorage-based Data Persistence
   ========================================== */

const Database = (() => {

    // ---- STORAGE KEY ----
    const STORAGE_KEY = 'sn_portfolio_data';

    // ---- DEFAULT DATA ----
    const defaultData = {
        admins: {
            saeedullah: {
                id: 'saeedullah',
                fullName: 'Saeed Ullah',
                email: 'saeedullah@example.com',
                whatsapp: '923001234567',
                bankAccount: 'PK00ABCD0000001234567890',
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                bio: 'Passionate full-stack web developer creating modern, responsive, and user-friendly websites and web applications. Specializing in HTML, CSS, JavaScript, React, and Node.js.',
                role: 'Website Developer',
                skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
                password: 'saeed123',
                projects: [
                    {
                        id: 'proj_s001',
                        title: 'E-Commerce Platform',
                        description: 'A full-stack e-commerce platform built with React and Node.js. Features include user authentication, product catalog, shopping cart, payment integration, and admin dashboard.',
                        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
                        category: 'Web',
                        techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                        githubLink: 'https://github.com/saeedullah/ecommerce',
                        liveLink: 'https://myecommerce-demo.com',
                        dateAdded: '2025-01-15'
                    },
                    {
                        id: 'proj_s002',
                        title: 'Portfolio Website Template',
                        description: 'A beautiful, responsive portfolio website template built with HTML, CSS, and JavaScript. Features smooth animations, dark theme, and mobile-first design.',
                        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
                        category: 'Web',
                        techStack: ['HTML', 'CSS', 'JavaScript', 'AOS'],
                        githubLink: 'https://github.com/saeedullah/portfolio-template',
                        liveLink: 'https://portfolio-demo.com',
                        dateAdded: '2025-02-10'
                    },
                    {
                        id: 'proj_s003',
                        title: 'Task Management App',
                        description: 'A real-time task management application with drag-and-drop functionality, team collaboration features, and deadline notifications.',
                        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
                        category: 'Web',
                        techStack: ['React', 'Firebase', 'Tailwind CSS'],
                        githubLink: 'https://github.com/saeedullah/task-manager',
                        liveLink: '',
                        dateAdded: '2025-03-05'
                    }
                ]
            },
            naeemurrahman: {
                id: 'naeemurrahman',
                fullName: 'Naeem ur Rahman',
                email: 'naeemurrahman@example.com',
                whatsapp: '923009876543',
                bankAccount: 'PK00EFGH0000009876543210',
                profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                bio: 'Creative video editor specializing in cinematic edits, color grading, motion graphics, and visual storytelling for YouTube, weddings, and commercial projects.',
                role: 'Video Editor',
                skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Photoshop', 'Illustrator'],
                password: 'naeem123',
                projects: [
                    {
                        id: 'proj_n001',
                        title: 'Cinematic Wedding Film',
                        description: 'A beautifully crafted cinematic wedding film featuring drone shots, color grading, and emotional storytelling. Shot in 4K and edited in DaVinci Resolve.',
                        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
                        category: 'Video',
                        techStack: ['DaVinci Resolve', 'Premiere Pro', 'After Effects'],
                        githubLink: '',
                        liveLink: 'https://youtube.com/watch?v=demo1',
                        dateAdded: '2025-01-20'
                    },
                    {
                        id: 'proj_n002',
                        title: 'YouTube Intro Animation',
                        description: 'Custom animated YouTube intro with 3D text, particle effects, and dynamic transitions. Created for a tech review channel with 500K+ subscribers.',
                        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=400&fit=crop',
                        category: 'Animation',
                        techStack: ['After Effects', 'Cinema 4D'],
                        githubLink: '',
                        liveLink: 'https://youtube.com/watch?v=demo2',
                        dateAdded: '2025-02-15'
                    },
                    {
                        id: 'proj_n003',
                        title: 'Commercial Product Ad',
                        description: 'High-energy product commercial for a tech startup. Features fast cuts, motion graphics, sound design, and professional color grading.',
                        image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop',
                        category: 'Video',
                        techStack: ['Premiere Pro', 'After Effects', 'Audition'],
                        githubLink: '',
                        liveLink: 'https://youtube.com/watch?v=demo3',
                        dateAdded: '2025-03-10'
                    }
                ]
            }
        }
    };

    // ---- INITIALIZE DATABASE ----
    function init() {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
            console.log('Database initialized with default data.');
        } else {
            console.log('Database loaded from localStorage.');
        }
    }

    // ---- GET ALL DATA ----
    function getAllData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : defaultData;
    }

    // ---- SAVE ALL DATA ----
    function saveAllData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // ---- GET ADMIN BY ID ----
    function getAdmin(adminId) {
        const data = getAllData();
        return data.admins[adminId] || null;
    }

    // ---- GET BOTH ADMINS ----
    function getBothAdmins() {
        const data = getAllData();
        return {
            saeedullah: data.admins.saeedullah,
            naeemurrahman: data.admins.naeemurrahman
        };
    }

    // ---- UPDATE ADMIN PROFILE ----
    function updateAdminProfile(adminId, profileData) {
        const data = getAllData();
        if (!data.admins[adminId]) {
            console.error('Admin not found:', adminId);
            return false;
        }

        // Update only profile fields, keep password and projects intact
        data.admins[adminId].fullName = profileData.fullName || data.admins[adminId].fullName;
        data.admins[adminId].email = profileData.email || data.admins[adminId].email;
        data.admins[adminId].whatsapp = profileData.whatsapp || data.admins[adminId].whatsapp;
        data.admins[adminId].bankAccount = profileData.bankAccount !== undefined ? profileData.bankAccount : data.admins[adminId].bankAccount;
        data.admins[adminId].profileImage = profileData.profileImage || data.admins[adminId].profileImage;
        data.admins[adminId].bio = profileData.bio || data.admins[adminId].bio;
        data.admins[adminId].role = profileData.role || data.admins[adminId].role;

        if (profileData.skills) {
            if (typeof profileData.skills === 'string') {
                data.admins[adminId].skills = profileData.skills.split(',').map(s => s.trim()).filter(s => s);
            } else if (Array.isArray(profileData.skills)) {
                data.admins[adminId].skills = profileData.skills;
            }
        }

        saveAllData(data);
        console.log('Profile updated for:', adminId);
        return true;
    }

    // ---- AUTHENTICATE ADMIN ----
    function authenticate(username, password) {
        const data = getAllData();
        const admin = data.admins[username];

        if (admin && admin.password === password) {
            return {
                success: true,
                adminId: admin.id,
                fullName: admin.fullName,
                role: admin.role
            };
        }

        return { success: false, message: 'Invalid username or password' };
    }

    // ---- GET ADMIN PROJECTS ----
    function getProjects(adminId) {
        const admin = getAdmin(adminId);
        return admin ? admin.projects : [];
    }

    // ---- GET ALL PROJECTS (both admins) ----
    function getAllProjects() {
        const data = getAllData();
        const allProjects = [];

        Object.keys(data.admins).forEach(adminId => {
            const admin = data.admins[adminId];
            admin.projects.forEach(project => {
                allProjects.push({
                    ...project,
                    adminId: adminId,
                    adminName: admin.fullName,
                    adminImage: admin.profileImage
                });
            });
        });

        // Sort by date descending
        allProjects.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        return allProjects;
    }

    // ---- ADD PROJECT ----
    function addProject(adminId, projectData) {
        const data = getAllData();
        if (!data.admins[adminId]) {
            console.error('Admin not found:', adminId);
            return false;
        }

        const newProject = {
            id: 'proj_' + adminId.substring(0, 1) + '_' + Date.now(),
            title: projectData.title,
            description: projectData.description,
            image: projectData.image,
            category: projectData.category,
            techStack: typeof projectData.techStack === 'string'
                ? projectData.techStack.split(',').map(s => s.trim()).filter(s => s)
                : (projectData.techStack || []),
            githubLink: projectData.githubLink || '',
            liveLink: projectData.liveLink || '',
            dateAdded: projectData.dateAdded || new Date().toISOString().split('T')[0]
        };

        data.admins[adminId].projects.unshift(newProject);
        saveAllData(data);
        console.log('Project added:', newProject.title);
        return newProject;
    }

    // ---- UPDATE PROJECT ----
    function updateProject(adminId, projectId, projectData) {
        const data = getAllData();
        if (!data.admins[adminId]) return false;

        const projectIndex = data.admins[adminId].projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            console.error('Project not found:', projectId);
            return false;
        }

        const updatedProject = {
            ...data.admins[adminId].projects[projectIndex],
            title: projectData.title || data.admins[adminId].projects[projectIndex].title,
            description: projectData.description || data.admins[adminId].projects[projectIndex].description,
            image: projectData.image || data.admins[adminId].projects[projectIndex].image,
            category: projectData.category || data.admins[adminId].projects[projectIndex].category,
            techStack: projectData.techStack
                ? (typeof projectData.techStack === 'string'
                    ? projectData.techStack.split(',').map(s => s.trim()).filter(s => s)
                    : projectData.techStack)
                : data.admins[adminId].projects[projectIndex].techStack,
            githubLink: projectData.githubLink !== undefined ? projectData.githubLink : data.admins[adminId].projects[projectIndex].githubLink,
            liveLink: projectData.liveLink !== undefined ? projectData.liveLink : data.admins[adminId].projects[projectIndex].liveLink,
            dateAdded: projectData.dateAdded || data.admins[adminId].projects[projectIndex].dateAdded
        };

        data.admins[adminId].projects[projectIndex] = updatedProject;
        saveAllData(data);
        console.log('Project updated:', updatedProject.title);
        return true;
    }

    // ---- DELETE PROJECT ----
    function deleteProject(adminId, projectId) {
        const data = getAllData();
        if (!data.admins[adminId]) return false;

        const projectIndex = data.admins[adminId].projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            console.error('Project not found:', projectId);
            return false;
        }

        const deletedProject = data.admins[adminId].projects.splice(projectIndex, 1)[0];
        saveAllData(data);
        console.log('Project deleted:', deletedProject.title);
        return true;
    }

    // ---- GET PROJECT BY ID ----
    function getProjectById(adminId, projectId) {
        const admin = getAdmin(adminId);
        if (!admin) return null;
        return admin.projects.find(p => p.id === projectId) || null;
    }

    // ---- RESET DATABASE ----
    function resetDatabase() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        console.log('Database reset to default.');
    }

    // ---- GET TOTAL PROJECT COUNT ----
    function getTotalProjectCount() {
        return getAllProjects().length;
    }

    // ---- PUBLIC API ----
    return {
        init,
        getAllData,
        getAdmin,
        getBothAdmins,
        updateAdminProfile,
        authenticate,
        getProjects,
        getAllProjects,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
        resetDatabase,
        getTotalProjectCount
    };

})();

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Database.init();
});