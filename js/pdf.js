const PDFGenerator = (() => {
    /**
     * Generate and download the resume as a PDF file.
     * @param {Object} data - Resume data (for filename generation)
     */
    async function download(data) {
        const previewEl = document.getElementById('resume-preview');
        if (!previewEl) {
            showToast('Preview element not found', 'error');
            return;
        }

        let tempContainer = null;

        // Show loading state
        const downloadBtns = document.querySelectorAll('#btn-download, #btn-download-m');
        downloadBtns.forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>Generating...</span>';
        });
        if (window.lucide) lucide.createIcons();

        try {
            // Clone the preview for PDF generation (to avoid modifying the live preview)
            const clone = previewEl.cloneNode(true);

            // Reset any zoom transforms and remove edit mode artifacts
            clone.contentEditable = 'false';
            clone.style.outline = 'none';
            clone.style.transform = 'none';
            clone.style.width = '210mm';
            clone.style.minHeight = '297mm';
            clone.style.boxShadow = 'none';
            clone.style.margin = '0';
            clone.style.position = 'relative';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.overflow = 'visible';
            clone.style.opacity = '1';
            clone.style.visibility = 'visible';

            // Create a temporary container
            tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.top = '0';
            tempContainer.style.left = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.minHeight = '297mm';
            tempContainer.style.padding = '0';
            tempContainer.style.margin = '0';
            tempContainer.style.background = '#ffffff';
            tempContainer.style.opacity = '0';
            tempContainer.style.pointerEvents = 'none';
            tempContainer.style.zIndex = '-1';
            tempContainer.style.overflow = 'hidden';
            tempContainer.appendChild(clone);
            document.body.appendChild(tempContainer);

            // Give the browser a frame to apply layout before capture.
            await new Promise(resolve => requestAnimationFrame(() => resolve()));

            // Generate filename from name
            const name = data?.personal?.fullName?.trim() || 'Resume';
            const safeName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
            const filename = `${safeName}_Resume.pdf`;

            // html2pdf options for ATS compatibility
            const options = {
                margin: 0,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Generate PDF
            await html2pdf().set(options).from(clone).save();

            showToast('PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error('PDF generation failed:', err);
            showToast('Failed to generate PDF. Please try again.', 'error');
        } finally {
            if (tempContainer?.parentNode) {
                tempContainer.parentNode.removeChild(tempContainer);
            }

            // Restore button state
            downloadBtns.forEach(btn => {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="download"></i><span>Download PDF</span>';
            });
            if (window.lucide) lucide.createIcons();
        }
    }

    /**
     * Show a toast notification.
     * Uses the global showToast from app.js if available.
     */
    function showToast(message, type) {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    return { download };
})();
