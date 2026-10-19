// ============================================
// S&N PORTFOLIO - CRASH-PROOF ADMIN DASHBOARD
// ============================================

let currentUser = null;
let currentData = {};

// Helper: Safely add event listeners without crashing
function safeAddListener(id, event, callback) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(event, callback);
    }
}

// Helper: Safely get input value
function val(id, value) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (value !== undefined) el.value = value;
    return el.value || '';
}

// Fail-Safe Preloader Removal (Guarantees Page Shows Up on Mobile)
function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 400);
    }
}

// Always force hide preloader after 800ms
setTimeout(hidePreloader, 800);
window.addEventListener('load', hidePreloader);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Auth Check
        if (typeof db === 'undefined' || !db.checkAuth()) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = db.getCurrentUser();
        if (!currentUser) {
            db.logout();
            return;
        }

        const nameEl = document.getElementById('admin-display-name');
        if (nameEl) {
            nameEl.textContent = currentUser === 'saeed' ? 'Saeed ullah' : 'Naeem ur Rahman';
        }

        // 2. Theme Handling
        const themeBtn = document.getElementById('theme-btn');
        const htmlEl = document.documentElement;
        if (db && db.getTheme) {
            const t = db.getTheme();
            htmlEl.setAttribute('data-theme', t);
            if (themeBtn) themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const newT = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                htmlEl.setAttribute('data-theme', newT);
                if (db && db.setTheme) db.setTheme(newT);
                themeBtn.innerHTML = newT === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            });
        }

        // 3. Navigation setup
        setupNavigation();

        // 4. Logout setup
        safeAddListener('logout-btn', 'click', () => db.logout());

        // 5. Load User Data
        currentData = await db.getUser(currentUser) || {};
        populateForms();

        // 6. Mobile Friendly Image Compression Bindings
        bindImageUpload('input-profile-img', 'preview-profile', 'profileImage');
        bindImageUpload('input-cover-img', 'preview-cover', 'coverImage');

        // 7. Dynamic List Add Buttons
        safeAddListener('add-education-btn', 'click', addEducation);
        safeAddListener('add-experience-btn', 'click', addExperience);
        safeAddListener('add-skill-btn', 'click', addSkill);
        safeAddListener('add-project-btn', 'click', addProject);
        safeAddListener('add-service-btn', 'click', addService);

        // 8. Save Button
        safeAddListener('save-all-btn', 'click', saveAllData);

    } catch (err) {
        console.error("Dashboard init error:", err);
    } finally {
        hidePreloader();
    }
});

// Navigation Handler
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

            if (sidebar && window.innerWidth <= 992) {
                sidebar.classList.remove('show');
            }
        });
    });

    safeAddListener('sidebar-toggle', 'click', () => {
        if (sidebar) sidebar.classList.toggle('show');
    });
}

// Populate Form Fields
function populateForms() {
    const d = currentData || {};
    
    // Images
    const pPrev = document.getElementById('preview-profile');
    if (pPrev && d.profileImage) pPrev.src = d.profileImage;

    const cPrev = document.getElementById('preview-cover');
    if (cPrev && d.coverImage) cPrev.src = d.coverImage;

    // Basic & Contact
    val('input-name', d.name || '');
    val('input-title', d.title || '');
    val('input-email', d.email || '');
    val('input-phone', d.phone || '');
    val('input-location', d.location || '');
    val('input-whatsapp', d.whatsapp || '');
    val('input-bank', d.bank || '');
    val('input-intro', d.intro || '');
    val('input-about', d.about || '');

    // Socials & Extras
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

    // Dynamic Lists
    renderList('education-list', d.education || [], renderEducationHTML);
    renderList('experience-list', d.experience || [], renderExperienceHTML);
    renderList('skills-list', d.skills || [], renderSkillHTML);
    renderList('projects-list', d.projects || [], renderProjectHTML);
    renderList('services-list', d.services || [], renderServiceHTML);
}

// Dynamic List Renderer
function renderList(containerId, array, htmlFunc) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    array.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = htmlFunc(item, index);
        container.appendChild(div);
    });
}

// Education Entry Template
function renderEducationHTML(item = {}) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Education Entry</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i> Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Degree</label><input type="text" class="form-control edu-degree" value="${item.degree || ''}"></div>
            <div class="form-group"><label>Institution</label><input type="text" class="form-control edu-inst" value="${item.institution || ''}"></div>
            <div class="form-group"><label>Field of Study</label><input type="text" class="form-control edu-field" value="${item.field || ''}"></div>
            <div class="form-group">
                <label>Years</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" class="form-control edu-start" placeholder="Start" value="${item.startYear || ''}">
                    <input type="text" class="form-control edu-end" placeholder="End" value="${item.endYear || ''}">
                </div>
            </div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><input type="text" class="form-control edu-desc" value="${item.description || ''}"></div>
        </div>
    `;
}
function addEducation() {
    const list = document.getElementById('education-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderEducationHTML({});
    list.appendChild(div);
}

// Experience Entry Template
function renderExperienceHTML(item = {}) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Experience Entry</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i> Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Job Title</label><input type="text" class="form-control exp-title" value="${item.jobTitle || ''}"></div>
            <div class="form-group"><label>Company</label><input type="text" class="form-control exp-comp" value="${item.company || ''}"></div>
            <div class="form-group"><label>Type</label><input type="text" class="form-control exp-type" placeholder="Full-time/Freelance" value="${item.employmentType || ''}"></div>
            <div class="form-group">
                <label>Dates</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" class="form-control exp-start" placeholder="Start" value="${item.startDate || ''}">
                    <input type="text" class="form-control exp-end" placeholder="End" value="${item.endDate || ''}">
                </div>
                <label style="margin-top:5px; font-size:12px; display:flex; align-items:center; gap:5px;"><input type="checkbox" class="exp-current" ${item.currentlyWorking ? 'checked' : ''}> Currently Working Here</label>
            </div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><textarea class="form-control exp-desc" rows="2">${item.description || ''}</textarea></div>
        </div>
    `;
}
function addExperience() {
    const list = document.getElementById('experience-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderExperienceHTML({});
    list.appendChild(div);
}

// Skills Entry Template
function renderSkillHTML(item = {}) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Skill</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button>
        </div>
        <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px;">
            <div class="form-group"><label>Skill Name</label><input type="text" class="form-control sk-name" value="${item.name || ''}"></div>
            <div class="form-group"><label>Level</label><input type="text" class="form-control sk-lvl" placeholder="Expert/Advanced" value="${item.level || ''}"></div>
            <div class="form-group"><label>Category</label><input type="text" class="form-control sk-cat" placeholder="Technical/Software" value="${item.category || ''}"></div>
        </div>
    `;
}
function addSkill() {
    const list = document.getElementById('skills-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderSkillHTML({});
    list.appendChild(div);
}

// Projects Entry Template
function renderProjectHTML(item = {}) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Project Entry</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i> Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Project Title</label><input type="text" class="form-control prj-title" value="${item.title || ''}"></div>
            <div class="form-group"><label>Image URL / Base64</label><input type="text" class="form-control prj-img" placeholder="Paste image link or upload photo" value="${item.image || ''}"></div>
            <div class="form-group"><label>Technologies / Tools</label><input type="text" class="form-control prj-tech" placeholder="e.g. Premiere Pro, HTML, CSS" value="${item.technologies || ''}"></div>
            <div class="form-group">
                <label>Project Links</label>
                <div style="display:flex; gap:10px;">
                    <input type="url" class="form-control prj-link" placeholder="Video / Website Link" value="${item.link || ''}">
                    <input type="url" class="form-control prj-git" placeholder="GitHub / Extra Link" value="${item.github || ''}">
                </div>
            </div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><textarea class="form-control prj-desc" rows="2">${item.description || ''}</textarea></div>
        </div>
    `;
}
function addProject() {
    const list = document.getElementById('projects-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderProjectHTML({});
    list.appendChild(div);
}

// Services Entry Template
function renderServiceHTML(item = {}) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Service</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Service Title</label><input type="text" class="form-control srv-title" value="${item.title || ''}"></div>
            <div class="form-group"><label>Icon Class (FontAwesome e.g. fa-video / fa-code)</label><input type="text" class="form-control srv-icon" value="${item.icon || 'fa-star'}"></div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><input type="text" class="form-control srv-desc" value="${item.description || ''}"></div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Relevant Skills</label><input type="text" class="form-control srv-skills" value="${item.skills || ''}"></div>
        </div>
    `;
}
function addService() {
    const list = document.getElementById('services-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = renderServiceHTML({});
    list.appendChild(div);
}

// Mobile Gallery Image Compression Engine
function bindImageUpload(inputId, previewId, dataKey) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        showToast("Processing image...", false);

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Compress width/height for fast loading on mobile
                const MAX_SIZE = 600;
                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX_SIZE) {
                    height = Math.round((height * MAX_SIZE) / width);
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width = Math.round((width * MAX_SIZE) / height);
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // JPEG Compression with 0.65 Quality (Super Small File Size)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
                
                const prev = document.getElementById(previewId);
                if (prev) prev.src = dataUrl;
                currentData[dataKey] = dataUrl;

                showToast("Image ready!", false);
            };
        };
        reader.readAsDataURL(file);
    });
}

// Save All Data safely
async function saveAllData() {
    const btn = document.getElementById('save-all-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        btn.disabled = true;
    }

    try {
        const newData = { ...currentData };

        // Basic Info
        newData.name = val('input-name');
        newData.title = val('input-title');
        newData.email = val('input-email');
        newData.phone = val('input-phone');
        newData.location = val('input-location');
        newData.whatsapp = val('input-whatsapp');
        newData.bank = val('input-bank');
        newData.intro = val('input-intro');
        newData.about = val('input-about');

        // Socials
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

        // Extract Lists safely from DOM
        const getListItems = (id, mapper) => {
            const container = document.getElementById(id);
            if (!container) return [];
            return Array.from(container.children).map(mapper);
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

        // Save via DB
        if (db && db.saveUser) {
            await db.saveUser(currentUser, newData);
            currentData = newData;
            showToast("Saved Successfully!", false);
        }

    } catch (err) {
        console.error("Save error:", err);
        showToast("Error saving data!", true);
    } finally {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-save"></i> Save All Changes';
            btn.disabled = false;
        }
    }
}

// Toast System
function showToast(message, isError) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!toast || !msgEl) return;
    
    msgEl.textContent = message;
    toast.className = isError ? 'toast error show' : 'toast show';

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}