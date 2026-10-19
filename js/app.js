/* ==========================================
   S&N PORTFOLIO - PUBLIC SITE APP LOGIC
   Home photos + cover banners + portfolio
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Instant Preloader Removal
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.pointerEvents = 'none';
        setTimeout(function () { preloader.style.display = 'none'; }, 200);
    }

    // 2. Theme Switcher
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.innerHTML = savedTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark'
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
        });
    }

    // 3. Home page dual profile cards
    loadHomeProfiles();

    // 4. Portfolio page
    if (document.getElementById('profile-name')) {
        loadPortfolioPage();
    }
});

/**
 * Apply one user's data onto home page card elements
 */
function applyHomeCard(prefix, data) {
    if (!data) return;

    const img = document.getElementById('home-' + prefix + '-img');
    const name = document.getElementById('home-' + prefix + '-name');
    const title = document.getElementById('home-' + prefix + '-title');
    const intro = document.getElementById('home-' + prefix + '-intro');
    const banner = document.getElementById('home-' + prefix + '-banner');

    // Profile photo — always set when available (fixes Naeem gray box)
    if (img) {
        if (data.profileImage && String(data.profileImage).trim() !== '') {
            img.onerror = function () {
                img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name || prefix) + '&size=150&background=6366f1&color=fff';
            };
            img.src = data.profileImage;
            img.alt = data.name || prefix;
            img.style.display = 'block';
        }
    }

    if (name && data.name) name.textContent = data.name;
    if (title && data.title) title.textContent = data.title;
    if (intro && data.about) intro.textContent = data.about;

    // Card top banner = cover image (so users SEE the banner on home too)
    if (banner && data.coverImage && String(data.coverImage).trim() !== '') {
        banner.style.backgroundImage = 'url("' + data.coverImage + '")';
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
        banner.classList.add('has-cover');
    }
}

/**
 * Load both Saeed + Naeem onto home cards from Firebase / local cache
 */
function loadHomeProfiles() {
    if (typeof db === 'undefined' || !db.getUser) {
        console.warn('db not ready for home profiles');
        return;
    }

    // Saeed card
    db.getUser('saeed', function (data) {
        applyHomeCard('saeed', data);
    });

    // Naeem card — separate call so one failure never blocks the other
    db.getUser('naeem', function (data) {
        applyHomeCard('naeem', data);
    });
}

/**
 * Full portfolio page loader (banner + avatar + about + projects)
 */
function loadPortfolioPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user') || 'saeed';

    // Kill preloader early
    const pre = document.getElementById('preloader');
    if (pre) {
        pre.style.display = 'none';
        pre.classList.add('hide');
    }

    if (typeof db === 'undefined' || !db.getUser) {
        const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = 'Profile unavailable';
        return;
    }

    db.getUser(user, function (data) {
        if (!data) return;

        const nameEl = document.getElementById('profile-name');
        const titleEl = document.getElementById('profile-title');
        const roleEl = document.getElementById('profile-role');
        const imgEl = document.getElementById('profile-img');
        const coverEl = document.getElementById('cover-img');
        const aboutEl = document.getElementById('profile-about');
        const bioEl = document.getElementById('profile-bio');
        const resumeBtn = document.getElementById('resume-btn');
        const whatsappBtn = document.getElementById('whatsapp-btn');

        if (nameEl) nameEl.textContent = data.name || 'User';
        if (titleEl) titleEl.textContent = data.title || '';
        if (roleEl) roleEl.textContent = data.role || 'Creator';

        // Profile avatar
        if (imgEl && data.profileImage) {
            imgEl.onerror = function () {
                imgEl.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name || 'User') + '&size=150&background=2563eb&color=fff';
            };
            imgEl.src = data.profileImage;
            imgEl.style.display = 'block';
        }

        // COVER / BANNER — must show for public users
        if (coverEl) {
            if (data.coverImage && String(data.coverImage).trim() !== '') {
                coverEl.onload = function () {
                    coverEl.style.display = 'block';
                };
                coverEl.onerror = function () {
                    coverEl.style.display = 'none';
                };
                coverEl.src = data.coverImage;
                coverEl.style.display = 'block';
                coverEl.alt = (data.name || 'User') + ' cover banner';
            } else {
                coverEl.style.display = 'none';
            }
        }

        if (aboutEl) aboutEl.textContent = data.about || '';
        if (bioEl) bioEl.textContent = data.bio || '';

        if (resumeBtn && data.resumeUrl) {
            resumeBtn.href = data.resumeUrl;
            resumeBtn.style.display = 'inline-flex';
        }

        if (whatsappBtn && data.whatsapp) {
            const cleanNum = String(data.whatsapp).replace(/[^0-9]/g, '');
            if (cleanNum) {
                whatsappBtn.href = 'https://wa.me/' + cleanNum;
                whatsappBtn.style.display = 'inline-flex';
            }
        }

        // Optional contact block
        const contactBlock = document.getElementById('contact-block');
        const contactInfo = document.getElementById('contact-info');
        if (contactBlock && contactInfo) {
            const parts = [];
            if (data.email) parts.push('Email: ' + data.email);
            if (data.phone) parts.push('Phone: ' + data.phone);
            if (data.location) parts.push('Location: ' + data.location);
            if (parts.length) {
                contactInfo.textContent = parts.join('\n');
                contactBlock.style.display = 'block';
            }
        }

        // Optional skills block
        const skillsBlock = document.getElementById('skills-block');
        const skillsDisplay = document.getElementById('skills-display');
        if (skillsBlock && skillsDisplay && data.skills && data.skills.length) {
            skillsDisplay.innerHTML = data.skills.map(function (s) {
                const n = s.name || s.title || '';
                const lvl = s.level ? ' — ' + s.level + '%' : '';
                return n
                    ? '<div style="padding:0.35rem 0;border-bottom:1px solid #e2e8f0;">' + n + lvl + '</div>'
                    : '';
            }).join('');
            skillsBlock.style.display = 'block';
        }

        renderProjects(data.projects || []);
    });
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';
    if (!projects || projects.length === 0) {
        grid.innerHTML = '<p class="no-data">No projects uploaded yet.</p>';
        return;
    }

    projects.forEach(function (p) {
        const card = document.createElement('div');
        card.className = 'project-card';
        const title = p.title || 'Project Title';
        const cat = p.category || 'Portfolio';
        const tech = p.tech || '';
        const link = p.link || '';
        card.innerHTML =
            '<div class="project-info">' +
            '<span class="project-cat">' + cat + '</span>' +
            '<h4>' + title + '</h4>' +
            (tech ? '<p class="project-tech">' + tech + '</p>' : '') +
            (link
                ? '<a href="' + link + '" target="_blank" rel="noopener" class="btn btn-sm btn-primary">View Project <i class="fas fa-external-link-alt"></i></a>'
                : '') +
            '</div>';
        grid.appendChild(card);
    });
}