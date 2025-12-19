/**
 * Print Utility with Printer Status Detection
 * Provides feedback when printer is offline or not available
 */

/**
 * Check if printer is available and print
 * @param {Window} printWindow - The window to print
 * @param {Function} onSuccess - Callback when print is successful
 * @param {Function} onError - Callback when print fails
 * @param {Function} onCancel - Callback when user cancels print
 */
export const safePrint = async (printWindow, { onSuccess, onError, onCancel } = {}) => {
    try {
        // Check if print window is valid
        if (!printWindow || printWindow.closed) {
            throw new Error('Print window tidak tersedia');
        }

        // Set up print event listeners
        const mediaQueryList = printWindow.matchMedia('print');
        let printStarted = false;
        let printCompleted = false;

        // Listen for beforeprint event
        printWindow.addEventListener('beforeprint', () => {
            printStarted = true;
            console.log('🖨️ Print dialog opened');
        });

        // Listen for afterprint event
        printWindow.addEventListener('afterprint', () => {
            printCompleted = true;
            console.log('✅ Print dialog closed');

            if (printStarted) {
                // User either printed or cancelled
                // We can't distinguish between success and cancel in browser
                if (onSuccess) onSuccess();
            }
        });

        // Trigger print
        printWindow.print();

        // Wait a bit to see if print dialog opens
        await new Promise(resolve => setTimeout(resolve, 1000));

        // If print didn't start, likely printer issue
        if (!printStarted && !printCompleted) {
            throw new Error('Printer tidak merespon. Pastikan printer terhubung dan menyala.');
        }

    } catch (error) {
        console.error('❌ Print error:', error);
        if (onError) {
            onError(error);
        } else {
            // Default error handling
            alert(`Gagal mencetak!\n\n${error.message}\n\nPastikan:\n- Printer terhubung ke komputer\n- Printer dalam keadaan menyala\n- Driver printer terinstall dengan benar`);
        }
    }
};

/**
 * Print with automatic printer status check
 * @param {string} content - HTML content to print
 * @param {string} title - Document title
 * @param {Object} options - Print options
 */
export const printDocument = (content, title = 'Print', options = {}) => {
    const {
        onSuccess,
        onError,
        onCancel,
        styles = '',
        width = '800',
        height = '600'
    } = options;

    try {
        // Create print window
        const printWindow = window.open('', '_blank', `width=${width},height=${height}`);

        if (!printWindow) {
            throw new Error('Popup diblokir oleh browser. Izinkan popup untuk mencetak.');
        }

        // Write content
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    ${styles}
                    @media print {
                        @page { margin: 0; }
                        body { margin: 0; padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();

        // Wait for content to load
        printWindow.onload = () => {
            // Use safePrint with error handling
            safePrint(printWindow, { onSuccess, onError, onCancel });
        };

    } catch (error) {
        console.error('❌ Print document error:', error);
        if (onError) {
            onError(error);
        } else {
            alert(`Gagal membuka jendela cetak!\n\n${error.message}`);
        }
    }
};

/**
 * Check printer availability (browser limitation: can't directly check)
 * This provides user guidance instead
 */
export const showPrinterCheckDialog = () => {
    const message = `
Sebelum mencetak, pastikan:

✅ Printer terhubung ke komputer
✅ Printer dalam keadaan menyala (power ON)
✅ Kabel printer terpasang dengan baik
✅ Driver printer sudah terinstall
✅ Kertas tersedia di printer

Lanjutkan cetak?
    `.trim();

    return confirm(message);
};

/**
 * Enhanced print with pre-check
 * @param {string} content - HTML content
 * @param {string} title - Document title
 * @param {Object} options - Options
 */
export const printWithCheck = (content, title, options = {}) => {
    // Show printer check dialog
    if (!showPrinterCheckDialog()) {
        console.log('Print cancelled by user');
        if (options.onCancel) options.onCancel();
        return;
    }

    // Proceed with print
    printDocument(content, title, {
        ...options,
        onError: (error) => {
            // Enhanced error message
            const errorMessage = `
❌ GAGAL MENCETAK!

Error: ${error.message}

Kemungkinan penyebab:
• Printer tidak terhubung atau mati
• Driver printer bermasalah
• Kabel printer terlepas
• Printer sedang digunakan aplikasi lain

Solusi:
1. Periksa koneksi printer
2. Pastikan printer menyala
3. Restart printer
4. Coba cetak ulang

Hubungi IT support jika masalah berlanjut.
            `.trim();

            alert(errorMessage);

            if (options.onError) options.onError(error);
        }
    });
};

/**
 * Print status notification
 */
export const showPrintStatus = (status, message) => {
    const statusConfig = {
        success: {
            icon: '✅',
            title: 'Berhasil',
            color: '#10b981'
        },
        error: {
            icon: '❌',
            title: 'Gagal',
            color: '#ef4444'
        },
        warning: {
            icon: '⚠️',
            title: 'Peringatan',
            color: '#f59e0b'
        },
        info: {
            icon: 'ℹ️',
            title: 'Informasi',
            color: '#3b82f6'
        }
    };

    const config = statusConfig[status] || statusConfig.info;

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-left: 4px solid ${config.color};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">${config.icon}</span>
            <div>
                <div style="font-weight: bold; margin-bottom: 0.25rem; color: ${config.color};">
                    ${config.title}
                </div>
                <div style="font-size: 0.9rem; color: #6b7280;">
                    ${message}
                </div>
            </div>
        </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

export default {
    safePrint,
    printDocument,
    printWithCheck,
    showPrinterCheckDialog,
    showPrintStatus
};
