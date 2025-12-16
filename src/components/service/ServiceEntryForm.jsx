import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Bike, User, FileText, Search, Plus, Trash2, Wrench, History } from 'lucide-react';
import { api } from '../../services/api';
import NewCustomerModal from './NewCustomerModal';
import ServiceHistoryModal from './ServiceHistoryModal';

export default function ServiceEntryForm({ onSave, onCancel, initialData }) {
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [tempPlateNumber, setTempPlateNumber] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag untuk mencegah reload data
    const hasLoadedInitialData = useRef(false); // Track apakah initial data sudah pernah di-load

    const [formData, setFormData] = useState({
        plateNumber: '',
        customerName: '',
        address: '',
        phoneNumber: '',
        bikeModel: '',
        frameNumber: '',
        engineNumber: '',
        color: '',
        year: '',
        kilometer: '',
        complaint: ''
    });

    // -- Cost Estimation State --
    const [items, setItems] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedPartId, setSelectedPartId] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');
    const [partSearch, setPartSearch] = useState('');

    // Resources
    const [servicesList, setServicesList] = useState([]);
    const [partsList, setPartsList] = useState([]);
    const [bikeTypesList, setBikeTypesList] = useState([]);

    // Bike Type Search State
    const [bikeSearchTerm, setBikeSearchTerm] = useState('');
    const [filteredBikeTypes, setFilteredBikeTypes] = useState([]);
    const [showBikeDropdown, setShowBikeDropdown] = useState(false);

    useEffect(() => {
        const loadResources = async () => {
            try {
                const [s, p, b] = await Promise.all([
                    api.getServices(),
                    api.getInventory(),
                    api.getBikeTypes()
                ]);
                setServicesList(s);
                setPartsList(p);
                setBikeTypesList(b);
                setFilteredBikeTypes(b); // Initialize filtered list
            } catch (e) {
                console.error("Failed to load resources", e);
            }
        };
        loadResources();
    }, []);

    // Filter bike types when search term changes
    useEffect(() => {
        if (bikeSearchTerm) {
            const filtered = bikeTypesList.filter(bike =>
                bike.type?.toLowerCase().includes(bikeSearchTerm.toLowerCase()) ||
                bike.code?.toLowerCase().includes(bikeSearchTerm.toLowerCase()) ||
                bike.category?.toLowerCase().includes(bikeSearchTerm.toLowerCase())
            );
            setFilteredBikeTypes(filtered);
        } else {
            setFilteredBikeTypes(bikeTypesList);
        }
    }, [bikeSearchTerm, bikeTypesList]);

    // -- Init Data for Edit Mode --
    useEffect(() => {
        // Hanya load jika ada initialData DAN belum pernah di-load sebelumnya
        if (initialData && !hasLoadedInitialData.current) {
            hasLoadedInitialData.current = true; // Tandai bahwa data sudah di-load

            // Set initial form data dari queue
            setFormData({
                plateNumber: initialData.plateNumber || '',
                customerName: initialData.customerName || '',
                address: initialData.address || '',
                phoneNumber: initialData.phoneNumber || '',
                bikeModel: initialData.bikeModel || '',
                frameNumber: initialData.frameNumber || '',
                engineNumber: initialData.engineNumber || '',
                color: initialData.color || '',
                year: initialData.year || '',
                kilometer: initialData.kilometer || '',
                complaint: initialData.complaint || ''
            });

            // Sync bike search term
            setBikeSearchTerm(initialData.bikeModel || '');

            console.log('[DEBUG] Initial data loaded:', {
                kilometer: initialData.kilometer,
                plateNumber: initialData.plateNumber
            });

            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items);
            }

            // Load data terbaru dari customers table (hanya sekali)
            const loadLatestCustomerData = async () => {
                if (initialData.plateNumber) {
                    try {
                        const customerData = await api.getCustomerByPlate(initialData.plateNumber);
                        if (customerData) {
                            // Update form dengan data terbaru dari customers table
                            setFormData(prev => ({
                                ...prev,
                                customerName: customerData.customerName || prev.customerName,
                                address: customerData.address || prev.address,
                                phoneNumber: customerData.phoneNumber || prev.phoneNumber,
                                bikeModel: customerData.bikeModel || prev.bikeModel,
                                frameNumber: customerData.frameNumber || prev.frameNumber,
                                engineNumber: customerData.engineNumber || prev.engineNumber,
                                color: customerData.color || prev.color,
                                year: customerData.year || prev.year,
                                kilometer: customerData.kilometer || prev.kilometer
                            }));
                            // Sync bike search term untuk filter
                            if (customerData.bikeModel) {
                                setBikeSearchTerm(customerData.bikeModel);
                            }
                            console.log('[DEBUG] Loaded latest customer data for edit mode');
                            console.log('[DEBUG] Customer kilometer:', customerData.kilometer);
                        }
                    } catch (error) {
                        console.error('Failed to load latest customer data:', error);
                    }
                }
            };

            loadLatestCustomerData();
            setIsDataLoaded(true); // Set flag karena data sudah di-load
        }
    }, [initialData]);

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0);
    };

    const handleAddService = () => {
        if (!selectedServiceId) return;
        const serv = servicesList.find(s => s.id === parseInt(selectedServiceId));
        if (serv) {
            const newItem = {
                type: 'Service',
                name: serv.name,
                price: serv.price,
                q: 1,
                id: serv.id,
                discount: 0,
                discountPercent: 0
            };
            setItems([...items, newItem]);
            setSelectedServiceId('');
        }
    };

    const handleAddPart = () => {
        if (!selectedPartId) return;
        const part = partsList.find(p => p.id === selectedPartId);

        if (part) {
            if (part.stock <= 0) {
                alert(`Stok habis untuk ${part.name}!`);
                return;
            }

            const newItem = {
                type: 'Part',
                name: part.name,
                price: part.price,
                q: 1,
                id: part.id,
                stock: part.stock, // Simpan info stok max
                discount: 0,
                discountPercent: 0
            };
            setItems([...items, newItem]);
            setSelectedPartId('');
        }
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleUpdateDiscount = (index, value, mode = 'percent') => {
        const newItems = [...items];
        const item = newItems[index];

        if (mode === 'percent') {
            const percent = Math.min(100, Math.max(0, Number(value)));
            item.discountPercent = percent;
            item.discount = Math.floor((item.price * percent) / 100);
        } else {
            const nominal = Number(value);
            item.discount = nominal;
            if (item.price > 0) {
                // Hitung persen, max 2 desimal
                item.discountPercent = parseFloat(((nominal / item.price) * 100).toFixed(2));
            }
        }
        setItems(newItems);
    };

    const handleUpdateQuantity = (index, value) => {
        const newItems = [...items];
        const item = newItems[index];
        const newQty = Math.max(1, Number(value));

        // Validasi Stok untuk Part
        if (item.type === 'Part') {
            // Cek stok asli dari daftar parts atau property stock di item
            if (newQty > (item.stock || 0)) {
                alert(`Stok tidak cukup! Sisa stok: ${item.stock || 0}`);
                return;
            }
        }

        item.q = newQty;
        setItems(newItems);
    };

    const handleUpdatePrice = (index, value) => {
        const price = Number(value);
        const newItems = [...items];
        newItems[index].price = price;

        // Recalculate discount if percent exists
        if (newItems[index].discountPercent !== undefined) {
            newItems[index].discount = Math.floor((price * newItems[index].discountPercent) / 100);
        }

        setItems(newItems);
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Force Uppercase for Plate Number
        if (name === 'plateNumber') {
            value = value.toUpperCase();
        }

        // Jika user mengganti plat nomor, reset flag dan clear data kendaraan
        if (name === 'plateNumber' && value !== formData.plateNumber) {
            setIsDataLoaded(false); // Reset flag agar bisa load data baru

            // Clear data kendaraan dan pelanggan jika plat nomor berubah
            if (formData.plateNumber && value.length < formData.plateNumber.length) {
                // User sedang menghapus karakter - clear semua data
                setFormData({
                    plateNumber: value,
                    customerName: '',
                    address: '',
                    phoneNumber: '',
                    bikeModel: '',
                    frameNumber: '',
                    engineNumber: '',
                    color: '',
                    year: '',
                    kilometer: '',
                    complaint: formData.complaint // Keep complaint
                });
                setBikeSearchTerm('');
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleBikeSearch = (value) => {
        setBikeSearchTerm(value);
        setFormData({ ...formData, bikeModel: value });
        setShowBikeDropdown(true);
    };

    const handleSelectBike = async (bike) => {
        const bikeDisplay = `${bike.type}${bike.code ? ' (' + bike.code + ')' : ''}`;
        setFormData(prev => ({ ...prev, bikeModel: bikeDisplay }));
        setBikeSearchTerm(bikeDisplay);
        setShowBikeDropdown(false);

        // Auto-save customer data setelah pilih bike type
        if (formData.plateNumber && formData.customerName) {
            try {
                await api.updateCustomer({
                    plateNumber: formData.plateNumber,
                    customerName: formData.customerName,
                    bikeModel: bikeDisplay,
                    engineNumber: formData.engineNumber,
                    frameNumber: formData.frameNumber,
                    year: formData.year,
                    color: formData.color,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    kilometer: formData.kilometer
                });
                console.log('Customer bike type updated:', bikeDisplay);
            } catch (error) {
                console.error('Failed to update bike type:', error);
            }
        }
    };

    // Auto-update customer data when form changes
    const handleCustomerDataBlur = async () => {
        // Only update if we have minimum required data
        if (!formData.plateNumber || !formData.customerName) return;

        const customerData = {
            plateNumber: formData.plateNumber,
            customerName: formData.customerName,
            bikeModel: formData.bikeModel,
            engineNumber: formData.engineNumber,
            frameNumber: formData.frameNumber,
            year: formData.year,
            color: formData.color,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            kilometer: formData.kilometer
        };

        console.log('Saving customer data:', customerData);

        try {
            await api.updateCustomer(customerData);
            console.log('Customer data auto-saved successfully');
        } catch (error) {
            console.error('Failed to auto-save customer data:', error);
        }
    };

    const checkDb = async (plate) => {
        if (!plate || plate.length < 3) return;
        if (isDataLoaded) return; // Jangan reload jika data sudah pernah di-load

        try {
            const found = await api.getCustomerByPlate(plate);
            if (found) {
                // Data ditemukan - isi otomatis
                setFormData(prev => ({
                    ...prev,
                    customerName: found.customerName || '',
                    address: found.address || '',
                    phoneNumber: found.phoneNumber || '',
                    bikeModel: found.bikeModel || '',
                    frameNumber: found.frameNumber || '',
                    engineNumber: found.engineNumber || '',
                    color: found.color || '',
                    year: found.year || '',
                    kilometer: found.kilometer || ''
                }));
                setBikeSearchTerm(found.bikeModel || ''); // Sync bike search term
                setIsDataLoaded(true); // Set flag bahwa data sudah di-load
            } else {
                // Data tidak ditemukan - tampilkan modal
                setTempPlateNumber(plate);
                setShowBikeDropdown(false);
                setShowNewCustomerModal(true);
            }
        } catch (error) {
            console.error("Lookup failed", error);
        }
    };

    const handleBlurPlate = () => {
        if (formData.plateNumber.length > 3 && !isDataLoaded) {
            checkDb(formData.plateNumber);
        }
    };

    const handleSaveNewCustomer = async (customerData) => {
        try {
            // Simpan ke database customers
            await api.createCustomer(customerData);

            // Isi form dengan data dari modal
            setFormData(prev => ({
                ...prev,
                ...customerData
            }));

            setIsDataLoaded(true); // Set flag bahwa data sudah di-load
            setShowNewCustomerModal(false);
        } catch (error) {
            console.error("Failed to save customer", error);
            alert('Gagal menyimpan data konsumen: ' + error.message);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi field wajib
        if (!formData.plateNumber || !formData.customerName || !formData.bikeModel) {
            alert('Mohon lengkapi Nopol, Nama, dan Tipe Motor.');
            return;
        }

        // Cek apakah plat nomor sudah ada di antrian aktif (hanya untuk pendaftaran baru, bukan edit)
        if (!initialData) {
            try {
                const checkResult = await api.checkActiveQueue(formData.plateNumber);

                if (checkResult.exists) {
                    alert(
                        `Plat nomor ${formData.plateNumber} sudah ada di antrian!\n\n` +
                        `Nomor Antrian: #${checkResult.queueNumber}\n` +
                        `Tanggal: ${checkResult.date}\n` +
                        `Status: ${checkResult.status}\n` +
                        `Tipe Servis: ${checkResult.serviceType}\n\n` +
                        `Mohon tunggu hingga servis selesai sebelum mendaftar lagi.`
                    );
                    return;
                }
            } catch (error) {
                console.error('Failed to check active queue:', error);
                // Lanjutkan jika gagal cek (fail-safe)
            }
        }

        // Include items in result
        onSave({ ...formData, items });
    };

    // Helper to render table rows with discount input
    const renderItemRow = (item, idx) => (
        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '0.25rem' }}>{item.name}</td>
            <td style={{ padding: '0.25rem', textAlign: 'right', width: '120px' }}>
                <input
                    type="number"
                    className="input"
                    style={{ padding: '0.1rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '100%' }}
                    value={item.price}
                    onChange={(e) => handleUpdatePrice(idx, e.target.value)}
                />
            </td>
            <td style={{ padding: '0.25rem', textAlign: 'center' }}>
                <input
                    type="number"
                    min="1"
                    className="input"
                    style={{ padding: '0.1rem', fontSize: '0.8rem', textAlign: 'center', width: '40px' }}
                    value={item.q}
                    onChange={(e) => handleUpdateQuantity(idx, e.target.value)}
                />
            </td>
            <td style={{ padding: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative', width: '50px' }}>
                        <input
                            type="number"
                            className="input"
                            style={{ padding: '0.2rem 14px 0.2rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '100%' }}
                            placeholder="0"
                            min="0"
                            max="100"
                            value={item.discountPercent !== undefined ? item.discountPercent : ''}
                            onChange={(e) => handleUpdateDiscount(idx, e.target.value, 'percent')}
                        />
                        <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>%</span>
                    </div>
                    <input
                        type="number"
                        className="input"
                        style={{ padding: '0.2rem 4px', fontSize: '0.8rem', textAlign: 'right', width: '80px' }}
                        placeholder="Rp"
                        value={item.discount || ''}
                        onChange={(e) => handleUpdateDiscount(idx, e.target.value, 'nominal')}
                    />
                </div>
            </td>
            <td style={{ padding: '0.25rem', textAlign: 'right', fontWeight: 'bold' }}>
                Rp {((item.price - (item.discount || 0)) * item.q).toLocaleString()}
            </td>
            <td style={{ padding: '0.25rem', textAlign: 'right', width: '20px' }}>
                <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <X size={14} />
                </button>
            </td>
        </tr>
    );

    return (
        <>
            {showNewCustomerModal && (
                <NewCustomerModal
                    plateNumber={tempPlateNumber}
                    onSave={handleSaveNewCustomer}
                    onCancel={() => setShowNewCustomerModal(false)}
                />
            )}

            {showHistoryModal && (
                <ServiceHistoryModal
                    plateNumber={formData.plateNumber}
                    customerName={formData.customerName}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {initialData ? 'Edit Data Antrian' : 'Pendaftaran Servis Baru'}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {formData.plateNumber && (
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setShowHistoryModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <History size={18} />
                                Lihat History
                            </button>
                        )}
                        <button className="btn btn-outline" onClick={onCancel} style={{ border: 'none' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* --- TOP SECTION: DATA INPUT --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                        {/* Vehicle Data */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <Bike size={18} /> Data Kendaraan
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No. Polisi <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="plateNumber"
                                            className="input"
                                            placeholder="AD 1234 XY"
                                            style={{ textTransform: 'uppercase', paddingRight: '2rem' }}
                                            value={formData.plateNumber}
                                            onChange={handleChange}
                                            onBlur={handleBlurPlate}
                                        />
                                        <Search size={16} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)' }} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Type Motor <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Cari type motor..."
                                            value={bikeSearchTerm || formData.bikeModel}
                                            onChange={(e) => handleBikeSearch(e.target.value)}
                                            onFocus={() => setShowBikeDropdown(true)}
                                            style={{ paddingRight: '2rem' }}
                                        />
                                        <Search size={16} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)' }} />
                                    </div>

                                    {showBikeDropdown && filteredBikeTypes.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: 'var(--bg-dark)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius)',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            zIndex: 1000,
                                            marginTop: '0.25rem'
                                        }}>
                                            {filteredBikeTypes.map((bike) => (
                                                <div
                                                    key={bike.id}
                                                    onClick={() => handleSelectBike(bike)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--border)'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                >
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {bike.type} {bike.code && `(${bike.code})`}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {bike.category && `${bike.category} • `}
                                                        {(bike.year_from || bike.year_to) && `${bike.year_from || '?'}-${bike.year_to || '?'}`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Added Engine No, Color, Year */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No. Mesin</label>
                                    <input type="text" name="engineNumber" className="input" value={formData.engineNumber} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Warna</label>
                                    <input type="text" name="color" className="input" value={formData.color || ''} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Tahun Rakit</label>
                                    <input type="text" name="year" className="input" value={formData.year || ''} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Kilometer</label>
                                    <input type="number" name="kilometer" className="input" placeholder="KM" value={formData.kilometer} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No. Rangka (Opsional)</label>
                                    <input type="text" name="frameNumber" className="input" value={formData.frameNumber} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                                </div>
                            </div>
                        </div>

                        {/* Customer Data */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <User size={18} /> Data Pelanggan
                            </h3>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nama Pemilik <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input type="text" name="customerName" className="input" value={formData.customerName} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                            </div>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Alamat</label>
                                <input type="text" name="address" className="input" value={formData.address} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No. HP / WA</label>
                                <input type="text" name="phoneNumber" className="input" value={formData.phoneNumber} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                            </div>
                        </div>
                    </div>

                    {/* --- BOTTOM SECTION: ESTIMATION (Split Service & Parts) --- */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            <FileText size={18} /> Estimasi Biaya & Jasa
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* LEFT: JASA SERVIS */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Jasa Servis</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', marginBottom: '0.5rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Cari Jasa..."
                                            value={serviceSearch}
                                            onChange={(e) => setServiceSearch(e.target.value)}
                                            style={{ paddingRight: '2rem', fontSize: '0.85rem', padding: '0.4rem' }}
                                        />
                                        <Search size={14} style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select className="input" style={{ flex: 1 }} value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                                            <option value="">+ Tambah Jasa</option>
                                            {servicesList
                                                .filter(s => s.name?.toLowerCase().includes(serviceSearch.toLowerCase()))
                                                .slice(0, 50)
                                                .map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} - Rp {s.price.toLocaleString()}</option>
                                                ))}
                                        </select>
                                        <button type="button" className="btn btn-primary" onClick={handleAddService} disabled={!selectedServiceId}><Plus size={18} /></button>
                                    </div>
                                </div>
                                <div style={{ flex: 1, backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: '0.5rem', marginBottom: '0.5rem', minHeight: '120px' }}>
                                    {items.filter(i => i.type === 'Service').length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '2rem', fontStyle: 'italic' }}>Belum ada jasa dipilih.</p>
                                    ) : (
                                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '0.5rem' }}>Item</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Harga</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'center', width: '50px' }}>Qty</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right', width: '140px' }}>Diskon (% / Rp)</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                                                    <th style={{ width: '30px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, idx) => item.type === 'Service' ? renderItemRow(item, idx) : null)}
                                            </tbody>
                                        </table>
                                    )}
                                    <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        Total Jasa: Rp {items.filter(i => i.type === 'Service').reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: SPAREPARTS */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Suku Cadang</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', marginBottom: '0.5rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Cari Part..."
                                            value={partSearch}
                                            onChange={(e) => setPartSearch(e.target.value)}
                                            style={{ paddingRight: '2rem', fontSize: '0.85rem', padding: '0.4rem' }}
                                        />
                                        <Search size={14} style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select className="input" style={{ flex: 1 }} value={selectedPartId} onChange={(e) => setSelectedPartId(e.target.value)}>
                                            <option value="">+ Tambah Part</option>
                                            {partsList
                                                .filter(p => p.name?.toLowerCase().includes(partSearch.toLowerCase()))
                                                .slice(0, 50)
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} (S: {p.stock}) - Rp {p.price.toLocaleString()}
                                                    </option>
                                                ))}
                                        </select>
                                        <button type="button" className="btn btn-primary" onClick={handleAddPart} disabled={!selectedPartId}><Plus size={18} /></button>
                                    </div>
                                </div>
                                <div style={{ flex: 1, backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: '0.5rem', marginBottom: '0.5rem', minHeight: '120px' }}>
                                    {items.filter(i => i.type === 'Part').length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '2rem', fontStyle: 'italic' }}>Belum ada part dipilih.</p>
                                    ) : (
                                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '0.5rem' }}>Item</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Harga</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'center', width: '50px' }}>Qty</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right', width: '140px' }}>Diskon (% / Rp)</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                                                    <th style={{ width: '30px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, idx) => item.type === 'Part' ? renderItemRow(item, idx) : null)}
                                            </tbody>
                                        </table>
                                    )}
                                    <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        Total Sparepart: Rp {items.filter(i => i.type === 'Part').reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER: SUMMARY & SUBMIT --- */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Keluhan / Catatan</label>
                            <textarea name="complaint" className="input" rows="3" value={formData.complaint} onChange={handleChange} placeholder="Deskripsikan keluhan pelanggan..."></textarea>
                        </div>

                        <div>
                            <div style={{ backgroundColor: 'var(--bg-hover)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Ringkasan Biaya</h4>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span>Total Jasa</span>
                                    <span>Rp {items.filter(i => i.type === 'Service').reduce((sum, item) => sum + (item.price * item.q), 0).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span>Total Sparepart</span>
                                    <span>Rp {items.filter(i => i.type === 'Part').reduce((sum, item) => sum + (item.price * item.q), 0).toLocaleString()}</span>
                                </div>

                                <div style={{ borderTop: '1px dashed var(--border)', margin: '0.75rem 0' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                    <span>Subtotal</span>
                                    <span>Rp {items.reduce((sum, item) => sum + (item.price * item.q), 0).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--danger)' }}>
                                    <span>Diskon / Potongan</span>
                                    <span>- Rp {items.reduce((sum, item) => sum + ((item.discount || 0) * item.q), 0).toLocaleString()}</span>
                                </div>

                                <div style={{ borderTop: '2px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Estimasi</span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>Rp {calculateTotal().toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                                    <Save size={18} /> Simpan Pendaftaran
                                </button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
}
