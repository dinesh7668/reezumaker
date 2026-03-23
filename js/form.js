/* ============================================================
   ResumeForge — Form Manager
   Handles dynamic form entries, tag inputs, and data collection.
   ============================================================ */

const FormManager = (() => {
    // Current resume data model
    let resumeData = StorageManager.getDefaultData();

    // Step definitions with labels and icons
    const STEPS = [
        { label: 'Personal', icon: 'user' },
        { label: 'Summary', icon: 'align-left' },
        { label: 'Experience', icon: 'briefcase' },
        { label: 'Education', icon: 'graduation-cap' },
        { label: 'Skills', icon: 'wrench' },
        { label: 'Projects', icon: 'folder-kanban' },
        { label: 'Certifications', icon: 'award' },
        { label: 'Achievements', icon: 'trophy' },
        { label: 'Languages', icon: 'languages' }
    ];

    let currentStep = 0;
    let onDataChange = null; // Callback for live preview updates

    /**
     * Initialize the form manager.
     * @param {Function} onChange - Callback invoked when data changes
     */
    function init(onChange) {
        onDataChange = onChange;
        buildStepIndicators();
        bindPersonalFields();
        bindSummaryAndObjectiveFields();
        bindSkillsInput();
        bindDynamicAddButtons();
        goToStep(0);
    }

    /**
     * Load data into the form fields.
     * @param {Object} data - Resume data
     */
    function loadFormData(data) {
        resumeData = { ...StorageManager.getDefaultData(), ...data };

        // Personal fields
        Object.keys(resumeData.personal).forEach(key => {
            const input = document.querySelector(`[data-field="${key}"]`);
            if (input) input.value = resumeData.personal[key] || '';
        });

        // Summary and Objective
        const summaryField = document.getElementById('summary');
        if (summaryField) {
            summaryField.value = resumeData.summary || '';
        }
        const objectiveField = document.getElementById('objective');
        if (objectiveField) {
            objectiveField.value = resumeData.objective || '';
        }
        updateCharCount();
        
        // Show/hide objective container
        const objContainer = document.getElementById('objective-container');
        const btnAddObj = document.getElementById('btn-add-objective');
        if (resumeData.objective || (objectiveField && objectiveField.value)) {
            objContainer.style.display = 'block';
            btnAddObj.style.display = 'none';
        } else {
            objContainer.style.display = 'none';
            btnAddObj.style.display = 'flex';
        }

        // Skills
        renderSkillTags();

        // Dynamic entries
        renderEntriesFromData('experience');
        renderEntriesFromData('education');
        renderEntriesFromData('projects');
        renderEntriesFromData('certifications');
        renderEntriesFromData('achievements');
        renderEntriesFromData('languages');

        notifyChange();
    }

    /**
     * Get the current resume data.
     * @returns {Object}
     */
    function getData() {
        return resumeData;
    }

    /**
     * Collect all form data into the resumeData object.
     */
    function collectAllData() {
        // Personal
        Object.keys(resumeData.personal).forEach(key => {
            const input = document.querySelector(`[data-field="${key}"]`);
            if (input) resumeData.personal[key] = input.value.trim();
        });

        // Summary and Objective
        const summaryField = document.getElementById('summary');
        if (summaryField) resumeData.summary = summaryField.value.trim();
        const objectiveField = document.getElementById('objective');
        if (objectiveField) resumeData.objective = objectiveField.value.trim();

        // Dynamic entries are already kept in sync

        return resumeData;
    }

    /**
     * Reset all form data.
     */
    function resetForm() {
        resumeData = StorageManager.getDefaultData();
        loadFormData(resumeData);
    }

    // =====================
    // TWO-WAY BINDING SYNC
    // =====================

    /**
     * Sync a specific field from preview directly back to form data and inputs.
     * @param {string} path - dot notation path (e.g. personal.fullName, experience.0.role)
     * @param {string} value - new text value
     */
    function syncField(path, value) {
        const parts = path.split('.');
        
        if (parts.length === 1) {
            // summary or objective
            resumeData[parts[0]] = value;
            const input = document.getElementById(parts[0]);
            if (input) {
                input.value = value;
                updateCharCount();
            }
        } else if (parts.length === 2 && parts[0] === 'personal') {
            resumeData.personal[parts[1]] = value;
            const input = document.querySelector(`[data-field="${parts[1]}"]`);
            if (input) input.value = value;
        } else if (parts.length === 3) {
            // dynamic entry: section.index.field
            const section = parts[0];
            const index = parseInt(parts[1], 10);
            const field = parts[2];
            
            if (resumeData[section] && resumeData[section][index]) {
                resumeData[section][index][field] = value;
                
                // Update DOM
                const containerId = `${getAddBtnSuffix(section)}-entries`;
                let container = document.getElementById(containerId) || document.getElementById(`${section}-entries`);
                if (container) {
                    const card = container.querySelector(`.entry-card[data-index="${index}"]`);
                    if (card) {
                        const input = card.querySelector(`[data-entry-field="${field}"]`);
                        if (input) input.value = value;
                        
                        // Also update card title
                        const template = ENTRY_TEMPLATES[section];
                        if (template) {
                            const label = card.querySelector('.entry-label');
                            if (label) label.textContent = template.defaultTitle(resumeData[section][index]);
                        }
                    }
                }
            }
        }
    }

    function buildStepIndicators() {
        const container = document.getElementById('step-indicators');
        container.innerHTML = STEPS.map((s, i) =>
            `<div class="step-dot${i === 0 ? ' active' : ''}" data-step="${i}" title="${s.label}">${i + 1}</div>`
        ).join('');

        // Click handlers for step dots
        container.querySelectorAll('.step-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                goToStep(parseInt(dot.dataset.step));
            });
        });
    }

    function goToStep(step) {
        if (step < 0 || step >= STEPS.length) return;

        // Collect current data before navigating
        collectAllData();

        currentStep = step;

        // Update form steps visibility
        document.querySelectorAll('.form-step').forEach((el, i) => {
            el.classList.toggle('active', i === step);
        });

        // Update step indicators
        document.querySelectorAll('.step-dot').forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i === step) dot.classList.add('active');
            else if (i < step) dot.classList.add('completed');
        });

        // Update progress bar
        const fill = document.getElementById('progress-fill');
        fill.style.width = `${((step + 1) / STEPS.length) * 100}%`;

        // Update counter
        document.getElementById('step-counter').textContent = `Step ${step + 1} of ${STEPS.length}`;

        // Update prev/next buttons
        document.getElementById('btn-prev').disabled = step === 0;
        const nextBtn = document.getElementById('btn-next');
        nextBtn.innerHTML = step === STEPS.length - 1
            ? '<i data-lucide="check-circle"></i> Finish'
            : 'Next <i data-lucide="arrow-right"></i>';

        // Re-init Lucide icons for new content
        if (window.lucide) lucide.createIcons();

        // Scroll form to top
        document.getElementById('form-panel').scrollTop = 0;
    }

    function nextStep() {
        if (currentStep < STEPS.length - 1) {
            goToStep(currentStep + 1);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            goToStep(currentStep - 1);
        }
    }

    // =====================
    // PERSONAL FIELDS
    // =====================

    function bindPersonalFields() {
        document.querySelectorAll('[data-field]').forEach(input => {
            if (input.id === 'summary' || input.id === 'skills-input') return;
            input.addEventListener('input', () => {
                const field = input.dataset.field;
                if (resumeData.personal.hasOwnProperty(field)) {
                    resumeData.personal[field] = input.value.trim();
                    notifyChange();
                }
            });
        });
    }

    // =====================
    // SUMMARY & OBJECTIVE FIELDS
    // =====================

    function bindSummaryAndObjectiveFields() {
        const summaryField = document.getElementById('summary');
        if (summaryField) {
            summaryField.addEventListener('input', () => {
                resumeData.summary = summaryField.value.trim();
                updateCharCount();
                notifyChange();
            });
        }

        const objectiveField = document.getElementById('objective');
        if (objectiveField) {
            objectiveField.addEventListener('input', () => {
                resumeData.objective = objectiveField.value.trim();
                updateCharCount();
                notifyChange();
            });
        }

        const btnAddObj = document.getElementById('btn-add-objective');
        const btnRemoveObj = document.getElementById('btn-remove-objective');
        const objContainer = document.getElementById('objective-container');
        
        if (btnAddObj) {
            btnAddObj.addEventListener('click', () => {
                objContainer.style.display = 'block';
                btnAddObj.style.display = 'none';
                if (window.lucide) lucide.createIcons();
            });
        }

        if (btnRemoveObj) {
            btnRemoveObj.addEventListener('click', () => {
                objContainer.style.display = 'none';
                btnAddObj.style.display = 'flex';
                if (objectiveField) {
                    objectiveField.value = '';
                    resumeData.objective = '';
                    updateCharCount();
                    notifyChange();
                }
            });
        }
    }

    function updateCharCount() {
        const summaryField = document.getElementById('summary');
        if (summaryField) {
            const count = document.getElementById('summary-count');
            const len = summaryField.value.length;
            count.textContent = `${len} / 500`;
            count.style.color = len > 500 ? 'var(--danger)' : 'var(--text-tertiary)';
        }

        const objectiveField = document.getElementById('objective');
        if (objectiveField) {
            const countObj = document.getElementById('objective-count');
            const lenObj = objectiveField.value.length;
            countObj.textContent = `${lenObj} / 250`;
            countObj.style.color = lenObj > 250 ? 'var(--danger)' : 'var(--text-tertiary)';
        }
    }

    // =====================
    // SKILLS TAG INPUT
    // =====================

    function bindSkillsInput() {
        const input = document.getElementById('skills-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = input.value.replace(/,/g, '').trim();
                if (val && !resumeData.skills.includes(val)) {
                    resumeData.skills.push(val);
                    renderSkillTags();
                    notifyChange();
                }
                input.value = '';
            }
        });
    }

    function renderSkillTags() {
        const container = document.getElementById('skills-tags');
        container.innerHTML = resumeData.skills.map((skill, i) => `
            <span class="skill-tag">
                ${escapeHTML(skill)}
                <button type="button" data-skill-index="${i}" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </span>
        `).join('');

        container.querySelectorAll('button[data-skill-index]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.skillIndex);
                resumeData.skills.splice(idx, 1);
                renderSkillTags();
                notifyChange();
            });
        });
    }

    // =====================
    // DYNAMIC ENTRY SECTIONS
    // =====================

    // Template definitions for each dynamic section
    const ENTRY_TEMPLATES = {
        experience: {
            fields: [
                { name: 'role', label: 'Job Title', type: 'text', placeholder: 'e.g. Senior Developer', span: 2 },
                { name: 'company', label: 'Company', type: 'text', placeholder: 'e.g. Google' },
                { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Mountain View, CA' },
                { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g. Jan 2022' },
                { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'e.g. Present' },
                { name: 'description', label: 'Key Responsibilities & Achievements', type: 'textarea', placeholder: '• Led a team of 5 engineers...\n• Improved system performance by 40%...', span: 2 }
            ],
            defaultTitle: (e) => e.role || 'New Experience',
            defaultSubtitle: (e) => e.company || ''
        },
        education: {
            fields: [
                { name: 'degree', label: 'Degree / Program', type: 'text', placeholder: 'e.g. B.S. Computer Science', span: 2 },
                { name: 'institution', label: 'Institution', type: 'text', placeholder: 'e.g. MIT' },
                { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Cambridge, MA' },
                { name: 'startDate', label: 'Start Date', type: 'text', placeholder: 'e.g. Sep 2018' },
                { name: 'endDate', label: 'End Date', type: 'text', placeholder: 'e.g. Jun 2022' },
                { name: 'gpa', label: 'GPA (optional)', type: 'text', placeholder: 'e.g. 3.85 / 4.0', span: 2 }
            ],
            defaultTitle: (e) => e.degree || 'New Education',
            defaultSubtitle: (e) => e.institution || ''
        },
        projects: {
            fields: [
                { name: 'name', label: 'Project Name', type: 'text', placeholder: 'e.g. E-commerce Platform' },
                { name: 'link', label: 'Project Link', type: 'text', placeholder: 'e.g. github.com/user/project' },
                { name: 'technologies', label: 'Technologies / Project Type', type: 'text', placeholder: 'e.g. React, Node.js (or "Frontend based")', span: 2 },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the project, your role, and key outcomes...', span: 2 }
            ],
            defaultTitle: (e) => e.name || 'New Project',
            defaultSubtitle: (e) => e.technologies || ''
        },
        certifications: {
            fields: [
                { name: 'name', label: 'Certification Name', type: 'text', placeholder: 'e.g. Frontend developer React', span: 2 },
                { name: 'issuer', label: 'Issuing Organization', type: 'text', placeholder: 'e.g. HackerRank' },
                { name: 'date', label: 'Date', type: 'text', placeholder: 'e.g. Mar 2023' }
            ],
            defaultTitle: (e) => e.name || 'New Certification',
            defaultSubtitle: (e) => e.issuer || ''
        },
        achievements: {
            fields: [
                { name: 'title', label: 'Achievement / Activity Title', type: 'text', placeholder: 'e.g. Hackathon Winner', span: 2 },
                { name: 'description', label: 'Description / Activity detail', type: 'textarea', placeholder: 'e.g. Participated in ICMRI 2026...', span: 2 }
            ],
            defaultTitle: (e) => e.title || 'New Achievement',
            defaultSubtitle: () => ''
        },
        languages: {
            fields: [
                { name: 'language', label: 'Language', type: 'text', placeholder: 'e.g. Spanish' },
                { name: 'proficiency', label: 'Proficiency Level', type: 'select', options: ['', 'Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'] }
            ],
            defaultTitle: (e) => e.language || 'New Language',
            defaultSubtitle: (e) => e.proficiency || ''
        }
    };

    function bindDynamicAddButtons() {
        const sections = ['experience', 'education', 'projects', 'certifications', 'achievements', 'languages'];
        sections.forEach(section => {
            const btn = document.getElementById(`add-${section.replace('s', '').replace('ie', 'y')}`);
            // Handle irregular plurals
            const addBtnId = `add-${getAddBtnSuffix(section)}`;
            const addBtn = document.getElementById(addBtnId);
            if (addBtn) {
                addBtn.addEventListener('click', () => addEntry(section));
            }
        });
    }

    function getAddBtnSuffix(section) {
        const map = {
            experience: 'experience',
            education: 'education',
            projects: 'project',
            certifications: 'certification',
            achievements: 'achievement',
            languages: 'language'
        };
        return map[section] || section;
    }

    /**
     * Add a new empty entry to a section.
     * @param {string} section - Section name (e.g., 'experience')
     */
    function addEntry(section) {
        const template = ENTRY_TEMPLATES[section];
        if (!template) return;

        // Create empty entry object
        const entry = {};
        template.fields.forEach(f => { entry[f.name] = ''; });

        resumeData[section].push(entry);
        renderEntryCard(section, resumeData[section].length - 1, true);
        notifyChange();
    }

    /**
     * Remove an entry from a section.
     * @param {string} section
     * @param {number} index
     */
    function removeEntry(section, index) {
        resumeData[section].splice(index, 1);
        renderEntriesFromData(section);
        notifyChange();
    }

    /**
     * Render all entry cards for a section from data.
     * @param {string} section
     */
    function renderEntriesFromData(section) {
        const container = document.getElementById(`${getAddBtnSuffix(section)}-entries`) ||
                          document.getElementById(`${section}-entries`);
        if (!container) return;
        container.innerHTML = '';

        resumeData[section].forEach((_, i) => {
            renderEntryCard(section, i, false);
        });

        if (window.lucide) lucide.createIcons();
    }

    /**
     * Render a single entry card.
     * @param {string} section
     * @param {number} index
     * @param {boolean} expanded - Whether to expand by default
     */
    function renderEntryCard(section, index, expanded) {
        const template = ENTRY_TEMPLATES[section];
        const entry = resumeData[section][index];
        const containerId = `${getAddBtnSuffix(section)}-entries`;
        const container = document.getElementById(containerId) || document.getElementById(`${section}-entries`);
        if (!container) return;

        const card = document.createElement('div');
        card.className = `entry-card${expanded ? ' expanded' : ''}`;
        card.draggable = true;
        card.dataset.section = section;
        card.dataset.index = index;

        const title = template.defaultTitle(entry);
        const subtitle = template.defaultSubtitle(entry);

        card.innerHTML = `
            <div class="entry-card-header">
                <div class="entry-card-title">
                    <span class="entry-number">${index + 1}</span>
                    <span class="entry-label">${escapeHTML(title)}</span>
                    ${subtitle ? `<span style="color:var(--text-tertiary);font-weight:400;font-size:0.8rem">— ${escapeHTML(subtitle)}</span>` : ''}
                </div>
                <div class="entry-card-actions">
                    <button class="btn btn-icon btn-sm btn-delete" title="Remove">
                        <i data-lucide="trash-2"></i>
                    </button>
                    <button class="btn btn-icon btn-sm btn-toggle">
                        <i data-lucide="chevron-down" class="chevron-icon"></i>
                    </button>
                </div>
            </div>
            <div class="entry-card-body">
                <div class="form-grid">
                    ${template.fields.map(f => createFieldHTML(f, entry[f.name], section, index)).join('')}
                </div>
            </div>
        `;

        // Event: Toggle expand
        card.querySelector('.entry-card-header').addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete')) return;
            card.classList.toggle('expanded');
        });

        // Event: Delete
        card.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            card.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => removeEntry(section, index), 300);
        });

        // Event: Field changes
        card.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', () => {
                const fieldName = input.dataset.entryField;
                resumeData[section][index][fieldName] = input.value.trim();
                // Update card title
                const label = card.querySelector('.entry-label');
                if (label) label.textContent = template.defaultTitle(resumeData[section][index]);
                notifyChange();
            });
        });

        // Drag and Drop
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragleave', handleDragLeave);

        container.appendChild(card);

        if (window.lucide) lucide.createIcons();
    }

    /**
     * Create HTML for a form field.
     */
    function createFieldHTML(field, value, section, index) {
        const span = field.span === 2 ? 'span-2' : '';
        const escapedValue = escapeHTML(value || '');

        if (field.type === 'textarea') {
            return `
                <div class="form-group ${span}">
                    <label>${field.label}</label>
                    <textarea rows="4" placeholder="${field.placeholder || ''}" data-entry-field="${field.name}">${escapedValue}</textarea>
                </div>`;
        }

        if (field.type === 'select') {
            const options = field.options.map(opt =>
                `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt || 'Select...'}</option>`
            ).join('');
            return `
                <div class="form-group ${span}">
                    <label>${field.label}</label>
                    <select data-entry-field="${field.name}">${options}</select>
                </div>`;
        }

        return `
            <div class="form-group ${span}">
                <label>${field.label}</label>
                <input type="${field.type}" value="${escapedValue}" placeholder="${field.placeholder || ''}" data-entry-field="${field.name}">
            </div>`;
    }

    // =====================
    // DRAG & DROP REORDERING
    // =====================

    let draggedCard = null;

    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        document.querySelectorAll('.entry-card').forEach(c => c.classList.remove('drag-over'));
        draggedCard = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (this !== draggedCard && this.dataset.section === draggedCard.dataset.section) {
            this.classList.add('drag-over');
        }
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (!draggedCard || this === draggedCard) return;
        if (this.dataset.section !== draggedCard.dataset.section) return;

        const section = this.dataset.section;
        const fromIndex = parseInt(draggedCard.dataset.index);
        const toIndex = parseInt(this.dataset.index);

        // Swap in data array
        const arr = resumeData[section];
        const item = arr.splice(fromIndex, 1)[0];
        arr.splice(toIndex, 0, item);

        // Re-render
        renderEntriesFromData(section);
        notifyChange();
    }

    // =====================
    // HELPERS
    // =====================

    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function notifyChange() {
        if (onDataChange) {
            collectAllData();
            onDataChange(resumeData);
        }
    }

    // Public API
    return {
        init,
        loadFormData,
        getData,
        collectAllData,
        resetForm,
        syncField,
        goToStep,
        nextStep,
        prevStep,
        get currentStep() { return currentStep; },
        get totalSteps() { return STEPS.length; },
        STEPS
    };
})();
