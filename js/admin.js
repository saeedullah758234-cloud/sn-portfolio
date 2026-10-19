// ============================================
// S&N PORTFOLIO - ADMIN DASHBOARD + IMAGE CROP
// ============================================

let currentUser = null;
let currentData = {};
let cropState = {
    image: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    dragging: false,
    targetKey: null,
    previewId: null
};

function safeAddListener(id, event, callback) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
}

function val(id, value) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (value !== undefined) el.value = value;
    return el.value || '';
}

function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 400);
    }
}
setTimeout(hidePreloader, 800);
window.addEventListener('load', hidePreloader);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (typeof db === 'undefined' || !db.checkAuth()) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = db.getCurrentUser();
        if (!currentUser) { db.logout(); return; }

        const nameEl = document.getElementById('admin-display-name');
        if (nameEl) nameEl.textContent = currentUser === 'saeed' ? 'Saeed ullah' : 'Naeem ur Rahman';

        // Theme
        const themeBtn = document.getElementById('theme-btn');
        const htmlEl = document.documentElement;
        if (db.getTheme) {
            const t = db.getTheme();
            htmlEl.setAttribute('data-theme', t);
            if (themeBtn) themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const newT = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                htmlEl.setAttribute('data-theme', newT);
                if (db.setTheme) db.setTheme(newT);
                themeBtn.innerHTML = newT === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            });
        }

        setupNavigation();
        safeAddListener('logout-btn', 'click', () => db.logout());

        currentData = await db.getUser(currentUser) || {};
        populateForms();

        // Image uploads with Crop Editor
        bindImageUpload('input-profile-img', 'preview-profile', 'profileImage', true);
        bindImageUpload('input-cover-img', 'preview-cover', 'coverImage', false);

        safeAddListener('add-education-btn', 'click', addEducation);
        safeAddListener('add-experience-btn', 'click', addExperience);
        safeAddListener('add-skill-btn', 'click', addSkill);
        safeAddListener('add-project-btn', 'click', addProject);
        safeAddListener('add-service-btn', 'click', addService);
        safeAddListener('save-all-btn', 'click', saveAllData);

        // Crop Modal Buttons
        safeAddListener('crop-zoom-in', 'click', () => { cropState.scale = Math.min(3, cropState.scale + 0.1); drawCrop(); });
        safeAddListener('crop-zoom-out', 'click', () => { cropState.scale = Math.max(0.5, cropState.scale - 0.1); drawCrop(); });
        safeAddListener('crop-apply-btn', 'click', applyCrop);
        safeAddListener('crop-cancel-btn', 'click', closeCropModal);

    } catch (err) {
        console.error("Dashboard error:", err);
    } finally {
        hidePreloader();
    }
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const sidebar = document.getElementById('admin-sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const target = document.getElementById(item.dataset.target);
            if (target) target.classList.add('active');
            if (sidebar && window.innerWidth <= 992) sidebar.classList.remove('show');
        });
    });
    safeAddListener('sidebar-toggle', 'click', () => {
        if (sidebar) sidebar.classList.toggle('show');
    });
}

function populateForms() {
    const d = currentData || {};
    const pPrev = document.getElementById('preview-profile');
    if (pPrev && d.profileImage) pPrev.src = d.profileImage;
    const cPrev = document.getElementById('preview-cover');
    if (cPrev && d.coverImage) cPrev.src = d.coverImage;

    val('input-name', d.name || '');
    val('input-title', d.title || '');
    val('input-email', d.email || '');
    val('input-phone', d.phone || '');
    val('input-location', d.location || '');
    val('input-whatsapp', d.whatsapp || '');
    val('input-bank', d.bank || '');
    val('input-intro', d.intro || '');
    val('input-about', d.about || '');

    if (d.social) {
        val('input-linkedin', d.social.linkedin || '');
        val('input-github', d.social.github || '');
        val('input-youtube', d.social.youtube || '');
        val('input-facebook', d.social.facebook || '');
        val('input-instagram', d.social.instagram || '');
    }
    val('input-website', d.website || '');
    val('input-languages', d.languages || '');
    val('input-interests', d.interests || '');
    val('input-goals', d.goals || '');
    val('input-resume', d.resume || '');

    renderList('education-list', d.education || [], renderEducationHTML);
    renderList('experience-list', d.experience || [], renderExperienceHTML);
    renderList('skills-list', d.skills || [], renderSkillHTML);
    renderList('projects-list', d.projects || [], renderProjectHTML);
    renderList('services-list', d.services || [], renderServiceHTML);
}

function renderList(containerId, array, htmlFunc) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    array.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = htmlFunc(item);
        container.appendChild(div);
    });
}

function renderEducationHTML(item = {}) {
    return `<div class="list-item-header"><span class="list-item-title">Education</span>
        <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button></div>
        <div class="form-grid">
            <div class="form-group"><label>Degree</label><input type="text" class="form-control edu-degree" value="${item.degree||''}"></div>
            <div class="form-group"><label>Institution</label><input type="text" class="form-control edu-inst" value="${item.institution||''}"></div>
            <div class="form-group"><label>Field</label><input type="text" class="form-control edu-field" value="${item.field||''}"></div>
            <div class="form-group"><label>Years</label><div style="display:flex;gap:10px;">
                <input type="text" class="form-control edu-start" placeholder="Start" value="${item.startYear||''}">
                <input type="text" class="form-control edu-end" placeholder="End" value="${item.endYear||''}"></div></div>
            <div class="form-group" style="grid-column:1/-1;"><label>Description</label><input type="text" class="form-control edu-desc" value="${item.description||''}"></div>
        </div>`;
}
function addEducation() {
    const list = document.getElementById('education-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderEducationHTML({});
    list.appendChild(div);
}

function renderExperienceHTML(item = {}) {
    return `<div class="list-item-header"><span class="list-item-title">Experience</span>
        <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button></div>
        <div class="form-grid">
            <div class="form-group"><label>Job Title</label><input type="text" class="form-control exp-title" value="${item.jobTitle||''}"></div>
            <div class="form-group"><label>Company</label><input type="text" class="form-control exp-comp" value="${item.company||''}"></div>
            <div class="form-group"><label>Type</label><input type="text" class="form-control exp-type" value="${item.employmentType||''}"></div>
            <div class="form-group"><label>Dates</label><div style="display:flex;gap:10px;">
                <input type="text" class="form-control exp-start" value="${item.startDate||''}">
                <input type="text" class="form-control exp-end" value="${item.endDate||''}"></div>
                <label style="margin-top:5px;font-size:12px;display:flex;align-items:center;gap:5px;">
                <input type="checkbox" class="exp-current" ${item.currentlyWorking?'checked':''}> Currently Working</label></div>
            <div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea class="form-control exp-desc" rows="2">${item.description||''}</textarea></div>
        </div>`;
}
function addExperience() {
    const list = document.getElementById('experience-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderExperienceHTML({});
    list.appendChild(div);
}

function renderSkillHTML(item = {}) {
    return `<div class="list-item-header"><span class="list-item-title">Skill</span>
        <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button></div>
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;">
            <div class="form-group"><label>Name</label><input type="text" class="form-control sk-name" value="${item.name||''}"></div>
            <div class="form-group"><label>Level</label><input type="text" class="form-control sk-lvl" value="${item.level||''}"></div>
            <div class="form-group"><label>Category</label><input type="text" class="form-control sk-cat" value="${item.category||''}"></div>
        </div>`;
}
function addSkill() {
    const list = document.getElementById('skills-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderSkillHTML({});
    list.appendChild(div);
}

function renderProjectHTML(item = {}) {
    return `<div class="list-item-header"><span class="list-item-title">Project</span>
        <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button></div>
        <div class="form-grid">
            <div class="form-group"><label>Title</label><input type="text" class="form-control prj-title" value="${item.title||''}"></div>
            <div class="form-group"><label>Image URL / Base64</label><input type="text" class="form-control prj-img" value="${item.image||''}"></div>
            <div class="form-group"><label>Technologies</label><input type="text" class="form-control prj-tech" value="${item.technologies||''}"></div>
            <div class="form-group"><label>Links</label><div style="display:flex;gap:10px;">
                <input type="url" class="form-control prj-link" placeholder="Live URL" value="${item.link||''}">
                <input type="url" class="form-control prj-git" placeholder="GitHub" value="${item.github||''}"></div></div>
            <div class="form-group" style="grid-column:1/-1;"><label>Description</label><textarea class="form-control prj-desc" rows="2">${item.description||''}</textarea></div>
        </div>`;
}
function addProject() {
    const list = document.getElementById('projects-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderProjectHTML({});
    list.appendChild(div);
}

function renderServiceHTML(item = {}) {
    return `<div class="list-item-header"><span class="list-item-title">Service</span>
        <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button></div>
        <div class="form-grid">
            <div class="form-group"><label>Title</label><input type="text" class="form-control srv-title" value="${item.title||''}"></div>
            <div class="form-group"><label>Icon (fa-code / fa-video)</label><input type="text" class="form-control srv-icon" value="${item.icon||'fa-star'}"></div>
            <div class="form-group" style="grid-column:1/-1;"><label>Description</label><input type="text" class="form-control srv-desc" value="${item.description||''}"></div>
            <div class="form-group" style="grid-column:1/-1;"><label>Skills</label><input type="text" class="form-control srv-skills" value="${item.skills||''}"></div>
        </div>`;
}
function addService() {
    const list = document.getElementById('services-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderServiceHTML({});
    list.appendChild(div);
}

// ============================================
// IMAGE UPLOAD + CROP EDITOR
// ============================================
function bindImageUpload(inputId, previewId, dataKey, isProfile) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                if (isProfile) {
                    // Open Crop Modal for Profile
                    openCropModal(img, dataKey, previewId);
                } else {
                    // Cover - simple compress
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let w = img.width, h = img.height;
                    const MAX = 1200;
                    if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                    canvas.width = w; canvas.height = h;
                    ctx.drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    const prev = document.getElementById(previewId);
                    if (prev) prev.src = dataUrl;
                    currentData[dataKey] = dataUrl;
                    showToast("Cover image ready!", false);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        input.value = ''; // allow re-select same file
    });
}

function openCropModal(img, dataKey, previewId) {
    cropState.image = img;
    cropState.scale = 1;
    cropState.offsetX = 0;
    cropState.offsetY = 0;
    cropState.targetKey = dataKey;
    cropState.previewId = previewId;

    let modal = document.getElementById('crop-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'crop-modal';
        modal.innerHTML = `
            <div class="crop-overlay">
                <div class="crop-box">
                    <h3 style="margin-bottom:15px;color:var(--text-primary);">Edit Profile Photo</h3>
                    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:15px;">Drag to move • Use buttons to zoom</p>
                    <canvas id="crop-canvas" width="300" height="300" style="border-radius:50%;border:3px solid var(--accent-primary);background:#111;cursor:grab;touch-action:none;"></canvas>
                    <div style="display:flex;gap:10px;justify-content:center;margin:15px 0;">
                        <button type="button" id="crop-zoom-out" class="btn secondary-btn small-btn"><i class="fas fa-search-minus"></i></button>
                        <button type="button" id="crop-zoom-in" class="btn secondary-btn small-btn"><i class="fas fa-search-plus"></i></button>
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;">
                        <button type="button" id="crop-cancel-btn" class="btn secondary-btn small-btn">Cancel</button>
                        <button type="button" id="crop-apply-btn" class="btn primary-btn small-btn"><i class="fas fa-check"></i> Apply & Save</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Re-bind buttons after creating
        document.getElementById('crop-zoom-in').onclick = () => { cropState.scale = Math.min(3, cropState.scale + 0.15); drawCrop(); };
        document.getElementById('crop-zoom-out').onclick = () => { cropState.scale = Math.max(0.4, cropState.scale - 0.15); drawCrop(); };
        document.getElementById('crop-apply-btn').onclick = applyCrop;
        document.getElementById('crop-cancel-btn').onclick = closeCropModal;

        const canvas = document.getElementById('crop-canvas');
        canvas.addEventListener('mousedown', startDrag);
        canvas.addEventListener('touchstart', startDrag, {passive:false});
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('touchmove', onDrag, {passive:false});
        window.addEventListener('mouseup', endDrag);
        window.addEventListener('touchend', endDrag);
    }

    modal.style.display = 'flex';
    drawCrop();
}

function drawCrop() {
    const canvas = document.getElementById('crop-canvas');
    if (!canvas || !cropState.image) return;
    const ctx = canvas.getContext('2d');
    const size = 300;
    ctx.clearRect(0, 0, size, size);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const img = cropState.image;
    const scale = cropState.scale;
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (size - w) / 2 + cropState.offsetX;
    const y = (size - h) / 2 + cropState.offsetY;

    ctx.drawImage(img, x, y, w, h);
    ctx.restore();

    // Border ring
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#00f3ff';
    ctx.lineWidth = 4;
    ctx.stroke();
}

function startDrag(e) {
    e.preventDefault();
    cropState.dragging = true;
    const pt = e.touches ? e.touches[0] : e;
    cropState.startX = pt.clientX - cropState.offsetX;
    cropState.startY = pt.clientY - cropState.offsetY;
    const canvas = document.getElementById('crop-canvas');
    if (canvas) canvas.style.cursor = 'grabbing';
}

function onDrag(e) {
    if (!cropState.dragging) return;
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    cropState.offsetX = pt.clientX - cropState.startX;
    cropState.offsetY = pt.clientY - cropState.startY;
    drawCrop();
}

function endDrag() {
    cropState.dragging = false;
    const canvas = document.getElementById('crop-canvas');
    if (canvas) canvas.style.cursor = 'grab';
}

function applyCrop() {
    const canvas = document.getElementById('crop-canvas');
    if (!canvas) return;

    // Export high quality circular crop
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 400;
    exportCanvas.height = 400;
    const ctx = exportCanvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const img = cropState.image;
    const scale = cropState.scale * (400/300);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (400 - w) / 2 + cropState.offsetX * (400/300);
    const y = (400 - h) / 2 + cropState.offsetY * (400/300);
    ctx.drawImage(img, x, y, w, h);

    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.85);
    
    currentData[cropState.targetKey] = dataUrl;
    const prev = document.getElementById(cropState.previewId);
    if (prev) prev.src = dataUrl;

    closeCropModal();
    showToast("Profile photo updated! Click Save All Changes.", false);
}

function closeCropModal() {
    const modal = document.getElementById('crop-modal');
    if (modal) modal.style.display = 'none';
    cropState.image = null;
}

// ============================================
// SAVE ALL DATA
// ============================================
async function saveAllData() {
    const btn = document.getElementById('save-all-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;
    }

    try {
        const newData = { ...currentData };

        newData.name = val('input-name');
        newData.title = val('input-title');
        newData.email = val('input-email');
        newData.phone = val('input-phone');
        newData.location = val('input-location');
        newData.whatsapp = val('input-whatsapp');
        newData.bank = val('input-bank');
        newData.intro = val('input-intro');
        newData.about = val('input-about');

        newData.social = {
            linkedin: val('input-linkedin'),
            github: val('input-github'),
            youtube: val('input-youtube'),
            facebook: val('input-facebook'),
            instagram: val('input-instagram')
        };
        newData.website = val('input-website');
        newData.languages = val('input-languages');
        newData.interests = val('input-interests');
        newData.goals = val('input-goals');
        newData.resume = val('input-resume');

        const getListItems = (id, mapper) => {
            const c = document.getElementById(id);
            if (!c) return [];
            return Array.from(c.children).map(mapper);
        };

        newData.education = getListItems('education-list', el => ({
            degree: el.querySelector('.edu-degree')?.value || '',
            institution: el.querySelector('.edu-inst')?.value || '',
            field: el.querySelector('.edu-field')?.value || '',
            startYear: el.querySelector('.edu-start')?.value || '',
            endYear: el.querySelector('.edu-end')?.value || '',
            description: el.querySelector('.edu-desc')?.value || ''
        }));

        newData.experience = getListItems('experience-list', el => ({
            jobTitle: el.querySelector('.exp-title')?.value || '',
            company: el.querySelector('.exp-comp')?.value || '',
            employmentType: el.querySelector('.exp-type')?.value || '',
            startDate: el.querySelector('.exp-start')?.value || '',
            endDate: el.querySelector('.exp-end')?.value || '',
            currentlyWorking: el.querySelector('.exp-current')?.checked || false,
            description: el.querySelector('.exp-desc')?.value || ''
        }));

        newData.skills = getListItems('skills-list', el => ({
            name: el.querySelector('.sk-name')?.value || '',
            level: el.querySelector('.sk-lvl')?.value || '',
            category: el.querySelector('.sk-cat')?.value || ''
        }));

        newData.projects = getListItems('projects-list', el => ({
            title: el.querySelector('.prj-title')?.value || '',
            image: el.querySelector('.prj-img')?.value || '',
            technologies: el.querySelector('.prj-tech')?.value || '',
            link: el.querySelector('.prj-link')?.value || '',
            github: el.querySelector('.prj-git')?.value || '',
            description: el.querySelector('.prj-desc')?.value || ''
        }));

        newData.services = getListItems('services-list', el => ({
            title: el.querySelector('.srv-title')?.value || '',
            icon: el.querySelector('.srv-icon')?.value || '',
            description: el.querySelector('.srv-desc')?.value || '',
            skills: el.querySelector('.srv-skills')?.value || ''
        }));

        if (db && db.saveUser) {
            await db.saveUser(currentUser, newData);
            currentData = newData;
            showToast("Saved to Cloud! Worldwide live now.", false);
        }
    } catch (err) {
        console.error(err);
        showToast("Error saving!", true);
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-save"></i> Save All Changes';
            btn.disabled = false;
        }
    }
}

function showToast(message, isError) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.className = isError ? 'toast error show' : 'toast show';
    setTimeout(() => toast.classList.remove('show'), 3500);
}