const getBaseUrl = () => {
    const hostname = window.location.hostname;

    // Jika akses dari localhost, gunakan localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
    }

    // Jika akses dari IP lain, gunakan IP yang sama untuk backend
    return `http://${hostname}:3001/api`;
};

export const api = {
    // Queue/Service
    getQueue: async () => {
        const res = await fetch(`${getBaseUrl()}/queue`);
        return res.json();
    },
    createQueue: async (data) => {
        const res = await fetch(`${getBaseUrl()}/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateQueue: async (id, data) => {
        const res = await fetch(`${getBaseUrl()}/queue/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal mengupdate antrian');
        return json;
    },
    deleteQueue: async (id) => {
        const res = await fetch(`${getBaseUrl()}/queue/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Job aliases (same as Queue)
    createJob: async (data) => {
        const res = await fetch(`${getBaseUrl()}/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal membuat job');
        return json;
    },
    updateJob: async (id, data) => {
        const res = await fetch(`${getBaseUrl()}/queue/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal mengupdate job');
        return json;
    },
    deleteJob: async (id) => {
        const res = await fetch(`${getBaseUrl()}/queue/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Utilities
    getCustomerByPlate: async (plate) => {
        const res = await fetch(`${getBaseUrl()}/customer-lookup?plate=${encodeURIComponent(plate)}`);
        return res.json();
    },

    // Services
    getServices: async () => {
        const res = await fetch(`${getBaseUrl()}/services`);
        return res.json();
    },

    // Mechanics
    getMechanics: async () => {
        const res = await fetch(`${getBaseUrl()}/mechanics`);
        return res.json();
    },
    createService: async (data) => {
        const res = await fetch(`${getBaseUrl()}/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteService: async (id) => {
        const res = await fetch(`${getBaseUrl()}/services/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Inventory
    getInventory: async () => {
        const res = await fetch(`${getBaseUrl()}/inventory`);
        return res.json();
    },
    createInventoryItem: async (data) => {
        const res = await fetch(`${getBaseUrl()}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateInventoryItem: async (id, data) => {
        const res = await fetch(`${getBaseUrl()}/inventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    reduceInventoryStock: async (items) => {
        const res = await fetch(`${getBaseUrl()}/inventory/reduce-stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        return res.json();
    },

    // Bike Types
    getBikeTypes: async () => {
        const res = await fetch(`${getBaseUrl()}/bike-types`);
        return res.json();
    },
    createBikeType: async (data) => {
        const res = await fetch(`${getBaseUrl()}/bike-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteBikeType: async (id) => {
        const res = await fetch(`${getBaseUrl()}/bike-types/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Part Types
    getPartTypes: async () => {
        const res = await fetch(`${getBaseUrl()}/part-types`);
        return res.json();
    },
    createPartType: async (data) => {
        const res = await fetch(`${getBaseUrl()}/part-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deletePartType: async (id) => {
        const res = await fetch(`${getBaseUrl()}/part-types/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    updatePartType: async (id, data) => {
        const res = await fetch(`${getBaseUrl()}/part-types/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateStockIn: async (id, data) => {
        const res = await fetch(`${getBaseUrl()}/stock-in/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteStockIn: async (id) => {
        const res = await fetch(`${getBaseUrl()}/stock-in/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Stock In
    getStockIn: async () => {
        const res = await fetch(`${getBaseUrl()}/stock-in`);
        return res.json();
    },
    createStockIn: async (data) => {
        const res = await fetch(`${getBaseUrl()}/stock-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // Stock Out
    getStockOut: async () => {
        const res = await fetch(`${getBaseUrl()}/stock-out`);
        return res.json();
    },
    createStockOut: async (data) => {
        const res = await fetch(`${getBaseUrl()}/stock-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteStockOut: async (id) => {
        const res = await fetch(`${getBaseUrl()}/stock-out/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    // Customers
    createCustomer: async (data) => {
        const res = await fetch(`${getBaseUrl()}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateCustomer: async (data) => {
        // Backend menggunakan ON CONFLICT untuk upsert, jadi kita gunakan POST yang sama
        const res = await fetch(`${getBaseUrl()}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    getServiceHistory: async (plateNumber) => {
        const res = await fetch(`${getBaseUrl()}/service-history/${encodeURIComponent(plateNumber)}`);
        return res.json();
    },
    checkActiveQueue: async (plateNumber) => {
        const res = await fetch(`${getBaseUrl()}/check-active-queue/${encodeURIComponent(plateNumber)}`);
        return res.json();
    },
    // Mechanics
    getMechanics: async () => {
        const res = await fetch(`${getBaseUrl()}/mechanics`);
        return res.json();
    },
    createMechanic: async (data) => {
        const res = await fetch(`${getBaseUrl()}/mechanics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal menambahkan mekanik');
        return json;
    },
    deleteMechanic: async (id) => {
        const res = await fetch(`${getBaseUrl()}/mechanics/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },
    // Sales
    createSale: async (data) => {
        const res = await fetch(`${getBaseUrl()}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal menyimpan penjualan');
        return json;
    },
    getSales: async () => {
        const res = await fetch(`${getBaseUrl()}/sales`);
        return res.json();
    },
    saveOpname: async (data) => {
        const response = await fetch(`${getBaseUrl()}/inventory/opname`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    deleteSale: async (id) => {
        const res = await fetch(`${getBaseUrl()}/sales/${id}`, {
            method: 'DELETE'
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal menghapus penjualan');
        return json;
    },


    // Attendance
    getAttendance: async (param) => {
        let query = '';
        if (typeof param === 'object') {
            if (param.month) query = `month=${param.month}`;
            else if (param.date) query = `date=${param.date}`;
        } else {
            // Backward compatibility for string date
            query = `date=${param}`;
        }
        const res = await fetch(`${getBaseUrl()}/attendance?${query}`);
        return res.json();
    },
    checkIn: async (data) => {
        const res = await fetch(`${getBaseUrl()}/attendance/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal check-in');
        return json;
    },
    checkOut: async (data) => {
        const res = await fetch(`${getBaseUrl()}/attendance/check-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal check-out');
        return json;
    },
    updateAttendanceStatus: async (data) => {
        const res = await fetch(`${getBaseUrl()}/attendance/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal update status');
        return json;
    },
    deleteAttendance: async (id) => {
        const res = await fetch(`${getBaseUrl()}/attendance/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Auth
    login: async (credentials) => {
        const res = await fetch(`${getBaseUrl()}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const json = await res.json();
        // Return full response (json + ok status) or handle error here? 
        // Logic in LoginPage expects data.error handling manually for 401. 
        // Let's emulate fetch response behavior or return structured object
        return { ok: res.ok, ...json };
    },

    // Expenses Report
    getExpenses: async (params) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${getBaseUrl()}/expenses?${query}`);
        return res.json();
    },
    addExpense: async (data) => {
        const res = await fetch(`${getBaseUrl()}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal menyimpan pengeluaran');
        return json;
    },
    deleteExpense: async (id) => {
        const res = await fetch(`${getBaseUrl()}/expenses/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    getCustomerLastVisit: async (plate, currentId) => {
        const query = new URLSearchParams({ plate, currentId }).toString();
        const res = await fetch(`${getBaseUrl()}/customer-last-visit?${query}`);
        if (!res.ok) return null;
        return res.json();
    },

    // Settings
    getSettings: async () => {
        const res = await fetch(`${getBaseUrl()}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },
    saveSettings: async (settings) => {
        const res = await fetch(`${getBaseUrl()}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to save settings');
        return json;
    }
};

