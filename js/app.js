/* ============================================================
   ResumeForge — Main Application
   Initializes all modules and handles global UI interactions.
   ============================================================ */

(function () {
    'use strict';

    // =====================
    // TOAST NOTIFICATION SYSTEM
    // =====================

    /**
     * Display a toast notification.
     * @param {string} message - Toast message
     * @param {string} type - 'success', 'error', or 'info'
     * @param {number} duration - Duration in ms (default 3000)
     */
    window.showToast = function (message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        };

        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // =====================
    // CONFIRM MODAL
    // =====================

    function showConfirm(title, message) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirm-modal');
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-message').textContent = message;
            overlay.classList.remove('hidden');

            const confirmBtn = document.getElementById('modal-confirm');
            const cancelBtn = document.getElementById('modal-cancel');

            function cleanup() {
                overlay.classList.add('hidden');
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                overlay.removeEventListener('click', onOverlay);
            }

            function onConfirm() { cleanup(); resolve(true); }
            function onCancel() { cleanup(); resolve(false); }
            function onOverlay(e) { if (e.target === overlay) { cleanup(); resolve(false); } }

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlay);
        });
    }

    // =====================
    // THEME SYSTEM
    // =====================

    function initTheme() {
        const saved = StorageManager.loadTheme();
        document.documentElement.setAttribute('data-theme', saved);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';

        // Add transition class for smooth theme change
        document.body.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', next);
        StorageManager.saveTheme(next);

        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 600);

        showToast(`Switched to ${next} mode`, 'info');
    }

    // =====================
    // TEMPLATE SELECTION
    // =====================

    function initTemplateSelector() {
        const saved = StorageManager.loadTemplate();
        setActiveTemplate(saved);

        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.dataset.template;
                setActiveTemplate(template);
                const data = FormManager.collectAllData();
                PreviewManager.setTemplate(template, data);
                showToast(`Template: ${template.charAt(0).toUpperCase() + template.slice(1)}`, 'info');
            });
        });
    }

    function setActiveTemplate(template) {
        document.querySelectorAll('.template-card').forEach(c => {
            c.classList.toggle('active', c.dataset.template === template);
        });
    }

    // =====================
    // INITIALIZATION
    // =====================

    function initApp() {
        // Initialize theme
        initTheme();

        // Initialize Lucide icons
        if (window.lucide) lucide.createIcons();

        // Initialize template selector
        initTemplateSelector();

        // Initialize form manager with live preview callback
        FormManager.init((data) => {
            PreviewManager.update(data);
        });

        // Initialize preview manager
        PreviewManager.init();
        const savedTemplate = StorageManager.loadTemplate();
        PreviewManager.setTemplate(savedTemplate, StorageManager.getDefaultData());

        // Load saved data if exists
        if (StorageManager.hasSavedData()) {
            const data = StorageManager.loadData();
            FormManager.loadFormData(data);
            showToast('Loaded your saved resume', 'success');
        } else {
            // Render empty preview
            PreviewManager.update(FormManager.getData());
        }

        // =====================
        // EVENT BINDINGS
        // =====================

        // Step navigation
        document.getElementById('btn-next').addEventListener('click', FormManager.nextStep);
        document.getElementById('btn-prev').addEventListener('click', FormManager.prevStep);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Ctrl+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveResume();
            }
        });

        // Save button
        document.getElementById('btn-save')?.addEventListener('click', saveResume);
        document.getElementById('btn-save-m')?.addEventListener('click', saveResume);

        // Load button
        document.getElementById('btn-load')?.addEventListener('click', loadResume);
        document.getElementById('btn-load-m')?.addEventListener('click', loadResume);

        // Reset button
        document.getElementById('btn-reset')?.addEventListener('click', resetResume);
        document.getElementById('btn-reset-m')?.addEventListener('click', resetResume);

        // Theme toggle
        document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
        document.getElementById('btn-theme-m')?.addEventListener('click', toggleTheme);

        // Download PDF
        document.getElementById('btn-download')?.addEventListener('click', () => {
            const data = FormManager.collectAllData();
            PDFGenerator.download(data);
        });
        document.getElementById('btn-download-m')?.addEventListener('click', () => {
            const data = FormManager.collectAllData();
            PDFGenerator.download(data);
        });

        // Mobile menu toggle
        document.getElementById('btn-mobile-menu')?.addEventListener('click', () => {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        });

        // Mobile preview toggle
        document.getElementById('fab-preview')?.addEventListener('click', toggleMobilePreview);

        // Handle window resize for preview zoom
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                PreviewManager.autoFitZoom();
            }, 250);
        });

        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');
        }, 1500);
    }

    // =====================
    // ACTION HANDLERS
    // =====================

    function saveResume() {
        const data = FormManager.collectAllData();
        const success = StorageManager.saveData(data);
        if (success) {
            showToast('Resume saved to browser storage', 'success');
        } else {
            showToast('Failed to save resume', 'error');
        }
    }

    function loadResume() {
        if (StorageManager.hasSavedData()) {
            const data = StorageManager.loadData();
            FormManager.loadFormData(data);
            showToast('Resume loaded successfully', 'success');
        } else {
            showToast('No saved resume found', 'info');
        }
    }

    async function resetResume() {
        const confirmed = await showConfirm(
            'Reset Resume?',
            'This will clear all your current data. Make sure to save first if needed.'
        );
        if (confirmed) {
            FormManager.resetForm();
            StorageManager.clearData();
            showToast('Resume reset successfully', 'success');
        }
    }

    // =====================
    // MOBILE PREVIEW TOGGLE
    // =====================

    let previewVisible = false;

    function toggleMobilePreview() {
        const panel = document.getElementById('preview-panel');
        const fab = document.getElementById('fab-preview');
        previewVisible = !previewVisible;

        if (previewVisible) {
            panel.classList.add('visible');
            fab.innerHTML = '<i data-lucide="pencil"></i>';
            PreviewManager.autoFitZoom();
        } else {
            panel.classList.remove('visible');
            fab.innerHTML = '<i data-lucide="eye"></i>';
        }

        if (window.lucide) lucide.createIcons();
    }

    // =====================
    // BOOT
    // =====================

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
