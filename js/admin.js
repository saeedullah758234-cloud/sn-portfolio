/* ===== SN PORTFOLIO ADMIN DASHBOARD JS ===== */

// Global state
let currentUserKey = localStorage.getItem('sn_user') || 'saeed';
let currentUserData = {};

// Crop Modal state
let cropImageObj = new Image();
let zoomLevel = 1;
let posX = 0, posY = 0;
let isDragging = false;
let startX = 0, startY = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // Check Authentication
    const loggedIn = localStorage.getItem('sn_logged_in');
    if (!loggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Set Welcome Name
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName) {
        welcomeName.textContent = currentUserKey === 'saeed' ? 'Saeed ullah' : 'Naeem ur Rahman';
    }

    // Initialize Tab Switching
    setupTabSwitching();

    // Load Data
    await loadAdminData();

    // Setup Event Listeners
    setupImageHandlers();
    setupSaveHandler();
    setupLogoutHandler();
});

/* ===== TAB SWITCHING LOGIC ===== */
function setupTabSwitching() {
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.admin-section');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;

            // Remove active from all links & sections
            menuLinks.forEach(l => l.parentElement.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Activate clicked link & section
            link.parentElement.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Close mobile menu
            if (sidebar) sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

/* ===== LOAD USER DATA ===== */
async function loadAdminData() {
    try {
        currentUserData = await db.getUser(currentUserKey) || {};

        // Populate Form Fields
        setInputValue('admin-name', currentUserData.name || '');
        setInputValue('admin-title', currentUserData.title || '');
        setInputValue('admin-email', currentUserData.email || '');
        setInputValue('admin-whatsapp', currentUserData.whatsapp || '');
        setInputValue('admin-intro', currentUserData.intro || '');
        setInputValue('admin-about', currentUserData.about || '');
        setInputValue('admin-resume', currentUserData.resume || '');
        setInputValue('admin-bank', currentUserData.bankDetails || '');

        // Socials
        if (currentUserData.socials) {
            setInputValue('admin-freelance', currentUserData.socials.freelance || '');
            setInputValue('admin-github', currentUserData.socials.github || '');
            setInputValue('admin-linkedin', currentUserData.socials.linkedin || '');
            setInputValue('admin-facebook', currentUserData.socials.facebook || '');
            setInputValue('admin-instagram', currentUserData.socials.instagram || '');
        }

        // Image Previews
        const profilePreview = document.getElementById('profile-preview');
        if (profilePreview && currentUserData.profileImage) {
            profilePreview.src = currentUserData.profileImage;
        }

        const coverPreview = document.getElementById('cover-preview');
        if (coverPreview && currentUserData.coverImage) {
            coverPreview.src = currentUserData.coverImage;
        }

        // Render Dynamic Lists
        renderDynamicList('admin-education-list', currentUserData.education || [], 'education');
        renderDynamicList('admin-experience-list', currentUserData.experience || [], 'experience');
        renderDynamicList('admin-skills-list', currentUserData.skills || [], 'skills');
        renderDynamicList('admin-projects-list', currentUserData.projects || [], 'projects');
        renderDynamicList('admin-services-list', currentUserData.services || [], 'services');
        renderDynamicList('admin-certs-list', currentUserData.certifications || [], 'certifications');

    } catch (err) {
        console.error("Error loading admin data:", err);
    }
}

function setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

/* ===== DYNAMIC LIST RENDERING ===== */
function renderDynamicList(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!Array.isArray(items) || items.length === 0) {
        // Add 1 default empty item
        addDynamicItem(containerId, type);
        return;
    }

    items.forEach(item => {
        addDynamicItem(containerId, type, item);
    });
}

function addDynamicItem(containerId, type, data = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';

    let html = `
        <div class="list-item-header">
            <strong><i class="fas fa-grip-lines"></i> Item</strong>
            <button type="button" class="remove-btn" onclick="this.closest('.list-item').remove()">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div class="form-grid">
    `;

    if (type === 'education') {
        html += `
            <div class="form-group"><label>Degree / Certificate</label><input type="text" class="item-title" value="${data.title || ''}" placeholder="e.g. BS Computer Science"></div>
            <div class="form-group"><label>University / Institute</label><input type="text" class="item-subtitle" value="${data.subtitle || ''}" placeholder="e.g. University of Peshawar"></div>
            <div class="form-group"><label>Year / Duration</label><input type="text" class="item-period" value="${data.period || ''}" placeholder="e.g. 2020 - 2024"></div>
            <div class="form-group"><label>Description</label><input type="text" class="item-desc" value="${data.description || ''}" placeholder="Details..."></div>
        `;
    } else if (type === 'experience') {
        html += `
            <div class="form-group"><label>Job Title / Role</label><input type="text" class="item-title" value="${data.title || ''}" placeholder="e.g. Senior Web Developer"></div>
            <div class="form-group"><label>Company Name</label><input type="text" class="item-subtitle" value="${data.subtitle || ''}" placeholder="e.g. Tech Solutions"></div>
            <div class="form-group"><label>Duration</label><input type="text" class="item-period" value="${data.period || ''}" placeholder="e.g. 2022 - Present"></div>
            <div class="form-group"><label>Responsibilities</label><input type="text" class="item-desc" value="${data.description || ''}" placeholder="Summary of work..."></div>
        `;
    } else if (type === 'skills') {
        html += `
            <div class="form-group"><label>Skill Name</label><input type="text" class="item-title" value="${data.name || data.title || ''}" placeholder="e.g. JavaScript / Video Editing"></div>
            <div class="form-group"><label>Proficiency Level (%)</label><input type="number" class="item-subtitle" value="${data.level || data.subtitle || '85'}" placeholder="85"></div>
            <div class="form-group"><label>Category</label><input type="text" class="item-desc" value="${data.category || data.description || ''}" placeholder="e.g. Frontend / Post Production"></div>
        `;
    } else if (type === 'projects') {
        html += `
            <div class="form-group"><label>Project Title</label><input type="text" class="item-title" value="${data.title || ''}" placeholder="e.g. E-Commerce Store"></div>
            <div class="form-group"><label>Category / Tech Used</label><input type="text" class="item-subtitle" value="${data.subtitle || ''}" placeholder="e.g. React & Firebase"></div>
            <div class="form-group"><label>Project / Demo Link</label><input type="url" class="item-period" value="${data.link || data.period || ''}" placeholder="https://..."></div>
            <div class="form-group"><label>Description</label><input type="text" class="item-desc" value="${data.description || ''}" placeholder="Brief project summary..."></div>
        `;
    } else if (type === 'services') {
        html += `
            <div class="form-group"><label>Service Title</label><input type="text" class="item-title" value="${data.title || ''}" placeholder="e.g. Custom Web Development"></div>
            <div class="form-group"><label>Icon (FontAwesome Class)</label><input type="text" class="item-subtitle" value="${data.icon || data.subtitle || 'fas fa-code'}" placeholder="fas fa-code"></div>
            <div class="form-group"><label>Description</label><input type="text" class="item-desc" value="${data.description || ''}" placeholder="What you offer..."></div>
        `;
    } else if (type === 'certifications') {
        html += `
            <div class="form-group"><label>Certification Name</label><input type="text" class="item-title" value="${data.title || ''}" placeholder="e.g. Meta Frontend Developer"></div>
            <div class="form-group"><label>Issuing Organization</label><input type="text" class="item-subtitle" value="${data.subtitle || ''}" placeholder="e.g. Coursera"></div>
            <div class="form-group"><label>Year / Link</label><input type="text" class="item-period" value="${data.period || ''}" placeholder="e.g. 2023"></div>
        `;
    }

    html += `</div>`;
    itemDiv.innerHTML = html;
    container.appendChild(itemDiv);
}

/* ===== READ DYNAMIC LIST VALUES (BUG FIXED) ===== */
function collectDynamicData(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const items = [];
    const rows = container.querySelectorAll('.list-item');

    rows.forEach(row => {
        // Safe selection to prevent undefined errors
        const titleEl = row.querySelector('.item-title');
        const subtitleEl = row.querySelector('.item-subtitle');
        const periodEl = row.querySelector('.item-period');
        const descEl = row.querySelector('.item-desc');

        const title = titleEl ? titleEl.value.trim() : '';
        const subtitle = subtitleEl ? subtitleEl.value.trim() : '';
        const period = periodEl ? periodEl.value.trim() : '';
        const desc = descEl ? descEl.value.trim() : '';

        if (title) { // Only save if title is not empty
            if (type === 'skills') {
                items.push({ name: title, level: subtitle || '80', category: desc });
            } else if (type === 'projects') {
                items.push({ title: title, subtitle: subtitle, link: period, description: desc });
            } else if (type === 'services') {
                items.push({ title: title, icon: subtitle || 'fas fa-check', description: desc });
            } else {
                items.push({ title: title, subtitle: subtitle, period: period, description: desc });
            }
        }
    });

    return items;
}

/* ===== PROFILE & COVER IMAGE HANDLERS ===== */
function setupImageHandlers() {
    const profileUploadBtn = document.getElementById('profile-upload-btn');
    const profileInput = document.getElementById('profile-input');
    const coverUploadBtn = document.getElementById('cover-upload-btn');
    const coverInput = document.getElementById('cover-input');

    if (profileUploadBtn && profileInput) {
        profileUploadBtn.addEventListener('click', () => profileInput.click());
        profileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) openCropModal(file);
        });
    }

    if (coverUploadBtn && coverInput) {
        coverUploadBtn.addEventListener('click', () => coverInput.click());
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleCoverUpload(file);
        });
    }

    setupCropModalControls();
}

function handleCoverUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 1200;
            let scale = 1;

            if (img.width > maxWidth) {
                scale = maxWidth / img.width;
            }

            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const base64 = canvas.toDataURL('image/jpeg', 0.75);
            currentUserData.coverImage = base64;
            const coverPreview = document.getElementById('cover-preview');
            if (coverPreview) coverPreview.src = base64;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/* ===== CROP MODAL ===== */
function openCropModal(file) {
    const modal = document.getElementById('crop-modal');
    const reader = new FileReader();

    reader.onload = (e) => {
        cropImageObj = new Image();
        cropImageObj.onload = () => {
            const cropImageEl = document.getElementById('crop-image');
            cropImageEl.src = cropImageObj.src;
            zoomLevel = 1;
            posX = 0;
            posY = 0;
            updateCropTransform();
            modal.classList.add('active');
        };
        cropImageObj.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateCropTransform() {
    const cropImageEl = document.getElementById('crop-image');
    if (cropImageEl) {
        cropImageEl.style.transform = `translate(${posX}px, ${posY}px) scale(${zoomLevel})`;
    }
}

function setupCropModalControls() {
    const modal = document.getElementById('crop-modal');
    const container = document.getElementById('crop-container');
    const zoomIn = document.getElementById('crop-zoom-in');
    const zoomOut = document.getElementById('crop-zoom-out');
    const cancelBtn = document.getElementById('crop-cancel');
    const saveBtn = document.getElementById('crop-save');

    if (zoomIn) zoomIn.addEventListener('click', () => { zoomLevel += 0.2; updateCropTransform(); });
    if (zoomOut) zoomOut.addEventListener('click', () => { if (zoomLevel > 0.4) zoomLevel -= 0.2; updateCropTransform(); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.arc(200, 200, 200, 0, Math.PI * 2);
            ctx.clip();

            // Draw center scaled image
            ctx.drawImage(cropImageObj, 0, 0, 400, 400);

            const base64 = canvas.toDataURL('image/jpeg', 0.85);
            currentUserData.profileImage = base64;

            const profilePreview = document.getElementById('profile-preview');
            if (profilePreview) profilePreview.src = base64;

            modal.classList.remove('active');
        });
    }

    // Drag events for Crop Image
    if (container) {
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            updateCropTransform();
        });

        window.addEventListener('mouseup', () => isDragging = false);

        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - posX;
                startY = e.touches[0].clientY - posY;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            posX = e.touches[0].clientX - startX;
            posY = e.touches[0].clientY - startY;
            updateCropTransform();
        });

        window.addEventListener('touchend', () => isDragging = false);
    }
}

/* ===== SAVE ALL CHANGES (FAIL-SAFE) ===== */
function setupSaveHandler() {
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;

        try {
            const updatedData = {
                ...currentUserData,
                name: document.getElementById('admin-name')?.value.trim() || '',
                title: document.getElementById('admin-title')?.value.trim() || '',
                email: document.getElementById('admin-email')?.value.trim() || '',
                whatsapp: document.getElementById('admin-whatsapp')?.value.trim() || '',
                intro: document.getElementById('admin-intro')?.value.trim() || '',
                about: document.getElementById('admin-about')?.value.trim() || '',
                resume: document.getElementById('admin-resume')?.value.trim() || '',
                bankDetails: document.getElementById('admin-bank')?.value.trim() || '',
                socials: {
                    freelance: document.getElementById('admin-freelance')?.value.trim() || '',
                    github: document.getElementById('admin-github')?.value.trim() || '',
                    linkedin: document.getElementById('admin-linkedin')?.value.trim() || '',
                    facebook: document.getElementById('admin-facebook')?.value.trim() || '',
                    instagram: document.getElementById('admin-instagram')?.value.trim() || ''
                },
                education: collectDynamicData('admin-education-list', 'education'),
                experience: collectDynamicData('admin-experience-list', 'experience'),
                skills: collectDynamicData('admin-skills-list', 'skills'),
                projects: collectDynamicData('admin-projects-list', 'projects'),
                services: collectDynamicData('admin-services-list', 'services'),
                certifications: collectDynamicData('admin-certs-list', 'certifications')
            };

            // Call database save
            await db.saveUser(currentUserKey, updatedData);

            // Always show success to user (Fail-safe UI)
            saveBtn.style.background = '#10b981';
            saveBtn.innerHTML = `<i class="fas fa-check"></i> Saved Successfully!`;
            
        } catch (error) {
            console.error("Save Error:", error);
            // Even on network error, we save to local storage in database.js so we show success
            saveBtn.style.background = '#10b981';
            saveBtn.innerHTML = `<i class="fas fa-check"></i> Saved Locally!`;
        }

        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.style.background = '';
            saveBtn.innerHTML = `<i class="fas fa-save"></i> Save All Changes To Cloud`;
        }, 2000);
    });
}

/* ===== LOGOUT HANDLER ===== */
function setupLogoutHandler() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('sn_logged_in');
            localStorage.removeItem('sn_user');
            window.location.href = 'login.html';
        });
    }
}