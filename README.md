# ResumeForge — Modern Resume Builder

A sleek, modern resume builder web application with a futuristic glassmorphism UI. Build professional, ATS-friendly resumes and download them as clean PDF files — all from your browser.

![ResumeForge](https://img.shields.io/badge/ResumeForge-Resume%20Builder-6366f1?style=for-the-badge)

##  Features

- **Step-by-Step Form Wizard** — Guided 9-step resume creation process
- **Live Preview** — See your resume update in real-time as you type
- **4 ATS-Friendly Templates** — Minimal, Modern, Elegant, and ATS Optimized
- **PDF Download** — One-click export to a clean, printable PDF
- **Dark & Light Mode** — Switch between gorgeous dark and light themes
- **Local Storage** — Automatically save and load your resume data
- **Drag & Drop** — Reorder sections by dragging entry cards
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Smooth Animations** — Modern micro-animations and transitions

##  Resume Sections

1. **Personal Information** — Name, email, phone, address, LinkedIn, portfolio, GitHub
2. **Professional Summary** — Brief career overview
3. **Work Experience** — Multiple entries with company, role, dates, descriptions
4. **Education** — Degrees, institutions, GPA
5. **Skills** — Tag-based skill input
6. **Projects** — Portfolio projects with links and descriptions
7. **Certifications** — Professional certifications
8. **Achievements** — Key accomplishments
9. **Languages** — Languages spoken with proficiency levels

##  Templates

| Template | Description |
|----------|-------------|
| **Minimal** | Clean, centered layout with elegant typography |
| **Modern** | Two-column layout with dark sidebar |
| **Elegant** | Gradient header with professional styling |
| **ATS** | Plain text optimized for applicant tracking systems |

##  Getting Started

### Quick Start

1. Simply open `index.html` in your modern web browser
2. Start filling in your details in the form
3. Watch the live preview update in real-time
4. Choose a template that fits your style
5. Click **Download PDF** to save your resume

### No Installation Required

This is a pure HTML/CSS/JavaScript application. No npm, Node.js, or build tools needed.

> **Note:** An internet connection is required on first load to fetch Google Fonts, Lucide Icons, and the html2pdf.js library from CDN.

##  Project Structure

```
Resume Builder/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Core styles, themes, layout
│   ├── animations.css      # Keyframes & micro-animations
│   └── templates.css       # Resume template styles
├── js/
│   ├── app.js              # Main app initialization
│   ├── form.js             # Form management & validation
│   ├── preview.js          # Live preview rendering
│   ├── templates.js        # Template HTML generators
│   ├── pdf.js              # PDF generation logic
│   └── storage.js          # Local storage management
└── README.md               # This file
```

##  Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save resume to browser storage |

##  Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, glassmorphism, responsive grid
- **Vanilla JavaScript** — Modular IIFE pattern
- **Google Fonts** — Inter typeface
- **Lucide Icons** — Modern icon library
- **html2pdf.js** — PDF generation from HTML

