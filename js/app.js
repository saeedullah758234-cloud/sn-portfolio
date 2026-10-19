// Function to safely hide Preloader (with instant fail-safe)
function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 400);
    }
}

// Hide preloader when page completes loading
window.addEventListener('load', hidePreloader);

// Fail-safe: Force hide preloader after 1.2 seconds max so it NEVER freezes!
setTimeout(hidePreloader, 1200);

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Top Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '60px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#0a0a1a';
                navLinks.style.padding = '20px';
            }
        });
    }

    // 2. Load Portfolio Data if on portfolio.html page
    const currentPath = window.location.pathname;
    if (currentPath.includes('portfolio.html')) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            let user = urlParams.get('user');
            if (!user) user = 'saeed'; // Default user
            loadPortfolioData(user);
        } catch (e) {
            console.log("Error reading URL parameter:", e);
            loadPortfolioData('saeed');
        }
    }
});

// Helper Function: Safely Set Text
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    }
}

// Function to Load User Data dynamically
async function loadPortfolioData(user) {
    try {
        if (typeof db === 'undefined') {
            console.error("Database script is missing!");
            return;
        }

        const userData = await db.getUser(user);
        if (!userData) return;

        // Set Basic Text Info
        safeSetText('profile-name', userData.name || 'User Profile');
        safeSetText('profile-title', userData.title || 'Professional');
        safeSetText('profile-desc', userData.about || 'Welcome to my portfolio.');

        // Set Email with Icon
        const emailEl = document.getElementById('profile-email');
        if (emailEl) {
            emailEl.innerHTML = `<i class="fas fa-envelope"></i> <span>${userData.email || 'N/A'}</span>`;
        }

        // Set Bank Details with Icon & Copy Function
        const bankEl = document.getElementById('profile-bank');
        if (bankEl) {
            bankEl.innerHTML = `<i class="fas fa-university"></i> <span>${userData.bank || 'N/A'}</span> 
            <i class="fas fa-copy copy-icon" onclick="copyToClipboard('${userData.bank || ''}')"></i>`;
        }

        // Set Profile Image
        const profileImg = document.getElementById('profile-image');
        if (profileImg) {
            profileImg.src = (userData.profileImage && userData.profileImage !== '') 
                ? userData.profileImage 
                : 'https://via.placeholder.com/150';
        }

        // Set WhatsApp Links
        if (userData.whatsapp) {
            const cleanNumber = userData.whatsapp.replace(/[^0-9]/g, '');
            const waUrl = `https://wa.me/${cleanNumber}`;

            const waBtn = document.getElementById('whatsapp-btn');
            if (waBtn) waBtn.href = waUrl;

            const waFloat = document.getElementById('whatsapp-float');
            if (waFloat) waFloat.href = waUrl;
        }

        // Load User Projects
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = ''; // Clear default loading text

            if (userData.projects && userData.projects.length > 0) {
                userData.projects.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'project-card';
                    card.innerHTML = `
                        <div class="project-img">
                            <img src="${project.image || 'https://via.placeholder.com/300x200'}" alt="${project.title}">
                        </div>
                        <div class="project-info">
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                            <a href="${project.link || '#'}" target="_blank" class="btn primary-btn">View Project</a>
                        </div>
                    `;
                    projectsGrid.appendChild(card);
                });
            } else {
                projectsGrid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-secondary);">No projects uploaded yet.</p>';
            }
        }
    } catch (err) {
        console.error("Error loading portfolio details:", err);
    }
}

// Copy to Clipboard Utility
window.copyToClipboard = function(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    }).catch(() => {
        alert("Copy failed!");
    });
};