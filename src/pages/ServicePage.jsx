import React, { useState, useEffect } from 'react';
import { Plus, Check, DollarSign, X, Bike, User, FileText, Clock, Trash2, Edit, Wrench, ChevronLeft, ChevronRight, Calendar, Printer } from 'lucide-react';
import ServiceQueueList from '../components/service/ServiceQueueList';
import ServiceProcessForm from '../components/service/ServiceProcessForm';
import ServiceEntryForm from '../components/service/ServiceEntryForm';
import ServiceInvoice from '../components/service/ServiceInvoice';
import { api } from '../services/api';
import { formatSPK } from '../utils/printHelpers';
import { showPrintStatus } from '../utils/printUtils';

export default function ServicePage() {
    // Helper for robust local date (YYYY-MM-DD)
    const getLocalDate = (d = new Date()) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [activeTab, setActiveTab] = useState('queue'); // queue, process, completed, paid
    const [queue, setQueue] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    // -- Settings State -- (Moved up for grouping)
    const [settings, setSettings] = useState({});

    // DEBUG PREVIEW STATE (Temporary)
    const [previewText, setPreviewText] = useState(null);
    const [previewData, setPreviewData] = useState(null); // To store item needed for actual print if confirmed
    const [selectedService, setSelectedService] = useState(null);
    const [showEntryForm, setShowEntryForm] = useState(false);

    // Edit Mode State
    const [editingQueueId, setEditingQueueId] = useState(null);

    // New State for Detail Modal
    const [selectedQueueItem, setSelectedQueueItem] = useState(null);

    // -- Payment Modal State --
    const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);
    const [selectedMechanic, setSelectedMechanic] = useState('');
    const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);

    // -- Filter State --
    const [filterDate, setFilterDate] = useState(getLocalDate());

    // -- Data Fetching --
    const fetchData = async () => {
        try {
            const [qData, mData] = await Promise.all([api.getQueue(), api.getMechanics()]);
            setQueue(qData);
            setMechanics(mData);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const data = await api.getSettings();
            setSettings(data || {});
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchSettings();
        // Poll every 5 seconds for updates from other clients
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // -- Actions --
    const handleSelectService = (service) => {
        // If it's already in progress, go straight to process
        if (service.status === 'In Progress') {
            setSelectedService(service);
            setActiveTab('process');
        } else {
            // Show detail modal first
            setSelectedQueueItem(service);
        }
    };

    const handleStartWork = async (service) => {
        await api.updateJob(service.id, { ...service, status: 'In Progress' });
        fetchData();
        setSelectedQueueItem(null);
        setSelectedService({ ...service, status: 'In Progress' }); // Local optim update
        setActiveTab('process');
    };

    const handleDeleteQueue = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus antrian ini?')) {
            await api.deleteJob(id);
            fetchData();
            setSelectedQueueItem(null);
        }
    };

    const handleEditQueue = (service) => {
        setEditingQueueId(service.id);
        setShowEntryForm(true); // Re-use entry form
        setSelectedQueueItem(null); // Close popup
    };

    const handleCreateOrUpdateQueue = async (formData) => {
        if (editingQueueId) {
            // UPDATE EXISTING
            // We need to fetch the existing item first or just merge
            const currentItem = queue.find(q => q.id === editingQueueId);
            const updatedItem = {
                ...currentItem,
                ...formData,
                plateNumber: formData.plateNumber.toUpperCase(),
            };

            await api.updateJob(editingQueueId, updatedItem);
            alert('Data Antrian Berhasil Diperbarui!');
        } else {
            // CREATE NEW
            const selectedDate = formData.date || getLocalDate();
            const sameDayQueue = queue.filter(q => q.date === selectedDate);
            const lastQueueNum = sameDayQueue.length > 0 ? Math.max(...sameDayQueue.map(q => Number(q.queueNumber) || 0)) : 0;
            const newQueueNumber = lastQueueNum + 1;

            const newQueueItem = {
                queueNumber: newQueueNumber,
                date: selectedDate,
                customerName: formData.customerName,
                bikeModel: formData.bikeModel,
                plateNumber: formData.plateNumber.toUpperCase(),
                status: 'Pending',
                mechanicId: null,
                entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                serviceType: 'Pemeriksaan Awal',
                complaint: formData.complaint,
                items: formData.items || [],
                // Extra Data
                address: formData.address,
                phoneNumber: formData.phoneNumber,
                frameNumber: formData.frameNumber,
                engineNumber: formData.engineNumber,
                kilometer: formData.kilometer
            };

            await api.createJob(newQueueItem);
            alert(`Antrian Berhasil Dibuat!\nNomor Antrian: #${newQueueNumber}`);
        }

        fetchData();
        setEditingQueueId(null);
        setShowEntryForm(false);
        setActiveTab('queue');
    };

    const handleSaveService = async (updatedService) => {
        console.log('[DEBUG] handleSaveService called with:', updatedService);
        try {
            const result = await api.updateJob(updatedService.id, { ...updatedService, status: 'Done' });
            console.log('[DEBUG] API result:', result);

            // Fallback check in case api.js is cached and doesn't throw
            if (result && result.error) {
                console.log('[DEBUG] Result contains error, throwing...');
                throw new Error(result.error);
            }

            console.log('[DEBUG] Success! Showing success alert...');
            fetchData();
            setSelectedService(null);
            setActiveTab('completed');
            alert(`✅ Pengerjaan Selesai!\nSilahkan lanjut ke pembayaran.`);
        } catch (err) {
            console.error("[DEBUG] CAUGHT ERROR:", err);
            // Tampilkan pesan error yang lebih user friendly
            const msg = err.message || "Terjadi kesalahan sistem";
            alert('❌ GAGAL MENYELESAIKAN SERVIS:\n\n' + msg);
        }
    };

    const handleOpenPaymentModal = (service) => {
        setSelectedPaymentItem(service);
        setSelectedMechanic(service.mechanicId || '');
    };

    const handleConfirmPayment = async () => {
        if (!selectedMechanic) {
            alert('Silahkan pilih mekanik terlebih dahulu!');
            return;
        }

        const updatedItem = {
            ...selectedPaymentItem,
            status: 'Paid',
            mechanicId: selectedMechanic,
            date: selectedPaymentItem.date, // Keep original registration date for reporting
            payment_date: getLocalDate() // Explicitly set payment date to today
        };

        await api.updateJob(selectedPaymentItem.id, updatedItem);
        fetchData();
        setSelectedPaymentItem(null);
        alert('Pembayaran Berhasil! Masuk ke Riwayat.');
    };


    const handleCancelService = () => {
        setSelectedService(null);
        setActiveTab('queue');
    };

    const handleRevertToQueue = async (service) => {
        if (confirm(`Kembalikan ${service.plateNumber} ke daftar antrian?`)) {
            await api.updateJob(service.id, { ...service, status: 'Pending' });
            fetchData();
            setSelectedService(null);
            setActiveTab('queue');
        }
    };

    const handleUpdateProgress = async (updatedService) => {
        // We can choose to save to server immediately or just local state.
        // For robustness in multi-user, auto-save is better.
        await api.updateJob(updatedService.id, updatedService);
        // We don't necessarily need to re-fetch whole queue for this, 
        // effectively 'updatedService' IS the optimization.
        // But to keep sync:
        fetchData();
    };

    const handlePrintWorkOrder = async (originalItem) => {
        // Fetch latest settings to avoid stale state
        let currentSettings = settings;
        try {
            currentSettings = await api.getSettings();
            setSettings(currentSettings);
        } catch (e) { console.error("Failed to refresh settings", e); }

        // Network Print Check (With Debug Preview)
        const targetPrinter = currentSettings.printer_name || 'EPSON';

        try {
            const textContent = formatSPK(originalItem, currentSettings);
            // INSTEAD OF PRINTING, SHOW PREVIEW
            setPreviewText(textContent);
            setPreviewData({ text: textContent, printer: targetPrinter });
        } catch (e) {
            alert('Gagal format: ' + e.message);
        }
    };

    // Function to execute print after preview
    const executePrint = async () => {
        if (!previewData) return;

        try {
            // Show loading notification
            showPrintStatus('info', 'Mengirim print job ke server...');

            // Send to server
            const result = await api.printJob(previewData.text);

            // Check if server responded with error
            if (result && result.error) {
                throw new Error(result.error);
            }

            // Success notification
            showPrintStatus('success', `Print job berhasil dikirim ke printer ${previewData.printer}!`);

            setPreviewText(null);
            setPreviewData(null);

        } catch (e) {
            console.error('Print error:', e);

            // Determine error type and show appropriate message
            let errorMessage = e.message || 'Unknown error';
            let errorTitle = 'Gagal Mencetak';
            let suggestions = [];

            // Check for specific error types
            if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Network')) {
                errorTitle = 'Server Tidak Terhubung';
                suggestions = [
                    'Pastikan server backend berjalan',
                    'Periksa koneksi jaringan',
                    'Restart server jika diperlukan'
                ];
            } else if (errorMessage.includes('printer') || errorMessage.includes('PRINTER')) {
                errorTitle = 'Printer Tidak Tersedia';
                suggestions = [
                    'Pastikan printer dalam keadaan menyala (power ON)',
                    'Periksa koneksi kabel printer ke server',
                    'Pastikan printer tidak sedang error atau paper jam',
                    'Cek apakah printer terdeteksi di sistem',
                    'Restart printer dan coba lagi'
                ];
            } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
                errorTitle = 'Printer Tidak Merespon';
                suggestions = [
                    'Printer mungkin sedang offline atau mati',
                    'Periksa status printer di komputer server',
                    'Pastikan printer tidak sedang digunakan aplikasi lain',
                    'Coba restart printer'
                ];
            }

            // Build detailed error message
            const detailedMessage = `
❌ ${errorTitle}

Error: ${errorMessage}

Kemungkinan Penyebab:
${suggestions.map(s => `• ${s}`).join('\n')}

Solusi:
1. Periksa status printer di komputer server
2. Pastikan printer menyala dan terhubung
3. Restart printer jika diperlukan
4. Hubungi IT support jika masalah berlanjut

Apakah Anda ingin mencoba lagi?
            `.trim();

            // Show error notification
            showPrintStatus('error', errorTitle + ': ' + errorMessage);

            // Ask user if they want to retry
            if (confirm(detailedMessage)) {
                // Retry print
                executePrint();
            } else {
                // Close preview
                setPreviewText(null);
                setPreviewData(null);
            }
        }
    };

    // Function for local browser print (direct to client printer)
    const handlePrintLocal = () => {
        if (!previewText) return;

        // Create print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('Popup diblokir! Izinkan popup untuk print lokal.');
            return;
        }

        // Write content to print window with LANDSCAPE orientation (same as server)
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print SPK</title>
                <meta charset="UTF-8">
                <style>
                    /* Page Setup - K2 Half Page LANDSCAPE (same as server) */
                    @page {
                        size: 11in 8.5in landscape;
                        margin: 0.3in 0.4in 0.25in 0.3in;
                    }
                    
                    /* Body - Optimized for Dot Matrix LANDSCAPE */
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: "Courier New", Courier, monospace;
                        font-size: 10pt;
                        line-height: 1.1;
                        white-space: pre;
                        color: #000;
                        background: #fff;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    /* Print Media - Force exact rendering */
                    @media print {
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color: #000 !important;
                        }
                        
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            font-size: 10pt !important;
                            line-height: 1.1 !important;
                        }
                        
                        /* Remove browser defaults */
                        html, body {
                            width: 100%;
                            height: 100%;
                        }
                        
                        /* Prevent page breaks */
                        * {
                            page-break-inside: avoid;
                        }
                    }
                    
                    /* Screen Preview */
                    @media screen {
                        body {
                            padding: 0.5in;
                            background: #f0f0f0;
                        }
                        
                        body::before {
                            content: "Preview - Ukuran kertas: K2 Landscape (11in x 8.5in)";
                            display: block;
                            background: #333;
                            color: #fff;
                            padding: 0.5rem;
                            margin: -0.5in -0.5in 0.5in -0.5in;
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                        }
                    }
                </style>
            </head>
            <body>${previewText}</body>
            </html>
        `);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            // Small delay to ensure fonts are loaded
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();

                // Close after print dialog closes
                printWindow.onafterprint = () => {
                    setTimeout(() => {
                        printWindow.close();
                    }, 500);
                };
            }, 250);
        };

        // Close preview
        setPreviewText(null);
        setPreviewData(null);

        // Show notification
        showPrintStatus('info', 'Browser print dialog dibuka. Pastikan pilih ukuran kertas K2 Landscape (11" x 8.5").');
    };

    const handleCancelPayment = async (service) => {
        if (confirm(`Batalkan pembayaran untuk ${service.plateNumber}? Status akan kembali ke Selesai.`)) {
            // Updated: Set payment_date to null to remove from reports
            await api.updateJob(service.id, {
                ...service,
                status: 'Done',
                payment_date: null
            });
            fetchData();
        }
    };

    const handleRevertToProcess = async (service) => {
        if (confirm(`Kembalikan ${service.plateNumber} ke menu Proses?`)) {
            await api.updateJob(service.id, {
                ...service,
                status: 'In Progress',
                payment_date: null // Ensure payment date is cleared if reverting
            });
            fetchData();
            setActiveTab('process');
        }
    };

    // -- Render Form Overlay --
    if (showEntryForm) {
        // Find initial data if editing
        const initialData = editingQueueId ? queue.find(q => q.id === editingQueueId) : null;

        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <ServiceEntryForm
                    initialData={initialData}
                    onSave={handleCreateOrUpdateQueue}
                    onCancel={() => { setShowEntryForm(false); setEditingQueueId(null); }}
                />
            </div>
        );
    }

    // -- MAIN RENDER --
    return (
        <div className="service-page-container">

            {/* PAYMENT MODAL */}
            {selectedPaymentItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 200,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Pembayaran Servis</h2>
                            <button onClick={() => setSelectedPaymentItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            {/* Read Only Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nopol</label>
                                    <div className="input" style={{ backgroundColor: 'var(--bg-dark)', border: 'none' }}>{selectedPaymentItem.plateNumber}</div>
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pemilik</label>
                                    <div className="input" style={{ backgroundColor: 'var(--bg-dark)', border: 'none' }}>{selectedPaymentItem.customerName}</div>
                                </div>
                            </div>
                            <div className="input-group">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Motor</label>
                                <div className="input" style={{ backgroundColor: 'var(--bg-dark)', border: 'none' }}>{selectedPaymentItem.bikeModel}</div>
                            </div>

                            {/* Mechanic Selection */}
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mekanik <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <select className="input" value={selectedMechanic} onChange={(e) => setSelectedMechanic(parseInt(e.target.value))}>
                                    <option value="">-- Pilih Mekanik --</option>
                                    {mechanics
                                        .filter(m => !m.role || m.role === 'Mekanik')
                                        .map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))
                                    }
                                </select>
                            </div>


                            {/* Total */}
                            <div style={{ textAlign: 'right', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>Total Pembayaran:</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                    Rp {selectedPaymentItem.items.reduce((s, x) => {
                                        // Item gratis tidak dihitung (customer bayar 0)
                                        if (x.isFreeVoucher) return s;
                                        // Item normal: (price - discount) * quantity
                                        return s + ((x.price - (x.discount || 0)) * x.q);
                                    }, 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setSelectedPaymentItem(null)}>Batal</button>
                            <button className="btn btn-success" onClick={handleConfirmPayment}>
                                <DollarSign size={18} /> Bayar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DEBUG PREVIEW OVERLAY */}
            {previewText && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: '#333', padding: '1rem', borderRadius: '8px',
                        width: 'auto', maxWidth: '95vw', display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#fff' }}>
                            <h3 style={{ margin: 0 }}>Preview K2 (Half Page)</h3>
                            <button onClick={() => setPreviewText(null)} style={{ border: 'none', background: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Kertas K2 Simulation Area */}
                        <div style={{
                            width: '9.5in', // Physical width simulation
                            maxWidth: '100%', // Responsive
                            height: '5.5in', // Physical height simulation (K2)
                            backgroundColor: '#fff', // Paper White
                            color: '#000', // Ink Black
                            padding: '0.2in', // Paper Margin
                            fontFamily: '"Courier New", Courier, monospace',
                            whiteSpace: 'pre',
                            fontSize: '12px', // Adjustable for viewing
                            overflow: 'auto',
                            border: '1px solid #ccc',
                            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                        }}>
                            {previewText}
                        </div>

                        <div style={{ marginTop: '1rem', width: '100%', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }} onClick={() => setPreviewText(null)}>Batal</button>
                            <button
                                className="btn btn-outline"
                                style={{
                                    borderColor: '#10b981',
                                    color: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onClick={handlePrintLocal}
                                title="Print langsung ke printer lokal/network"
                            >
                                <Printer size={18} /> Print Lokal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={executePrint}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Printer size={18} /> Cetak ke Server ({previewData?.printer})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal Overlay */}
            {selectedQueueItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Detail Antrian #{selectedQueueItem.queueNumber}</h2>
                            <button onClick={() => setSelectedQueueItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Kendaraan</label>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedQueueItem.plateNumber}</div>
                                <div>{selectedQueueItem.bikeModel} {selectedQueueItem.kilometer ? `(KM: ${selectedQueueItem.kilometer})` : ''}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pelanggan</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> {selectedQueueItem.customerName}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedQueueItem.phoneNumber}</div>
                                </div>
                                <div className="input-group">
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Waktu Masuk</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {selectedQueueItem.entryTime}</div>
                                </div>
                            </div>

                            <div className="input-group" style={{ backgroundColor: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} /> Keluhan / Catatan</label>
                                <div style={{ marginTop: '0.5rem' }}>{selectedQueueItem.complaint || '-'}</div>
                            </div>

                            {/* Estimation Summary in Popup */}
                            {selectedQueueItem.items && selectedQueueItem.items.length > 0 && (
                                <div className="input-group" style={{ backgroundColor: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16} /> Estimasi Awal</label>
                                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                                        Rp {selectedQueueItem.items.reduce((s, x) => s + ((x.price - (x.discount || 0)) * x.q), 0).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            {/* Left: Destructive Actions */}
                            <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeleteQueue(selectedQueueItem.id)}>
                                <Trash2 size={18} /> <span className="hide-mobile">Hapus</span>
                            </button>

                            {/* Right: Primary Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                                <button className="btn btn-outline" onClick={() => handlePrintWorkOrder(selectedQueueItem)}>
                                    <Printer size={18} /> <span className="hide-mobile">Cetak</span>
                                </button>
                                <button className="btn btn-outline" onClick={() => handleEditQueue(selectedQueueItem)}>
                                    <Edit size={18} /> <span className="hide-mobile">Edit</span>
                                </button>
                                <button className="btn btn-primary" onClick={() => handleStartWork(selectedQueueItem)}>
                                    Lanjut
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Global Filter */}
            <div className="service-header-wrapper">
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Layanan Servis</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Kelola antrian dan pengerjaan servis motor.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => {
                            const d = new Date(filterDate);
                            d.setDate(d.getDate() - 1);
                            setFilterDate(getLocalDate(d));
                        }}>
                            <ChevronLeft size={18} />
                        </button>

                        <div
                            onClick={() => document.getElementById('service-date-filter').showPicker()}
                            style={{ position: 'relative', minWidth: '150px', textAlign: 'center', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                <Calendar size={16} />
                                <span>{new Date(filterDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <input
                                id="service-date-filter"
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                style={{
                                    position: 'absolute', opacity: 0, pointerEvents: 'none', bottom: 0, left: '50%', width: 0, height: 0
                                }}
                            />
                        </div>

                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => {
                            const d = new Date(filterDate);
                            d.setDate(d.getDate() + 1);
                            setFilterDate(getLocalDate(d));
                        }}>
                            <ChevronRight size={18} />
                        </button>

                        {filterDate !== getLocalDate() && (
                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setFilterDate(getLocalDate())}>
                                Hari Ini
                            </button>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditingQueueId(null); setShowEntryForm(true); }}>
                        <Plus size={18} /> <span className="hide-mobile">Antrian Baru</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem', flexShrink: 0 }}>
                <button
                    className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('queue')}
                >
                    Antrian ({queue.filter(i => ['Pending', 'Waiting'].includes(i.status) && i.date === filterDate).length})
                </button>
                <button
                    className={`btn ${activeTab === 'process' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('process')}
                >
                    Proses ({queue.filter(i => i.status === 'In Progress' && i.date === filterDate).length})
                </button>
                <button
                    className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('completed')}
                >
                    Selesai ({queue.filter(i => i.status === 'Done' && i.date === filterDate).length})
                </button>
                <button
                    className={`btn ${activeTab === 'paid' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('paid')}
                >
                    Sudah Bayar ({queue.filter(i => i.status === 'Paid' && (i.payment_date || i.date) === filterDate).length})
                </button>
            </div>

            {/* Content Scrollable Container */}
            <div style={{ flex: 1, overflow: 'hidden', paddingRight: '0.5rem', paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                {/* Content with Filter Applied */}
                {activeTab === 'queue' && (
                    <ServiceQueueList
                        queue={queue.filter(i => ['Pending', 'Waiting'].includes(i.status) && i.date === filterDate)}
                        onSelect={handleSelectService}
                    />
                )}

                {activeTab === 'process' && (
                    <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
                        {selectedService ? (
                            <ServiceProcessForm
                                service={selectedService}
                                onSave={handleSaveService}
                                onUpdateProgress={handleUpdateProgress}
                                onCancel={handleCancelService}
                                onRevert={handleRevertToQueue}
                            />
                        ) : (
                            // List of 'In Progress' for resuming work
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <h3 className="text-muted">Sedang Dikerjakan ({filterDate}):</h3>
                                {queue.filter(i => i.status === 'In Progress' && i.date === filterDate).length === 0 && <p className="text-muted">Tidak ada unit sedang dikerjakan pada tanggal ini.</p>}

                                {queue.filter(i => i.status === 'In Progress' && i.date === filterDate).map((item) => {
                                    const mechanic = mechanics.find(m => m.id === parseInt(item.mechanicId));
                                    return (
                                        <div
                                            key={item.id}
                                            className="card"
                                            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.1s' }}
                                            onClick={() => handleSelectService(item)}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div>
                                                <h3>#{item.queueNumber} - {item.plateNumber}</h3>
                                                <p className="text-muted">{item.bikeModel}</p>
                                                {mechanic && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                                        <Wrench size={14} /> Mekanik: {mechanic.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className="text-muted" style={{ fontSize: '0.9rem', marginRight: '1rem' }}>Klik untuk lanjut</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'completed' && (
                    <div className="no-scrollbar" style={{ display: 'grid', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {queue.filter(i => i.status === 'Done' && i.date === filterDate).length === 0 && (
                            <div className="card text-center" style={{ padding: '2rem' }}>
                                <p className="text-muted">Belum ada servis selesai pada tanggal {filterDate.split('-').reverse().join('/')}.</p>
                            </div>
                        )}

                        {queue.filter(i => i.status === 'Done' && i.date === filterDate).map((item) => (
                            <div key={item.id} className="card" onClick={() => setSelectedInvoiceItem(item)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                <div>
                                    <h3>#{item.queueNumber} - {item.plateNumber} ({item.customerName})</h3>
                                    <p className="text-muted">Total: Rp {item.items.reduce((s, x) => {
                                        // Item gratis tidak dihitung (customer bayar 0)
                                        if (x.isFreeVoucher) return s;
                                        // Item normal: (price - discount) * quantity
                                        return s + ((x.price - (x.discount || 0)) * x.q);
                                    }, 0).toLocaleString()}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Batalkan Selesai & Kembali ke Proses" onClick={(e) => { e.stopPropagation(); handleRevertToProcess(item); }}>
                                        <Trash2 size={16} />
                                    </button>
                                    <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); handleOpenPaymentModal(item); }}>
                                        <DollarSign size={18} /> Bayar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'paid' && (() => {
                    const paidItems = queue.filter(i => i.status === 'Paid' && (i.payment_date || i.date) === filterDate);

                    return (
                        <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                            {paidItems.length === 0 ? (
                                <div className="card text-center" style={{ padding: '2rem' }}>
                                    <p className="text-muted">Tidak ada riwayat pembayaran pada tanggal {filterDate.split('-').reverse().join('/')}.</p>
                                </div>
                            ) : (
                                paidItems.map((item) => {
                                    const itemTotal = item.items.reduce((s, x) => {
                                        if (x.isFreeVoucher) return s;
                                        return s + ((x.price - (x.discount || 0)) * x.q);
                                    }, 0);

                                    return (
                                        <div key={item.id} className="card" onClick={() => setSelectedInvoiceItem(item)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                            <div>
                                                <h3>#{item.queueNumber} - {item.plateNumber}</h3>
                                                <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>LUNAS</span>
                                                    <span>• {item.customerName}</span>
                                                    <span>• Rp {itemTotal.toLocaleString('id-ID')}</span>
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div className="badge badge-success"><Check size={14} /> Selesai</div>
                                                <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Batalkan Bayar & Kembali ke Selesai" onClick={(e) => { e.stopPropagation(); handleCancelPayment(item); }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* INVOICE MODAL - MOVED OUTSIDE TABS TO WORK FOR BOTH COMPLETED AND PAID */}
            {selectedInvoiceItem && (
                <ServiceInvoice
                    service={selectedInvoiceItem}
                    onClose={() => setSelectedInvoiceItem(null)}
                />
            )}
        </div>
    );
}
