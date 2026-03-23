/* ============================================================
   ResumeForge — Live Preview Manager
   Renders the resume preview in real-time using the template engine.
   ============================================================ */

const PreviewManager = (() => {
    let currentTemplate = 'minimal';
    let zoomLevel = 100;
    let isEditMode = false;
    const MIN_ZOOM = 50;
    const MAX_ZOOM = 150;

    /**
     * Initialize the preview manager.
     */
    function init() {
        bindZoomControls();
        initFormatToolbar();
        // Set initial zoom based on viewport
        autoFitZoom();

        // Bind for live editing sync
        const previewEl = document.getElementById('resume-preview');
        if (previewEl) {
            previewEl.addEventListener('input', handlePreviewInput);
        }
    }

    /**
     * Update the preview with new data.
     * @param {Object} data - Resume data
     */
    function update(data) {
        if (isEditMode) return;
        const previewEl = document.getElementById('resume-preview');
        if (!previewEl) return;

        const html = TemplateEngine.render(currentTemplate, data);
        previewEl.innerHTML = html;
    }

    /**
     * Set the active template and re-render.
     * @param {string} template - Template name
     * @param {Object} data - Resume data
     */
    function setTemplate(template, data) {
        currentTemplate = template;
        update(data);
        StorageManager.saveTemplate(template);
    }

    /**
     * Get the current template name.
     * @returns {string}
     */
    function getTemplate() {
        return currentTemplate;
    }

    /**
     * Bind zoom controls.
     */
    function bindZoomControls() {
        document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
            setZoom(zoomLevel + 10);
        });
        document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
            setZoom(zoomLevel - 10);
        });
    }

    /**
     * Handle input inside the contenteditable preview to sync back to the form
     */
    function handlePreviewInput(e) {
        if (!isEditMode) return;

        let syncNode = e.target;
        if (syncNode.nodeType === 3) syncNode = syncNode.parentElement;

        const syncEl = syncNode.closest('[data-sync-field]');
        if (syncEl) {
            const path = syncEl.getAttribute('data-sync-field');
            const value = syncEl.innerText;
            if (typeof FormManager !== 'undefined' && typeof FormManager.syncField === 'function') {
                FormManager.syncField(path, value);
            }
        }
    }

    /**
     * Formatting and Edit Mode
     */
    function toggleEditMode() {
        isEditMode = !isEditMode;
        const previewEl = document.getElementById('resume-preview');
        const toolbar = document.getElementById('format-toolbar');
        const btnEdit = document.getElementById('btn-edit-mode');

        if (isEditMode) {
            previewEl.contentEditable = 'true';
            previewEl.style.outline = '2px dashed var(--primary)';
            toolbar.style.display = 'flex';
            btnEdit.classList.add('active');
            btnEdit.style.color = 'var(--primary)';
            if (window.showToast) window.showToast('Manual Edit Mode Active. Form updates paused.', 'info');
        } else {
            previewEl.contentEditable = 'false';
            previewEl.style.outline = 'none';
            toolbar.style.display = 'none';
            btnEdit.classList.remove('active');
            btnEdit.style.color = '';
            if (window.showToast) window.showToast('Manual Edit Mode Deactivated.', 'info');
        }
    }

    function changeFontSize(step) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        let focusNode = selection.focusNode;
        if (!focusNode) return;

        let parent = focusNode.nodeType === 3 ? focusNode.parentElement : focusNode;
        if (!parent || parent === document.getElementById('resume-preview')) return;
        
        let currentSize = window.getComputedStyle(parent).fontSize;
        let newSize = parseFloat(currentSize) + step;
        parent.style.fontSize = newSize + 'px';
    }

    function alignText(align) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        let focusNode = selection.focusNode;
        if (!focusNode) return;

        let parent = focusNode.nodeType === 3 ? focusNode.parentElement : focusNode;
        while (parent && parent !== document.getElementById('resume-preview')) {
            let display = window.getComputedStyle(parent).display;
            if (display === 'block' || display === 'flex' || display === 'grid') {
                break;
            }
            parent = parent.parentElement;
        }
        if (parent && parent !== document.getElementById('resume-preview')) {
            parent.style.textAlign = align;
        }
    }

    function initFormatToolbar() {
        document.getElementById('btn-edit-mode')?.addEventListener('click', toggleEditMode);
        
        const formatButtons = [
            'btn-format-bold', 'btn-format-italic', 'btn-format-inc', 'btn-format-dec',
            'btn-format-left', 'btn-format-center', 'btn-format-right'
        ];
        
        formatButtons.forEach(id => {
            document.getElementById(id)?.addEventListener('mousedown', e => e.preventDefault());
        });

        document.getElementById('btn-format-bold')?.addEventListener('click', () => document.execCommand('bold', false, null));
        document.getElementById('btn-format-italic')?.addEventListener('click', () => document.execCommand('italic', false, null));
        document.getElementById('btn-format-inc')?.addEventListener('click', () => changeFontSize(1));
        document.getElementById('btn-format-dec')?.addEventListener('click', () => changeFontSize(-1));
        document.getElementById('btn-format-left')?.addEventListener('click', () => alignText('left'));
        document.getElementById('btn-format-center')?.addEventListener('click', () => alignText('center'));
        document.getElementById('btn-format-right')?.addEventListener('click', () => alignText('right'));
    }

    /**
     * Set zoom level.
     * @param {number} level
     */
    function setZoom(level) {
        zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
        const previewEl = document.getElementById('resume-preview');
        if (previewEl) {
            // Use CSS zoom so the layout bounding box scales correctly on mobile,
            // preventing the left-edge overflow clipping issue.
            previewEl.style.zoom = zoomLevel / 100;
        }
        document.getElementById('zoom-level').textContent = `${zoomLevel}%`;
    }

    /**
     * Auto-fit zoom based on container width.
     */
    function autoFitZoom() {
        const wrapper = document.getElementById('preview-wrapper');
        if (!wrapper) return;

        setTimeout(() => {
            const containerWidth = wrapper.clientWidth - 40; // padding
            const pageWidth = 793; // ~210mm at 96dpi
            const idealZoom = Math.floor((containerWidth / pageWidth) * 100);
            setZoom(Math.min(idealZoom, 100));
        }, 100);
    }

    /**
     * Get the resume preview element (for PDF generation).
     * @returns {HTMLElement}
     */
    function getPreviewElement() {
        return document.getElementById('resume-preview');
    }

    return {
        init,
        update,
        setTemplate,
        getTemplate,
        getPreviewElement,
        autoFitZoom,
        setZoom
    };
})();
