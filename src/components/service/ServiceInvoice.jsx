import React, { useRef, useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { api } from '../../services/api';

export default function ServiceInvoice({ service, onClose }) {
    const [mechanic, setMechanic] = useState(null);
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const loadCommonData = async () => {
            try {
                // Parallel fetch mechanics and settings
                const [mecs, sets] = await Promise.all([
                    api.getMechanics(),
                    api.getSettings()
                ]);

                if (service.mechanicId) {
                    const m = mecs.find(mech => mech.id === parseInt(service.mechanicId));
                    setMechanic(m);
                }
                setSettings(sets || {});
            } catch (err) {
                console.error("Error loading invoice data", err);
            }
        };
        loadCommonData();
    }, [service.mechanicId]);

    // Calculate separated totals
    const grossService = service.items.filter(i => i.type === 'Service').reduce((sum, item) => sum + (item.price * item.q), 0);
    const grossPart = service.items.filter(i => i.type === 'Part').reduce((sum, item) => sum + (item.price * item.q), 0);
    const totalDiscount = service.items.reduce((sum, item) => sum + ((item.discount || 0) * item.q), 0);
    const grandTotal = grossService + grossPart - totalDiscount;

    const invoiceRef = useRef();

    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Simple reload to restore state after print hack
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '800px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

                {/* Header Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={handlePrint}>
                            <Printer size={18} /> Cetak (Epson LX-310)
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Area */}
                <div ref={invoiceRef} style={{ padding: '0.2cm', overflowY: 'auto', backgroundColor: '#fff', color: '#000', fontFamily: '"Courier New", Courier, monospace', fontSize: '11pt' }}>

                    <style>
                        {`
                            @media print {
                                @page {
                                    size: 8.5in 5.5in landscape;
                                    margin: 0.35in 0.4in 0.25in 0.3in;
                                }
                                body {
                                    margin: 0;
                                    padding: 0;
                                    background: white;
                                    color: black;
                                    font-family: "Courier New", Courier, monospace;
                                    font-size: 12pt; 
                                    font-weight: bold;
                                    line-height: 1.0;
                                    -webkit-font-smoothing: none;
                                    text-rendering: optimizeLegibility;
                                }
                                * {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color: #000 !important;
                                }
                                .header-container {
                                    text-align: center;
                                    border-bottom: 2px solid #000;
                                    padding-bottom: 4px;
                                    margin-bottom: 6px;
                                }
                                h1 {
                                    font-size: 16pt;
                                    margin: 0;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    font-weight: 900;
                                }
                                .sub-header {
                                    font-size: 10pt;
                                    margin: 2px 0;
                                }
                                .meta-grid {
                                    display: flex;
                                    justify-content: space-between;
                                    margin-bottom: 6px;
                                    font-size: 11pt;
                                }
                                .section-title {
                                    font-size: 13pt;
                                    font-weight: 900;
                                    text-decoration: underline;
                                    margin-top: 10px;
                                    margin-bottom: 3px;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    table-layout: fixed;
                                    margin-bottom: 4px;
                                    page-break-inside: auto;
                                }
                                tr {
                                    page-break-inside: avoid;
                                    page-break-after: auto;
                                }
                                td {
                                    padding: 0;
                                    vertical-align: top;
                                    font-size: 11pt;
                                }
                                .text-right { text-align: right; }
                                .text-center { text-align: center; }
                                
                                .total-section {
                                    margin-top: 4px;
                                    border-top: 2px solid #000;
                                    padding-top: 2px;
                                    page-break-inside: avoid;
                                }
                                .total-section td {
                                    font-size: 12pt;
                                    padding: 0;
                                }
                                .footer {
                                    margin-top: 10px;
                                    text-align: center;
                                    font-size: 10pt;
                                    page-break-inside: avoid;
                                }
                                .signature-section {
                                    display: flex;
                                    justify-content: space-between;
                                    margin-top: 10px;
                                    page-break-inside: avoid;
                                }
                                .signature-box {
                                    width: 150px;
                                    text-align: center;
                                    font-size: 11pt;
                                }
                            }
                        `}
                    </style>

                    {/* Invoice Content Wrapper for Screen (Preview) */}
                    <div style={{ margin: '0 auto' }}>

                        <div className="header-container">
                            <h1>{settings.workshopName || 'BENGKEL MOTOR'}</h1>
                            <div className="sub-header">
                                {settings.workshopAddress || ''}
                                {settings.workshopAddress && settings.workshopPhone ? ' | ' : ''}
                                {settings.workshopPhone ? `Telp: ${settings.workshopPhone}` : ''}
                            </div>
                        </div>

                        <div className="meta-grid">
                            <div>
                                <div>No. Inv : <strong>INV-{service.id}</strong></div>
                                <div>Tanggal : {formatDate(service.date)}</div>
                            </div>
                            <div className="text-right">
                                <div>Kpd Yth: <strong>{service.customerName.toUpperCase().substring(0, 20)}</strong></div>
                                <div>{service.plateNumber} / {service.bikeModel.substring(0, 15)}</div>
                            </div>
                        </div>

                        {/* JASA */}
                        {service.items.filter(i => i.type === 'Service').length > 0 && (
                            <div>
                                <div className="section-title">JASA</div>
                                <table>
                                    <tbody>
                                        {service.items.filter(i => i.type === 'Service').map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr>
                                                    <td style={{ width: '55%' }}>{item.name}</td>
                                                    <td style={{ width: '10%', textAlign: 'center' }}>{item.q}</td>
                                                    <td style={{ width: '35%', textAlign: 'right' }}>{(item.price * item.q).toLocaleString()}</td>
                                                </tr>
                                                {item.discount > 0 && (
                                                    <tr style={{ fontSize: '10pt' }}>
                                                        <td colSpan="2" style={{ paddingLeft: '10px', fontStyle: 'italic' }}>
                                                            Diskon {item.discountPercent ? `(${item.discountPercent}%)` : ''}
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>-{(item.discount * item.q).toLocaleString()}</td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* SPAREPART */}
                        {service.items.filter(i => i.type === 'Part').length > 0 && (
                            <div>
                                <div className="section-title">SPAREPART</div>
                                <table>
                                    <tbody>
                                        {service.items.filter(i => i.type === 'Part').map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr>
                                                    <td style={{ width: '55%' }}>{item.name}</td>
                                                    <td style={{ width: '10%', textAlign: 'center' }}>{item.q}</td>
                                                    <td style={{ width: '35%', textAlign: 'right' }}>{(item.price * item.q).toLocaleString()}</td>
                                                </tr>
                                                {item.discount > 0 && (
                                                    <tr style={{ fontSize: '10pt' }}>
                                                        <td colSpan="2" style={{ paddingLeft: '10px', fontStyle: 'italic' }}>
                                                            Diskon {item.discountPercent ? `(${item.discountPercent}%)` : ''}
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>-{(item.discount * item.q).toLocaleString()}</td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TOTAL CALCULATION */}
                        <div className="total-section">
                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '60%' }}></td>
                                        <td style={{ width: '20%', fontSize: '16pt' }}>Total Jasa</td>
                                        <td className="text-right" style={{ width: '20%', fontSize: '16pt' }}>Rp {grossService.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ width: '60%' }}></td>
                                        <td style={{ width: '20%', fontSize: '16pt' }}>Total Part</td>
                                        <td className="text-right" style={{ width: '20%', fontSize: '16pt' }}>Rp {grossPart.toLocaleString()}</td>
                                    </tr>
                                    {totalDiscount > 0 && (
                                        <tr>
                                            <td style={{ width: '60%' }}></td>
                                            <td style={{ width: '20%', fontSize: '16pt' }}>Potongan</td>
                                            <td className="text-right" style={{ width: '20%', fontSize: '16pt' }}>-Rp {totalDiscount.toLocaleString()}</td>
                                        </tr>
                                    )}
                                    <tr style={{ borderTop: '2px solid #000' }}>
                                        <td style={{ width: '60%' }}></td>
                                        <td style={{ width: '20%', fontSize: '13pt', fontWeight: '900' }}>TOTAL</td>
                                        <td className="text-right" style={{ width: '20%', fontSize: '13pt', fontWeight: '900' }}>Rp {grandTotal.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* TANDA TANGAN */}
                        <div className="signature-section">
                            <div className="signature-box">
                                <div style={{ marginBottom: '40px' }}>Mekanik</div>
                                <div style={{ borderTop: '1px solid #000', whiteSpace: 'nowrap' }}>{mechanic?.name || '-'}</div>
                            </div>
                            <div className="signature-box">
                                <div style={{ marginBottom: '40px' }}>Hormat Kami</div>
                                <div style={{ borderTop: '1px solid #000' }}>Admin</div>
                            </div>
                        </div>

                        <div className="footer">
                            <div style={{ borderTop: '1px dashed #000', margin: '5px auto', width: '80%' }}></div>
                            <div style={{ fontStyle: 'italic', fontSize: '10pt' }}>
                                {settings.workshopMotto || 'Terima kasih atas kepercayaan Anda'}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
