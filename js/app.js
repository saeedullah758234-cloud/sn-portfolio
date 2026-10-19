// Remove Preloader when everything is fully loaded (Fixes Loading Hang)
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// DOM Loaded Event
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }

    // 2. Initialize AOS Animations safely (Desktop Only)
    if (typeof AOS !== 'undefined' && window.innerWidth >= 768) {
        try {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100
            });
        } catch (e) {
            console.log("AOS Error handled");
        }
    }

    // 3. Initialize Particles safely (Desktop Only)
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js') && window.innerWidth >= 768) {
        try {
            particlesJS('particles-js', {
                "particles": {
                    "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                    "color": { "value": "#00f3ff" },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.5, "random": false },
                    "size": { "value": 3, "random": true },
                    "line_linked": { "enable": true, "distance": 150, "color": "#00f3ff", "opacity": 0.4, "width": 1 },
                    "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }
                },
                "retina_detect": true
            });
        } catch (e) {
            console.log("Particles Error handled");
        }
    }

    // 4. Load Data if on Portfolio Page
    const currentPage = window.location.pathname;
    if (currentPage.includes('portfolio.html')) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            let user = urlParams.get('user');
            if (!user) user = 'saeed'; // Default
            loadPortfolioData(user);
        } catch (e) {
            loadPortfolioData('saeed');
        }
    }
});

// Helper function to safely set text content
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    }
}

// Function to load portfolio data dynamically
async function loadPortfolioData(user) {
    try {
        const userData = await db.getUser(user);
        if (!userData) return;

        // Update Text Info
        safeSetText('profile-name', userData.name || 'Name not set');
        safeSetText('profile-title', userData.title || 'Title not set');
        safeSetText('profile-desc', userData.about || 'Description not set');
        
        // Update Email and Bank with Icons
        const emailEl = document.getElementById('profile-email');
        if (emailEl) {
            emailEl.innerHTML = `<i class="fas fa-envelope"></i> ${userData.email || 'Email not set'}`;
        }

        const bankEl = document.getElementById('profile-bank');
        if (bankEl) {
            bankEl.innerHTML = `<i class="fas fa-university"></i> ${userData.bank || 'Bank info not set'} 
            <i class="fas fa-copy copy-icon" onclick="copyToClipboard('${userData.bank || ''}')"></i>`;
        }

        // Update Profile Image
        const profileImg = document.getElementById('profile-image');
        if (profileImg) {
            profileImg.src = userData.profileImage ? userData.profileImage : 'https://via.placeholder.com/150';
        }

        // Update WhatsApp Links
        if (userData.whatsapp) {
            const cleanNumber = userData.whatsapp.replace(/[^0-9]/g, '');
            const waLink = `https://wa.me/${cleanNumber}`;
            
            const waBtn = document.getElementById('whatsapp-btn');
            if (waBtn) waBtn.href = waLink;

            const waFloat = document.getElementById('whatsapp-float');
            if (waFloat) waFloat.href = waLink;
        }

        // Load Projects
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = ''; // Clear default "Loading projects..." text

            if (userData.projects && userData.projects.length > 0) {
                userData.projects.forEach(project => {
                    const projectCard = document.createElement('div');
                    projectCard.className = 'project-card';
                    projectCard.innerHTML = `
                        <div class="project-img">
                            <img src="${project.image || 'https://via.placeholder.com/300x200'}" alt="${project.title}">
                        </div>
                        <div class="project-info">
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                            <a href="${project.link}" target="_blank" class="btn primary-btn">View Project</a>
                        </div>
                    `;
                    projectsGrid.appendChild(projectCard);
                });
            } else {
                projectsGrid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-secondary);">No projects uploaded yet.</p>';
            }
        }
    } catch (error) {
        console.log("Error displaying portfolio data");
    }
}

// Copy to Clipboard function
window.copyToClipboard = function(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    }).catch(err => {
        console.log('Copy failed');
    });
};