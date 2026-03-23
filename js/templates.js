/* ============================================================
   ResumeForge — Template Renderer
   Generates HTML for each resume template from the data model.
   All templates produce clean, semantic HTML for ATS parsing.
   ============================================================ */

const TemplateEngine = (() => {
    /**
     * Escape HTML entities for safe rendering.
     * @param {string} str - Raw string
     * @returns {string} Escaped HTML
     */
    function esc(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Render the contact row (shared by all templates).
     * @param {Object} p - Personal data
     * @returns {string} HTML
     */
    function contactRow(p) {
        const items = [];
        if (p.email) items.push(`<span data-sync-field="personal.email">${esc(p.email)}</span>`);
        if (p.phone) items.push(`<span data-sync-field="personal.phone">${esc(p.phone)}</span>`);
        if (p.address) items.push(`<span data-sync-field="personal.address">${esc(p.address)}</span>`);
        if (p.linkedin) items.push(`<span data-sync-field="personal.linkedin">${esc(p.linkedin)}</span>`);
        if (p.portfolio) items.push(`<span data-sync-field="personal.portfolio">${esc(p.portfolio)}</span>`);
        if (p.github) items.push(`<span data-sync-field="personal.github">${esc(p.github)}</span>`);
        if (!items.length) return '';
        return `<div class="r-contact-row">${items.join('<span class="separator">|</span>')}</div>`;
    }

    /**
     * Render a section only if it has content.
     * @param {string} title - Section heading
     * @param {string} content - Inner HTML
     * @returns {string} HTML or empty string
     */
    function section(title, content) {
        if (!content || content.trim() === '') return '';
        return `<div class="r-section"><h2 class="r-section-title">${title}</h2>${content}</div>`;
    }

    /**
     * Render experience entries.
     * @param {Array} entries
     * @returns {string} HTML
     */
    function renderExperience(entries) {
        if (!entries || !entries.length) return '';
        return entries.map((e, index) => `
            <div class="r-entry">
                <div class="r-entry-header">
                    <div>
                        <h3 class="r-entry-title" data-sync-field="experience.${index}.role">${esc(e.role)}</h3>
                        <div class="r-entry-subtitle"><span data-sync-field="experience.${index}.company">${esc(e.company)}</span>${e.location ? ', <span data-sync-field="experience.' + index + '.location">' + esc(e.location) + '</span>' : ''}</div>
                    </div>
                    <span class="r-entry-date"><span data-sync-field="experience.${index}.startDate">${esc(e.startDate)}</span>${e.endDate ? ' – <span data-sync-field="experience.' + index + '.endDate">' + esc(e.endDate) + '</span>' : ' – Present'}</span>
                </div>
                ${e.description ? `<div class="r-entry-desc" data-sync-field="experience.${index}.description">${esc(e.description)}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Render education entries.
     * @param {Array} entries
     * @returns {string} HTML
     */
    function renderEducation(entries) {
        if (!entries || !entries.length) return '';
        return entries.map((e, index) => `
            <div class="r-entry">
                <div class="r-entry-header">
                    <div>
                        <h3 class="r-entry-title" data-sync-field="education.${index}.degree">${esc(e.degree)}</h3>
                        <div class="r-entry-subtitle"><span data-sync-field="education.${index}.institution">${esc(e.institution)}</span>${e.location ? ', <span data-sync-field="education.' + index + '.location">' + esc(e.location) + '</span>' : ''}</div>
                    </div>
                    <span class="r-entry-date"><span data-sync-field="education.${index}.startDate">${esc(e.startDate)}</span>${e.endDate ? ' – <span data-sync-field="education.' + index + '.endDate">' + esc(e.endDate) + '</span>' : ' – Present'}</span>
                </div>
                ${e.gpa ? `<div class="r-entry-desc">GPA: <span data-sync-field="education.${index}.gpa">${esc(e.gpa)}</span></div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Render skills as tags or list.
     * @param {Array} skills
     * @returns {string} HTML
     */
    function renderSkills(skills) {
        if (!skills || !skills.length) return '';
        return `<ul class="r-skills-list">${skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`;
    }

    /**
     * Render project entries.
     * @param {Array} entries
     * @returns {string} HTML
     */
    function renderProjects(entries) {
        if (!entries || !entries.length) return '';
        return entries.map((e, index) => `
            <div class="r-entry">
                <div class="r-entry-header">
                    <h3 class="r-entry-title" data-sync-field="projects.${index}.name">${esc(e.name)}</h3>
                    ${e.link ? `<span class="r-entry-date" data-sync-field="projects.${index}.link">${esc(e.link)}</span>` : ''}
                </div>
                ${e.technologies ? `<div class="r-entry-subtitle" data-sync-field="projects.${index}.technologies">${esc(e.technologies)}</div>` : ''}
                ${e.description ? `<div class="r-entry-desc" data-sync-field="projects.${index}.description">${esc(e.description)}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Render certifications.
     * @param {Array} entries
     * @returns {string} HTML
     */
    function renderCertifications(entries) {
        if (!entries || !entries.length) return '';
        return entries.map((e, index) => `
            <div class="r-entry">
                <div class="r-entry-header">
                    <h3 class="r-entry-title" data-sync-field="certifications.${index}.name">${esc(e.name)}</h3>
                    <span class="r-entry-date" data-sync-field="certifications.${index}.date">${esc(e.date)}</span>
                </div>
                ${e.issuer ? `<div class="r-entry-subtitle" data-sync-field="certifications.${index}.issuer">${esc(e.issuer)}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Render achievements.
     * @param {Array} entries
     * @returns {string} HTML
     */
    function renderAchievements(entries) {
        if (!entries || !entries.length) return '';
        return `<ul>${entries.map((e, index) => `<li><strong data-sync-field="achievements.${index}.title">${esc(e.title)}</strong>${e.description ? ' — <span data-sync-field="achievements.' + index + '.description">' + esc(e.description) + '</span>' : ''}</li>`).join('')}</ul>`;
    }

    /**
     * Render languages.
     * @param {Array} entries
     * @returns {string} HTML
     */
    function renderLanguages(entries) {
        if (!entries || !entries.length) return '';
        return entries.map((e, index) => `
            <div class="r-entry">
                <span class="r-entry-title" data-sync-field="languages.${index}.language">${esc(e.language)}</span>
                ${e.proficiency ? ` — <span class="r-lang-level" data-sync-field="languages.${index}.proficiency">${esc(e.proficiency)}</span>` : ''}
            </div>
        `).join('');
    }

    // =====================
    // TEMPLATE: MINIMAL
    // =====================
    function renderMinimal(data) {
        const p = data.personal;
        const hasName = p.fullName;
        return `
        <div class="resume-minimal">
            <header class="r-header">
                <h1 class="r-name" data-sync-field="personal.fullName">${esc(p.fullName) || 'Your Name'}</h1>
                ${p.jobTitle ? `<div class="r-job-title" data-sync-field="personal.jobTitle">${esc(p.jobTitle)}</div>` : ''}
                ${contactRow(p)}
            </header>
            ${data.objective ? section('Career Objective', `<p class="r-summary" data-sync-field="objective">${esc(data.objective)}</p>`) : ''}
            ${data.summary ? section('Professional Summary', `<p class="r-summary" data-sync-field="summary">${esc(data.summary)}</p>`) : ''}
            ${section('Experience', renderExperience(data.experience))}
            ${section('Education', renderEducation(data.education))}
            ${section('Skills', renderSkills(data.skills))}
            ${section('Projects', renderProjects(data.projects))}
            ${section('Certifications', renderCertifications(data.certifications))}
            ${section('Achievements', renderAchievements(data.achievements))}
            ${section('Languages', renderLanguages(data.languages))}
        </div>`;
    }

    // =====================
    // TEMPLATE: MODERN (sidebar)
    // =====================
    function renderModern(data) {
        const p = data.personal;
        return `
        <div class="resume-modern">
            <aside class="r-sidebar">
                <h1 class="r-name" data-sync-field="personal.fullName">${esc(p.fullName) || 'Your Name'}</h1>
                ${p.jobTitle ? `<div class="r-job-title" data-sync-field="personal.jobTitle">${esc(p.jobTitle)}</div>` : ''}
                ${section('Contact', contactRow(p))}
                ${section('Skills', renderSkills(data.skills))}
                ${section('Languages', renderLanguages(data.languages))}
                ${section('Certifications', renderCertifications(data.certifications))}
            </aside>
            <main class="r-main">
                ${data.objective ? section('Career Objective', `<p class="r-summary" data-sync-field="objective">${esc(data.objective)}</p>`) : ''}
                ${data.summary ? section('About Me', `<p class="r-summary" data-sync-field="summary">${esc(data.summary)}</p>`) : ''}
                ${section('Experience', renderExperience(data.experience))}
                ${section('Education', renderEducation(data.education))}
                ${section('Projects', renderProjects(data.projects))}
                ${section('Achievements', renderAchievements(data.achievements))}
            </main>
        </div>`;
    }

    // =====================
    // TEMPLATE: ELEGANT (gradient header)
    // =====================
    function renderElegant(data) {
        const p = data.personal;
        return `
        <div class="resume-elegant">
            <header class="r-header">
                <h1 class="r-name" data-sync-field="personal.fullName">${esc(p.fullName) || 'Your Name'}</h1>
                ${p.jobTitle ? `<div class="r-job-title" data-sync-field="personal.jobTitle">${esc(p.jobTitle)}</div>` : ''}
                ${contactRow(p)}
            </header>
            <div class="r-body">
                ${data.objective ? section('Career Objective', `<p class="r-summary" data-sync-field="objective">${esc(data.objective)}</p>`) : ''}
                ${data.summary ? section('Professional Summary', `<p class="r-summary" data-sync-field="summary">${esc(data.summary)}</p>`) : ''}
                ${section('Experience', renderExperience(data.experience))}
                ${section('Education', renderEducation(data.education))}
                ${section('Skills', renderSkills(data.skills))}
                ${section('Projects', renderProjects(data.projects))}
                ${section('Certifications', renderCertifications(data.certifications))}
                ${section('Achievements', renderAchievements(data.achievements))}
                ${section('Languages', renderLanguages(data.languages))}
            </div>
        </div>`;
    }

    // =====================
    // TEMPLATE: ATS OPTIMIZED
    // =====================
    function renderATS(data) {
        const p = data.personal;
        return `
        <div class="resume-ats">
            <header class="r-header">
                <h1 class="r-name" data-sync-field="personal.fullName">${esc(p.fullName) || 'Your Name'}</h1>
                ${p.jobTitle ? `<div class="r-job-title" data-sync-field="personal.jobTitle">${esc(p.jobTitle)}</div>` : ''}
                ${contactRow(p)}
            </header>
            ${data.objective ? section('Career Objective', `<p class="r-summary" data-sync-field="objective">${esc(data.objective)}</p>`) : ''}
            ${data.summary ? section('Summary', `<p class="r-summary" data-sync-field="summary">${esc(data.summary)}</p>`) : ''}
            ${section('Professional Experience', renderExperience(data.experience))}
            ${section('Education', renderEducation(data.education))}
            ${section('Technical Skills', renderSkills(data.skills))}
            ${section('Projects', renderProjects(data.projects))}
            ${section('Certifications', renderCertifications(data.certifications))}
            ${section('Achievements', renderAchievements(data.achievements))}
            ${section('Languages', renderLanguages(data.languages))}
        </div>`;
    }

    // =====================
    // TEMPLATE: DP RESUME
    // =====================
    function renderDP(data) {
        const p = data.personal;

        let contactItems = [];
        if (p.address) contactItems.push(`<span data-sync-field="personal.address">${esc(p.address)}</span>`);
        if (p.phone) contactItems.push(`<span data-sync-field="personal.phone">${esc(p.phone)}</span>`);
        if (p.email) contactItems.push(`<span data-sync-field="personal.email">${esc(p.email)}</span>`);
        const contactLine = contactItems.length ? `<div style="font-size: 9.5pt; color: #333; margin-bottom: 2px;">${contactItems.join('<span style="margin:0 6px;">|</span>')}</div>` : '';

        let linkItems = [];
        if (p.github) linkItems.push(`<a style="color: blue; text-decoration: none;" data-sync-field="personal.github">My_GitHub</a>`);
        if (p.linkedin) linkItems.push(`<a style="color: blue; text-decoration: none;" data-sync-field="personal.linkedin">My_LinkedIn</a>`);
        if (p.portfolio) linkItems.push(`<a style="color: blue; text-decoration: none;" data-sync-field="personal.portfolio">My_Portfolio</a>`);
        const linkLine = linkItems.length ? `<div style="font-size: 9.5pt; font-weight: bold; color: blue;">${linkItems.join('<span style="margin:0 6px;">|</span>')}</div>` : '';

        const dpSection = (title, content) => {
            if (!content || content.trim() === '') return '';
            return `
            <div style="margin-bottom: 12px;">
                <div style="background: #e0e0e0; border-radius: 999px; padding: 4px 14px; margin-bottom: 6px; display: inline-block; width: 100%; box-sizing: border-box;">
                    <h2 style="font-size: 10.5pt; font-weight: 800; font-style: italic; text-transform: uppercase; margin: 0; color: #000;">${title}</h2>
                </div>
                <div style="padding: 0 4px;">
                    ${content}
                </div>
            </div>`;
        };

        const dpSkills = (skills) => {
            if (!skills || !skills.length) return '';
            return skills.map((s, i) => {
                let html = esc(s);
                if (html.includes(':')) {
                    const parts = html.split(':');
                    html = `<span style="font-weight:bold;">${parts[0]}:</span>${parts.slice(1).join(':')}`;
                }
                return `<div style="font-size: 9.5pt; margin-bottom: 4px;" data-sync-field="skills.${i}"><span style="display:inline-block; line-height:1.4;">${html}</span></div>`;
            }).join('');
        };

        const dpProjects = (entries) => {
            if (!entries || !entries.length) return '';
            return entries.map((e, index) => {
                const linkHtml = e.link ? `<a style="text-decoration:none; margin-left: 6px; font-size:11pt;" data-sync-field="projects.${index}.link">&#128279;</a>` : '';
                const typeHtml = e.technologies ? `<span style="font-weight: bold; margin-left: 8px;" data-sync-field="projects.${index}.technologies">( ${esc(e.technologies)} )</span>` : '';
                
                let descHtml = '';
                if (e.description) {
                    const bullets = e.description.split('\n').filter(l => l.trim().length > 0);
                    descHtml = `<ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 9.5pt; line-height: 1.4;">` + 
                               bullets.map(b => `<li style="margin-bottom:2px;" data-sync-field="projects.${index}.description">${esc(b.replace(/^[\s•\-\*]+/, ''))}</li>`).join('') +
                               `</ul>`;
                }

                return `
                <div style="margin-bottom: 10px;">
                    <div style="font-size: 9.5pt; font-weight: bold; text-transform: uppercase;">
                        <span data-sync-field="projects.${index}.name">${esc(e.name)}</span>${linkHtml}${typeHtml}
                    </div>
                    ${descHtml}
                </div>`;
            }).join('');
        };

        const dpEducation = (entries) => {
            if (!entries || !entries.length) return '';
            return entries.map((e, index) => {
                const dateStr = [e.startDate, e.endDate].filter(Boolean).join(' - ') || 'present';
                return `
                <div style="margin-bottom: 8px; font-size: 9.5pt; text-transform: uppercase;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 2px;">
                        <span data-sync-field="education.${index}.degree">${esc(e.degree)}</span>
                        <span style="font-size: 9pt;">${esc(dateStr)}</span>
                    </div>
                    <div data-sync-field="education.${index}.institution">
                        ${esc(e.institution)}
                    </div>
                </div>`;
            }).join('');
        };

        const dpAdditional = () => {
            let parts = [];
            if (data.languages && data.languages.length) {
                const langs = data.languages.map(l => `${esc(l.language).toUpperCase()}`).join(' <span style="margin:0 4px;">|</span> ');
                parts.push(`<div style="font-size: 9.5pt; margin-bottom: 6px; display: flex;"><strong style="white-space:nowrap; margin-right:6px;">LANGUAGE :</strong> <span>${langs}</span></div>`);
            }
            if (data.certifications && data.certifications.length) {
                const certs = data.certifications.map((c, i) => `<span data-sync-field="certifications.${i}.name">${esc(c.name)}</span> [ <span data-sync-field="certifications.${i}.issuer">${esc(c.issuer || 'HackerRank')}</span> ]`).join(' <span style="margin:0 4px;">|</span> ');
                parts.push(`<div style="font-size: 9.5pt; margin-bottom: 6px; display: flex;"><strong style="white-space:nowrap; margin-right:6px;">CERTIFICATES :</strong> <span>${certs}</span></div>`);
            }
            if (data.achievements && data.achievements.length) {
                const acts = data.achievements.map((a, i) => `<span data-sync-field="achievements.${i}.description">${esc(a.description || a.title)}</span>`).join(' <span style="margin:0 4px;">|</span> ');
                parts.push(`<div style="font-size: 9.5pt; margin-bottom: 6px; display: flex;"><strong style="white-space:nowrap; margin-right:6px;">ACTIVITIES :</strong> <span>${acts}</span></div>`);
            }
            return parts.join('');
        };

        return `
        <div class="resume-dp" style="font-family: Arial, Helvetica, sans-serif; color: #111; padding: 10mm; background: #fff; line-height: 1.4;">
            <header style="margin-bottom: 14px;">
                <h1 data-sync-field="personal.fullName" style="font-size: 22pt; font-weight: 800; text-transform: uppercase; margin: 0 0 6px; letter-spacing: -0.5px;">${esc(p.fullName) || 'YOUR NAME'}</h1>
                ${p.jobTitle ? `<div data-sync-field="personal.jobTitle" style="font-size: 10.5pt; font-weight: 800; text-transform: uppercase; margin-bottom: 6px;">${esc(p.jobTitle)}</div>` : ''}
                ${contactLine}
                ${linkLine}
            </header>
            
            ${data.summary ? dpSection('SUMMARY', `<p style="font-size: 9.5pt; margin: 0; line-height: 1.5;" data-sync-field="summary">${esc(data.summary)}</p>`) : ''}
            
            ${dpSection('TECHNICAL SKILLS', dpSkills(data.skills))}
            
            ${dpSection('PROJECTS', dpProjects(data.projects))}
            
            ${dpSection('EDUCATION', dpEducation(data.education))}
            
            ${dpSection('ADDITIONAL INFORMATION', dpAdditional())}
        </div>`;
    }

    /**
     * Render resume HTML based on template name.
     * @param {string} template - Template identifier
     * @param {Object} data - Resume data
     * @returns {string} Full HTML for the resume
     */
    function render(template, data) {
        switch (template) {
            case 'dp':      return renderDP(data);
            case 'modern':  return renderModern(data);
            case 'elegant': return renderElegant(data);
            case 'ats':     return renderATS(data);
            case 'minimal':
            default:        return renderMinimal(data);
        }
    }

    return { render };
})();
