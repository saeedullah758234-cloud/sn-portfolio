/* ==========================================
   S&N PORTFOLIO - FIREBASE DATABASE CONNECTOR
   ========================================== */

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

// Initialize Firebase safely
let firebaseDb = null;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    firebaseDb = firebase.database();
} catch (e) {
    console.warn("Firebase Init Warning:", e);
}

// Default Backup Data
const defaultProfiles = {
    saeed: {
        name: "Saeed ullah",
        title: "Web Developer & Designer",
        role: "Full-Stack Web Developer",
        email: "saeedullah758234@gmail.com",
        phone: "+92 300 0000000",
        whatsapp: "+923000000000",
        location: "Pakistan",
        about: "Passionate Full-Stack Web Developer crafting high-performance responsive web applications.",
        bio: "Specialized in modern JavaScript frameworks, custom backend solutions, responsive CSS, and cloud Database integration.",
        profileImage: "https://via.placeholder.com/150",
        coverImage: "https://via.placeholder.com/1200x400",
        projects: [
            { title: "S&N Dual Admin Portfolio", category: "Web App", tech: "HTML5, CSS3, JS, Firebase", link: "#" }
        ]
    },
    naeem: {
        name: "Naeem ur Rahman",
        title: "Video Editor & Motion Designer",
        role: "Professional Video Editor",
        email: "naeemurrahman@gmail.com",
        phone: "+92 300 0000000",
        whatsapp: "+923000000000",
        location: "Pakistan",
        about: "Professional Video Editor creating high-impact visual stories and video content.",
        bio: "Expert in Premiere Pro, After Effects, cinematic color grading, sound design, and YouTube/Reels content creation.",
        profileImage: "https://via.placeholder.com/150",
        coverImage: "https://via.placeholder.com/1200x400",
        projects: [
            { title: "Cinematic Video Reel", category: "Video Editing", tech: "Premiere Pro, After Effects", link: "#" }
        ]
    }
};

// Database API Controller with INSTANT UI SYNC
const db = {
    getUser: function(userKey, callback) {
        const key = (userKey || 'saeed').toLowerCase();
        
        // 1. Immediately return local data to prevent loading freezes
        const localData = localStorage.getItem(`sn_data_${key}`);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                callback(parsed);
            } catch (e) {}
        } else {
            callback(defaultProfiles[key] || defaultProfiles.saeed);
        }

        // 2. Fetch fresh data from Firebase Cloud in the background
        if (firebaseDb) {
            firebaseDb.ref('users/' + key).once('value')
                .then(snapshot => {
                    const cloudData = snapshot.val();
                    if (cloudData) {
                        localStorage.setItem(`sn_data_${key}`, JSON.stringify(cloudData));
                        callback(cloudData); // Update UI with latest cloud data
                    }
                })
                .catch(err => {
                    console.log("Cloud read warning, using local cache:", err);
                });
        }
    },

    saveUser: function(userKey, data, callback) {
        const key = (userKey || 'saeed').toLowerCase();
        
        // 1. INSTANT SAVE: Save to local browser cache instantly
        localStorage.setItem(`sn_data_${key}`, JSON.stringify(data));

        // 2. BACKGROUND SYNC: Send to Firebase Cloud without freezing the screen
        if (firebaseDb) {
            firebaseDb.ref('users/' + key).set(data).catch((err) => {
                console.error("Firebase background save error:", err);
            });
        }

        // 3. FORCE CALLBACK: Tell the Save Button to stop spinning in 500ms max
        setTimeout(() => {
            if (callback) callback(true);
        }, 500);
    }
};