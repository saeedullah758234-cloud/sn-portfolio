/* ==========================================
   SAEED & NAEEM PORTFOLIO - ADMIN DASHBOARD
   Sidebar, Profile, Projects CRUD, Toasts, Image Upload
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'dashboard.html') return;

    // ---- GUARD: Must be logged in ----
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const session = Auth.getSession();
    const adminId = session.adminId;
    let adminData = Database.getAdmin(adminId);

    if (!adminData) {
        Auth.logout();
        return;
    }

    // Store current image data (base64 or URL)
    let currentProfileImage = adminData.profileImage || '';
    let currentProjectImage = '';

    // =============================================
    //  SIDEBAR & NAVIGATION
    // =============================================
    const sidebar = document.getElementById('adminSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
    const adminSections = document.querySelectorAll('.admin-section');

    // Set sidebar profile
    setText('sidebarName', adminData.fullName);
    setText('sidebarRole', adminData.role);
    setImg('sidebarAvatar', adminData.profileImage, adminData.fullName);
    setText('topbarName', adminData.fullName.split(' ')[0]);
    setImg('topbarAvatar', adminData.profileImage, adminData.fullName);

    // Mobile sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            createSidebarOverlay();
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    function createSidebarOverlay() {
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay active';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeSidebar);
        } else {
            overlay.classList.add('active');
        }
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    // Section switching
    function switchSection(sectionName) {
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionName);
        });

        adminSections.forEach(section => {
            section.classList.toggle('active', section.id === 'section' + capitalize(sectionName));
        });

        closeSidebar();

        if (sectionName === 'dashboard') loadDashboard();
        if (sectionName === 'editProfile') loadProfileForm();
        if (sectionName === 'myProjects') loadProjectsTable();
        if (sectionName === 'addProject') resetProjectForm();
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });

    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection(btn.dataset.goto);
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });
    }

    // =============================================
    //  IMAGE UPLOAD FUNCTIONALITY (NEW!)
    // =============================================

    // Compress image to base64 (to avoid storage overflow)
    function compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64);
                };
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsDataURL(file);
        });
    }

    function showUploadLoader() {
        const loader = document.getElementById('uploadLoader');
        if (loader) loader.classList.add('active');
    }

    function hideUploadLoader() {
        const loader = document.getElementById('uploadLoader');
        if (loader) loader.classList.remove('active');
    }

    // ---- PROFILE IMAGE UPLOAD ----
    const profileImageFile = document.getElementById('profileImageFile');
    const profileImagePreviewImg = document.getElementById('profileImagePreviewImg');
    const profilePlaceholder = document.getElementById('profilePlaceholder');
    const removeProfileImg = document.getElementById('removeProfileImg');
    const useUrlBtnProfile = document.getElementById('useUrlBtnProfile');
    const profileUrlGroup = document.getElementById('profileUrlGroup');
    const loadProfileUrl = document.getElementById('loadProfileUrl');
    const profileImageInput = document.getElementById('profileImage');

    if (profileImageFile) {
        profileImageFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file.', 'error');
                return;
            }

            // Max 10MB (will be compressed)
            if (file.size > 10 * 1024 * 1024) {
                showToast('Image too large. Max 10MB allowed.', 'error');
                return;
            }

            showUploadLoader();

            try {
                const base64 = await compressImage(file, 600, 0.85);
                currentProfileImage = base64;
                setProfileImagePreview(base64);
                showToast('Image loaded! Click "Save Profile" to apply.', 'success');
            } catch (err) {
                showToast('Failed to process image.', 'error');
                console.error(err);
            } finally {
                hideUploadLoader();
                profileImageFile.value = ''; // reset input
            }
        });
    }

    if (useUrlBtnProfile) {
        useUrlBtnProfile.addEventListener('click', () => {
            if (profileUrlGroup.style.display === 'none') {
                profileUrlGroup.style.display = 'flex';
                useUrlBtnProfile.innerHTML = '<i class="fas fa-times"></i> Hide URL';
            } else {
                profileUrlGroup.style.display = 'none';
                useUrlBtnProfile.innerHTML = '<i class="fas fa-link"></i> Use URL Instead';
            }
        });
    }

    if (loadProfileUrl) {
        loadProfileUrl.addEventListener('click', () => {
            const url = profileImageInput.value.trim();
            if (!url) {
                showToast('Please enter an image URL.', 'error');
                return;
            }
            currentProfileImage = url;
            setProfileImagePreview(url);
            showToast('URL image loaded!', 'success');
        });
    }

    if (removeProfileImg) {
        removeProfileImg.addEventListener('click', () => {
            currentProfileImage = '';
            setProfileImagePreview('');
            if (profileImageInput) profileImageInput.value = '';
            showToast('Image removed.', 'success');
        });
    }

    function setProfileImagePreview(src) {
        if (!profileImagePreviewImg || !profilePlaceholder) return;

        if (src) {
            profileImagePreviewImg.src = src;
            profileImagePreviewImg.style.display = 'block';
            profilePlaceholder.style.display = 'none';
            if (removeProfileImg) removeProfileImg.style.display = 'inline-flex';
        } else {
            profileImagePreviewImg.src = '';
            profileImagePreviewImg.style.display = 'none';
            profilePlaceholder.style.display = 'flex';
            if (removeProfileImg) removeProfileImg.style.display = 'none';
        }
    }

    // ---- PROJECT IMAGE UPLOAD ----
    const projectImageFile = document.getElementById('projectImageFile');
    const projectImagePreviewImg = document.getElementById('projectImagePreviewImg');
    const projectPlaceholder = document.getElementById('projectPlaceholder');
    const removeProjectImg = document.getElementById('removeProjectImg');
    const useUrlBtnProject = document.getElementById('useUrlBtnProject');
    const projectUrlGroup = document.getElementById('projectUrlGroup');
    const loadProjectUrl = document.getElementById('loadProjectUrl');
    const projectImageInput = document.getElementById('projectImage');

    if (projectImageFile) {
        projectImageFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file.', 'error');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showToast('Image too large. Max 10MB allowed.', 'error');
                return;
            }

            showUploadLoader();

            try {
                const base64 = await compressImage(file, 1000, 0.8);
                currentProjectImage = base64;
                setProjectImagePreview(base64);
                showToast('Image loaded! Fill the form and save.', 'success');
            } catch (err) {
                showToast('Failed to process image.', 'error');
                console.error(err);
            } finally {
                hideUploadLoader();
                projectImageFile.value = '';
            }
        });
    }

    if (useUrlBtnProject) {
        useUrlBtnProject.addEventListener('click', () => {
            if (projectUrlGroup.style.display === 'none') {
                projectUrlGroup.style.display = 'flex';
                useUrlBtnProject.innerHTML = '<i class="fas fa-times"></i> Hide URL';
            } else {
                projectUrlGroup.style.display = 'none';
                useUrlBtnProject.innerHTML = '<i class="fas fa-link"></i> Use URL Instead';
            }
        });
    }

    if (loadProjectUrl) {
        loadProjectUrl.addEventListener('click', () => {
            const url = projectImageInput.value.trim();
            if (!url) {
                showToast('Please enter an image URL.', 'error');
                return;
            }
            currentProjectImage = url;
            setProjectImagePreview(url);
            showToast('URL image loaded!', 'success');
        });
    }

    if (removeProjectImg) {
        removeProjectImg.addEventListener('click', () => {
            currentProjectImage = '';
            setProjectImagePreview('');
            if (projectImageInput) projectImageInput.value = '';
            showToast('Image removed.', 'success');
        });
    }

    function setProjectImagePreview(src) {
        if (!projectImagePreviewImg || !projectPlaceholder) return;

        if (src) {
            projectImagePreviewImg.src = src;
            projectImagePreviewImg.style.display = 'block';
            projectPlaceholder.style.display = 'none';
            if (removeProjectImg) removeProjectImg.style.display = 'inline-flex';
        } else {
            projectImagePreviewImg.src = '';
            projectImagePreviewImg.style.display = 'none';
            projectPlaceholder.style.display = 'flex';
            if (removeProjectImg) removeProjectImg.style.display = 'none';
        }
    }

    // =============================================
    //  DASHBOARD
    // =============================================
    function loadDashboard() {
        adminData = Database.getAdmin(adminId);
        const projects = adminData.projects || [];

        setText('dashProjectCount', projects.length);

        const isComplete = adminData.fullName && adminData.email && adminData.whatsapp && adminData.bio;
        setText('dashProfileStatus', isComplete ? 'Complete' : 'Incomplete');

        const loginTime = session.loginTime ? new Date(session.loginTime) : new Date();
        setText('dashLastLogin', loginTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

        const recentList = document.getElementById('recentProjectsList');
        if (recentList) {
            if (projects.length === 0) {
                recentList.innerHTML = '<p class="empty-text">No projects yet. Add your first project!</p>';
            } else {
                const recent = projects.slice(0, 5);
                recentList.innerHTML = recent.map(p => `
                    <div class="recent-item">
                        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="recent-item-img">
                        <div class="recent-item-info">
                            <div class="recent-item-title">${escapeHtml(p.title)}</div>
                            <div class="recent-item-category">${escapeHtml(p.category)} · ${formatDate(p.dateAdded)}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // =============================================
    //  EDIT PROFILE
    // =============================================
    function loadProfileForm() {
        adminData = Database.getAdmin(adminId);

        setInput('profileName', adminData.fullName);
        setInput('profileRole', adminData.role);
        setInput('profileEmail', adminData.email);
        setInput('profileWhatsapp', adminData.whatsapp);
        setInput('profileBank', adminData.bankAccount);
        setInput('profileBio', adminData.bio);
        setInput('profileSkills', adminData.skills ? adminData.skills.join(', ') : '');

        currentProfileImage = adminData.profileImage || '';
        setProfileImagePreview(currentProfileImage);

        // Reset URL input
        if (profileImageInput) profileImageInput.value = '';
        if (profileUrlGroup) profileUrlGroup.style.display = 'none';
        if (useUrlBtnProfile) useUrlBtnProfile.innerHTML = '<i class="fas fa-link"></i> Use URL Instead';
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const profileData = {
                fullName: document.getElementById('profileName').value.trim(),
                role: document.getElementById('profileRole').value.trim(),
                email: document.getElementById('profileEmail').value.trim(),
                whatsapp: document.getElementById('profileWhatsapp').value.trim(),
                bankAccount: document.getElementById('profileBank').value.trim(),
                profileImage: currentProfileImage,
                bio: document.getElementById('profileBio').value.trim(),
                skills: document.getElementById('profileSkills').value.trim()
            };

            if (!profileData.fullName || !profileData.email || !profileData.whatsapp) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            if (!profileData.profileImage) {
                showToast('Please choose a profile image.', 'error');
                return;
            }

            try {
                const success = Database.updateAdminProfile(adminId, profileData);

                if (success) {
                    showToast('Profile updated successfully!', 'success');
                    adminData = Database.getAdmin(adminId);

                    setText('sidebarName', adminData.fullName);
                    setText('sidebarRole', adminData.role);
                    setImg('sidebarAvatar', adminData.profileImage, adminData.fullName);
                    setText('topbarName', adminData.fullName.split(' ')[0]);
                    setImg('topbarAvatar', adminData.profileImage, adminData.fullName);
                } else {
                    showToast('Failed to update profile.', 'error');
                }
            } catch (err) {
                if (err.name === 'QuotaExceededError') {
                    showToast('Storage full! Try a smaller image.', 'error');
                } else {
                    showToast('An error occurred.', 'error');
                }
                console.error(err);
            }
        });
    }

    // =============================================
    //  MY PROJECTS TABLE
    // =============================================
    function loadProjectsTable() {
        adminData = Database.getAdmin(adminId);
        const projects = adminData.projects || [];
        const tbody = document.getElementById('projectsTableBody');
        const table = document.getElementById('projectsTable');
        const empty = document.getElementById('tableEmpty');

        if (projects.length === 0) {
            if (table) table.classList.remove('active');
            if (empty) empty.style.display = 'block';
            return;
        }

        if (table) table.classList.add('active');
        if (empty) empty.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = projects.map(p => `
                <tr>
                    <td><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="table-thumb"></td>
                    <td><strong>${escapeHtml(p.title)}</strong></td>
                    <td>${escapeHtml(p.category)}</td>
                    <td>${formatDate(p.dateAdded)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-btn table-btn-edit" title="Edit" onclick="AdminActions.editProject('${p.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="table-btn table-btn-delete" title="Delete" onclick="AdminActions.confirmDelete('${p.id}', '${escapeHtml(p.title).replace(/'/g, "\\'")}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    // =============================================
    //  ADD / EDIT PROJECT
    // =============================================
    const projectForm = document.getElementById('projectForm');
    let editingProjectId = null;

    function resetProjectForm() {
        editingProjectId = null;
        if (projectForm) projectForm.reset();
        setInput('editProjectId', '');
        setText('projectFormTitle', 'Add New Project');
        document.querySelector('#projectFormTitle i').className = 'fas fa-plus-circle';
        setText('projectFormSubtitle', 'Fill in the details of your project');
        setText('projectSubmitText', 'Save Project');

        const cancelBtn = document.getElementById('cancelEdit');
        if (cancelBtn) cancelBtn.style.display = 'none';

        currentProjectImage = '';
        setProjectImagePreview('');

        if (projectImageInput) projectImageInput.value = '';
        if (projectUrlGroup) projectUrlGroup.style.display = 'none';
        if (useUrlBtnProject) useUrlBtnProject.innerHTML = '<i class="fas fa-link"></i> Use URL Instead';
    }

    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const projectData = {
                title: document.getElementById('projectTitle').value.trim(),
                description: document.getElementById('projectDescription').value.trim(),
                image: currentProjectImage,
                category: document.getElementById('projectCategory').value,
                techStack: document.getElementById('projectTech').value.trim(),
                githubLink: document.getElementById('projectGithub').value.trim(),
                liveLink: document.getElementById('projectLive').value.trim()
            };

            if (!projectData.title || !projectData.description || !projectData.category) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            if (!projectData.image) {
                showToast('Please choose a project image.', 'error');
                return;
            }

            try {
                let success;

                if (editingProjectId) {
                    success = Database.updateProject(adminId, editingProjectId, projectData);
                    if (success) showToast('Project updated successfully!', 'success');
                } else {
                    const newProject = Database.addProject(adminId, projectData);
                    if (newProject) showToast('Project added successfully!', 'success');
                    success = !!newProject;
                }

                if (success) {
                    resetProjectForm();
                    switchSection('myProjects');
                } else {
                    showToast('Something went wrong. Try again.', 'error');
                }
            } catch (err) {
                if (err.name === 'QuotaExceededError') {
                    showToast('Storage full! Try a smaller image or delete old projects.', 'error');
                } else {
                    showToast('An error occurred.', 'error');
                }
                console.error(err);
            }
        });
    }

    const cancelEditBtn = document.getElementById('cancelEdit');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            resetProjectForm();
            switchSection('myProjects');
        });
    }

    // =============================================
    //  DELETE PROJECT
    // =============================================
    let deleteTargetId = null;
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (deleteTargetId) {
                const success = Database.deleteProject(adminId, deleteTargetId);
                if (success) {
                    showToast('Project deleted successfully!', 'success');
                    loadProjectsTable();
                    loadDashboard();
                } else {
                    showToast('Failed to delete project.', 'error');
                }
            }
            closeDeleteModal();
        });
    }

    function closeDeleteModal() {
        if (deleteModal) deleteModal.classList.remove('active');
        deleteTargetId = null;
    }

    // =============================================
    //  GLOBAL ADMIN ACTIONS
    // =============================================
    window.AdminActions = {
        editProject(projectId) {
            const project = Database.getProjectById(adminId, projectId);
            if (!project) {
                showToast('Project not found.', 'error');
                return;
            }

            editingProjectId = projectId;
            switchSection('addProject');

            setInput('editProjectId', projectId);
            setInput('projectTitle', project.title);
            setInput('projectDescription', project.description);
            setInput('projectCategory', project.category);
            setInput('projectTech', project.techStack ? project.techStack.join(', ') : '');
            setInput('projectGithub', project.githubLink);
            setInput('projectLive', project.liveLink);

            currentProjectImage = project.image || '';
            setProjectImagePreview(currentProjectImage);

            setText('projectFormTitle', 'Edit Project');
            document.querySelector('#projectFormTitle i').className = 'fas fa-edit';
            setText('projectFormSubtitle', `Editing: ${project.title}`);
            setText('projectSubmitText', 'Update Project');

            const cancelBtn = document.getElementById('cancelEdit');
            if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        },

        confirmDelete(projectId, projectName) {
            deleteTargetId = projectId;
            setText('deleteProjectName', projectName);
            if (deleteModal) deleteModal.classList.add('active');
        }
    };

    // =============================================
    //  TOAST NOTIFICATIONS
    // =============================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${escapeHtml(message)}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // =============================================
    //  UTILITY FUNCTIONS
    // =============================================
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el && text !== undefined) el.textContent = text;
    }

    function setInput(id, value) {
        const el = document.getElementById(id);
        if (el && value !== undefined) el.value = value;
    }

    function setImg(id, src, alt) {
        const el = document.getElementById(id);
        if (el && src) {
            el.src = src;
            el.alt = alt || '';
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // =============================================
    //  INITIAL LOAD
    // =============================================
    loadDashboard();

});