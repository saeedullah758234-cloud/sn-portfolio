// ============================================
// S&N PORTFOLIO - PUBLIC APP LOGIC
// Home page live images + Portfolio loader
// ============================================

window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 500);
    }
});

setTimeout(() => {
    const preloader = document.querySelector('.preloader');
    if (preloader && preloader.style.display !== 'none') {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 500);
    }
}, 1500);

document.addEventListener('DOMContentLoaded', () => {
    // Theme
    const themeBtn = document.getElementById('theme-btn');
    const htmlEl = document.documentElement;
    
    if (typeof db !== 'undefined' && db.getTheme) {
        const savedTheme = db.getTheme();
        htmlEl.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            if (typeof db !== 'undefined' && db.setTheme) db.setTheme(newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeBtn) return;
        themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Mobile Menu
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            menuBtn.innerHTML = navLinks.classList.contains('mobile-active') 
                ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }

    // Scroll Animations
    const fadeElements = document.querySelectorAll('.fade-in');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    fadeElements.forEach(el => scrollObserver.observe(el));

    // Load Home Page Profiles (Live Images from Firebase)
    if (document.getElementById('home-saeed-img') || document.getElementById('home-naeem-img')) {
        loadHomeProfiles();
    }

    // Load Portfolio Page
    if (document.getElementById('profile-name') || window.location.pathname.includes('portfolio')) {
        loadPortfolio();
    }
});

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ============================================
// HOME PAGE - LIVE PROFILE CARDS
// ============================================
async function loadHomeProfiles() {
    if (typeof db === 'undefined') return;

    try {
        // Saeed
        const saeed = await db.getUser('saeed');
        if (saeed) {
            const img = document.getElementById('home-saeed-img');
            if (img && saeed.profileImage) img.src = saeed.profileImage;
            safeSetText('home-saeed-name', saeed.name || 'Saeed ullah');
            safeSetText('home-saeed-title', saeed.title || 'Web Developer');
            safeSetText('home-saeed-intro', saeed.intro || saeed.about || 'Expert in modern web development.');
        }

        // Naeem
        const naeem = await db.getUser('naeem');
        if (naeem) {
            const img = document.getElementById('home-naeem-img');
            if (img && naeem.profileImage) img.src = naeem.profileImage;
            safeSetText('home-naeem-name', naeem.name || 'Naeem ur Rahman');
            safeSetText('home-naeem-title', naeem.title || 'Video Editor');
            safeSetText('home-naeem-intro', naeem.intro || naeem.about || 'Professional video editing & cinematic stories.');
        }
    } catch (err) {
        console.error("Home profiles load error:", err);
    }
}

// ============================================
// PORTFOLIO PAGE LOADER
// ============================================
async function loadPortfolio() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let user = urlParams.get('user') || 'saeed';
        
        document.querySelectorAll('.nav-links a, .bottom-nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.href.includes(`user=${user}`)) link.classList.add('active');
        });

        if (typeof db === 'undefined') {
            safeSetText('profile-name', 'Database Error');
            safeSetText('profile-title', 'Please refresh');
            return;
        }

        const userData = await db.getUser(user);
        if (!userData) {
            safeSetText('profile-name', 'User Not Found');
            return;
        }

        // Basic Info
        safeSetText('profile-name', userData.name || 'User Profile');
        safeSetText('profile-title', userData.title || 'Professional');
        safeSetText('profile-intro', userData.intro || '');
        safeSetText('profile-about', userData.about || 'Welcome to my portfolio.');

        const profileImg = document.getElementById('profile-image');
        if (profileImg) {
            profileImg.src = (userData.profileImage && userData.profileImage !== '') 
                ? userData.profileImage 
                : 'https://via.placeholder.com/160';
        }

        const coverContainer = document.getElementById('cover-image-container');
        if (coverContainer) {
            if (userData.coverImage && userData.coverImage !== '') {
                coverContainer.innerHTML = `<img src="${userData.coverImage}" alt="Cover" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                coverContainer.innerHTML = '';
            }
        }

        // WhatsApp
        if (userData.whatsapp) {
            const cleanWA = userData.whatsapp.replace(/[^0-9]/g, '');
            const waUrl = `https://wa.me/${cleanWA}`;
            const waBtn = document.getElementById('whatsapp-btn');
            const waFloat = document.getElementById('whatsapp-float');
            if (waBtn) waBtn.href = waUrl;
            if (waFloat) waFloat.href = waUrl;
        }

        // Resume
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn && userData.resume && userData.resume.trim() !== '') {
            resumeBtn.href = userData.resume;
            resumeBtn.style.display = 'inline-flex';
        }

        // Social Links
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
                    socialLinksEl.innerHTML += `<a href="${url}" target="_blank"><i class="${icons[platform]}"></i></a>`;
                }
            }
        }

        // Contact Grid
        const contactGrid = document.getElementById('contact-grid');
        if (contactGrid) {
            contactGrid.innerHTML = '';
            if (userData.email) contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-envelope"></i> <span>${userData.email}</span> <i class="fas fa-copy copy-icon" onclick="copyText('${userData.email}')"></i></div>`;
            if (userData.phone) contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-phone-alt"></i> <span>${userData.phone}</span></div>`;
            if (userData.location) contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-map-marker-alt"></i> <span>${userData.location}</span></div>`;
            if (userData.bank) contactGrid.innerHTML += `<div class="info-item"><i class="fas fa-university"></i> <span>${userData.bank}</span> <i class="fas fa-copy copy-icon" onclick="copyText('${userData.bank}')"></i></div>`;
        }

        // Services
        renderGrid('services', userData.services, (s) => `
            <div class="service-card">
                <div class="service-icon"><i class="fas ${s.icon || 'fa-star'}"></i></div>
                <h3>${s.title}</h3>
                <p>${s.description}</p>
                ${s.skills ? `<div class="tech-tags" style="justify-content:center;margin-top:15px;">${s.skills.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}</div>` : ''}
            </div>
        `);

        // Skills
        renderGrid('skills', userData.skills, (s) => `
            <div class="skill-item">
                <h4>${s.name}</h4>
                <span class="skill-level">${s.level}</span>
                ${s.category ? `<br><small style="color:var(--text-muted);font-size:11px;">${s.category}</small>` : ''}
            </div>
        `);

        // Projects
        renderGrid('projects', userData.projects, (p) => `
            <div class="project-card">
                <div class="project-img">
                    <img src="${p.image || 'https://via.placeholder.com/300x200'}" alt="${p.title}">
                </div>
                <div class="project-info">
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    ${p.technologies ? `<div class="tech-tags">${p.technologies.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}</div>` : ''}
                    <div class="project-links">
                        ${p.link && p.link !== '#' ? `<a href="${p.link}" target="_blank" class="btn primary-btn small-btn">Live View</a>` : ''}
                        ${p.github && p.github !== '#' && p.github !== '' ? `<a href="${p.github}" target="_blank" class="btn secondary-btn small-btn"><i class="fab fa-github"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `);

        // Timeline
        let showTimeline = false;
        if (userData.experience && userData.experience.length > 0) {
            const wrap = document.getElementById('experience-wrapper');
            if (wrap) wrap.style.display = 'block';
            showTimeline = true;
            const exp = document.getElementById('experience-timeline');
            if (exp) exp.innerHTML = userData.experience.map(e => `
                <div class="timeline-item">
                    <h3>${e.jobTitle}</h3>
                    <h4>${e.company} <span style="color:var(--text-muted);font-size:14px;font-weight:normal;">${e.employmentType || ''}</span></h4>
                    <div class="timeline-date">${e.startDate} → ${e.currentlyWorking ? 'Present' : (e.endDate || '')}</div>
                    <p>${e.description || ''}</p>
                </div>
            `).join('');
        }

        if (userData.education && userData.education.length > 0) {
            const wrap = document.getElementById('education-wrapper');
            if (wrap) wrap.style.display = 'block';
            showTimeline = true;
            const edu = document.getElementById('education-timeline');
            if (edu) edu.innerHTML = userData.education.map(e => `
                <div class="timeline-item">
                    <h3>${e.degree}</h3>
                    <h4>${e.institution} <span style="color:var(--text-muted);font-size:14px;font-weight:normal;">${e.field || ''}</span></h4>
                    <div class="timeline-date">${e.startYear} - ${e.endYear}</div>
                    <p>${e.description || ''}</p>
                </div>
            `).join('');
        }

        if (showTimeline) {
            const tc = document.getElementById('timeline-container');
            if (tc) tc.style.display = 'block';
        }

        // Certifications
        renderGrid('certifications', userData.certifications, (c) => `
            <div class="cert-card">
                <div class="cert-icon"><i class="fas fa-certificate"></i></div>
                <div>
                    <h4>${c.name}</h4>
                    <p>${c.organization} | ${c.issueDate}</p>
                    ${c.url && c.url !== '#' ? `<a href="${c.url}" target="_blank" style="color:var(--accent-primary);font-size:13px;">View Credential</a>` : ''}
                </div>
            </div>
        `);

    } catch (err) {
        console.error("Portfolio load error:", err);
        safeSetText('profile-name', 'Error Loading');
        safeSetText('profile-title', 'Please try again');
    }
}

function renderGrid(sectionId, dataArray, htmlFn) {
    const container = document.getElementById(`${sectionId}-container`);
    const grid = document.getElementById(`${sectionId}-grid`);
    if (container && grid) {
        if (dataArray && dataArray.length > 0) {
            container.style.display = 'block';
            grid.innerHTML = dataArray.map(item => htmlFn(item)).join('');
        } else {
            container.style.display = 'none';
        }
    }
}

window.copyText = function(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied: " + text);
    }).catch(() => alert("Copy failed"));
};