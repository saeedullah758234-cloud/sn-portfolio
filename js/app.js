/* ==========================================
   S&N PORTFOLIO - PUBLIC SITE APP LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Instant Preloader Removal Failsafe
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.pointerEvents = 'none';
        setTimeout(() => { preloader.style.display = 'none'; }, 200);
    }

    // 2. Theme Switcher Logic
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // 3. Load Dynamic Home Profiles
    loadHomeProfiles();

    // 4. Load Portfolio Page Data if on Portfolio Page
    if (document.getElementById('profile-name')) {
        loadPortfolioPage();
    }
});

// Load Live Profile Photos & Titles on Home Page Cards
function loadHomeProfiles() {
    if (typeof db === 'undefined' || !db.getUser) return;

    db.getUser('saeed', (data) => {
        if (!data) return;
        const img = document.getElementById('home-saeed-img');
        const name = document.getElementById('home-saeed-name');
        const title = document.getElementById('home-saeed-title');
        const intro = document.getElementById('home-saeed-intro');

        if (img && data.profileImage) img.src = data.profileImage;
        if (name && data.name) name.innerText = data.name;
        if (title && data.title) title.innerText = data.title;
        if (intro && data.about) intro.innerText = data.about;
    });

    db.getUser('naeem', (data) => {
        if (!data) return;
        const img = document.getElementById('home-naeem-img');
        const name = document.getElementById('home-naeem-name');
        const title = document.getElementById('home-naeem-title');
        const intro = document.getElementById('home-naeem-intro');

        if (img && data.profileImage) img.src = data.profileImage;
        if (name && data.name) name.innerText = data.name;
        if (title && data.title) title.innerText = data.title;
        if (intro && data.about) intro.innerText = data.about;
    });
}

// Load Full Portfolio Page for Specific User
function loadPortfolioPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user') || 'saeed';

    if (typeof db === 'undefined' || !db.getUser) return;

    db.getUser(user, (data) => {
        if (!data) return;

        // Profile Details
        const nameEl = document.getElementById('profile-name');
        const titleEl = document.getElementById('profile-title');
        const roleEl = document.getElementById('profile-role');
        const imgEl = document.getElementById('profile-img');
        const coverEl = document.getElementById('cover-img');
        const aboutEl = document.getElementById('profile-about');
        const bioEl = document.getElementById('profile-bio');
        const resumeBtn = document.getElementById('resume-btn');
        const whatsappBtn = document.getElementById('whatsapp-btn');

        if (nameEl) nameEl.innerText = data.name || '';
        if (titleEl) titleEl.innerText = data.title || '';
        if (roleEl) roleEl.innerText = data.role || '';
        if (imgEl && data.profileImage) imgEl.src = data.profileImage;
        if (coverEl && data.coverImage) coverEl.src = data.coverImage;
        if (aboutEl) aboutEl.innerText = data.about || '';
        if (bioEl) bioEl.innerText = data.bio || '';

        if (resumeBtn && data.resumeUrl) {
            resumeBtn.href = data.resumeUrl;
            resumeBtn.style.display = 'inline-flex';
        }

        if (whatsappBtn && data.whatsapp) {
            const cleanNum = data.whatsapp.replace(/[^0-9]/g, '');
            whatsappBtn.href = `https://wa.me/${cleanNum}`;
            whatsappBtn.style.display = 'inline-flex';
        }

        // Render Projects
        renderProjects(data.projects || []);
    });
}

// Projects Renderer
function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';
    if (projects.length === 0) {
        grid.innerHTML = '<p class="no-data">No projects uploaded yet.</p>';
        return;
    }

    projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-info">
                <span class="project-cat">${p.category || 'Portfolio'}</span>
                <h4>${p.title || 'Project Title'}</h4>
                <p class="project-tech">${p.tech || ''}</p>
                ${p.link ? `<a href="${p.link}" target="_blank" class="btn btn-sm btn-primary">View Project <i class="fas fa-external-link-alt"></i></a>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}