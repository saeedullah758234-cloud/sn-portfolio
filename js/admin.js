/* ==========================================
   S&N PORTFOLIO - ADMIN DASHBOARD LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Instant Preloader Hide Failsafe
    const hidePreloader = () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hide');
            setTimeout(() => { preloader.style.display = 'none'; }, 300);
        }
    };
    setTimeout(hidePreloader, 350);

    // 2. Auth Protection
    if (typeof requireAuth === 'function') {
        requireAuth();
    }

    const currentUser = localStorage.getItem('sn_user') || 'saeed';
    let currentData = null;

    // Header Display Name
    const welcomeMsg = document.getElementById('welcome-message');
    if (welcomeMsg) {
        welcomeMsg.innerText = `Welcome, ${currentUser === 'saeed' ? 'Saeed ullah' : 'Naeem ur Rahman'}`;
    }

    // 3. Sidebar Navigation & Mobile Drawer
    const sidebar = document.getElementById('admin-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('href').substring(1);
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                targetSec.scrollIntoView({ behavior: 'smooth' });
            }
            if (window.innerWidth <= 991) {
                closeSidebar();
            }
        });
    });

    // 4. Theme & Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof logout === 'function') logout();
        });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // 5. Load Data
    if (typeof db !== 'undefined' && db.getUser) {
        db.getUser(currentUser, (data) => {
            hidePreloader();
            if (data) {
                currentData = data;
                populateForm(data);
            }
        });
    } else {
        hidePreloader();
    }

    function populateForm(data) {
        if (!data) return;
        ['name', 'title', 'role', 'email', 'phone', 'whatsapp', 'location', 'about', 'bio', 'resumeUrl', 'bankAccount', 'github', 'linkedin', 'facebook', 'instagram', 'twitter'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = data[id] || '';
        });

        const profPrev = document.getElementById('profile-img-preview');
        if (profPrev && data.profileImage) profPrev.src = data.profileImage;

        const covPrev = document.getElementById('cover-img-preview');
        if (covPrev && data.coverImage) covPrev.src = data.coverImage;

        renderList('education', data.education || []);
        renderList('experience', data.experience || []);
        renderList('skills', data.skills || []);
        renderList('projects', data.projects || []);
        renderList('services', data.services || []);
        renderList('certifications', data.certifications || []);
    }

    function renderList(type, items) {
        const container = document.getElementById(`${type}-list`);
        if (!container) return;
        container.innerHTML = '';

        items.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'dynamic-item-card';

            let fieldsHTML = '';
            if (type === 'projects') {
                fieldsHTML = `
                    <div class="grid-2">
                        <input type="text" class="form-control item-field" data-key="title" value="${item.title || ''}" placeholder="Project Title">
                        <input type="text" class="form-control item-field" data-key="category" value="${item.category || ''}" placeholder="Category">
                        <input type="text" class="form-control item-field" data-key="tech" value="${item.tech || ''}" placeholder="Technologies">
                        <input type="url" class="form-control item-field" data-key="link" value="${item.link || ''}" placeholder="Project Link">
                    </div>
                `;
            } else if (type === 'skills') {
                fieldsHTML = `
                    <div class="grid-2">
                        <input type="text" class="form-control item-field" data-key="name" value="${item.name || ''}" placeholder="Skill Name">
                        <input type="number" class="form-control item-field" data-key="level" value="${item.level || 85}" placeholder="Level %">
                    </div>
                `;
            } else {
                fieldsHTML = `
                    <div class="grid-2">
                        <input type="text" class="form-control item-field" data-key="title" value="${item.title || item.degree || ''}" placeholder="Title / Degree">
                        <input type="text" class="form-control item-field" data-key="institution" value="${item.institution || item.company || ''}" placeholder="Institution / Company">
                    </div>
                `;
            }

            card.innerHTML = `
                <button type="button" class="remove-btn" onclick="removeItem('${type}', ${idx})">&times;</button>
                ${fieldsHTML}
            `;
            container.appendChild(card);
        });
    }

    window.removeItem = (type, idx) => {
        if (!currentData || !currentData[type]) return;
        currentData[type].splice(idx, 1);
        renderList(type, currentData[type]);
    };

    ['education', 'experience', 'skills', 'projects', 'services', 'certifications'].forEach(type => {
        const btn = document.getElementById(`add-${type.slice(0, -1)}-btn`) || document.getElementById(`add-${type}-btn`);
        if (btn) {
            btn.addEventListener('click', () => {
                if (!currentData) currentData = {};
                if (!currentData[type]) currentData[type] = [];
                currentData[type].push({});
                renderList(type, currentData[type]);
            });
        }
    });

    // 6. Profile Crop
    const cropModal = document.getElementById('crop-modal');
    const cropCanvas = document.getElementById('crop-canvas');
    const cropZoom = document.getElementById('crop-zoom');
    const profileInput = document.getElementById('profile-photo-input');
    const cropConfirm = document.getElementById('crop-confirm-btn');
    const cropCancel = document.getElementById('crop-cancel-btn');
    const cropCancelX = document.getElementById('crop-cancel-x');

    let cropImg = new Image();
    let ctx = cropCanvas ? cropCanvas.getContext('2d') : null;
    let zoomVal = 1, offsetX = 0, offsetY = 0, isDragging = false, startX = 0, startY = 0;

    if (profileInput) {
        profileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                cropImg.onload = () => {
                    zoomVal = 1; offsetX = 0; offsetY = 0;
                    if (cropZoom) cropZoom.value = 1;
                    if (cropModal) cropModal.style.display = 'flex';
                    drawCrop();
                };
                cropImg.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function drawCrop() {
        if (!ctx || !cropImg.src) return;
        ctx.clearRect(0, 0, 300, 300);
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 145, 0, Math.PI * 2);
        ctx.clip();
        const w = cropImg.width * zoomVal;
        const h = cropImg.height * zoomVal;
        const x = 150 - w / 2 + offsetX;
        const y = 150 - h / 2 + offsetY;
        ctx.drawImage(cropImg, x, y, w, h);
        ctx.restore();
    }

    if (cropCanvas) {
        cropCanvas.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX - offsetX; startY = e.clientY - offsetY; });
        window.addEventListener('mousemove', (e) => { if (!isDragging) return; offsetX = e.clientX - startX; offsetY = e.clientY - startY; drawCrop(); });
        window.addEventListener('mouseup', () => { isDragging = false; });

        cropCanvas.addEventListener('touchstart', (e) => { isDragging = true; startX = e.touches[0].clientX - offsetX; startY = e.touches[0].clientY - offsetY; });
        window.addEventListener('touchmove', (e) => { if (!isDragging) return; offsetX = e.touches[0].clientX - startX; offsetY = e.touches[0].clientY - startY; drawCrop(); });
        window.addEventListener('touchend', () => { isDragging = false; });
    }

    if (cropZoom) cropZoom.addEventListener('input', () => { zoomVal = parseFloat(cropZoom.value); drawCrop(); });
    function closeCrop() { if (cropModal) cropModal.style.display = 'none'; }
    if (cropCancel) cropCancel.addEventListener('click', closeCrop);
    if (cropCancelX) cropCancelX.addEventListener('click', closeCrop);

    if (cropConfirm) {
        cropConfirm.addEventListener('click', () => {
            const expCvs = document.createElement('canvas');
            expCvs.width = 400; expCvs.height = 400;
            const expCtx = expCvs.getContext('2d');
            expCtx.beginPath(); expCtx.arc(200, 200, 200, 0, Math.PI * 2); expCtx.clip();
            const sc = 400 / 300;
            expCtx.drawImage(cropImg, 200 - (cropImg.width*zoomVal*sc)/2 + offsetX*sc, 200 - (cropImg.height*zoomVal*sc)/2 + offsetY*sc, cropImg.width*zoomVal*sc, cropImg.height*zoomVal*sc);
            
            const b64 = expCvs.toDataURL('image/jpeg', 0.85);
            if (!currentData) currentData = {};
            currentData.profileImage = b64;
            const profPrev = document.getElementById('profile-img-preview');
            if (profPrev) profPrev.src = b64;
            closeCrop();
        });
    }

    // 7. Cover Image (With Auto Compression to prevent hangs)
    const coverInput = document.getElementById('cover-photo-input');
    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    const cvs = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    let width = img.width;
                    let height = img.height;
                    if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
                    cvs.width = width; cvs.height = height;
                    const ctx = cvs.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = cvs.toDataURL('image/jpeg', 0.75); // Compress for speed
                    
                    if (!currentData) currentData = {};
                    currentData.coverImage = compressedBase64;
                    const covPrev = document.getElementById('cover-img-preview');
                    if (covPrev) covPrev.src = compressedBase64;
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 8. Super-Fast Instant Save
    const saveBtn = document.getElementById('save-all-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (!currentData) currentData = {};

            // A: Read all static basic info inputs
            ['name', 'title', 'role', 'email', 'phone', 'whatsapp', 'location', 'about', 'bio', 'resumeUrl', 'bankAccount', 'github', 'linkedin', 'facebook', 'instagram', 'twitter'].forEach(id => {
                const input = document.getElementById(id);
                if (input) currentData[id] = input.value;
            });

            // B: READ ALL DYNAMIC LIST INPUTS (Projects, Skills, etc. from form fields)
            ['education', 'experience', 'skills', 'projects', 'services', 'certifications'].forEach(type => {
                const container = document.getElementById(`${type}-list`);
                if (container) {
                    const items = [];
                    container.querySelectorAll('.dynamic-item-card').forEach(card => {
                        const obj = {};
                        card.querySelectorAll('.item-field').forEach(inp => {
                            obj[inp.getAttribute('data-key')] = inp.value;
                        });
                        items.push(obj);
                    });
                    currentData[type] = items;
                }
            });

            // Put UI in loading state
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            if (typeof db !== 'undefined' && db.saveUser) {
                // Call database.js saveUser (It will return instantly)
                db.saveUser(currentUser, currentData, (success) => {
                    saveBtn.disabled = false;
                    saveBtn.classList.add('btn-success');
                    saveBtn.innerHTML = '<i class="fas fa-check-circle"></i> Saved!';
                    
                    // Reset button text after 2.5 seconds
                    setTimeout(() => {
                        saveBtn.classList.remove('btn-success');
                        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save All Changes To Cloud';
                    }, 2500);
                });
            }
        });
    }
});