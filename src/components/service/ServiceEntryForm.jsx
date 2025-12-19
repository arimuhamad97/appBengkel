import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Bike, User, FileText, Search, Plus, Trash2, Wrench, History, Minus } from 'lucide-react';
import { api } from '../../services/api';
import NewCustomerModal from './NewCustomerModal';
import ServiceHistoryModal from './ServiceHistoryModal';

export default function ServiceEntryForm({ onSave, onCancel, initialData }) {
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [tempPlateNumber, setTempPlateNumber] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag untuk mencegah reload data
    const hasLoadedInitialData = useRef(false); // Track apakah initial data sudah pernah di-load

    // Helper for robust local date (YYYY-MM-DD)
    const getLocalDate = (d = new Date()) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        date: getLocalDate(),
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
        if (initialData && !hasLoadedInitialData.current) {
            hasLoadedInitialData.current = true;

            setFormData({
                date: initialData.date || getLocalDate(),
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

            setBikeSearchTerm(initialData.bikeModel || '');

            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items);
            }

            const loadLatestCustomerData = async () => {
                if (initialData.plateNumber) {
                    try {
                        const customerData = await api.getCustomerByPlate(initialData.plateNumber);
                        if (customerData) {
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
                            if (customerData.bikeModel) {
                                setBikeSearchTerm(customerData.bikeModel);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to load latest customer data:', error);
                    }
                }
            };

            loadLatestCustomerData();
            setIsDataLoaded(true);
        }
    }, [initialData]);

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0);
    };

    const isASSService = (groupType) => {
        if (!groupType) return false;
        const group = groupType.toUpperCase().trim();
        return group === 'ASS I' || group === 'ASS II' || group === 'ASS III' || group === 'ASS IV';
    };

    const handleAddService = () => {
        if (!selectedServiceId) return;
        const serv = servicesList.find(s => s.id === parseInt(selectedServiceId));
        if (serv) {
            const isFree = isASSService(serv.group_type);

            const newItem = {
                type: 'Service',
                name: serv.name,
                price: serv.price,
                q: 1,
                id: serv.id,
                discount: isFree ? serv.price : 0,
                discountPercent: isFree ? 100 : 0,
                isFreeVoucher: isFree,
                originalPrice: serv.price,
                group_type: serv.group_type
            };

            const newItems = [...items, newItem];

            if (serv.group_type && serv.group_type.toUpperCase().trim() === 'ASS I') {
                const updatedItems = newItems.map(item => {
                    if (item.type === 'Part' && item.category && item.category.toUpperCase().trim() === 'OLI' && !item.isFreeVoucher) {
                        return {
                            ...item,
                            isFreeVoucher: true,
                            originalPrice: item.originalPrice || item.price,
                            discount: item.price,
                            discountPercent: 100
                        };
                    }
                    return item;
                });
                setItems(updatedItems);
            } else {
                setItems(newItems);
            }

            setSelectedServiceId('');
            setServiceSearch('');
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

            const hasASSI = items.some(item =>
                item.type === 'Service' &&
                item.group_type &&
                item.group_type.toUpperCase().trim() === 'ASS I'
            );

            const isOil = part.category && part.category.toUpperCase().trim() === 'OLI';
            const isFree = hasASSI && isOil;

            const newItem = {
                type: 'Part',
                name: part.name,
                price: part.price,
                q: 1,
                id: part.id,
                stock: part.stock,
                discount: isFree ? part.price : 0,
                discountPercent: isFree ? 100 : 0,
                isFreeVoucher: isFree,
                originalPrice: part.price,
                category: part.category
            };
            setItems([...items, newItem]);
            setSelectedPartId('');
            setPartSearch('');
        }
    };

    const handleRemoveItem = (index) => {
        const itemToRemove = items[index];
        const newItems = [...items];
        newItems.splice(index, 1);

        const removedIsASSI = itemToRemove.type === 'Service' &&
            itemToRemove.group_type &&
            itemToRemove.group_type.toUpperCase().trim() === 'ASS I';

        if (removedIsASSI) {
            const stillHasASSI = newItems.some(item =>
                item.type === 'Service' &&
                item.group_type &&
                item.group_type.toUpperCase().trim() === 'ASS I'
            );

            if (!stillHasASSI) {
                const updatedItems = newItems.map(item => {
                    if (item.type === 'Part' && item.category && item.category.toUpperCase().trim() === 'OLI' && item.isFreeVoucher) {
                        return {
                            ...item,
                            isFreeVoucher: false,
                            discount: 0,
                            discountPercent: 0
                        };
                    }
                    return item;
                });
                setItems(updatedItems);
                return;
            }
        }

        setItems(newItems);
    };

    const handleUpdateDiscount = (index, value, mode = 'percent') => {
        const normalizedValue = typeof value === 'string' ? value.replace(',', '.') : value;
        const newItems = [...items];
        const item = newItems[index];

        if (mode === 'percent') {
            const percent = Math.min(100, Math.max(0, Number(normalizedValue)));
            item.discountPercent = percent;
            item.discount = Math.floor((item.price * percent) / 100);
        } else {
            const nominal = Number(normalizedValue);
            item.discount = nominal;
            if (item.price > 0) {
                item.discountPercent = parseFloat(((nominal / item.price) * 100).toFixed(2));
            }
        }
        setItems(newItems);
    };

    const handleUpdateQuantity = (index, value) => {
        const itemToCheck = items[index];
        const newQty = Math.max(1, Number(value));

        if (itemToCheck.type === 'Part') {
            if (newQty > (itemToCheck.stock || 0)) {
                alert(`Stok tidak cukup! Sisa stok: ${itemToCheck.stock || 0}`);
                return;
            }
        }

        // Immutable update to prevent side effects on shared references
        setItems(items.map((item, i) =>
            i === index ? { ...item, q: newQty } : item
        ));
    };

    const handleUpdatePrice = (index, value) => {
        const price = Number(value);
        const newItems = [...items];
        newItems[index].price = price;

        if (newItems[index].discountPercent !== undefined) {
            newItems[index].discount = Math.floor((price * newItems[index].discountPercent) / 100);
        }

        setItems(newItems);
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'plateNumber') value = value.toUpperCase();

        if (name === 'plateNumber' && value !== formData.plateNumber) {
            setIsDataLoaded(false);
            if (formData.plateNumber && value.length < formData.plateNumber.length) {
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
                    complaint: formData.complaint
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

        if (formData.plateNumber && formData.customerName) {
            try {
                await api.updateCustomer({
                    ...formData,
                    bikeModel: bikeDisplay
                });
            } catch (error) {
                console.error('Failed to update bike type:', error);
            }
        }
    };

    const handleCustomerDataBlur = async () => {
        if (!formData.plateNumber || !formData.customerName) return;
        try {
            await api.updateCustomer(formData);
        } catch (error) {
            console.error('Failed to auto-save customer data:', error);
        }
    };

    const checkDb = async (plate) => {
        if (!plate || plate.length < 3) return;
        if (isDataLoaded) return;

        try {
            const found = await api.getCustomerByPlate(plate);
            if (found) {
                setFormData(prev => ({
                    ...prev,
                    ...found
                }));
                setBikeSearchTerm(found.bikeModel || '');
                setIsDataLoaded(true);
            } else {
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
            await api.createCustomer(customerData);
            setFormData(prev => ({
                ...prev,
                ...customerData
            }));
            setIsDataLoaded(true);
            setShowNewCustomerModal(false);
        } catch (error) {
            console.error("Failed to save customer", error);
            alert('Gagal menyimpan data konsumen: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.plateNumber || !formData.customerName || !formData.bikeModel) {
            alert('Mohon lengkapi Nopol, Nama, dan Tipe Motor.');
            return;
        }

        if (!initialData) {
            try {
                const checkResult = await api.checkActiveQueue(formData.plateNumber);
                if (checkResult.exists) {
                    alert(`Plat nomor ${formData.plateNumber} sudah ada di antrian!`);
                    return;
                }
            } catch (error) {
                console.error('Failed to check active queue:', error);
            }
        }
        onSave({ ...formData, items });
    };

    const renderItemRow = (item, idx) => (
        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '0.5rem 0.25rem' }}>
                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{item.name}</div>
                {item.isFreeVoucher && (
                    <span style={{
                        marginTop: '0.25rem',
                        display: 'inline-block',
                        padding: '0.1rem 0.4rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold'
                    }}>
                        GRATIS
                    </span>
                )}
            </td>
            <td style={{ padding: '0.25rem', textAlign: 'right', minWidth: '100px' }}>
                <input
                    type="number"
                    className="input"
                    style={{ padding: '0.25rem 4px', fontSize: '0.85rem', textAlign: 'right', width: '100%' }}
                    value={item.price}
                    onChange={(e) => handleUpdatePrice(idx, e.target.value)}
                    disabled={item.isFreeVoucher}
                />
            </td>
            <td style={{ padding: '0.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <button type="button" className="btn btn-outline" style={{ padding: '0 6px', height: '30px', minWidth: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleUpdateQuantity(idx, Math.max(1, parseInt(item.q || 0) - 1))}>
                        <Minus size={14} />
                    </button>
                    <input
                        type="number"
                        min="1"
                        className="input"
                        style={{ padding: '0.25rem', fontSize: '0.9rem', textAlign: 'center', width: '45px', margin: 0 }}
                        value={item.q}
                        onChange={(e) => handleUpdateQuantity(idx, e.target.value)}
                    />
                    <button type="button" className="btn btn-outline" style={{ padding: '0 6px', height: '30px', minWidth: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleUpdateQuantity(idx, parseInt(item.q || 0) + 1)}>
                        <Plus size={14} />
                    </button>
                </div>
            </td>
            <td style={{ padding: '0.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <div style={{ position: 'relative', width: '50px' }}>
                        <input
                            type="text"
                            className="input"
                            style={{ padding: '1px 12px 1px 2px', fontSize: '0.75rem', textAlign: 'right', width: '100%', height: '22px' }}
                            placeholder="0"
                            value={item.discountPercent !== undefined ? item.discountPercent : ''}
                            onChange={(e) => handleUpdateDiscount(idx, e.target.value, 'percent')}
                            disabled={item.isFreeVoucher}
                            inputMode="decimal"
                        />
                        <span style={{ position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#888' }}>%</span>
                    </div>
                    <input
                        type="number"
                        className="input"
                        style={{ padding: '1px 2px', fontSize: '0.75rem', textAlign: 'right', width: '70px', height: '22px' }}
                        placeholder="Rp"
                        value={item.discount !== undefined ? item.discount : ''}
                        onChange={(e) => handleUpdateDiscount(idx, e.target.value, 'nominal')}
                        disabled={item.isFreeVoucher}
                    />
                </div>
            </td>
            <td style={{ padding: '0.25rem', textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Rp {((item.price - (item.discount || 0)) * item.q).toLocaleString()}
            </td>
            <td style={{ padding: '0.25rem', textAlign: 'right', width: '20px' }}>
                <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}>
                    <X size={18} />
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* --- TOP SECTION: DATA INPUT --- */}
                    <div className="grid-responsive-2" style={{ gap: '1.5rem' }}>
                        {/* Vehicle Data */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <Bike size={18} /> Data Kendaraan
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Tgl. Daftar <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <input
                                        type="date"
                                        name="date"
                                        className="input"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </div>
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
                            </div>
                            <div className="input-group" style={{ position: 'relative', marginTop: '1rem' }}>
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

                    <div className="grid-cols-3 sm-grid-cols-1" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
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

                    <div className="grid-responsive-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Kilometer</label>
                            <input type="number" name="kilometer" className="input" placeholder="KM" value={formData.kilometer} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No. Rangka (Opsional)</label>
                            <input type="text" name="frameNumber" className="input" value={formData.frameNumber} onChange={handleChange} onBlur={handleCustomerDataBlur} />
                        </div>
                    </div>

                    {/* --- BOTTOM SECTION: ESTIMATION --- */}
                    <div style={{ marginTop: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            <FileText size={18} /> Estimasi Biaya & Jasa
                        </h3>

                        <div className="grid-responsive-2" style={{ gap: '1.5rem' }}>
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
                                <div style={{ flex: 1, backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: '0.5rem', minHeight: '120px' }}>
                                    {items.filter(i => i.type === 'Service').length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '2rem', fontStyle: 'italic' }}>Belum ada jasa dipilih.</p>
                                    ) : (
                                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '0.5rem' }}>Item</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Harga</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'center', width: '50px' }}>Qty</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right', width: '120px' }}>Disk (%)</th>
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
                                                .filter(p => {
                                                    const search = partSearch.toLowerCase();
                                                    return p.name?.toLowerCase().includes(search) || p.id?.toLowerCase().includes(search);
                                                })
                                                .slice(0, 50)
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        [{p.id}] {p.name} (S: {p.stock}) - Rp {p.price.toLocaleString()}
                                                    </option>
                                                ))}
                                        </select>
                                        <button type="button" className="btn btn-primary" onClick={handleAddPart} disabled={!selectedPartId}><Plus size={18} /></button>
                                    </div>
                                </div>
                                <div style={{ flex: 1, backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius)', padding: '0.5rem', minHeight: '120px' }}>
                                    {items.filter(i => i.type === 'Part').length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '2rem', fontStyle: 'italic' }}>Belum ada part dipilih.</p>
                                    ) : (
                                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '0.5rem' }}>Item</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Harga</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'center', width: '110px' }}>Qty</th>
                                                    <th style={{ padding: '0.5rem', textAlign: 'right', width: '90px' }}>Diskon</th>
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

                        <div className="grid-responsive-2" style={{ gap: '1.5rem' }}>
                            <div style={{ backgroundColor: 'var(--bg-hover)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Ringkasan Biaya</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span>Rp {items.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.q), 0).toLocaleString()}</span>
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

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: '1 1 200px', padding: '0.8rem' }}>
                                    <Save size={18} /> Simpan Pendaftaran
                                </button>
                                <button type="button" className="btn btn-outline" style={{ flex: '1 1 200px' }} onClick={onCancel}>
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
