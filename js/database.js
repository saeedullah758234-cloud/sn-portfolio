/* ==========================================================================
   SN PORTFOLIO V2.0 - INSTANT FAIL-SAFE DATABASE ENGINE
   File: js/database.js
   Author: Saeed ullah & Naeem ur Rahman
   ========================================================================== */

(function () {
    'use strict';

    // Firebase Configuration
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

    // Default Seed Data
    const defaultProfiles = {
        saeed: {
            name: "Saeed ullah",
            title: "Full Stack Web Developer",
            role: "developer",
            intro: "Specializing in scalable Web Applications, Custom Databases, Vercel deployments, and responsive UI/UX architecture.",
            about: "Passionate Full Stack Web Developer with expertise in modern JavaScript frameworks, Firebase realtime databases, and automated Vercel cloud hosting.",
            email: "saeedullah.758234@gmail.com",
            phone: "+923000000000",
            whatsapp: "923000000000",
            location: "Peshawar, Pakistan",
            website: "https://sn-portfolio-theta.vercel.app",
            availability: "Available for Freelance Projects",
            profileImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>",
            coverImage: "",
            resume: "",
            bankDetails: {
                bankName: "Easypaisa / JazzCash",
                accountTitle: "Saeed ullah",
                accountNumber: "03XXXXXXXXX"
            },
            socials: {
                github: "https://github.com/saeedullah758234-cloud",
                linkedin: "#",
                youtube: "",
                freelance: "#",
                instagram: "",
                facebook: "",
                twitter: ""
            },
            skills: [
                { name: "HTML5 / CSS3", level: "Expert", icon: "fa-brands fa-html5" },
                { name: "JavaScript ES6+", level: "Expert", icon: "fa-brands fa-js" },
                { name: "Firebase DB", level: "Advanced", icon: "fa-solid fa-database" },
                { name: "Vercel Deploy", level: "Expert", icon: "fa-solid fa-cloud-arrow-up" }
            ],
            projects: [],
            services: [
                { title: "Custom Web Apps", description: "Building modern responsive web applications.", icon: "fa-solid fa-code" }
            ],
            experience: [],
            education: [],
            certifications: []
        },
        naeem: {
            name: "Naeem ur Rahman",
            title: "Professional Video Editor",
            role: "editor",
            intro: "Expert in Cinematic Video Editing, Reels/Shorts, YouTube Production, Color Grading, and Motion Design.",
            about: "Creative Video Editor and Visual Content Creator turning raw footage into high-converting digital stories.",
            email: "naeemurrahman@gmail.com",
            phone: "+923000000001",
            whatsapp: "923000000001",
            location: "Pakistan",
            website: "https://sn-portfolio-theta.vercel.app",
            availability: "Available for Video Editing",
            profileImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='%2306b6d4'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>",
            coverImage: "",
            resume: "",
            bankDetails: {
                bankName: "Easypaisa / JazzCash",
                accountTitle: "Naeem ur Rahman",
                accountNumber: "03XXXXXXXXX"
            },
            socials: {
                github: "",
                linkedin: "#",
                youtube: "#",
                freelance: "#",
                instagram: "#",
                facebook: "",
                twitter: ""
            },
            skills: [
                { name: "Adobe Premiere Pro", level: "Expert", icon: "fa-solid fa-film" },
                { name: "After Effects", level: "Advanced", icon: "fa-solid fa-wand-magic-sparkles" },
                { name: "Color Grading", level: "Expert", icon: "fa-solid fa-palette" }
            ],
            projects: [],
            services: [
                { title: "Video Editing", description: "Cinematic, Reels, YouTube content editing.", icon: "fa-solid fa-video" }
            ],
            experience: [],
            education: [],
            certifications: []
        }
    };

    // Database Instance Manager
    class DatabaseEngine {
        constructor() {
            this.initialized = false;
            this.db = null;
            this.initFirebase();
        }

        initFirebase() {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                this.db = firebase.database();
                this.initialized = true;
            } catch (err) {
                console.warn("Firebase Init Offline:", err);
            }
        }

        cleanData(obj) {
            if (obj === null || obj === undefined) return "";
            if (typeof obj !== "object") return obj;
            if (Array.isArray(obj)) {
                return obj.map(item => this.cleanData(item)).filter(item => item !== null && item !== undefined);
            }
            const clean = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const val = obj[key];
                    if (val !== undefined && val !== null) {
                        clean[key] = this.cleanData(val);
                    }
                }
            }
            return clean;
        }

        mergeWithDefaults(key, custom) {
            const def = defaultProfiles[key] || defaultProfiles.saeed;
            if (!custom) return def;

            return {
                name: custom.name || def.name,
                title: custom.title || def.title,
                role: custom.role || def.role,
                intro: custom.intro || def.intro,
                about: custom.about || def.about,
                email: custom.email || def.email,
                phone: custom.phone || def.phone,
                whatsapp: custom.whatsapp || def.whatsapp,
                location: custom.location || def.location,
                website: custom.website || def.website,
                availability: custom.availability || def.availability,
                profileImage: custom.profileImage || def.profileImage,
                coverImage: custom.coverImage || def.coverImage,
                resume: custom.resume || def.resume,
                bankDetails: Object.assign({}, def.bankDetails, custom.bankDetails || {}),
                socials: Object.assign({}, def.socials, custom.socials || {}),
                skills: Array.isArray(custom.skills) ? custom.skills : def.skills,
                projects: Array.isArray(custom.projects) ? custom.projects : def.projects,
                services: Array.isArray(custom.services) ? custom.services : def.services,
                experience: Array.isArray(custom.experience) ? custom.experience : def.experience,
                education: Array.isArray(custom.education) ? custom.education : def.education,
                certifications: Array.isArray(custom.certifications) ? custom.certifications : def.certifications
            };
        }

        // 0-MS INSTANT GET USER METHOD (ZERO LOADING DELAY)
        getUser(userKey) {
            const key = (userKey === 'naeem') ? 'naeem' : 'saeed';
            
            // 1. Instant return from LocalStorage or Default Seed Data
            let profile = null;
            const local = localStorage.getItem('sn_data_' + key);
            if (local) {
                try { profile = JSON.parse(local); } catch (e) {}
            }
            profile = this.mergeWithDefaults(key, profile);

            // 2. Silent background sync with Firebase (non-blocking)
            if (this.db) {
                this.db.ref('users/' + key).once('value').then(snapshot => {
                    if (snapshot.exists()) {
                        const fbData = snapshot.val();
                        const merged = this.mergeWithDefaults(key, fbData);
                        localStorage.setItem('sn_data_' + key, JSON.stringify(merged));
                        window.dispatchEvent(new CustomEvent('sn_data_synced', { detail: { key, profile: merged } }));
                    }
                }).catch(() => {});
            }

            return Promise.resolve(profile);
        }

        async saveUser(userKey, userData) {
            const key = (userKey === 'naeem') ? 'naeem' : 'saeed';
            const clean = this.cleanData(userData);

            // Instant Local Storage Save
            try {
                localStorage.setItem('sn_data_' + key, JSON.stringify(clean));
            } catch (err) {
                console.warn("LocalStorage quota error:", err);
            }

            // Firebase Async Save
            if (this.db) {
                try {
                    await this.db.ref('users/' + key).set(clean);
                } catch (err) {
                    console.warn("Firebase save skipped:", err);
                }
            }

            return { success: true };
        }

        async getAllProfiles() {
            const saeed = await this.getUser('saeed');
            const naeem = await this.getUser('naeem');
            return { saeed, naeem };
        }

        compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let w = img.width;
                        let h = img.height;

                        if (w > h) {
                            if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
                        } else {
                            if (h > maxHeight) { w = Math.round((w * maxHeight) / h); h = maxHeight; }
                        }

                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('canvas');
                        ctx.drawImage(img, 0, 0, w, h);
                        resolve(canvas.toDataURL('image/jpeg', quality));
                    };
                    img.onerror = () => resolve(e.target.result);
                };
                reader.onerror = () => resolve("");
            });
        }
    }

    window.db = new DatabaseEngine();
})();