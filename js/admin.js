document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAuth === 'function') requireAuth();
    const currentUser = localStorage.getItem('sn_user') || 'saeed';
    let currentData = null;
    const preloader = document.getElementById('preloader');
    if (preloader) setTimeout(() => preloader.style.display = 'none', 500);

    // Sidebar & Theme
    const sidebar = document.getElementById('admin-sidebar');
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => sidebar.classList.add('open'));
    document.getElementById('sidebar-close')?.addEventListener('click', () => sidebar.classList.remove('open'));
    
    // Load Data
    if (typeof db !== 'undefined') {
        db.getUser(currentUser, (data) => {
            if (data) { currentData = data; fillForm(data); }
        });
    }

    function fillForm(data) {
        const fields = ['name','title','role','email','phone','whatsapp','location','about','bio','resumeUrl','bankAccount','github','linkedin','facebook','instagram'];
        fields.forEach(f => { if(document.getElementById(f)) document.getElementById(f).value = data[f] || ''; });
        if(data.profileImage) document.getElementById('profile-img-preview').src = data.profileImage;
        if(data.coverImage) document.getElementById('cover-img-preview').src = data.coverImage;
    }

    // Save Data
    document.getElementById('save-all-btn').addEventListener('click', function() {
        const btn = this;
        const fields = ['name','title','role','email','phone','whatsapp','location','about','bio','resumeUrl','bankAccount','github','linkedin','facebook','instagram'];
        fields.forEach(f => { currentData[f] = document.getElementById(f).value; });
        btn.innerText = "Saving...";
        db.saveUser(currentUser, currentData, () => {
            btn.innerText = "Save All Changes";
            alert("Saved to Firebase!");
        });
    });

    // Simple Crop Logic
    const profInput = document.getElementById('profile-photo-input');
    const cropModal = document.getElementById('crop-modal');
    const canvas = document.getElementById('crop-canvas');
    const ctx = canvas.getContext('2d');
    let img = new Image();

    profInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (re) => {
            img.onload = () => {
                cropModal.style.display = 'flex';
                ctx.drawImage(img, 0, 0, 300, 300);
            };
            img.src = re.target.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('crop-confirm-btn').addEventListener('click', () => {
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        currentData.profileImage = base64;
        document.getElementById('profile-img-preview').src = base64;
        cropModal.style.display = 'none';
    });
    
    document.getElementById('crop-cancel-btn').addEventListener('click', () => cropModal.style.display = 'none');
});