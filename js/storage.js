/* ============================================================
   ResumeForge — Local Storage Manager
   Handles saving/loading resume data to/from localStorage
   ============================================================ */

const StorageManager = (() => {
    const STORAGE_KEY = 'resumeforge_data';
    const THEME_KEY = 'resumeforge_theme';
    const TEMPLATE_KEY = 'resumeforge_template';

    /**
     * Get the default empty resume data structure.
     * @returns {Object} Default resume data
     */
    function getDefaultData() {
        return {
            personal: {
                fullName: '',
                email: '',
                phone: '',
                address: '',
                linkedin: '',
                portfolio: '',
                github: '',
                jobTitle: ''
            },
            summary: '',
            objective: '',
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            achievements: [],
            languages: []
        };
    }

    /**
     * Save resume data to localStorage.
     * @param {Object} data - The resume data to save
     */
    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save data:', e);
            return false;
        }
    }

    /**
     * Load resume data from localStorage.
     * @returns {Object} Saved data or default data
     */
    function loadData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle any missing fields
                return { ...getDefaultData(), ...parsed };
            }
        } catch (e) {
            console.error('Failed to load data:', e);
        }
        return getDefaultData();
    }

    /**
     * Check if there's any saved data.
     * @returns {boolean}
     */
    function hasSavedData() {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }

    /**
     * Clear all saved resume data.
     */
    function clearData() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Save the current theme preference.
     * @param {string} theme - 'dark' or 'light'
     */
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * Load the saved theme preference.
     * @returns {string} 'dark' or 'light'
     */
    function loadTheme() {
        return localStorage.getItem(THEME_KEY) || 'dark';
    }

    /**
     * Save the selected template.
     * @param {string} template - Template name
     */
    function saveTemplate(template) {
        localStorage.setItem(TEMPLATE_KEY, template);
    }

    /**
     * Load the saved template.
     * @returns {string} Template name
     */
    function loadTemplate() {
        return localStorage.getItem(TEMPLATE_KEY) || 'minimal';
    }

    // Public API
    return {
        getDefaultData,
        saveData,
        loadData,
        hasSavedData,
        clearData,
        saveTheme,
        loadTheme,
        saveTemplate,
        loadTemplate
    };
})();
