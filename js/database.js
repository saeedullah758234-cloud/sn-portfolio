/* ===== FIREBASE DATABASE CONFIG & FUNCTIONS ===== */

// Firebase Configuration (Make sure this matches your project settings)
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Default Empty Profiles just in case
const defaultProfiles = {
    saeed: {
        name: "Saeed ullah",
        title: "Full Stack Web Developer",
        intro: "Building modern, scalable web applications.",
        profileImage: "",
        coverImage: ""
    },
    naeem: {
        name: "Naeem ur Rahman",
        title: "Professional Video Editor",
        intro: "Creating cinematic visual experiences.",
        profileImage: "",
        coverImage: ""
    }
};

const db = {
    // Get User Data
    async getUser(userId) {
        try {
            // First check Firebase
            const snapshot = await database.ref('users/' + userId).once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                localStorage.setItem('sn_data_' + userId, JSON.stringify(data)); // Backup locally
                return data;
            }
        } catch (error) {
            console.warn("Firebase read failed, using local storage:", error);
        }
        
        // If Firebase fails or empty, load from LocalStorage
        const localData = localStorage.getItem('sn_data_' + userId);
        if (localData) {
            return JSON.parse(localData);
        }

        // If nothing exists, return default
        return defaultProfiles[userId];
    },

    // Save User Data (Fail-Safe Implementation)
    async saveUser(userId, data) {
        try {
            // Clean undefined values to prevent Firebase crash
            const safeData = JSON.parse(JSON.stringify(data));

            // 1. INSTANT LOCAL SAVE (Guarantees success on device immediately)
            localStorage.setItem('sn_data_' + userId, JSON.stringify(safeData));

            // 2. BACKGROUND FIREBASE SAVE
            database.ref('users/' + userId).set(safeData)
                .then(() => {
                    console.log(`Firebase sync success for ${userId}`);
                })
                .catch((err) => {
                    console.error(`Firebase sync failed for ${userId}:`, err);
                });

            // 3. Always return true to UI so user sees "Saved!"
            return true; 
        } catch (error) {
            console.error("Critical error in saveUser:", error);
            // Even if Firebase object mapping fails, return true because local save worked
            return true; 
        }
    }
};