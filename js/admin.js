/* ==========================================================================
   SN PORTFOLIO V2.0 - PROFESSIONAL ADMIN DASHBOARD ENGINE
   File: js/admin.js
   Author: Saeed ullah & Naeem ur Rahman
   ========================================================================== */

(function () {
    'use strict';

    let currentUserKey = 'saeed';
    let currentUserData = null;
    let pendingCropBase64 = null;

    // --------------------------------------------------------------------------
    // 1. INITIALIZATION
    // --------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', async () => {
        // Enforce Session
        window.auth.requireAuth();

        currentUserKey = window.auth.getCurrentUserKey();
        
        // Setup UI Controls
        setupThemeToggle();
        setupSidebarNavigation();
        setupMobileDrawer();
        setupLogout();

        // Load & Populate Data
        await loadDashboardData();

        // Setup Interactive Component Handlers
        setupImageUploadHandlers();
        setupCropModal();
        setupDynamicListAdders();
        setupGlobalSaveHandler();

        // Hide Preloader
        const loader = document.getElementById('preloader');
        if (loader) loader.classList.add('hidden');
    });

    // --------------------------------------------------------------------------
    // 2. UI NAVIGATION & LAYOUT HANDLERS
    // --------------------------------------------------------------------------
    function setupSidebarNavigation() {
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        const panels = document.querySelectorAll('.tab-panel');
        const panelTitle = document.getElementById('panelTitle');

        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                menuLinks.forEach(l => l.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                link.classList.add('active');
                const targetId = link.getAttribute('data-target');
                const targetPanel = document.getElementById(targetId);

                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                if (panelTitle) {
                    panelTitle.textContent = link.textContent.trim();
                }

                // Close mobile drawer if open
                closeMobileDrawer();
            });
        });
    }

    function setupMobileDrawer() {
        const btn = document.getElementById('adminMobileMenuBtn');
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (btn && sidebar && overlay) {
            btn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });

            overlay.addEventListener('click', closeMobileDrawer);
        }
    }

    function closeMobileDrawer() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    function setupThemeToggle() {
        const btn = document.getElementById('adminThemeToggleBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
            });
        }
    }

    function setupLogout() {
        const btn = document.getElementById('logoutBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to log out of the admin panel?')) {
                    window.auth.logout();
                }
            });
        }
    }

    // --------------------------------------------------------------------------
    // 3. LOAD DATA & POPULATE FORMS
    // --------------------------------------------------------------------------
    async function loadDashboardData() {
        currentUserData = await db.getUser(currentUserKey);

        if (!currentUserData) return;

        // Update Topbar / Sidebar Info
        bindVal('adminSidebarName', currentUserData.name || 'Admin');
        bindVal('adminSidebarRole', currentUserData.title || 'Administrator');
        if (currentUserData.profileImage) {
            const avatar = document.getElementById('adminSidebarAvatar');
            if (avatar) avatar.src = currentUserData.profileImage;
        }

        // Live Site View Button URL
        const viewLive = document.getElementById('viewLiveBtn');
        if (viewLive) {
            viewLive.href = `portfolio.html?user=${currentUserKey}`;
        }

        // Populate Forms
        populateBasicInfo(currentUserData);
        populatePhotos(currentUserData);
        populateBio(currentUserData);
        populateBankAndSocials(currentUserData);

        // Populate Dynamic Lists
        renderProjectsList(currentUserData.projects || []);
        renderSkillsList(currentUserData.skills || []);
        renderServicesList(currentUserData.services || []);
        renderExperienceList(currentUserData.experience || []);
        renderEducationList(currentUserData.education || []);
        renderCertsList(currentUserData.certifications || []);
    }

    function populateBasicInfo(data) {
        setInputValue('input-name', data.name);
        setInputValue('input-title', data.title);
        setInputValue('input-email', data.email);
        setInputValue('input-phone', data.phone);
        setInputValue('input-whatsapp', data.whatsapp);
        setInputValue('input-location', data.location);
        setInputValue('input-availability', data.availability);
    }

    function populatePhotos(data) {
        if (data.profileImage) {
            const img = document.getElementById('preview-avatar');
            if (img) img.src = data.profileImage;
        }
        if (data.coverImage) {
            const img = document.getElementById('preview-cover');
            if (img) img.src = data.coverImage;
        }
    }

    function populateBio(data) {
        setInputValue('input-intro', data.intro);
        setInputValue('input-about', data.about);
        setInputValue('input-resume', data.resume);
    }

    function populateBankAndSocials(data) {
        const bank = data.bankDetails || {};
        setInputValue('input-bank-name', bank.bankName);
        setInputValue('input-bank-title', bank.accountTitle);
        setInputValue('input-bank-account', bank.accountNumber);

        const soc = data.socials || {};
        setInputValue('input-social-github', soc.github);
        setInputValue('input-social-linkedin', soc.linkedin);
        setInputValue('input-social-youtube', soc.youtube);
        setInputValue('input-social-freelance', soc.freelance);
        setInputValue('input-social-instagram', soc.instagram);
        setInputValue('input-social-facebook', soc.facebook);
    }

    // --------------------------------------------------------------------------
    // 4. IMAGE HANDLERS & CROP MODAL
    // --------------------------------------------------------------------------
    function setupImageUploadHandlers() {
        // Avatar File Select
        const avatarInput = document.getElementById('upload-avatar-file');
        if (avatarInput) {
            avatarInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const base64 = await db.compressImage(file, 800, 800, 0.85);
                openCropModal(base64);
            });
        }

        // Cover File Select
        const coverInput = document.getElementById('upload-cover-file');
        if (coverInput) {
            coverInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const base64 = await db.compressImage(file, 1200, 400, 0.75);
                currentUserData.coverImage = base64;
                const preview = document.getElementById('preview-cover');
                if (preview) preview.src = base64;
                markUnsaved();
            });
        }
    }

    function setupCropModal() {
        const modal = document.getElementById('cropModal');
        const closeBtn = document.getElementById('closeCropModalBtn');
        const cancelBtn = document.getElementById('cancelCropBtn');
        const applyBtn = document.getElementById('applyCropBtn');
        const slider = document.getElementById('cropZoomSlider');
        const cropImg = document.getElementById('cropImageTarget');

        if (closeBtn) closeBtn.addEventListener('click', closeCropModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeCropModal);

        if (slider && cropImg) {
            slider.addEventListener('input', (e) => {
                const zoom = e.target.value;
                cropImg.style.transform = `scale(${zoom})`;
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                if (pendingCropBase64) {
                    currentUserData.profileImage = pendingCropBase64;
                    const preview = document.getElementById('preview-avatar');
                    if (preview) preview.src = pendingCropBase64;
                    markUnsaved();
                }
                closeCropModal();
            });
        }
    }

    function openCropModal(base64Image) {
        pendingCropBase64 = base64Image;
        const modal = document.getElementById('cropModal');
        const cropImg = document.getElementById('cropImageTarget');
        const slider = document.getElementById('cropZoomSlider');

        if (cropImg) cropImg.src = base64Image;
        if (slider) slider.value = 1;
        if (cropImg) cropImg.style.transform = 'scale(1)';

        if (modal) modal.classList.add('active');
    }

    function closeCropModal() {
        const modal = document.getElementById('cropModal');
        if (modal) modal.classList.remove('active');
    }

    // --------------------------------------------------------------------------
    // 5. DYNAMIC LIST MANAGEMENT (PROJECTS, SKILLS, SERVICES, TIMELINE)
    // --------------------------------------------------------------------------
    function renderProjectsList(projects) {
        const container = document.getElementById('adminProjectsList');
        if (!container) return;
        container.innerHTML = '';

        projects.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title">
                        <i class="fa-solid fa-folder text-primary"></i> ${item.title || 'Untitled Project'}
                    </div>
                    <div class="dynamic-card-actions">
                        <button type="button" class="btn-icon delete-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Project Title</label>
                        <input type="text" class="form-control proj-title" value="${item.title || ''}">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <input type="text" class="form-control proj-cat" value="${item.category || 'Web App'}">
                    </div>
                    <div class="form-group span-2">
                        <label>Project Description</label>
                        <textarea class="form-control proj-desc">${item.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Live Demo URL</label>
                        <input type="text" class="form-control proj-link" value="${item.link || ''}">
                    </div>
                    <div class="form-group">
                        <label>GitHub / Source URL</label>
                        <input type="text" class="form-control proj-github" value="${item.github || ''}">
                    </div>
                    <div class="form-group span-2">
                        <label>Thumbnail Cover Image URL</label>
                        <input type="text" class="form-control proj-thumb" value="${item.thumbnail || ''}">
                    </div>
                </div>
            `;

            card.querySelector('.delete-btn').addEventListener('click', () => {
                currentUserData.projects.splice(index, 1);
                renderProjectsList(currentUserData.projects);
                markUnsaved();
            });

            container.appendChild(card);
        });
    }

    function renderSkillsList(skills) {
        const container = document.getElementById('adminSkillsList');
        if (!container) return;
        container.innerHTML = '';

        skills.forEach((sk, index) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            const name = typeof sk === 'string' ? sk : sk.name;
            const level = sk.level || 'Advanced';
            
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title"><i class="fa-solid fa-code text-accent"></i> ${name}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Skill Name</label>
                        <input type="text" class="form-control skill-name" value="${name}">
                    </div>
                    <div class="form-group">
                        <label>Proficiency Level</label>
                        <input type="text" class="form-control skill-level" value="${level}">
                    </div>
                </div>
            `;

            card.querySelector('.delete-btn').addEventListener('click', () => {
                currentUserData.skills.splice(index, 1);
                renderSkillsList(currentUserData.skills);
                markUnsaved();
            });

            container.appendChild(card);
        });
    }

    function renderServicesList(services) {
        const container = document.getElementById('adminServicesList');
        if (!container) return;
        container.innerHTML = '';

        services.forEach((srv, index) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title"><i class="fa-solid fa-cube text-primary"></i> ${srv.title}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group span-2">
                        <label>Service Title</label>
                        <input type="text" class="form-control srv-title" value="${srv.title || ''}">
                    </div>
                    <div class="form-group span-2">
                        <label>Description</label>
                        <textarea class="form-control srv-desc">${srv.description || ''}</textarea>
                    </div>
                </div>
            `;

            card.querySelector('.delete-btn').addEventListener('click', () => {
                currentUserData.services.splice(index, 1);
                renderServicesList(currentUserData.services);
                markUnsaved();
            });

            container.appendChild(card);
        });
    }

    function renderExperienceList(list) {
        const container = document.getElementById('adminExperienceList');
        if (!container) return;
        container.innerHTML = '';

        list.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title">${item.title || 'Role'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Job Title / Role</label>
                        <input type="text" class="form-control exp-title" value="${item.title || item.role || ''}">
                    </div>
                    <div class="form-group">
                        <label>Company / Organization</label>
                        <input type="text" class="form-control exp-company" value="${item.company || ''}">
                    </div>
                    <div class="form-group span-2">
                        <label>Time Period</label>
                        <input type="text" class="form-control exp-period" value="${item.period || item.year || ''}">
                    </div>
                </div>
            `;

            card.querySelector('.delete-btn').addEventListener('click', () => {
                currentUserData.experience.splice(index, 1);
                renderExperienceList(currentUserData.experience);
                markUnsaved();
            });

            container.appendChild(card);
        });
    }

    function renderEducationList(list) {
        const container = document.getElementById('adminEducationList');
        if (!container) return;
        container.innerHTML = '';

        list.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title">${item.degree || item.title || 'Education'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Degree / Certificate</label>
                        <input type="text" class="form-control edu-degree" value="${item.degree || item.title || ''}">
                    </div>
                    <div class="form-group">
                        <label>School / University</label>
                        <input type="text" class="form-control edu-school" value="${item.institution || ''}">
                    </div>
                    <div class="form-group span-2">
                        <label>Passing Year</label>
                        <input type="text" class="form-control edu-year" value="${item.year || ''}">
                    </div>
                </div>
            `;

            card.querySelector('.delete-btn').addEventListener('click', () => {
                currentUserData.education.splice(index, 1);
                renderEducationList(currentUserData.education);
                markUnsaved();
            });

            container.appendChild(card);
        });
    }

    function renderCertsList(list) {
        const container = document.getElementById('adminCertsList');
        if (!container) return;
        container.innerHTML = '';

        list.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title">${item.title || 'Certification'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Certification Title</label>
                        <input type="text" class="form-control cert-title" value="${item.title || ''}">
                    </div>
                    <div class="form-group">
                        <label>Issuing Organization</label>
                        <input type="text" class="form-control cert-issuer" value="${item.issuer || ''}">
                    </div>
                </div>
            `;

            card.querySelector('.delete-btn').addEventListener('click', () => {
                currentUserData.certifications.splice(index, 1);
                renderCertsList(currentUserData.certifications);
                markUnsaved();
            });

            container.appendChild(card);
        });
    }

    // Dynamic Adders
    function setupDynamicListAdders() {
        bindClick('addNewProjectBtn', () => {
            if (!currentUserData.projects) currentUserData.projects = [];
            currentUserData.projects.unshift({
                id: Date.now(),
                title: 'New Project',
                category: 'Web App',
                description: 'Project description goes here.',
                link: '',
                github: '',
                thumbnail: 'https://via.placeholder.com/600x350'
            });
            renderProjectsList(currentUserData.projects);
            markUnsaved();
        });

        bindClick('addNewSkillBtn', () => {
            if (!currentUserData.skills) currentUserData.skills = [];
            currentUserData.skills.push({ name: 'New Skill', level: 'Expert', icon: 'fa-solid fa-code' });
            renderSkillsList(currentUserData.skills);
            markUnsaved();
        });

        bindClick('addNewServiceBtn', () => {
            if (!currentUserData.services) currentUserData.services = [];
            currentUserData.services.push({ title: 'New Service', description: 'Service description.', icon: 'fa-solid fa-cubes' });
            renderServicesList(currentUserData.services);
            markUnsaved();
        });

        bindClick('addNewExperienceBtn', () => {
            if (!currentUserData.experience) currentUserData.experience = [];
            currentUserData.experience.push({ title: 'Software Engineer', company: 'Tech Corp', period: '2023 - Present' });
            renderExperienceList(currentUserData.experience);
            markUnsaved();
        });

        bindClick('addNewEducationBtn', () => {
            if (!currentUserData.education) currentUserData.education = [];
            currentUserData.education.push({ degree: 'BS Computer Science', institution: 'University', year: '2024' });
            renderEducationList(currentUserData.education);
            markUnsaved();
        });

        bindClick('addNewCertBtn', () => {
            if (!currentUserData.certifications) currentUserData.certifications = [];
            currentUserData.certifications.push({ title: 'Certified Developer', issuer: 'Google', year: '2024' });
            renderCertsList(currentUserData.certifications);
            markUnsaved();
        });
    }

    // --------------------------------------------------------------------------
    // 6. COLLECT FORM DATA & GLOBAL FAIL-SAFE SAVE
    // --------------------------------------------------------------------------
    function collectFormData() {
        const data = Object.assign({}, currentUserData);

        // Basic Info
        data.name = getInputValue('input-name');
        data.title = getInputValue('input-title');
        data.email = getInputValue('input-email');
        data.phone = getInputValue('input-phone');
        data.whatsapp = getInputValue('input-whatsapp');
        data.location = getInputValue('input-location');
        data.availability = getInputValue('input-availability');

        // Bio
        data.intro = getInputValue('input-intro');
        data.about = getInputValue('input-about');
        data.resume = getInputValue('input-resume');

        // Bank
        data.bankDetails = {
            bankName: getInputValue('input-bank-name'),
            accountTitle: getInputValue('input-bank-title'),
            accountNumber: getInputValue('input-bank-account')
        };

        // Socials
        data.socials = {
            github: getInputValue('input-social-github'),
            linkedin: getInputValue('input-social-linkedin'),
            youtube: getInputValue('input-social-youtube'),
            freelance: getInputValue('input-social-freelance'),
            instagram: getInputValue('input-social-instagram'),
            facebook: getInputValue('input-social-facebook')
        };

        // Collect Dynamic Projects DOM Inputs
        const projCards = document.querySelectorAll('#adminProjectsList .dynamic-card');
        data.projects = Array.from(projCards).map((card, i) => {
            const orig = (currentUserData.projects && currentUserData.projects[i]) || {};
            return {
                id: orig.id || Date.now() + i,
                title: card.querySelector('.proj-title')?.value || 'Untitled',
                category: card.querySelector('.proj-cat')?.value || 'General',
                description: card.querySelector('.proj-desc')?.value || '',
                link: card.querySelector('.proj-link')?.value || '',
                github: card.querySelector('.proj-github')?.value || '',
                thumbnail: card.querySelector('.proj-thumb')?.value || ''
            };
        });

        // Collect Skills DOM Inputs
        const skillCards = document.querySelectorAll('#adminSkillsList .dynamic-card');
        data.skills = Array.from(skillCards).map(card => ({
            name: card.querySelector('.skill-name')?.value || 'Skill',
            level: card.querySelector('.skill-level')?.value || 'Advanced',
            icon: 'fa-solid fa-code'
        }));

        // Collect Services DOM Inputs
        const srvCards = document.querySelectorAll('#adminServicesList .dynamic-card');
        data.services = Array.from(srvCards).map(card => ({
            title: card.querySelector('.srv-title')?.value || 'Service',
            description: card.querySelector('.srv-desc')?.value || '',
            icon: 'fa-solid fa-cubes'
        }));

        // Collect Experience DOM Inputs
        const expCards = document.querySelectorAll('#adminExperienceList .dynamic-card');
        data.experience = Array.from(expCards).map(card => ({
            title: card.querySelector('.exp-title')?.value || '',
            company: card.querySelector('.exp-company')?.value || '',
            period: card.querySelector('.exp-period')?.value || ''
        }));

        // Collect Education DOM Inputs
        const eduCards = document.querySelectorAll('#adminEducationList .dynamic-card');
        data.education = Array.from(eduCards).map(card => ({
            degree: card.querySelector('.edu-degree')?.value || '',
            institution: card.querySelector('.edu-school')?.value || '',
            year: card.querySelector('.edu-year')?.value || ''
        }));

        // Collect Certs DOM Inputs
        const certCards = document.querySelectorAll('#adminCertsList .dynamic-card');
        data.certifications = Array.from(certCards).map(card => ({
            title: card.querySelector('.cert-title')?.value || '',
            issuer: card.querySelector('.cert-issuer')?.value || ''
        }));

        return data;
    }

    function setupGlobalSaveHandler() {
        const saveBtn = document.getElementById('globalSaveBtn');
        if (!saveBtn) return;

        saveBtn.addEventListener('click', async () => {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Saving Changes...';

            const updatedProfile = collectFormData();
            
            // Save to database engine (LocalStorage Instant + Background Firebase Sync)
            const result = await db.saveUser(currentUserKey, updatedProfile);

            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Dashboard Changes';

            if (result.success) {
                markSaved();
                currentUserData = updatedProfile;
            } else {
                alert('Notice: Changes saved locally. Firebase sync queued.');
                markSaved();
            }
        });
    }

    function markUnsaved() {
        const dot = document.getElementById('saveStatusDot');
        const text = document.getElementById('saveStatusText');
        if (dot) dot.className = 'status-dot unsaved';
        if (text) text.textContent = 'Unsaved changes pending...';
    }

    function markSaved() {
        const dot = document.getElementById('saveStatusDot');
        const text = document.getElementById('saveStatusText');
        if (dot) dot.className = 'status-dot';
        if (text) text.textContent = 'All changes synchronized';
    }

    // --------------------------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------------------------
    function bindVal(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function setInputValue(id, val) {
        const input = document.getElementById(id);
        if (input && val !== undefined && val !== null) {
            input.value = val;
        }
    }

    function getInputValue(id) {
        const input = document.getElementById(id);
        return input ? input.value : '';
    }

    function bindClick(id, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }

})();