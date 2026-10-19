/* ==========================================
   SAEED & NAEEM PORTFOLIO - MAIN APP
   Public Pages: Home, Portfolio, About
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Ensure Database is initialized first
    if (typeof Database !== 'undefined') {
        Database.init();
    }

    // ---- PRELOADER ----
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('hidden');
                setTimeout(() => preloader.remove(), 500);
            }
        }, 800);
    });

    // ---- AOS INIT (Disable on mobile for better performance) ----
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            disable: window.innerWidth < 768 // Disable on mobile to fix hang issue
        });
    }

    // ---- NAVBAR SCROLL ----
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ---- HAMBURGER MENU ----
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ---- MOBILE BOTTOM NAV ACTIVE STATE ----
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Helper function to extract user from URL safely
    function getUserFromUrl() {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('user');
        } catch (e) {
            return null;
        }
    }

    const currentUser = getUserFromUrl();

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href) {
            if (currentPage === 'index.html' && href === 'index.html') {
                item.classList.add('active');
            } else if (currentPage === 'about.html' && href === 'about.html') {
                item.classList.add('active');
            } else if (currentPage === 'portfolio.html' && currentUser && href.includes(currentUser)) {
                document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        }
    });

    // ---- HELPER FUNCTIONS ----
    function getWhatsAppLink(phone, name) {
        if (!phone) return '#';
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(`Hi ${name || ''}, I found your portfolio! I'd like to connect with you.`);
        return `https://wa.me/${cleanPhone}?text=${message}`;
    }

    function sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateStr).toLocaleDateString('en-US', options);
        } catch (e) {
            return dateStr;
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text || '';
    }

    function setImg(id, src, alt) {
        const el = document.getElementById(id);
        if (el && src) {
            el.src = src;
            el.alt = alt || '';
        }
    }

    function setLink(id, href) {
        const el = document.getElementById(id);
        if (el && href) el.href = href;
    }

    function setWhatsApp(id, phone, name) {
        const el = document.getElementById(id);
        if (el && phone) {
            el.href = getWhatsAppLink(phone, name);
        }
    }

    // =============================================
    //  INDEX PAGE LOGIC
    // =============================================
    if (currentPage === 'index.html' || currentPage === '') {
        loadHomePage();
    }

    function loadHomePage() {
        if (typeof Database === 'undefined') return;
        const admins = Database.getBothAdmins();
        if (!admins) return;

        const saeed = admins.saeedullah;
        const naeem = admins.naeemurrahman;

        if (saeed) {
            setText('saeedHomeName', saeed.fullName);
            setText('saeedHomeBio', saeed.bio);
            setImg('saeedHomeImg', saeed.profileImage, saeed.fullName);
            setWhatsApp('saeedWhatsappHome', saeed.whatsapp, saeed.fullName);
            setWhatsApp('ctaWhatsappSaeed', saeed.whatsapp, saeed.fullName);
            setWhatsApp('footerWhatsappSaeed', saeed.whatsapp, saeed.fullName);
            
            // Default float whatsapp to Saeed on home
            setWhatsApp('whatsappFloat', saeed.whatsapp, saeed.fullName);
        }

        if (naeem) {
            setText('naeemHomeName', naeem.fullName);
            setText('naeemHomeBio', naeem.bio);
            setImg('naeemHomeImg', naeem.profileImage, naeem.fullName);
            setWhatsApp('naeemWhatsappHome', naeem.whatsapp, naeem.fullName);
            setWhatsApp('ctaWhatsappNaeem', naeem.whatsapp, naeem.fullName);
        }

        const totalProjects = Database.getTotalProjectCount();
        animateCounter('statProjects', totalProjects);

        loadFeaturedProjects();

        // Only create particles on Desktop to prevent Mobile Hang
        if (window.innerWidth > 768) {
            createParticles();
        }
    }

    function loadFeaturedProjects() {
        const grid = document.getElementById('featuredGrid');
        const empty = document.getElementById('featuredEmpty');
        if (!grid) return;

        const allProjects = Database.getAllProjects();

        if (!allProjects || allProjects.length === 0) {
            grid.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }

        const featured = allProjects.slice(0, 6);
        grid.innerHTML = '';

        featured.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-card';
            if (window.innerWidth > 768) {
                card.setAttribute('data-aos', 'fade-up');
                card.setAttribute('data-aos-delay', (index * 50).toString());
            }

            const techTags = project.techStack && Array.isArray(project.techStack)
                ? project.techStack.slice(0, 3).map(t => `<span class="tech-tag">${sanitize(t)}</span>`).join('')
                : '';

            card.innerHTML = `
                <div class="project-card-image-wrapper">
                    <img src="${sanitize(project.image)}" alt="${sanitize(project.title)}" class="project-card-image" loading="lazy">
                </div>
                <div class="project-card-body">
                    <span class="project-card-category">${sanitize(project.category)}</span>
                    <h3 class="project-card-title">${sanitize(project.title)}</h3>
                    <p class="project-card-desc">${sanitize(project.description)}</p>
                    <div class="project-card-tech">${techTags}</div>
                    <div class="project-card-footer">
                        <div class="project-card-author">
                            <img src="${sanitize(project.adminImage)}" alt="${sanitize(project.adminName)}">
                            <span>${sanitize(project.adminName)}</span>
                        </div>
                        <div class="project-card-links">
                            ${project.githubLink ? `<a href="${sanitize(project.githubLink)}" class="project-link" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                            ${project.liveLink ? `<a href="${sanitize(project.liveLink)}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        if (typeof AOS !== 'undefined' && window.innerWidth > 768) AOS.refresh();
    }

    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.width = (Math.random() * 4 + 2) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            container.appendChild(particle);
        }
    }

    function animateCounter(elementId, target) {
        const el = document.getElementById(elementId);
        if (!el || target <= 0) return;

        let current = 0;
        const increment = Math.ceil(target / 20);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 50);
    }

    // =============================================
    //  PORTFOLIO PAGE LOGIC
    // =============================================
    if (currentPage === 'portfolio.html') {
        loadPortfolioPage();
    }

    function loadPortfolioPage() {
        if (typeof Database === 'undefined') return;
        
        const userId = getUserFromUrl();
        if (!userId) {
            window.location.href = 'index.html';
            return;
        }

        const admin = Database.getAdmin(userId);
        if (!admin) {
            window.location.href = 'index.html';
            return;
        }

        document.title = `${admin.fullName} - S&N Portfolio`;

        setText('portfolioName', admin.fullName);
        setText('portfolioRoleText', admin.role);
        setText('portfolioBio', admin.bio);
        setText('portfolioEmail', admin.email);
        setText('portfolioBank', admin.bankAccount || 'Not provided');
        setImg('portfolioAvatar', admin.profileImage, admin.fullName);

        const waLink = getWhatsAppLink(admin.whatsapp, admin.fullName);
        setLink('portfolioWhatsapp', waLink);
        setLink('whatsappFloat', waLink);

        const skillsContainer = document.getElementById('portfolioSkills');
        if (skillsContainer && admin.skills && Array.isArray(admin.skills)) {
            skillsContainer.innerHTML = admin.skills
                .map(s => `<span class="skill-tag">${sanitize(s)}</span>`)
                .join('');
        }

        const copyBtn = document.getElementById('copyBank');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (admin.bankAccount) {
                    navigator.clipboard.writeText(admin.bankAccount).then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                        }, 2000);
                    });
                }
            });
        }

        loadPortfolioProjects(userId, admin);
    }

    function loadPortfolioProjects(userId, admin) {
        const projects = Database.getProjects(userId) || [];
        const grid = document.getElementById('projectsGrid');
        const empty = document.getElementById('emptyState');
        const countEl = document.getElementById('projectCount');
        const filterContainer = document.getElementById('filterButtons');

        if (countEl) countEl.textContent = `${projects.length} project(s) in portfolio`;

        if (projects.length === 0) {
            if (grid) grid.style.display = 'none';
            if (empty) empty.style.display = 'block';
            if (filterContainer) filterContainer.style.display = 'none';
            return;
        }

        if (filterContainer) {
            const categories = ['all', ...new Set(projects.map(p => p.category))];
            filterContainer.innerHTML = categories
                .map(c => `<button class="filter-btn ${c === 'all' ? 'active' : ''}" data-filter="${c}">${c === 'all' ? 'All' : c}</button>`)
                .join('');

            filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderProjectCards(projects, grid, btn.dataset.filter);
                });
            });
        }

        renderProjectCards(projects, grid, 'all');
    }

    function renderProjectCards(projects, grid, filter) {
        if (!grid) return;
        grid.innerHTML = '';

        const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">No projects in this category.</p>';
            return;
        }

        filtered.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-card';
            
            const techTags = project.techStack && Array.isArray(project.techStack)
                ? project.techStack.slice(0, 3).map(t => `<span class="tech-tag">${sanitize(t)}</span>`).join('')
                : '';

            card.innerHTML = `
                <div class="project-card-image-wrapper">
                    <img src="${sanitize(project.image)}" alt="${sanitize(project.title)}" class="project-card-image" loading="lazy">
                </div>
                <div class="project-card-body">
                    <span class="project-card-category">${sanitize(project.category)}</span>
                    <h3 class="project-card-title">${sanitize(project.title)}</h3>
                    <p class="project-card-desc">${sanitize(project.description)}</p>
                    <div class="project-card-tech">${techTags}</div>
                    <div class="project-card-footer">
                        <span style="font-size:0.75rem;color:var(--text-muted);">
                            <i class="fas fa-calendar"></i> ${formatDate(project.dateAdded)}
                        </span>
                        <div class="project-card-links">
                            ${project.githubLink ? `<a href="${sanitize(project.githubLink)}" class="project-link" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                            ${project.liveLink ? `<a href="${sanitize(project.liveLink)}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.project-link')) return;
                openProjectModal(project);
            });

            grid.appendChild(card);
        });
    }

    // ---- PROJECT MODAL ----
    function openProjectModal(project) {
        const modal = document.getElementById('projectModal');
        if (!modal) return;

        setImg('modalImage', project.image, project.title);
        setText('modalCategory', project.category);
        setText('modalTitle', project.title);
        setText('modalDescription', project.description);
        setText('modalDate', formatDate(project.dateAdded));

        const techContainer = document.getElementById('modalTech');
        if (techContainer) {
            techContainer.innerHTML = project.techStack && Array.isArray(project.techStack)
                ? project.techStack.map(t => `<span class="tech-tag">${sanitize(t)}</span>`).join('')
                : '';
        }

        const githubBtn = document.getElementById('modalGithub');
        const liveBtn = document.getElementById('modalLive');

        if (githubBtn) {
            if (project.githubLink) {
                githubBtn.href = project.githubLink;
                githubBtn.style.display = 'inline-flex';
            } else {
                githubBtn.style.display = 'none';
            }
        }

        if (liveBtn) {
            if (project.liveLink) {
                liveBtn.href = project.liveLink;
                liveBtn.style.display = 'inline-flex';
            } else {
                liveBtn.style.display = 'none';
            }
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    const modalClose = document.getElementById('modalClose');
    const projectModal = document.getElementById('projectModal');

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) closeModal();
        });
    }

    function closeModal() {
        if (projectModal) {
            projectModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // =============================================
    //  ABOUT PAGE LOGIC
    // =============================================
    if (currentPage === 'about.html') {
        loadAboutPage();
    }

    function loadAboutPage() {
        if (typeof Database === 'undefined') return;
        const admins = Database.getBothAdmins();
        if (!admins) return;

        const saeed = admins.saeedullah;
        const naeem = admins.naeemurrahman;

        if (saeed) {
            setText('aboutSaeedName', saeed.fullName);
            setText('aboutSaeedBio', saeed.bio);
            setImg('aboutSaeedImg', saeed.profileImage, saeed.fullName);
            setWhatsApp('aboutWhatsappSaeed', saeed.whatsapp, saeed.fullName);
            setWhatsApp('whatsappFloat', saeed.whatsapp, saeed.fullName);
        }

        if (naeem) {
            setText('aboutNaeemName', naeem.fullName);
            setText('aboutNaeemBio', naeem.bio);
            setImg('aboutNaeemImg', naeem.profileImage, naeem.fullName);
            setWhatsApp('aboutWhatsappNaeem', naeem.whatsapp, naeem.fullName);
        }

        animateSkillBars();
    }

    function animateSkillBars() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fills = entry.target.querySelectorAll('.skill-bar-fill');
                    fills.forEach(fill => {
                        const width = fill.dataset.width;
                        setTimeout(() => {
                            fill.style.width = width + '%';
                        }, 200);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.skill-bars').forEach(bar => {
            observer.observe(bar);
        });
    }
});