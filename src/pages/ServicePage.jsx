import React, { useState, useEffect } from 'react';
import { Plus, Check, DollarSign, X, Bike, User, FileText, Clock, Trash2, Edit, Wrench, ChevronLeft, ChevronRight, Calendar, Printer } from 'lucide-react';
import ServiceQueueList from '../components/service/ServiceQueueList';
import ServiceProcessForm from '../components/service/ServiceProcessForm';
import ServiceEntryForm from '../components/service/ServiceEntryForm';
import ServiceInvoice from '../components/service/ServiceInvoice';
import { api } from '../services/api';

export default function ServicePage() {
    const [activeTab, setActiveTab] = useState('queue'); // queue, process, completed, paid
    const [queue, setQueue] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
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
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    // -- Settings State --
    const [settings, setSettings] = useState({});

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
            const today = new Date().toISOString().split('T')[0];
            const todaysQueue = queue.filter(q => q.date === today);
            const lastQueueNum = todaysQueue.length > 0 ? Math.max(...todaysQueue.map(q => q.queueNumber || 0)) : 0;
            const newQueueNumber = lastQueueNum + 1;

            const newQueueItem = {
                queueNumber: newQueueNumber,
                date: today,
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
            mechanicId: selectedMechanic
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
        let history = null;
        try {
            history = await api.getCustomerLastVisit(originalItem.plateNumber, originalItem.id);
        } catch (e) {
            console.error("Failed fetching history", e);
        }

        const queueItem = {
            ...originalItem,
            lastVisit: history?.date,
            lastMechanic: history?.mechanicName
        };

        const printWindow = window.open('', '_blank');

        // Pisahkan items menjadi Jasa dan Part
        const jasaItems = queueItem.items?.filter(item => item.type === 'Service') || [];
        const partItems = queueItem.items?.filter(item => item.type === 'Part') || [];

        const jasaHtml = jasaItems.length > 0
            ? jasaItems.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center">${item.q}</td>
                    <td style="text-align: right">Rp ${(item.price || 0).toLocaleString()}</td>
                    <td style="text-align: right">Rp ${((item.price || 0) * item.q).toLocaleString()}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="4" style="text-align: center;">-</td></tr>';

        const partHtml = partItems.length > 0
            ? partItems.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center">${item.q} ${item.unit || 'pcs'}</td>
                    <td style="text-align: right">Rp ${(item.price || 0).toLocaleString()}</td>
                    <td style="text-align: right">Rp ${((item.price || 0) * item.q).toLocaleString()}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="4" style="text-align: center;">-</td></tr>';

        // Tambahkan baris kosong untuk jasa tambahan
        const jasaEmptyRows = `
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
        `;

        // Tambahkan baris kosong untuk part tambahan
        const partEmptyRows = `
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
            <tr style="height: 30px;"><td>&nbsp;</td><td></td><td></td><td></td></tr>
        `;

        const totalJasa = jasaItems.reduce((s, x) => s + (x.price * x.q), 0);
        const totalPart = partItems.reduce((s, x) => s + (x.price * x.q), 0);
        const totalEstimasi = totalJasa + totalPart;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Perintah Kerja #${queueItem.queueNumber}</title>
                <style>
                    @page {
                        size: 8.5in 5.5in landscape; 
                        margin: 0; 
                    }
                    body { 
                        font-family: 'Courier New', 'Courier', monospace; 
                        font-size: 10pt; /* Turunkan sedikit dari 11pt agar muat */
                        font-weight: bold; 
                        line-height: 1.05;
                        margin: 0;
                        padding: 0.25in 0.4in 0.1in 0.4in; /* Compact Padding */
                        color: #000 !important;
                        max-width: 8.3in; 
                        max-height: 5.3in;
                        -webkit-print-color-adjust: exact; 
                        text-rendering: geometricPrecision; 
                    }
                    * { text-shadow: none !important; }
                    
                    /* Compact Header Styles */
                    .header-bengkel { font-size: 12pt; font-weight: bold; text-align: center; margin-bottom: 0px; }
                    .header-phone { font-size: 9pt; text-align: center; margin-bottom: 2px; }
                    
                    h1 { 
                        text-align: center;
                        margin: 2px 0;
                        font-size: 14pt; /* Compact Title */
                        font-weight: bold;
                        text-decoration: underline;
                    }
                    .queue-box {
                        text-align: center;
                        font-size: 12pt;
                        font-weight: bold;
                        border: 2px solid #000;
                        padding: 1px;
                        margin: 2px auto 4px auto;
                        width: 160px;
                    }
                    .info-grid {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 4px;
                        font-size: 10pt;
                    }
                    .complaint-box {
                         border: 1px dashed #000; padding: 2px; margin: 2px 0; min-height: 18px; font-size: 10pt;
                    }
                    table { margin: 1px 0; font-size: 10pt; }
                    
                    /* ... */
                    
                    <!-- AREA TAMBAHAN MANUAL (Split 2 Kolom) -->
                    <div style="margin-top: 3px; border: 1px solid #000; min-height: 2.1cm; display: flex;">
                        <!-- ... -->
                    </div>
                    .info-column {
                        width: 48%;
                    }
                    .info-row {
                        display: flex;
                    }
                    .complaint-box {
                        border: 1px dashed #000;
                        padding: 3px;
                        margin: 3px 0;
                        min-height: 20px;
                        font-size: 11pt;
                    }
                    table {
                        width: 100%;
                        table-layout: fixed; /* Agar lebar kolom konsisten antar tabel */
                        border-collapse: collapse;
                        margin: 2px 0;
                        font-size: 10pt;
                    }
                    th {
                        border-bottom: 2px solid #000;
                        text-align: left;
                    }
                    td {
                        padding: 1px 0;
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .signature-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 5px;
                        font-size: 11pt;
                    }
                    .signature-box {
                        min-width: 150px;
                        width: auto;
                        text-align: center;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        margin-top: 20px;
                        padding-top: 2px;
                    }
                </style>
            </head>
            <body>
                <div class="header-bengkel">${settings.workshopName || 'MUTIARA MOTOR 2'}</div>
                <div class="header-phone">HP/WA: ${settings.workshopPhone || '-'}</div>
                
                <h1>PERINTAH KERJA</h1>
                
                <div class="queue-box">
                    ANTRIAN #${queueItem.queueNumber}
                </div>

                <div class="info-grid">
                    <div class="info-column">
                        <div class="info-row"><div class="info-label">Tgl</div><div>: ${new Date(queueItem.date).toLocaleDateString('id-ID')} ${queueItem.entryTime}</div></div>
                        <div class="info-row"><div class="info-label">Nama</div><div>: ${queueItem.customerName.substring(0, 20)}</div></div>
                        <div class="info-row"><div class="info-label">No. HP</div><div>: ${queueItem.phoneNumber || '-'}</div></div>
                    </div>
                    <div class="info-column">
                        <div class="info-row"><div class="info-label">Unit</div><div>: ${queueItem.plateNumber}</div></div>
                        <div class="info-row"><div class="info-label">Tipe</div><div>: ${queueItem.bikeModel.substring(0, 20)}</div></div>
                        <div class="info-row"><div class="info-label">Alamat</div><div>: ${queueItem.address ? queueItem.address.substring(0, 25) : '-'}</div></div>
                    </div>
                </div>

                <div class="complaint-box">
                    <strong>KELUHAN:</strong> ${queueItem.complaint || '-'}
                </div>
                
                ${jasaItems.length > 0 ? `
                <div style="margin-top: 3px; border-bottom: 1px solid #000; font-weight: bold;">JASA</div>
                <table>
                    ${jasaItems.map(item => `
                    <tr>
                        <td width="60%">${item.name}</td>
                        <td width="10%" class="text-center">${item.q}</td>
                        <td width="30%" class="text-right">Rp ${(item.price * item.q).toLocaleString()}</td>
                    </tr>
                    `).join('')}
                </table>
                ` : ''}

                ${partItems.length > 0 ? `
                <div style="margin-top: 8px; border-bottom: 1px solid #000; font-weight: bold;">PART</div>
                <table>
                    ${partItems.map(item => `
                    <tr>
                        <td width="60%">${item.name}</td>
                        <td width="10%" class="text-center">${item.q}</td>
                        <td width="30%" class="text-right">Rp ${(item.price * item.q).toLocaleString()}</td>
                    </tr>
                    `).join('')}
                </table>
                ` : ''}

                <!-- TOTAL ESTIMASI -->
                <div style="margin-top: 8px; padding-top: 3px; border-top: 2px solid #000; text-align: right; font-weight: bold; font-size: 10pt;">
                    TOTAL ESTIMASI: Rp ${totalEstimasi.toLocaleString()}
                </div>

                <!-- AREA TAMBAHAN MANUAL (Split 2 Kolom) -->
                <div style="margin-top: 3px; border: 1px solid #000; min-height: 2.1cm; display: flex;">
                    <!-- Kolom Kiri: Jasa -->
                    <div style="width: 50%; border-right: 1px solid #000; position: relative;">
                        <span style="position: absolute; top: 2px; left: 2px; font-size: 10pt; font-weight: bold;">TAMBAHAN JASA (Manual):</span>
                    </div>
                    <!-- Kolom Kanan: Part -->
                    <div style="width: 50%; position: relative;">
                        <span style="position: absolute; top: 2px; left: 2px; font-size: 10pt; font-weight: bold;">TAMBAHAN PART (Manual):</span>
                    </div>
                </div>

                <div class="signature-section">
                    <div class="signature-box">
                        <div style="font-size: 10pt; text-align: left;">
                            <div>Kunjungan Terakhir:</div>
                            <div style="font-weight: bold; margin-top: 3px;">
                                ${queueItem.lastVisit
                ? `<div>${new Date(queueItem.lastVisit).toLocaleDateString('id-ID')}</div>
                                       ${queueItem.lastMechanic ? `<div style="margin-top: 2px; white-space: nowrap;">${queueItem.lastMechanic}</div>` : ''}`
                : '-'}
                            </div>
                        </div>
                    </div>
                    <div class="signature-box">
                        <div>Mekanik</div>
                        <div class="signature-line"></div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleCancelPayment = async (service) => {
        if (confirm(`Batalkan pembayaran untuk ${service.plateNumber}? Status akan kembali ke Selesai.`)) {
            await api.updateJob(service.id, { ...service, status: 'Done' });
            fetchData();
            alert('Pembayaran dibatalkan. Unit kembali ke tab Selesai.');
        }
    };

    const handleRevertToProcess = async (service) => {
        if (confirm(`Kembalikan ${service.plateNumber} ke menu Proses?`)) {
            await api.updateJob(service.id, { ...service, status: 'In Progress' });
            fetchData();
            alert('Status dikembalikan ke Proses.');
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 5rem)', // Adjusted height to fit within main content padding without scrolling
            overflow: 'hidden', // Prevent window scroll
            position: 'relative'
        }}>

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
                                    Rp {selectedPaymentItem.items.reduce((s, x) => s + (x.price * x.q), 0).toLocaleString()}
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
                                        Rp {selectedQueueItem.items.reduce((s, x) => s + (x.price * x.q), 0).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            {/* Left: Destructive Actions */}
                            <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeleteQueue(selectedQueueItem.id)}>
                                <Trash2 size={18} /> Hapus
                            </button>

                            {/* Right: Primary Actions */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-outline" onClick={() => handlePrintWorkOrder(selectedQueueItem)}>
                                    <Printer size={18} /> Cetak
                                </button>
                                <button className="btn btn-outline" onClick={() => handleEditQueue(selectedQueueItem)}>
                                    <Edit size={18} /> Edit
                                </button>
                                <button className="btn btn-primary" onClick={() => handleStartWork(selectedQueueItem)}>
                                    Lanjut Proses
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Global Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Layanan Servis</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Kelola antrian dan pengerjaan servis motor.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => {
                            const d = new Date(filterDate);
                            d.setDate(d.getDate() - 1);
                            setFilterDate(d.toISOString().split('T')[0]);
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
                            setFilterDate(d.toISOString().split('T')[0]);
                        }}>
                            <ChevronRight size={18} />
                        </button>

                        {filterDate !== new Date().toISOString().split('T')[0] && (
                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}>
                                Hari Ini
                            </button>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditingQueueId(null); setShowEntryForm(true); }}>
                        <Plus size={18} /> Antrian Baru
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
                    Sudah Bayar
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
                                    <p className="text-muted">Total: Rp {item.items.reduce((s, x) => s + (x.price * x.q), 0).toLocaleString()}</p>
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

                {activeTab === 'paid' && (
                    <div className="no-scrollbar" style={{ display: 'grid', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {queue.filter(i => i.status === 'Paid' && i.date === filterDate).length === 0 && (
                            <div className="card text-center" style={{ padding: '2rem' }}>
                                <p className="text-muted">Tidak ada riwayat pembayaran pada tanggal {filterDate.split('-').reverse().join('/')}.</p>
                            </div>
                        )}

                        {queue.filter(i => i.status === 'Paid' && i.date === filterDate).map((item) => (
                            <div key={item.id} className="card" onClick={() => setSelectedInvoiceItem(item)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                <div>
                                    <h3 style={{ textDecoration: 'line-through' }}>#{item.queueNumber} - {item.plateNumber}</h3>
                                    <p className="text-muted">LUNAS - {item.customerName}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div className="badge badge-success"><Check size={14} /> Selesai</div>
                                    <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Batalkan Bayar & Kembali ke Selesai" onClick={(e) => { e.stopPropagation(); handleCancelPayment(item); }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
