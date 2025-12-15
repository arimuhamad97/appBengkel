import React, { useRef, useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { api } from '../../services/api';

export default function ServiceInvoice({ service, onClose }) {
    const [mechanic, setMechanic] = useState(null);

    useEffect(() => {
        const loadMechanic = async () => {
            if (service.mechanicId) {
                const mechanics = await api.getMechanics();
                const m = mechanics.find(mech => mech.id === parseInt(service.mechanicId));
                setMechanic(m);
            }
        };
        loadMechanic();
    }, [service.mechanicId]);

    // Calculate separated totals
    const totalService = service.items.filter(i => i.type === 'Service').reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0);
    const totalPart = service.items.filter(i => i.type === 'Part').reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0);
    const total = totalService + totalPart;

    const invoiceRef = useRef();

    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Simple reload to restore state after print hack
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '600px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

                {/* Header Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-dark)' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" onClick={handlePrint}>
                            <Printer size={18} /> Cetak
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Area */}
                <div ref={invoiceRef} style={{ padding: '0.1cm', overflowY: 'auto', backgroundColor: '#fff', color: '#000', fontFamily: '"Courier New", Courier, monospace', fontSize: '14pt' }}>

                    <style>
                        {`
                            @media print {
                                @page {
                                    size: 9.5in 5.5in; /* 9 1/2 x 11 divided by 2 */
                                    margin: 0;
                                }
                                body {
                                    margin: 0;
                                    padding: 0;
                                    background: white;
                                    color: black;
                                    font-family: "Courier New", Courier, monospace;
                                    font-weight: normal; /* "Thin" / Normal weight as requested */
                                }
                                * {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                    color: #000 !important;
                                }
                                .no-print {
                                    display: none !important;
                                }
                                .dashed-border-bottom {
                                    border-bottom: 2px dashed black !important;
                                }
                                .solid-border-top {
                                    border-top: 2px solid black !important; /* Revert to 2px for cleaner look */
                                }
                            }
                        `}
                    </style>

                    {/* Invoice Header */}
                    <div style={{ textAlign: 'center', marginBottom: '15px', paddingBottom: '10px' }} className="dashed-border-bottom">
                        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>BENGKEL MOTOR MAJU JAYA</h1>
                        <p style={{ margin: '5px 0', fontSize: '13pt' }}>Jl. Raya Utama No. 123, Solo | Telp: 0812-3456-7890</p>
                    </div>

                    {/* Meta Data */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14pt' }}>
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '5px' }}>
                                <span>No. Nota</span>
                                <span>: INV-{service.id}</span>
                                <span>Tanggal</span>
                                <span>: {service.date}</span>
                                <span>Jam</span>
                                <span>: {service.entryTime}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px' }}>
                                <span>Pelanggan: {service.customerName}</span>
                                <span>{service.plateNumber}</span>
                                <span>{service.bikeModel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Sections */}
                    <div style={{ marginBottom: '20px', fontSize: '14pt' }}>

                        {/* JASA SECTION */}
                        <div style={{ marginBottom: '15px' }}>
                            <div className="dashed-border-bottom" style={{ fontWeight: 'bold', marginBottom: '10px', paddingBottom: '5px' }}>JASA</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14pt' }}>
                                <tbody>
                                    {service.items.filter(i => i.type === 'Service').map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '5px 0' }}>{item.name}</td>
                                            <td style={{ textAlign: 'right', padding: '5px 0' }}>{((item.price - (item.discount || 0)) * item.q).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {service.items.filter(i => i.type === 'Service').length > 0 && (
                                <div style={{ textAlign: 'right', marginTop: '5px', fontStyle: 'italic', fontSize: '13pt' }}>
                                    Total Jasa: Rp {totalService.toLocaleString()}
                                </div>
                            )}
                        </div>

                        {/* PART SECTION */}
                        {service.items.some(i => i.type === 'Part') && (
                            <div style={{ marginBottom: '15px' }}>
                                <div className="dashed-border-bottom" style={{ fontWeight: 'bold', marginBottom: '10px', paddingBottom: '5px' }}>PART</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14pt' }}>
                                    <tbody>
                                        {service.items.filter(i => i.type === 'Part').map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '5px 0', width: '50%' }}>{item.name}</td>
                                                <td style={{ textAlign: 'center', padding: '5px 0', width: '10%' }}>{item.q}</td>
                                                <td style={{ textAlign: 'right', padding: '5px 0', width: '20%' }}>{item.price.toLocaleString()}</td>
                                                <td style={{ textAlign: 'right', padding: '5px 0', width: '20%' }}>{((item.price - (item.discount || 0)) * item.q).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ textAlign: 'right', marginTop: '5px', fontStyle: 'italic', fontSize: '13pt' }}>
                                    Total Part: Rp {totalPart.toLocaleString()}
                                </div>
                            </div>
                        )}

                        {/* GRAND TOTAL */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <div className="solid-border-top" style={{ paddingTop: '10px', fontWeight: 'bold', fontSize: '20pt' }}>
                                Total Bayar: Rp {total.toLocaleString()}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '14pt' }}>
                        <div style={{ textAlign: 'center', width: '200px' }}>
                            <p style={{ marginBottom: '60px' }}>Hormat Kami,</p>
                            <p className="solid-border-top" style={{ paddingTop: '5px' }}>Admin</p>
                        </div>
                        <div style={{ textAlign: 'center', width: '200px' }}>
                            <p style={{ marginBottom: '60px' }}>Mekanik,</p>
                            <p className="solid-border-top" style={{ paddingTop: '5px' }}>{mechanic?.name || '-'}</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11pt', fontStyle: 'italic' }}>
                        <p>Terima kasih atas kepercayaan Anda. Garansi servis 1 minggu.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
