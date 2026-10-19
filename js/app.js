// ============================================
// S&N PORTFOLIO - PUBLIC APP LOGIC
// Handles UI, Theme, Animations, and Data Loading
// ============================================

// 1. PRELOADER & INITIALIZATION
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// Fail-safe Preloader
setTimeout(() => {
    const preloader = document.querySelector('.preloader');
    if (preloader && preloader.style.display !== 'none') {
        preloader.style.display = 'none';
    }
}, 2000);

document.addEventListener('DOMContentLoaded', () => {
    // 2. THEME MANAGEMENT
    const themeBtn = document.getElementById('theme-btn');
    const htmlEl = document.documentElement;
    
    // Load saved theme
    if(typeof db !== 'undefined' && db.getTheme) {
        const savedTheme = db.getTheme();
        htmlEl.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            if(typeof db !== 'undefined' && db.setTheme) {
                db.setTheme(newTheme);
            }
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeBtn) return;
        themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // 3. MOBILE MENU
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            menuBtn.innerHTML = navLinks.classList.contains('mobile-active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }

    // 4. SCROLL ANIMATIONS (Fade In)
    const fadeElements = document.querySelectorAll('.fade-in');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    fadeElements.forEach(el => scrollObserver.observe(el));

    // 5. LOAD PORTFOLIO DATA
    if (window.location.pathname.includes('portfolio.html')) {
        loadPortfolio();
    }
});

// Helper for setting text safely
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ============================================
// DATA LOADING LOGIC (portfolio.html)
// ============================================
async function loadPortfolio() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let user = urlParams.get('user') || 'saeed';
        
        // Ensure nav links are active
        document.querySelectorAll('.nav-links a, .bottom-nav-links a').forEach(link => {
            link.classList.remove('active');
            if(link.href.includes(`user=${user}`)) link.classList.add('active');
        });

        if (typeof db === 'undefined') {
            console.error("Database script missing");
            return;
        }

        const userData = await db.getUser(user);
        if (!userData) return;

        // --- 1. Basic Info ---
        safeSetText('profile-name', userData.name || 'User Profile');
        safeSetText('profile-title', userData.title || 'Professional');
        safeSetText('profile-intro', userData.intro || '');
        safeSetText('profile-about', userData.about || 'Welcome to my portfolio.');

        const profileImg = document.getElementById('profile-image');
        if (profileImg) {
            profileImg.src = (userData.profileImage && userData.profileImage !== '') ? userData.profileImage : 'https://via.placeholder.com/160';
        }

        const coverContainer = document.getElementById('cover-image-container');
        if (coverContainer) {
            if (userData.coverImage && userData.coverImage !== '') {
                coverContainer.innerHTML = `<img src="${userData.coverImage}" alt="Cover">`;
            } else {
                coverContainer.innerHTML = ''; // Keep gradient
            }
        }

        // WhatsApp Links
        if (userData.whatsapp) {
            const cleanWA = userData.whatsapp.replace(/[^0-9]/g, '');
            const waUrl = `https://wa.me/${cleanWA}`;
            const waBtn = document.getElementById('whatsapp-btn');
            const waFloat = document.getElementById('whatsapp-float');
            if (waBtn) waBtn.href = waUrl;
            if (waFloat) waFloat.href = waUrl;
        } else {
            const waBtn = document.getElementById('whatsapp-btn');
            if(waBtn) waBtn.style.display = 'none';
        }

        // Resume Button
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn && userData.resume && userData.resume.trim() !== '') {
            resumeBtn.href = userData.resume;
            resumeBtn.style.display = 'inline-flex';
        }

        // --- 2. Social Links ---
        const socialLinksEl = document.getElementById('social-links');
        if (socialLinksEl && userData.social) {
            socialLinksEl.innerHTML = '';
            const icons = {
                linkedin: 'fab fa-linkedin', github: 'fab fa-github',
                facebook: 'fab fa-facebook', instagram: 'fab fa-instagram',
                youtube: 'fab fa-youtube', twitter: 'fab fa-twitter'
            };
            for (const [platform, url] of Object.entries(userData.social)) {
                if (url && url.trim() !== '') {
                    socialLinksEl.innerHTML += `<a href="${url}" target="_blank" aria-label="${platform}"><i class="${icons[platform]}"></i></a>`;
                }
            }
        }

        // --- 3. Contact Grid ---
        const contactGrid = document.getElementById('contact-grid');
        if (contactGrid) {
            contactGrid.innerHTML = '';
            if (userData.email) {
                contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-envelope"></i> <span>${userData.email}</span> <i class="fas fa-copy copy-icon" onclick="copyText('${userData.email}')"></i></div>`;
            }
            if (userData.phone) {
                contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-phone-alt"></i> <span>${userData.phone}</span></div>`;
            }
            if (userData.location) {
                contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-map-marker-alt"></i> <span>${userData.location}</span></div>`;
            }
            if (userData.bank) {
                contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-university"></i> <span>${userData.bank}</span> <i class="fas fa-copy copy-icon" onclick="copyText('${userData.bank}')"></i></div>`;
            }
        }

        // --- 4. Services ---
        renderGrid('services', userData.services, (service) => `
            <div class="service-card">
                <div class="service-icon"><i class="fas ${service.icon || 'fa-star'}"></i></div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                ${service.skills ? `<div class="tech-tags" style="justify-content:center; margin-top:15px;">${service.skills.split(',').map(s => `<span class="tech-tag">${s.trim()}</span>`).join('')}</div>` : ''}
            </div>
        `);

        // --- 5. Skills ---
        renderGrid('skills', userData.skills, (skill) => `
            <div class="skill-item">
                <h4>${skill.name}</h4>
                <span class="skill-level">${skill.level}</span>
                ${skill.category ? `<br><small style="color:var(--text-muted); font-size:11px;">${skill.category}</small>` : ''}
            </div>
        `);

        // --- 6. Projects ---
        renderGrid('projects', userData.projects, (project) => `
            <div class="project-card">
                <div class="project-img">
                    <img src="${project.image || 'https://via.placeholder.com/300x200'}" alt="${project.title}">
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    ${project.technologies ? `<div class="tech-tags">${project.technologies.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}</div>` : ''}
                    <div class="project-links">
                        ${project.link && project.link !== '#' ? `<a href="${project.link}" target="_blank" class="btn primary-btn small-btn">Live View</a>` : ''}
                        ${project.github && project.github !== '#' && project.github !== '' ? `<a href="${project.github}" target="_blank" class="btn secondary-btn small-btn"><i class="fab fa-github"></i> Code</a>` : ''}
                    </div>
                </div>
            </div>
        `);

        // --- 7. Timeline (Experience & Education) ---
        let showTimeline = false;
        
        if (userData.experience && userData.experience.length > 0) {
            document.getElementById('experience-wrapper').style.display = 'block';
            showTimeline = true;
            const expContainer = document.getElementById('experience-timeline');
            expContainer.innerHTML = userData.experience.map(exp => `
                <div class="timeline-item">
                    <h3>${exp.jobTitle}</h3>
                    <h4>${exp.company} - <span style="color:var(--text-muted); font-size:14px; font-weight:normal;">${exp.employmentType}</span></h4>
                    <div class="timeline-date">${exp.startDate} to ${exp.currentlyWorking ? 'Present' : exp.endDate}</div>
                    <p>${exp.description}</p>
                </div>
            `).join('');
        }

        if (userData.education && userData.education.length > 0) {
            document.getElementById('education-wrapper').style.display = 'block';
            showTimeline = true;
            const eduContainer = document.getElementById('education-timeline');
            eduContainer.innerHTML = userData.education.map(edu => `
                <div class="timeline-item">
                    <h3>${edu.degree}</h3>
                    <h4>${edu.institution} - <span style="color:var(--text-muted); font-size:14px; font-weight:normal;">${edu.field}</span></h4>
                    <div class="timeline-date">${edu.startYear} - ${edu.endYear}</div>
                    <p>${edu.description}</p>
                </div>
            `).join('');
        }
        
        if (showTimeline) {
            document.getElementById('timeline-container').style.display = 'block';
        }

        // --- 8. Certifications ---
        renderGrid('certifications', userData.certifications, (cert) => `
            <div class="cert-card">
                <div class="cert-icon"><i class="fas fa-certificate"></i></div>
                <div>
                    <h4>${cert.name}</h4>
                    <p>${cert.organization} | ${cert.issueDate}</p>
                    ${cert.url && cert.url !== '#' ? `<a href="${cert.url}" target="_blank" style="color:var(--accent-primary); font-size:13px; text-decoration:underline;">View Credential</a>` : ''}
                </div>
            </div>
        `);

    } catch (err) {
        console.error("Error loading profile:", err);
    }
}

// Render Helper for Grids
function renderGrid(sectionId, dataArray, htmlTemplateCallback) {
    const container = document.getElementById(`${sectionId}-container`);
    const grid = document.getElementById(`${sectionId}-grid`);
    
    if (container && grid) {
        if (dataArray && dataArray.length > 0) {
            container.style.display = 'block';
            grid.innerHTML = dataArray.map(item => htmlTemplateCallback(item)).join('');
        } else {
            container.style.display = 'none';
        }
    }
}

// Copy to Clipboard
window.copyText = function(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard: " + text);
    }).catch(() => {
        alert("Copy failed!");
    });
};