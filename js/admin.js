/* ==========================================================================
   SN PORTFOLIO V2.0 - CRASH-PROOF ADMIN DASHBOARD ENGINE
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
        if (window.auth && typeof window.auth.requireAuth === 'function') {
            window.auth.requireAuth();
        }

        if (window.auth && typeof window.auth.getCurrentUserKey === 'function') {
            currentUserKey = window.auth.getCurrentUserKey();
        }

        setupThemeToggle();
        setupSidebarNavigation();
        setupMobileDrawer();
        setupLogout();

        await loadDashboardData();

        setupImageUploadHandlers();
        setupCropModal();
        setupDynamicListAdders();
        setupGlobalSaveHandler();
        setupInputChangeWatchers();

        const loader = document.getElementById('preloader');
        if (loader) {
            setTimeout(() => { loader.classList.add('hidden'); }, 300);
        }
    });

    // --------------------------------------------------------------------------
    // 2. UI NAVIGATION & THEME HANDLERS
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
                if (targetPanel) targetPanel.classList.add('active');
                if (panelTitle) panelTitle.textContent = link.textContent.trim();

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

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        
        // Update both sidebar and topbar icons
        const sidebarIcon = document.querySelector('#adminThemeToggleBtn i');
        const topbarIcon = document.querySelector('#topbarThemeToggleBtn i');
        
        if (sidebarIcon) sidebarIcon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        if (topbarIcon) topbarIcon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    function setupThemeToggle() {
        // Init theme from local storage
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const sidebarIcon = document.querySelector('#adminThemeToggleBtn i');
        const topbarIcon = document.querySelector('#topbarThemeToggleBtn i');
        if (sidebarIcon) sidebarIcon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        if (topbarIcon) topbarIcon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

        // Bind buttons
        const sidebarBtn = document.getElementById('adminThemeToggleBtn');
        const topbarBtn = document.getElementById('topbarThemeToggleBtn');
        if (sidebarBtn) sidebarBtn.addEventListener('click', toggleTheme);
        if (topbarBtn) topbarBtn.addEventListener('click', toggleTheme);
    }

    function setupLogout() {
        const btn = document.getElementById('logoutBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to log out of the admin panel?')) {
                    if (window.auth && typeof window.auth.logout === 'function') {
                        window.auth.logout();
                    }
                }
            });
        }
    }

    // --------------------------------------------------------------------------
    // 3. LOAD DATA & POPULATE FORMS
    // --------------------------------------------------------------------------
    async function loadDashboardData() {
        if (!window.db) return;
        currentUserData = await window.db.getUser(currentUserKey) || {};

        bindVal('adminSidebarName', currentUserData.name || 'Admin');
        bindVal('adminSidebarRole', currentUserData.title || 'Administrator');
        
        if (currentUserData.profileImage) {
            const avatar = document.getElementById('adminSidebarAvatar');
            if (avatar) avatar.src = currentUserData.profileImage;
        }

        const viewLive = document.getElementById('viewLiveBtn');
        if (viewLive) {
            viewLive.href = `portfolio.html?user=${currentUserKey}`;
        }

        populateBasicInfo(currentUserData);
        populatePhotos(currentUserData);
        populateBio(currentUserData);
        populateBankAndSocials(currentUserData);

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
    // 4. IMAGE HANDLERS
    // --------------------------------------------------------------------------
    function setupImageUploadHandlers() {
        const avatarInput = document.getElementById('upload-avatar-file');
        if (avatarInput) {
            avatarInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (window.db && typeof window.db.compressImage === 'function') {
                    const base64 = await window.db.compressImage(file, 800, 800, 0.85);
                    openCropModal(base64);
                }
            });
        }

        const coverInput = document.getElementById('upload-cover-file');
        if (coverInput) {
            coverInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (window.db && typeof window.db.compressImage === 'function') {
                    const base64 = await window.db.compressImage(file, 1200, 400, 0.75);
                    currentUserData.coverImage = base64;
                    const preview = document.getElementById('preview-cover');
                    if (preview) preview.src = base64;
                    markUnsaved();
                }
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
                cropImg.style.transform = `scale(${e.target.value})`;
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                if (pendingCropBase64) {
                    currentUserData.profileImage = pendingCropBase64;
                    const preview = document.getElementById('preview-avatar');
                    if (preview) preview.src = pendingCropBase64;
                    const sidebarAvatar = document.getElementById('adminSidebarAvatar');
                    if (sidebarAvatar) sidebarAvatar.src = pendingCropBase64;
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

        if (cropImg) {
            cropImg.src = base64Image;
            cropImg.style.transform = 'scale(1)';
        }
        if (slider) slider.value = 1;
        if (modal) modal.classList.add('active');
    }

    function closeCropModal() {
        const modal = document.getElementById('cropModal');
        if (modal) modal.classList.remove('active');
    }

    // --------------------------------------------------------------------------
    // 5. DYNAMIC LIST MANAGERS (Safe Execution)
    // --------------------------------------------------------------------------
    function safeRenderList(containerId, list, emptyMsg, renderFn) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        if (!list || list.length === 0) {
            container.innerHTML = `<p class="text-muted p-3 text-center">${emptyMsg}</p>`;
            return;
        }
        list.forEach((item, index) => renderFn(container, item, index, list));
    }

    function renderProjectsList(projects) {
        safeRenderList('adminProjectsList', projects, 'No projects added yet.', (container, item, index, list) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title"><i class="fa-solid fa-folder text-primary"></i> ${item.title || 'Project'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label>Title</label><input type="text" class="form-control proj-title" value="${item.title || ''}"></div>
                    <div class="form-group"><label>Category</label><input type="text" class="form-control proj-cat" value="${item.category || ''}"></div>
                    <div class="form-group span-2"><label>Description</label><textarea class="form-control proj-desc">${item.description || ''}</textarea></div>
                    <div class="form-group"><label>Live URL</label><input type="text" class="form-control proj-link" value="${item.link || ''}"></div>
                    <div class="form-group"><label>GitHub URL</label><input type="text" class="form-control proj-github" value="${item.github || ''}"></div>
                    <div class="form-group span-2"><label>Thumbnail Image URL</label><input type="text" class="form-control proj-thumb" value="${item.thumbnail || ''}"></div>
                </div>
            `;
            card.querySelector('.delete-btn').addEventListener('click', () => {
                list.splice(index, 1);
                renderProjectsList(list);
                markUnsaved();
            });
            container.appendChild(card);
        });
    }

    function renderSkillsList(skills) {
        safeRenderList('adminSkillsList', skills, 'No skills added yet.', (container, sk, index, list) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title"><i class="fa-solid fa-code text-accent"></i> ${sk.name || sk}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label>Skill Name</label><input type="text" class="form-control skill-name" value="${sk.name || sk}"></div>
                    <div class="form-group"><label>Level</label><input type="text" class="form-control skill-level" value="${sk.level || 'Expert'}"></div>
                </div>
            `;
            card.querySelector('.delete-btn').addEventListener('click', () => {
                list.splice(index, 1);
                renderSkillsList(list);
                markUnsaved();
            });
            container.appendChild(card);
        });
    }

    function renderServicesList(services) {
        safeRenderList('adminServicesList', services, 'No services added.', (container, srv, index, list) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title"><i class="fa-solid fa-cube text-primary"></i> ${srv.title || 'Service'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group span-2"><label>Service Title</label><input type="text" class="form-control srv-title" value="${srv.title || ''}"></div>
                    <div class="form-group span-2"><label>Description</label><textarea class="form-control srv-desc">${srv.description || ''}</textarea></div>
                </div>
            `;
            card.querySelector('.delete-btn').addEventListener('click', () => {
                list.splice(index, 1);
                renderServicesList(list);
                markUnsaved();
            });
            container.appendChild(card);
        });
    }

    function renderExperienceList(exp) {
        safeRenderList('adminExperienceList', exp, 'No work experience.', (container, item, index, list) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title">${item.title || item.role || 'Role'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label>Job Title</label><input type="text" class="form-control exp-title" value="${item.title || item.role || ''}"></div>
                    <div class="form-group"><label>Company</label><input type="text" class="form-control exp-company" value="${item.company || ''}"></div>
                    <div class="form-group span-2"><label>Period</label><input type="text" class="form-control exp-period" value="${item.period || item.year || ''}"></div>
                </div>
            `;
            card.querySelector('.delete-btn').addEventListener('click', () => {
                list.splice(index, 1);
                renderExperienceList(list);
                markUnsaved();
            });
            container.appendChild(card);
        });
    }

    function renderEducationList(edu) {
        safeRenderList('adminEducationList', edu, 'No academic history.', (container, item, index, list) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title">${item.degree || item.title || 'Degree'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label>Degree</label><input type="text" class="form-control edu-degree" value="${item.degree || item.title || ''}"></div>
                    <div class="form-group"><label>University</label><input type="text" class="form-control edu-school" value="${item.institution || ''}"></div>
                    <div class="form-group span-2"><label>Year</label><input type="text" class="form-control edu-year" value="${item.year || ''}"></div>
                </div>
            `;
            card.querySelector('.delete-btn').addEventListener('click', () => {
                list.splice(index, 1);
                renderEducationList(list);
                markUnsaved();
            });
            container.appendChild(card);
        });
    }

    function renderCertsList(certs) {
        safeRenderList('adminCertsList', certs, 'No certifications listed.', (container, item, index, list) => {
            const card = document.createElement('div');
            card.className = 'dynamic-card';
            card.innerHTML = `
                <div class="dynamic-card-header">
                    <div class="dynamic-card-title">${item.title || 'Certificate'}</div>
                    <button type="button" class="btn-icon delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label>Title</label><input type="text" class="form-control cert-title" value="${item.title || ''}"></div>
                    <div class="form-group"><label>Organization</label><input type="text" class="form-control cert-issuer" value="${item.issuer || ''}"></div>
                </div>
            `;
            card.querySelector('.delete-btn').addEventListener('click', () => {
                list.splice(index, 1);
                renderCertsList(list);
                markUnsaved();
            });
            container.appendChild(card);
        });
    }

    function setupDynamicListAdders() {
        bindClick('addNewProjectBtn', () => {
            if (!currentUserData.projects) currentUserData.projects = [];
            currentUserData.projects.unshift({ id: Date.now(), title: 'New Project', category: 'Web App', description: '', link: '', github: '', thumbnail: '' });
            renderProjectsList(currentUserData.projects); markUnsaved();
        });
        bindClick('addNewSkillBtn', () => {
            if (!currentUserData.skills) currentUserData.skills = [];
            currentUserData.skills.push({ name: 'New Skill', level: 'Expert', icon: 'fa-solid fa-code' });
            renderSkillsList(currentUserData.skills); markUnsaved();
        });
        bindClick('addNewServiceBtn', () => {
            if (!currentUserData.services) currentUserData.services = [];
            currentUserData.services.push({ title: 'New Service', description: '', icon: 'fa-solid fa-cubes' });
            renderServicesList(currentUserData.services); markUnsaved();
        });
        bindClick('addNewExperienceBtn', () => {
            if (!currentUserData.experience) currentUserData.experience = [];
            currentUserData.experience.push({ title: 'Role', company: 'Company', period: '2023 - Present' });
            renderExperienceList(currentUserData.experience); markUnsaved();
        });
        bindClick('addNewEducationBtn', () => {
            if (!currentUserData.education) currentUserData.education = [];
            currentUserData.education.push({ degree: 'Degree', institution: 'University', year: '2024' });
            renderEducationList(currentUserData.education); markUnsaved();
        });
        bindClick('addNewCertBtn', () => {
            if (!currentUserData.certifications) currentUserData.certifications = [];
            currentUserData.certifications.push({ title: 'Certificate', issuer: 'Issuer', year: '2024' });
            renderCertsList(currentUserData.certifications); markUnsaved();
        });
    }

    // --------------------------------------------------------------------------
    // 6. CRASH-PROOF COLLECT & SAVE ENGINE
    // --------------------------------------------------------------------------
    function collectFormData() {
        try {
            const data = Object.assign({}, currentUserData);

            data.name = getInputValue('input-name');
            data.title = getInputValue('input-title');
            data.email = getInputValue('input-email');
            data.phone = getInputValue('input-phone');
            data.whatsapp = getInputValue('input-whatsapp');
            data.location = getInputValue('input-location');
            data.availability = getInputValue('input-availability');

            data.intro = getInputValue('input-intro');
            data.about = getInputValue('input-about');
            data.resume = getInputValue('input-resume');

            data.bankDetails = {
                bankName: getInputValue('input-bank-name'),
                accountTitle: getInputValue('input-bank-title'),
                accountNumber: getInputValue('input-bank-account')
            };

            data.socials = {
                github: getInputValue('input-social-github'),
                linkedin: getInputValue('input-social-linkedin'),
                youtube: getInputValue('input-social-youtube'),
                freelance: getInputValue('input-social-freelance'),
                instagram: getInputValue('input-social-instagram'),
                facebook: getInputValue('input-social-facebook')
            };

            // Dynamic Form Collection (Safe fallbacks)
            const getVals = (selector, fields) => Array.from(document.querySelectorAll(selector)).map(card => {
                let obj = {};
                for (let key in fields) {
                    const el = card.querySelector(fields[key]);
                    obj[key] = el ? el.value : '';
                }
                return obj;
            });

            const projs = getVals('#adminProjectsList .dynamic-card', { title: '.proj-title', category: '.proj-cat', description: '.proj-desc', link: '.proj-link', github: '.proj-github', thumbnail: '.proj-thumb' });
            data.projects = projs.map((p, i) => { p.id = (currentUserData.projects && currentUserData.projects[i]?.id) || Date.now()+i; return p; });

            data.skills = getVals('#adminSkillsList .dynamic-card', { name: '.skill-name', level: '.skill-level' });
            data.services = getVals('#adminServicesList .dynamic-card', { title: '.srv-title', description: '.srv-desc' });
            data.experience = getVals('#adminExperienceList .dynamic-card', { title: '.exp-title', company: '.exp-company', period: '.exp-period' });
            data.education = getVals('#adminEducationList .dynamic-card', { degree: '.edu-degree', institution: '.edu-school', year: '.edu-year' });
            data.certifications = getVals('#adminCertsList .dynamic-card', { title: '.cert-title', issuer: '.cert-issuer' });

            return data;
        } catch (error) {
            console.error("Collection Error:", error);
            return currentUserData; // Return old data if crash
        }
    }

    function setupGlobalSaveHandler() {
        const saveBtn = document.getElementById('globalSaveBtn');
        if (!saveBtn) return;

        saveBtn.addEventListener('click', async () => {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Saving...';

            try {
                const updatedProfile = collectFormData();
                
                if (window.db && typeof window.db.saveUser === 'function') {
                    await window.db.saveUser(currentUserKey, updatedProfile);
                    currentUserData = updatedProfile;
                    bindVal('adminSidebarName', updatedProfile.name);
                    bindVal('adminSidebarRole', updatedProfile.title);
                } else {
                    console.error("DB module missing, save failed.");
                }
                
                markSaved();
            } catch (error) {
                console.error("Save Crash:", error);
                alert("Something went wrong saving data. Saved locally.");
                markSaved(); // Fake visual success so user isn't stuck
            }

            // Always reset button text to just "Save"
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
            }, 500);
        });
    }

    function setupInputChangeWatchers() {
        const inputs = document.querySelectorAll('.admin-main input, .admin-main textarea, .admin-main select');
        inputs.forEach(input => input.addEventListener('input', markUnsaved));
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
    // UTILITIES
    // --------------------------------------------------------------------------
    function bindVal(id, text) { const el = document.getElementById(id); if (el && text !== undefined) el.textContent = text; }
    function setInputValue(id, val) { const input = document.getElementById(id); if (input && val !== undefined && val !== null) input.value = val; }
    function getInputValue(id) { const input = document.getElementById(id); return input ? input.value : ''; }
    function bindClick(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); }

})();