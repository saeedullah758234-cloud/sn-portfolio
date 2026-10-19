/* ==========================================================================
   SN PORTFOLIO V2.0 - PUBLIC ENGINE (INSTANT LOAD)
   File: js/app.js
   Author: Saeed ullah & Naeem ur Rahman
   ========================================================================== */

(function () {
    'use strict';

    let currentUserProfile = null;
    let currentUserId = 'saeed';

    document.addEventListener('DOMContentLoaded', async () => {
        initTheme();
        initPreloader();
        initMobileMenu();

        const urlParams = new URLSearchParams(window.location.search);
        const requestedUser = urlParams.get('user');
        if (requestedUser === 'naeem' || requestedUser === 'saeed') {
            currentUserId = requestedUser;
        }

        updateNavLinks();

        const path = window.location.pathname.toLowerCase();

        if (path.includes('index.html') || path.endsWith('/')) {
            await initHomePage();
        } else if (path.includes('about.html')) {
            await initAboutPage();
        } else if (path.includes('portfolio.html')) {
            await initPortfolioPage(currentUserId);
        }

        // Listen for background sync updates
        window.addEventListener('sn_data_synced', (e) => {
            if (e.detail && e.detail.key === currentUserId && path.includes('portfolio.html')) {
                renderPortfolioData(e.detail.profile);
            }
        });
    });

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                updateThemeIcon(next);
            });
        }
    }

    function updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggleBtn i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    function initPreloader() {
        const loader = document.getElementById('preloader');
        if (loader) {
            // Immediate removal (Under 50ms)
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 50);
        }
    }

    function initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        if (menuBtn && navLinks) {
            menuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }

    function updateNavLinks() {
        const saeedLink = document.getElementById('navSaeedLink');
        const naeemLink = document.getElementById('navNaeemLink');

        if (saeedLink && currentUserId === 'saeed' && window.location.pathname.includes('portfolio.html')) {
            saeedLink.classList.add('active');
        } else if (naeemLink && currentUserId === 'naeem' && window.location.pathname.includes('portfolio.html')) {
            naeemLink.classList.add('active');
        }
    }

    async function initHomePage() {
        try {
            const profiles = await window.db.getAllProfiles();
            const saeed = profiles.saeed;
            const naeem = profiles.naeem;

            if (saeed) {
                bindElement('home-saeed-name', saeed.name);
                bindElement('home-saeed-title', saeed.title);
                bindElement('home-saeed-intro', saeed.intro || saeed.about);
                if (saeed.profileImage) bindImg('home-saeed-img', saeed.profileImage);
                if (saeed.coverImage) bindBg('home-saeed-banner', saeed.coverImage);
                bindHref('home-saeed-wa', `https://wa.me/${saeed.whatsapp || saeed.phone}?text=Hi%20Saeed,%20I%20saw%20your%20portfolio`);
            }

            if (naeem) {
                bindElement('home-naeem-name', naeem.name);
                bindElement('home-naeem-title', naeem.title);
                bindElement('home-naeem-intro', naeem.intro || naeem.about);
                if (naeem.profileImage) bindImg('home-naeem-img', naeem.profileImage);
                if (naeem.coverImage) bindBg('home-naeem-banner', naeem.coverImage);
                bindHref('home-naeem-wa', `https://wa.me/${naeem.whatsapp || naeem.phone}?text=Hi%20Naeem,%20I%20saw%20your%20portfolio`);
            }
        } catch (err) {}
    }

    async function initAboutPage() {
        try {
            const profiles = await window.db.getAllProfiles();
            const saeed = profiles.saeed;
            const naeem = profiles.naeem;

            if (saeed) {
                bindElement('about-saeed-name', saeed.name);
                bindElement('about-saeed-title', saeed.title);
                bindElement('about-saeed-bio', saeed.about);
                if (saeed.profileImage) bindImg('about-saeed-img', saeed.profileImage);
                bindHref('about-saeed-wa', `https://wa.me/${saeed.whatsapp || saeed.phone}`);
            }

            if (naeem) {
                bindElement('about-naeem-name', naeem.name);
                bindElement('about-naeem-title', naeem.title);
                bindElement('about-naeem-bio', naeem.about);
                if (naeem.profileImage) bindImg('about-naeem-img', naeem.profileImage);
                bindHref('about-naeem-wa', `https://wa.me/${naeem.whatsapp || naeem.phone}`);
            }
        } catch (err) {}
    }

    async function initPortfolioPage(userId) {
        currentUserProfile = await window.db.getUser(userId);
        if (!currentUserProfile) return;
        renderPortfolioData(currentUserProfile);
    }

    function renderPortfolioData(profile) {
        bindElement('p-name', profile.name);
        bindElement('p-title', profile.title);
        bindElement('p-intro', profile.intro || profile.about);
        bindElement('p-availability', profile.availability || 'Available for Freelance');

        if (profile.profileImage) bindImg('p-avatar-img', profile.profileImage);
        if (profile.coverImage) bindImg('p-cover-img', profile.coverImage);

        const waNum = profile.whatsapp || profile.phone || '';
        bindHref('p-wa-btn', `https://wa.me/${waNum}?text=Hello%20${encodeURIComponent(profile.name)},%20I%20saw%20your%20portfolio.`);
        
        if (profile.email) bindHref('p-email-btn', `mailto:${profile.email}`);
        
        const rBtn = document.getElementById('p-resume-btn');
        if (rBtn) {
            if (profile.resume) {
                rBtn.style.display = 'inline-flex';
                rBtn.href = profile.resume;
            } else {
                rBtn.style.display = 'none';
            }
        }

        renderProjects(profile.projects || []);
        renderSkills(profile.skills || []);
        renderServices(profile.services || []);
        renderExperience(profile.experience || []);
        renderEducation(profile.education || []);
        renderCertifications(profile.certifications || []);
        renderBankDetails(profile.bankDetails || {}, profile.name);
        renderSocials(profile.socials || {});
        
        setupProjectModal();
    }

    function renderProjects(projects) {
        const grid = document.getElementById('projectsGrid');
        const filtersContainer = document.getElementById('projectFilters');
        if (!grid) return;

        grid.innerHTML = '';
        if (projects.length === 0) {
            grid.innerHTML = '<p class="text-muted col-span-3 text-center p-4">No portfolio projects published yet.</p>';
            return;
        }

        const categories = ['all', ...new Set(projects.map(p => p.category || 'General'))];
        
        if (filtersContainer) {
            filtersContainer.innerHTML = categories.map(cat => `
                <button class="filter-btn ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
                    ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
            `).join('');

            filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    filterProjectsGrid(projects, e.target.getAttribute('data-filter'));
                });
            });
        }

        filterProjectsGrid(projects, 'all');
    }

    function filterProjectsGrid(projects, filterCategory) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const filtered = filterCategory === 'all' 
            ? projects 
            : projects.filter(p => (p.category || 'General').toLowerCase() === filterCategory.toLowerCase());

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'panel-card hover-lift animate-fadeInUp';
            
            const coverSrc = item.thumbnail || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='350'><rect width='100%' height='100%' fill='%231a1f3a'/></svg>";
            
            card.innerHTML = `
                <div class="image-preview-box mb-3" style="height: 180px; border: none; cursor: pointer;">
                    <img src="${coverSrc}" alt="${item.title}" style="object-fit: cover;">
                </div>
                <h3>${item.title}</h3>
                <span class="profile-role mb-2" style="font-size: 0.75rem;">${item.category || 'Project'}</span>
                <p class="text-muted text-sm mb-3">${(item.description || '').substring(0, 90)}...</p>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline btn-sm w-100 view-project-btn" data-id="${item.id}">
                        <i class="fa-solid fa-eye"></i> Details
                    </button>
                    ${item.link ? `<a href="${item.link}" target="_blank" class="btn btn-primary btn-sm"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live</a>` : ''}
                </div>
            `;

            card.querySelector('.view-project-btn').addEventListener('click', () => {
                openProjectModal(item);
            });

            grid.appendChild(card);
        });
    }

    function renderSkills(skills) {
        const container = document.getElementById('skillsGrid');
        if (!container) return;
        container.innerHTML = '';

        skills.forEach(sk => {
            const tag = document.createElement('div');
            tag.className = 'panel-card text-center hover-scale';
            tag.innerHTML = `
                <i class="${sk.icon || 'fa-solid fa-code'} text-primary mb-2" style="font-size: 1.75rem;"></i>
                <h4>${sk.name || sk}</h4>
                ${sk.level ? `<span class="text-muted text-sm">${sk.level}</span>` : ''}
            `;
            container.appendChild(tag);
        });
    }

    function renderServices(services) {
        const container = document.getElementById('servicesGrid');
        if (!container) return;
        container.innerHTML = '';

        services.forEach(srv => {
            const box = document.createElement('div');
            box.className = 'panel-card hover-lift';
            box.innerHTML = `
                <div class="brand-icon mb-3"><i class="${srv.icon || 'fa-solid fa-star'}"></i></div>
                <h3>${srv.title}</h3>
                <p class="text-muted">${srv.description || ''}</p>
            `;
            container.appendChild(box);
        });
    }

    function renderExperience(expList) {
        const container = document.getElementById('experienceList');
        if (!container) return;
        container.innerHTML = expList.map(exp => `
            <div class="dynamic-card mb-3">
                <div class="d-flex justify-content-between">
                    <h4>${exp.title || exp.role}</h4>
                    <span class="text-muted text-sm">${exp.period || exp.year || ''}</span>
                </div>
                <p class="text-primary text-sm font-weight-bold">${exp.company || ''}</p>
            </div>
        `).join('');
    }

    function renderEducation(eduList) {
        const container = document.getElementById('educationList');
        if (!container) return;
        container.innerHTML = eduList.map(edu => `
            <div class="dynamic-card mb-3">
                <div class="d-flex justify-content-between">
                    <h4>${edu.degree || edu.title}</h4>
                    <span class="text-muted text-sm">${edu.year || ''}</span>
                </div>
                <p class="text-accent text-sm font-weight-bold">${edu.institution || ''}</p>
            </div>
        `).join('');
    }

    function renderCertifications(certs) {
        const container = document.getElementById('certificationsGrid');
        if (!container) return;
        container.innerHTML = certs.map(c => `
            <div class="panel-card hover-lift">
                <i class="fa-solid fa-award text-accent mb-2" style="font-size: 2rem;"></i>
                <h3>${c.title}</h3>
                <p class="text-muted text-sm">${c.issuer || ''}</p>
            </div>
        `).join('');
    }

    function renderBankDetails(bank, fallbackName) {
        bindElement('b-bankName', bank.bankName || 'Easypaisa / JazzCash');
        bindElement('b-accTitle', bank.accountTitle || fallbackName);
        bindElement('b-accNo', bank.accountNumber || 'Available on request');
    }

    function renderSocials(socials) {
        const container = document.getElementById('p-socials-container');
        if (!container) return;
        
        const map = [
            { key: 'github', icon: 'fa-brands fa-github', label: 'GitHub' },
            { key: 'linkedin', icon: 'fa-brands fa-linkedin', label: 'LinkedIn' },
            { key: 'youtube', icon: 'fa-brands fa-youtube', label: 'YouTube' },
            { key: 'freelance', icon: 'fa-solid fa-briefcase', label: 'Freelance' },
            { key: 'instagram', icon: 'fa-brands fa-instagram', label: 'Instagram' },
            { key: 'facebook', icon: 'fa-brands fa-facebook', label: 'Facebook' }
        ];

        container.innerHTML = map
            .filter(item => socials[item.key])
            .map(item => `
                <a href="${socials[item.key]}" target="_blank" class="btn btn-outline btn-sm">
                    <i class="${item.icon}"></i> ${item.label}
                </a>
            `).join('');
    }

    function setupProjectModal() {
        const modal = document.getElementById('projectModal');
        const closeBtn = document.getElementById('modalCloseBtn');
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => { modal.classList.remove('active'); });
        }
    }

    function openProjectModal(project) {
        const modal = document.getElementById('projectModal');
        const modalContent = document.getElementById('modalContent');
        if (!modal || !modalContent) return;

        let mediaHtml = '';
        if (project.video) {
            mediaHtml = `<div class="mb-3" style="position:relative;padding-top:56.25%;"><iframe src="${project.video}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
        } else if (project.thumbnail) {
            mediaHtml = `<img src="${project.thumbnail}" alt="${project.title}" style="width:100%;max-height:350px;object-fit:cover;border-radius:12px;" class="mb-3">`;
        }

        modalContent.innerHTML = `
            ${mediaHtml}
            <h2>${project.title}</h2>
            <span class="profile-role mb-3">${project.category || 'General'}</span>
            <p class="text-muted leading-relaxed mb-4">${project.description || ''}</p>
            <div class="d-flex gap-2">
                ${project.link ? `<a href="${project.link}" target="_blank" class="btn btn-primary"><i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Project</a>` : ''}
                ${project.github ? `<a href="${project.github}" target="_blank" class="btn btn-outline"><i class="fa-brands fa-github"></i> Repository</a>` : ''}
            </div>
        `;

        modal.classList.add('active');
    }

    function bindElement(id, text) { const el = document.getElementById(id); if (el && text !== undefined) el.textContent = text; }
    function bindImg(id, src) { const el = document.getElementById(id); if (el && src) el.src = src; }
    function bindBg(id, url) { const el = document.getElementById(id); if (el && url) el.style.backgroundImage = `url('${url}')`; }
    function bindHref(id, url) { const el = document.getElementById(id); if (el && url) el.href = url; }

})();