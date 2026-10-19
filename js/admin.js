// ============================================
// S&N PORTFOLIO - ADMIN DASHBOARD LOGIC
// Handles tabs, data binding, dynamic forms, 
// image compression, and saving data.
// ============================================

let currentUser = null;
let currentData = {};

document.addEventListener('DOMContentLoaded', async () => {
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

    document.getElementById('admin-display-name').textContent = currentUser === 'saeed' ? 'Saeed ullah' : 'Naeem ur Rahman';

    // 2. Theme Handling
    const themeBtn = document.getElementById('theme-btn');
    const htmlEl = document.documentElement;
    if(db.getTheme) {
        const t = db.getTheme();
        htmlEl.setAttribute('data-theme', t);
        if(themeBtn) themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const newT = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newT);
            db.setTheme(newT);
            themeBtn.innerHTML = newT === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // 3. UI Navigation (Sidebar)
    setupNavigation();
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => db.logout());

    // 4. Load & Bind Data
    try {
        currentData = await db.getUser(currentUser);
        populateForms();
    } catch(e) {
        showToast("Error loading data!", true);
    }

    // 5. Image Compression & Preview Bindings
    bindImageUpload('input-profile-img', 'preview-profile', 'profileImage');
    bindImageUpload('input-cover-img', 'preview-cover', 'coverImage');

    // 6. Bind Add Buttons for Dynamic Lists
    document.getElementById('add-education-btn').addEventListener('click', () => addEducation());
    document.getElementById('add-experience-btn').addEventListener('click', () => addExperience());
    document.getElementById('add-skill-btn').addEventListener('click', () => addSkill());
    document.getElementById('add-project-btn').addEventListener('click', () => addProject());
    document.getElementById('add-service-btn').addEventListener('click', () => addService());

    // 7. Save All Button
    document.getElementById('save-all-btn').addEventListener('click', saveAllData);

    // Hide preloader
    const preloader = document.querySelector('.preloader');
    if(preloader) { preloader.style.opacity = '0'; setTimeout(()=>preloader.style.display='none', 500); }
});

// --- NAVIGATION ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const sidebar = document.getElementById('admin-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(item.dataset.target).classList.add('active');

            if(window.innerWidth <= 992) {
                sidebar.classList.remove('show');
            }
        });
    });

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
}

// --- POPULATE FORMS ---
function populateForms() {
    const d = currentData;
    
    // Images
    if(d.profileImage) document.getElementById('preview-profile').src = d.profileImage;
    if(d.coverImage) document.getElementById('preview-cover').src = d.coverImage;

    // Basic & Contact
    val('input-name', d.name);
    val('input-title', d.title);
    val('input-email', d.email);
    val('input-phone', d.phone);
    val('input-location', d.location);
    val('input-whatsapp', d.whatsapp);
    val('input-bank', d.bank);
    val('input-intro', d.intro);
    val('input-about', d.about);

    // Socials & Extras
    if(d.social) {
        val('input-linkedin', d.social.linkedin);
        val('input-github', d.social.github);
        val('input-youtube', d.social.youtube);
        val('input-facebook', d.social.facebook);
        val('input-instagram', d.social.instagram);
    }
    val('input-website', d.website);
    val('input-languages', d.languages);
    val('input-interests', d.interests);
    val('input-goals', d.goals);
    val('input-resume', d.resume);

    // Dynamic Lists
    renderList('education-list', d.education || [], renderEducationHTML);
    renderList('experience-list', d.experience || [], renderExperienceHTML);
    renderList('skills-list', d.skills || [], renderSkillHTML);
    renderList('projects-list', d.projects || [], renderProjectHTML);
    renderList('services-list', d.services || [], renderServiceHTML);
}

// Form Helper Functions
function val(id, value) {
    const el = document.getElementById(id);
    if(el && value !== undefined) el.value = value;
    return el ? el.value : '';
}

// --- DYNAMIC LIST RENDERERS ---
function renderList(containerId, array, htmlFunc) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    array.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = htmlFunc(item, index);
        container.appendChild(div);
    });
}

// Education HTML
function renderEducationHTML(item = {}, index) {
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
                    <input type="text" class="form-control edu-start" placeholder="Start (2018)" value="${item.startYear || ''}">
                    <input type="text" class="form-control edu-end" placeholder="End (2022)" value="${item.endYear || ''}">
                </div>
            </div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><input type="text" class="form-control edu-desc" value="${item.description || ''}"></div>
        </div>
    `;
}
function addEducation() {
    const div = document.createElement('div');
    div.className = 'list-item fade-in'; div.style.opacity = '1';
    div.innerHTML = renderEducationHTML({});
    document.getElementById('education-list').appendChild(div);
}

// Experience HTML
function renderExperienceHTML(item = {}, index) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Experience Entry</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i> Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Job Title</label><input type="text" class="form-control exp-title" value="${item.jobTitle || ''}"></div>
            <div class="form-group"><label>Company</label><input type="text" class="form-control exp-comp" value="${item.company || ''}"></div>
            <div class="form-group"><label>Type</label><input type="text" class="form-control exp-type" placeholder="Full-time, Part-time" value="${item.employmentType || ''}"></div>
            <div class="form-group">
                <label>Dates</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" class="form-control exp-start" placeholder="Start" value="${item.startDate || ''}">
                    <input type="text" class="form-control exp-end" placeholder="End" value="${item.endDate || ''}">
                </div>
                <label style="margin-top:5px; font-weight:normal; display:flex; align-items:center; gap:5px;"><input type="checkbox" class="exp-current" ${item.currentlyWorking ? 'checked' : ''}> Currently Working</label>
            </div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><textarea class="form-control exp-desc" rows="2">${item.description || ''}</textarea></div>
        </div>
    `;
}
function addExperience() {
    const div = document.createElement('div');
    div.className = 'list-item fade-in'; div.style.opacity = '1';
    div.innerHTML = renderExperienceHTML({});
    document.getElementById('experience-list').appendChild(div);
}

// Skills HTML
function renderSkillHTML(item = {}, index) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Skill</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button>
        </div>
        <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px;">
            <div class="form-group"><label>Skill Name</label><input type="text" class="form-control sk-name" value="${item.name || ''}"></div>
            <div class="form-group"><label>Level</label><input type="text" class="form-control sk-lvl" placeholder="Expert/Advanced" value="${item.level || ''}"></div>
            <div class="form-group"><label>Category</label><input type="text" class="form-control sk-cat" placeholder="Technical" value="${item.category || ''}"></div>
        </div>
    `;
}
function addSkill() {
    const div = document.createElement('div');
    div.className = 'list-item fade-in'; div.style.opacity = '1';
    div.innerHTML = renderSkillHTML({});
    document.getElementById('skills-list').appendChild(div);
}

// Projects HTML
function renderProjectHTML(item = {}, index) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Project</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i> Remove</button>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Title</label><input type="text" class="form-control prj-title" value="${item.title || ''}"></div>
            <div class="form-group"><label>Image URL / Base64</label><input type="text" class="form-control prj-img" value="${item.image || ''}"></div>
            <div class="form-group"><label>Technologies (Comma separated)</label><input type="text" class="form-control prj-tech" value="${item.technologies || ''}"></div>
            <div class="form-group">
                <label>Links</label>
                <div style="display:flex; gap:10px;">
                    <input type="url" class="form-control prj-link" placeholder="Live URL" value="${item.link || ''}">
                    <input type="url" class="form-control prj-git" placeholder="GitHub URL" value="${item.github || ''}">
                </div>
            </div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><textarea class="form-control prj-desc" rows="2">${item.description || ''}</textarea></div>
        </div>
    `;
}
function addProject() {
    const div = document.createElement('div');
    div.className = 'list-item fade-in'; div.style.opacity = '1';
    div.innerHTML = renderProjectHTML({});
    document.getElementById('projects-list').appendChild(div);
}

// Services HTML
function renderServiceHTML(item = {}, index) {
    return `
        <div class="list-item-header">
            <span class="list-item-title">Service</span>
            <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-trash"></i></button>
        </div>
        <div class="form-grid">
            <div class="form-group"><label>Title</label><input type="text" class="form-control srv-title" value="${item.title || ''}"></div>
            <div class="form-group"><label>Icon (FontAwesome class e.g. fa-code)</label><input type="text" class="form-control srv-icon" value="${item.icon || 'fa-star'}"></div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Description</label><input type="text" class="form-control srv-desc" value="${item.description || ''}"></div>
            <div class="form-group" style="grid-column: 1/-1;"><label>Relevant Skills (Comma separated)</label><input type="text" class="form-control srv-skills" value="${item.skills || ''}"></div>
        </div>
    `;
}
function addService() {
    const div = document.createElement('div');
    div.className = 'list-item fade-in'; div.style.opacity = '1';
    div.innerHTML = renderServiceHTML({});
    document.getElementById('services-list').appendChild(div);
}

// --- IMAGE COMPRESSION LOGIC ---
function bindImageUpload(inputId, previewId, dataKey) {
    document.getElementById(inputId).addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Max Width/Height
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                } else if (height > MAX_HEIGHT) {
                    width = Math.round((width * MAX_HEIGHT) / height);
                    height = MAX_HEIGHT;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to WebP (Quality 0.7)
                const dataUrl = canvas.toDataURL('image/webp', 0.7);
                
                // Show preview and save to state
                document.getElementById(previewId).src = dataUrl;
                currentData[dataKey] = dataUrl;
            }
        };
        reader.readAsDataURL(file);
    });
}

// --- SAVE ALL DATA LOGIC ---
async function saveAllData() {
    const btn = document.getElementById('save-all-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
        // Build Data Object
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

        // Socials & Extras
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

        // Extract Lists from DOM
        newData.education = Array.from(document.getElementById('education-list').children).map(el => ({
            degree: el.querySelector('.edu-degree').value,
            institution: el.querySelector('.edu-inst').value,
            field: el.querySelector('.edu-field').value,
            startYear: el.querySelector('.edu-start').value,
            endYear: el.querySelector('.edu-end').value,
            description: el.querySelector('.edu-desc').value
        }));

        newData.experience = Array.from(document.getElementById('experience-list').children).map(el => ({
            jobTitle: el.querySelector('.exp-title').value,
            company: el.querySelector('.exp-comp').value,
            employmentType: el.querySelector('.exp-type').value,
            startDate: el.querySelector('.exp-start').value,
            endDate: el.querySelector('.exp-end').value,
            currentlyWorking: el.querySelector('.exp-current').checked,
            description: el.querySelector('.exp-desc').value
        }));

        newData.skills = Array.from(document.getElementById('skills-list').children).map(el => ({
            name: el.querySelector('.sk-name').value,
            level: el.querySelector('.sk-lvl').value,
            category: el.querySelector('.sk-cat').value
        }));

        newData.projects = Array.from(document.getElementById('projects-list').children).map(el => ({
            title: el.querySelector('.prj-title').value,
            image: el.querySelector('.prj-img').value,
            technologies: el.querySelector('.prj-tech').value,
            link: el.querySelector('.prj-link').value,
            github: el.querySelector('.prj-git').value,
            description: el.querySelector('.prj-desc').value
        }));

        newData.services = Array.from(document.getElementById('services-list').children).map(el => ({
            title: el.querySelector('.srv-title').value,
            icon: el.querySelector('.srv-icon').value,
            description: el.querySelector('.srv-desc').value,
            skills: el.querySelector('.srv-skills').value
        }));

        // Save via DB
        await db.saveUser(currentUser, newData);
        currentData = newData; // Update state
        
        showToast("Data saved successfully!", false);

    } catch (err) {
        console.error(err);
        showToast("Error saving data!", true);
    } finally {
        btn.innerHTML = '<i class="fas fa-save"></i> Save All Changes';
        btn.disabled = false;
    }
}

// --- TOAST NOTIFICATION ---
function showToast(message, isError) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    
    msgEl.textContent = message;
    
    if (isError) {
        toast.classList.add('error');
        toast.querySelector('i').className = 'fas fa-exclamation-circle';
    } else {
        toast.classList.remove('error');
        toast.querySelector('i').className = 'fas fa-check-circle';
    }

    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}