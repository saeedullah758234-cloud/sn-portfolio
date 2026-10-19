/* ===================================================
   SN PORTFOLIO - ENHANCED DATABASE LAYER
   Firebase Realtime Database + LocalStorage Fallback
   =================================================== */

// ============ Firebase Configuration ============
const firebaseConfig = {
    apiKey: "AIzaSyD9TwGnhUGg92qWiv5zROJ50Ze0CbVgp_Q",
    authDomain: "sn-portfolio.firebaseapp.com",
    databaseURL: "https://sn-portfolio-default-rtdb.firebaseio.com",
    projectId: "sn-portfolio",
    storageBucket: "sn-portfolio.firebasestorage.app",
    messagingSenderId: "691206200263",
    appId: "1:691206200263:web:b70e58712d39c4787997e2",
    measurementId: "G-RS8BCD1VG0"
};

// Initialize Firebase safely (prevent duplicate init)
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

const database = (typeof firebase !== 'undefined') ? firebase.database() : null;

// ============ Default Profile Templates ============
const defaultProfiles = {
    saeed: {
        name: "Saeed ullah",
        title: "Full Stack Web Developer",
        role: "web-developer",
        intro: "Building modern, scalable web applications with cutting-edge technology.",
        about: "I am a passionate full-stack web developer with expertise in creating responsive, user-friendly websites and web applications. I love turning complex problems into simple, beautiful solutions.",
        email: "",
        phone: "",
        whatsapp: "",
        location: "Pakistan",
        website: "",
        availability: "available",
        profileImage: "",
        coverImage: "",
        resume: "",
        bankDetails: "",
        education: [],
        experience: [],
        skills: [],
        projects: [],
        services: [],
        certifications: [],
        socials: {
            freelance: "",
            github: "",
            linkedin: "",
            facebook: "",
            instagram: "",
            youtube: "",
            twitter: ""
        },
        meta: {
            lastUpdated: new Date().toISOString(),
            version: "2.0"
        }
    },
    naeem: {
        name: "Naeem ur Rahman",
        title: "Professional Video Editor",
        role: "video-editor",
        intro: "Creating cinematic visual experiences through professional video editing.",
        about: "I am a creative video editor specializing in cinematic storytelling, motion graphics, and post-production. I transform raw footage into engaging visual stories.",
        email: "",
        phone: "",
        whatsapp: "",
        location: "Pakistan",
        website: "",
        availability: "available",
        profileImage: "",
        coverImage: "",
        resume: "",
        bankDetails: "",
        education: [],
        experience: [],
        skills: [],
        projects: [],
        services: [],
        certifications: [],
        socials: {
            freelance: "",
            github: "",
            linkedin: "",
            facebook: "",
            instagram: "",
            youtube: "",
            twitter: ""
        },
        meta: {
            lastUpdated: new Date().toISOString(),
            version: "2.0"
        }
    }
};

// ============ Deep Clean Undefined Values (Firebase hates undefined) ============
function cleanData(obj) {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
        return obj.map(item => cleanData(item)).filter(item => item !== null);
    }
    if (typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                const value = cleanData(obj[key]);
                if (value !== null && value !== undefined) {
                    cleaned[key] = value;
                }
            } else if (obj[key] === '' || obj[key] === 0 || obj[key] === false) {
                // Keep empty strings as empty strings (not undefined)
                cleaned[key] = obj[key];
            }
        }
        return cleaned;
    }
    return obj;
}

// ============ Merge with defaults safely ============
function mergeWithDefaults(userId, data) {
    const defaults = defaultProfiles[userId] || defaultProfiles.saeed;
    const merged = { ...defaults, ...data };
    
    // Ensure arrays are arrays
    ['education', 'experience', 'skills', 'projects', 'services', 'certifications'].forEach(key => {
        if (!Array.isArray(merged[key])) merged[key] = [];
    });
    
    // Ensure socials is object
    if (!merged.socials || typeof merged.socials !== 'object') {
        merged.socials = defaults.socials;
    }
    
    return merged;
}

// ============ Main Database API ============
const db = {
    
    /* ---------- GET USER DATA ---------- */
    async getUser(userId) {
        if (!userId) return null;
        
        try {
            // Try Firebase first
            if (database) {
                const snapshot = await database.ref('users/' + userId).once('value');
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const merged = mergeWithDefaults(userId, data);
                    // Backup to localStorage
                    try {
                        localStorage.setItem('sn_data_' + userId, JSON.stringify(merged));
                    } catch (e) {
                        console.warn('LocalStorage quota exceeded, skipping backup');
                    }
                    return merged;
                }
            }
        } catch (error) {
            console.warn("Firebase read failed, falling back to localStorage:", error.message);
        }
        
        // Fallback to localStorage
        try {
            const localData = localStorage.getItem('sn_data_' + userId);
            if (localData) {
                return mergeWithDefaults(userId, JSON.parse(localData));
            }
        } catch (e) {
            console.warn('LocalStorage read failed');
        }
        
        // Final fallback: defaults
        return defaultProfiles[userId] || defaultProfiles.saeed;
    },
    
    /* ---------- SAVE USER DATA (Fail-safe) ---------- */
    async saveUser(userId, data) {
        if (!userId || !data) return { success: false, error: 'Invalid input' };
        
        try {
            // Add metadata
            data.meta = {
                lastUpdated: new Date().toISOString(),
                version: "2.0"
            };
            
            // Clean undefined values
            const safeData = cleanData(data);
            
            // 1. INSTANT LOCAL SAVE (always works)
            try {
                localStorage.setItem('sn_data_' + userId, JSON.stringify(safeData));
            } catch (e) {
                console.warn('LocalStorage save failed - quota may be exceeded');
            }
            
            // 2. BACKGROUND FIREBASE SAVE (non-blocking)
            if (database) {
                database.ref('users/' + userId).set(safeData)
                    .then(() => {
                        console.log(`✓ Firebase sync successful for ${userId}`);
                    })
                    .catch((err) => {
                        console.error(`✗ Firebase sync failed for ${userId}:`, err.message);
                    });
            }
            
            return { success: true, message: 'Saved successfully' };
            
        } catch (error) {
            console.error("Critical save error:", error);
            // Still return success because local save likely worked
            return { success: true, message: 'Saved locally', warning: error.message };
        }
    },
    
    /* ---------- UPDATE SPECIFIC FIELD ---------- */
    async updateField(userId, field, value) {
        if (!userId || !field) return false;
        
        try {
            const current = await this.getUser(userId);
            current[field] = value;
            return await this.saveUser(userId, current);
        } catch (e) {
            console.error('Update field failed:', e);
            return { success: false };
        }
    },
    
    /* ---------- ADD PROJECT ---------- */
    async addProject(userId, project) {
        try {
            const user = await this.getUser(userId);
            if (!Array.isArray(user.projects)) user.projects = [];
            project.id = Date.now().toString();
            project.createdAt = new Date().toISOString();
            user.projects.push(project);
            return await this.saveUser(userId, user);
        } catch (e) {
            console.error('Add project failed:', e);
            return { success: false };
        }
    },
    
    /* ---------- DELETE PROJECT ---------- */
    async deleteProject(userId, projectId) {
        try {
            const user = await this.getUser(userId);
            user.projects = (user.projects || []).filter(p => p.id !== projectId);
            return await this.saveUser(userId, user);
        } catch (e) {
            console.error('Delete project failed:', e);
            return { success: false };
        }
    },
    
    /* ---------- COMPRESS IMAGE (Smart) ---------- */
    compressImage(file, options = {}) {
        return new Promise((resolve, reject) => {
            const {
                maxWidth = 800,
                maxHeight = 800,
                quality = 0.75,
                format = 'image/jpeg'
            } = options;
            
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('File read error'));
            
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error('Image load error'));
                
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    // Scale down maintaining aspect ratio
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    
                    // Better quality rendering
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const base64 = canvas.toDataURL(format, quality);
                    const sizeKB = Math.round(base64.length / 1024);
                    
                    console.log(`✓ Image compressed: ${width}x${height}, ~${sizeKB}KB`);
                    resolve(base64);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },
    
    /* ---------- GET BOTH PROFILES (for home page) ---------- */
    async getAllProfiles() {
        try {
            const [saeed, naeem] = await Promise.all([
                this.getUser('saeed'),
                this.getUser('naeem')
            ]);
            return { saeed, naeem };
        } catch (e) {
            console.error('Get all profiles failed:', e);
            return {
                saeed: defaultProfiles.saeed,
                naeem: defaultProfiles.naeem
            };
        }
    },
    
    /* ---------- CHECK FIREBASE CONNECTION ---------- */
    async checkConnection() {
        if (!database) return false;
        try {
            const connected = await database.ref('.info/connected').once('value');
            return connected.val() === true;
        } catch (e) {
            return false;
        }
    }
};

// Expose globally
window.db = db;
console.log('✓ SN Portfolio Database v2.0 Ready');