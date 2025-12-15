import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db, { initDb, reloadDatabase } from './db.js';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

initDb();

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // HARDCODED FALLBACK (Priority Access)
    if (username === 'admin' && password === 'mutiara06844') {
        return res.json({
            message: "Login successful (Authorized)",
            user: { id: 1, username: 'admin', role: 'admin' }
        });
    }

    // In production, use bcrypt.compare(password, row.password)
    // For now, since npm install failed, we use simple text comparison as requested by user env limitations.

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(401).json({ error: "User tidak ditemukan" });

        if (row.password === password) {
            // Success
            // Return user info (omit password)
            res.json({
                message: "Login successful",
                user: { id: row.id, username: row.username, role: row.role }
            });
        } else {
            res.status(401).json({ error: "Password salah" });
        }
    });
});

// 1. GET Mechanics
app.get('/api/mechanics', (req, res) => {
    db.all("SELECT * FROM mechanics", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. GET Services
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services ORDER BY group_type, name ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2a. POST Service
app.post('/api/services', (req, res) => {
    const { name, group, price } = req.body;

    const sql = "INSERT INTO services (name, group_type, price) VALUES (?, ?, ?)";
    const params = [name, group, price];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, group_type: group, price });
    });
});

// 2b. DELETE Service
app.delete('/api/services/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM services WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// 3. GET Inventory
app.get('/api/inventory', (req, res) => {
    const sql = `SELECT * FROM inventory ORDER BY name ASC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. GET Queue
app.get('/api/queue', (req, res) => {
    db.all("SELECT * FROM queue ORDER BY queueNumber ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = rows.map(row => ({
            ...row,
            items: row.items ? JSON.parse(row.items) : []
        }));
        res.json(formatted);
    });
});

// Customer lookup - Updated to check customers table first
app.get('/api/customer-lookup', (req, res) => {
    const { plate } = req.query;
    if (!plate) return res.status(400).json({ error: 'Plate number required' });

    // Check customers table first
    db.get(
        "SELECT * FROM customers WHERE plate_number = ?",
        [plate],
        (err, customer) => {
            if (err) return res.status(500).json({ error: err.message });

            if (customer) {
                res.json({
                    customerName: customer.customer_name,
                    address: customer.address,
                    phoneNumber: customer.phone_number,
                    bikeModel: customer.bike_model,
                    frameNumber: customer.frame_number,
                    engineNumber: customer.engine_number,
                    color: customer.color,
                    year: customer.year,
                    kilometer: customer.kilometer
                });
            } else {
                // Fallback to queue table for backward compatibility
                db.get(
                    "SELECT * FROM queue WHERE plateNumber = ? ORDER BY id DESC LIMIT 1",
                    [plate],
                    (err, row) => {
                        if (err) return res.status(500).json({ error: err.message });
                        if (row) {
                            res.json({
                                customerName: row.customerName,
                                address: row.address,
                                phoneNumber: row.phoneNumber,
                                bikeModel: row.bikeModel,
                                frameNumber: row.frameNumber,
                                engineNumber: row.engineNumber,
                                color: row.color,
                                year: row.year
                            });
                        } else {
                            res.json(null);
                        }
                    }
                );
            }
        }
    );
});

// 5. POST Queue
app.post('/api/queue', (req, res) => {
    const data = req.body;
    const itemsJson = JSON.stringify(data.items || []);
    const id = Date.now();

    const sql = `INSERT INTO queue (id, queueNumber, date, customerName, bikeModel, plateNumber, status, mechanicId, entryTime, serviceType, complaint, items, phoneNumber, address, frameNumber, engineNumber, kilometer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        id, data.queueNumber, data.date, data.customerName, data.bikeModel, data.plateNumber,
        data.status, data.mechanicId, data.entryTime, data.serviceType, data.complaint,
        itemsJson, data.phoneNumber, data.address, data.frameNumber, data.engineNumber, data.kilometer
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: id, ...data });
    });
});

// 6. PUT Queue
app.put('/api/queue/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const itemsJson = JSON.stringify(data.items || []);

    // Check previous status and VALIDATE STOCK if completing
    db.get("SELECT status FROM queue WHERE id = ?", [id], async (err, oldRecord) => {
        if (err) return res.status(500).json({ error: err.message });

        const oldStatus = oldRecord ? oldRecord.status : null;
        const newStatus = data.status;
        const isCompletedStatus = (status) => status === 'Done' || status === 'completed' || status === 'Paid';

        // VALIDASI STOK: Jika status berubah ke Done/Completed
        if (!isCompletedStatus(oldStatus) && isCompletedStatus(newStatus)) {
            let itemsList = [];
            try {
                itemsList = typeof data.items === 'string' ? JSON.parse(data.items) : (data.items || []);
            } catch (e) {
                console.error('[DEBUG] Failed to parse items:', e);
                return res.status(400).json({ error: 'Invalid items data' });
            }

            const parts = itemsList.filter(item => item.type === 'Part');
            const insufficientParts = [];

            // Helper function to check stock (Promisified)
            const checkStock = (part) => {
                return new Promise((resolve) => {
                    const partId = part.id || part.code;
                    // Cek stok di tabel inventory
                    db.get("SELECT stock, name FROM inventory WHERE id = ?", [partId], (err, row) => {
                        // Jika row tidak ada, stok dianggap 0 (kecuali logic insert minus tadi, tapi kita mau cegah minus sekarang)
                        const currentStock = row ? row.stock : 0;
                        const partName = row ? row.name : (part.name || partId);

                        if (currentStock < part.q) {
                            resolve({ id: partId, name: partName, current: currentStock, required: part.q });
                        } else {
                            resolve(null);
                        }
                    });
                });
            };

            // Cek semua part secara parallel
            for (const part of parts) {
                const result = await checkStock(part);
                if (result) insufficientParts.push(result);
            }

            // Jika ada part yang stoknya kurang -> Set Error
            if (insufficientParts.length > 0) {
                const errorMsg = insufficientParts.map(p => `${p.name} (Stok: ${p.current}, Butuh: ${p.required})`).join(', ');
                console.warn(`[DEBUG] Stock validation failed for: ${errorMsg}`);
                return res.status(400).json({
                    error: `Stok tidak cukup untuk: ${errorMsg}. Transaksi dibatalkan.`
                });
            }
        }

        // JIKA LOLOS VALIDASI: Lanjut Update Queue
        const sql = `UPDATE queue SET 
            customerName = ?, bikeModel = ?, plateNumber = ?, status = ?, mechanicId = ?, 
            complaint = ?, items = ?, phoneNumber = ?, address = ?, 
            frameNumber = ?, engineNumber = ?, kilometer = ?
            WHERE id = ?`;

        const params = [
            data.customerName, data.bikeModel, data.plateNumber, data.status, data.mechanicId,
            data.complaint, itemsJson, data.phoneNumber, data.address,
            data.frameNumber, data.engineNumber, data.kilometer,
            id
        ];

        db.run(sql, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // LOGIKA PENGURANGAN STOK: Saat servis selesai
            if (!isCompletedStatus(oldStatus) && isCompletedStatus(newStatus)) {
                console.log(`[DEBUG] Service completed detected (Status: ${newStatus}). Processing stock reduction...`);

                let itemsList = [];
                try { itemsList = typeof data.items === 'string' ? JSON.parse(data.items) : (data.items || []); } catch (e) { }
                const parts = itemsList.filter(item => item.type === 'Part');
                const today = new Date().toISOString().split('T')[0];

                parts.forEach(part => {
                    const partId = part.id || part.code;
                    if (partId && part.q) {
                        // 1. Reduce Inventory
                        db.run("UPDATE inventory SET stock = stock - ? WHERE id = ?", [part.q, partId]);

                        // 2. Record Stock Out
                        db.run(
                            `INSERT INTO stock_out (code, name, qty, unit, price_sell, total_price, type, reference_id, date) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [partId, part.name, part.q, part.unit, part.price, (part.price || 0) * part.q, 'Service', id, today]
                        );
                    }
                });
            }

            // LOGIKA PENGEMBALIAN STOK: Saat status dikembalikan dari Done ke In Progress (atau status lain)
            if (isCompletedStatus(oldStatus) && !isCompletedStatus(newStatus)) {
                console.log(`[DEBUG] Service reverted from ${oldStatus} to ${newStatus}. Restoring stock...`);

                let itemsList = [];
                try { itemsList = typeof data.items === 'string' ? JSON.parse(data.items) : (data.items || []); } catch (e) { }
                const parts = itemsList.filter(item => item.type === 'Part');

                parts.forEach(part => {
                    const partId = part.id || part.code;
                    if (partId && part.q) {
                        // 1. Restore Inventory (tambahkan kembali)
                        db.run("UPDATE inventory SET stock = stock + ? WHERE id = ?", [part.q, partId], (err) => {
                            if (err) console.error(`[DEBUG] Failed to restore stock for ${partId}:`, err);
                            else console.log(`[DEBUG] Stock restored for ${partId}: +${part.q}`);
                        });
                    }
                });

                // 2. Delete ALL Stock Out Records for this service
                db.run(
                    "DELETE FROM stock_out WHERE reference_id = ? AND type = 'Service'",
                    [id],
                    (err) => {
                        if (err) console.error(`[DEBUG] Failed to bulk delete stock_out for service ${id}:`, err);
                        else console.log(`[DEBUG] All stock out records deleted for service ${id}`);
                    }
                );
            }

            res.json({ message: 'Updated', changes: this.changes });
        });
    });
});

// 7. DELETE Queue
app.delete('/api/queue/:id', (req, res) => {
    const { id } = req.params;

    // Pertama, ambil data queue untuk cek status dan items
    db.get("SELECT status, items FROM queue WHERE id = ?", [id], (err, queue) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!queue) return res.status(404).json({ error: 'Queue not found' });

        const isCompletedStatus = (status) => status === 'Done' || status === 'completed' || status === 'Paid';

        // Jika queue sudah completed, restore stock sebelum delete
        if (isCompletedStatus(queue.status)) {
            console.log(`[DEBUG] Deleting completed queue ${id}. Restoring stock...`);

            let itemsList = [];
            try { itemsList = typeof queue.items === 'string' ? JSON.parse(queue.items) : (queue.items || []); } catch (e) { }
            const parts = itemsList.filter(item => item.type === 'Part');

            parts.forEach(part => {
                const partId = part.id || part.code;
                if (partId && part.q) {
                    // Restore stock
                    db.run("UPDATE inventory SET stock = stock + ? WHERE id = ?", [part.q, partId], (err) => {
                        if (err) console.error(`[DEBUG] Failed to restore stock for ${partId}:`, err);
                        else console.log(`[DEBUG] Stock restored for ${partId}: +${part.q}`);
                    });
                }
            });

            // Delete ALL stock_out records for this service (Bulk delete is safer)
            db.run(
                "DELETE FROM stock_out WHERE reference_id = ? AND type = 'Service'",
                [id],
                (err) => {
                    if (err) console.error(`[DEBUG] Failed to delete stock_out for service ${id}:`, err);
                    else console.log(`[DEBUG] All stock_out records deleted for service ${id}`);
                }
            );
        }

        // Hapus queue
        db.run("DELETE FROM queue WHERE id = ?", id, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Deleted', changes: this.changes });
        });
    });
});

// 8. POST Inventory
app.post('/api/inventory', (req, res) => {
    const { id, name, price, stock, category, unit } = req.body;

    const sql = `INSERT INTO inventory (id, name, price, stock, category, unit) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [id, name, price, stock, category, unit || 'Pcs'];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name, price, stock, category, unit });
    });
});

// 9. PUT Inventory
app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, stock, category, unit } = req.body;

    // Build dynamic update query to handle optional fields
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push("name = ?"); params.push(name); }
    if (price !== undefined) { updates.push("price = ?"); params.push(price); }
    if (stock !== undefined) { updates.push("stock = ?"); params.push(stock); }
    if (category !== undefined) { updates.push("category = ?"); params.push(category); }
    if (unit !== undefined) { updates.push("unit = ?"); params.push(unit); }

    params.push(id);

    const sql = `UPDATE inventory SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated', changes: this.changes });
    });
});

// 9a. POST Reduce Inventory Stock
app.post('/api/inventory/reduce-stock', (req, res) => {
    const { items } = req.body; // Array of { id, quantity }

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array required' });
    }

    // Process each item
    let processed = 0;
    const errors = [];

    items.forEach((item, index) => {
        db.run(
            "UPDATE inventory SET stock = stock - ? WHERE id = ? AND stock >= ?",
            [item.quantity, item.id, item.quantity],
            function (err) {
                if (err) {
                    errors.push({ item: item.id, error: err.message });
                } else if (this.changes === 0) {
                    errors.push({ item: item.id, error: 'Insufficient stock or item not found' });
                }

                processed++;

                // Send response when all items processed
                if (processed === items.length) {
                    if (errors.length > 0) {
                        res.status(400).json({ message: 'Some items failed', errors });
                    } else {
                        res.json({ message: 'Stock reduced successfully', count: items.length });
                    }
                }
            }
        );
    });
});

// 10. GET Bike Types
app.get('/api/bike-types', (req, res) => {
    db.all("SELECT * FROM bike_types ORDER BY type ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 11. POST Bike Type
app.post('/api/bike-types', (req, res) => {
    const { type, code, year_from, year_to, engine_serial, frame_serial, category } = req.body;

    const sql = "INSERT INTO bike_types (type, code, year_from, year_to, engine_serial, frame_serial, category) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const params = [type, code, year_from, year_to, engine_serial, frame_serial, category];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, type, code, year_from, year_to, engine_serial, frame_serial, category });
    });
});

// 12. DELETE Bike Type
app.delete('/api/bike-types/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM bike_types WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// 13. GET Part Types
app.get('/api/part-types', (req, res) => {
    db.all("SELECT * FROM part_types ORDER BY name ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 14. POST Part Type
app.post('/api/part-types', (req, res) => {
    const { code, name, group_type, unit, sell_price, cost_price } = req.body;

    const sql = "INSERT INTO part_types (code, name, group_type, unit, sell_price, cost_price) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [code, name, group_type, unit, sell_price, cost_price];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const partTypeId = this.lastID;

        // Also create inventory record with stock 0
        // Use code as inventory ID if provided, otherwise use auto-generated part_type ID
        const inventoryId = code || `PT${partTypeId}`;
        const inventorySql = "INSERT OR IGNORE INTO inventory (id, name, price, stock, category) VALUES (?, ?, ?, ?, ?)";
        const inventoryParams = [inventoryId, name, sell_price, 0, group_type];

        db.run(inventorySql, inventoryParams, function (inventoryErr) {
            if (inventoryErr) {
                console.error('Failed to create inventory record:', inventoryErr);
                // Don't fail the whole request, just log the error
            }

            res.json({
                id: partTypeId,
                code,
                name,
                group_type,
                unit,
                sell_price,
                cost_price,
                inventory_created: !inventoryErr
            });
        });
    });
});

// 15. DELETE Part Type
app.delete('/api/part-types/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM part_types WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// 16. UPDATE Part Type
app.put('/api/part-types/:id', (req, res) => {
    const { id } = req.params;
    const { code, name, group_type, unit, sell_price, cost_price } = req.body;

    // First, get the current part_type to find inventory ID
    db.get("SELECT code FROM part_types WHERE id = ?", [id], (err, partType) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!partType) return res.status(404).json({ error: 'Part type not found' });

        // Build dynamic update query for part_types
        const updates = [];
        const params = [];

        if (code !== undefined) { updates.push("code = ?"); params.push(code); }
        if (name !== undefined) { updates.push("name = ?"); params.push(name); }
        if (group_type !== undefined) { updates.push("group_type = ?"); params.push(group_type); }
        if (unit !== undefined) { updates.push("unit = ?"); params.push(unit); }
        if (sell_price !== undefined) { updates.push("sell_price = ?"); params.push(sell_price); }
        if (cost_price !== undefined) { updates.push("cost_price = ?"); params.push(cost_price); }

        params.push(id);

        const sql = `UPDATE part_types SET ${updates.join(', ')} WHERE id = ?`;

        db.run(sql, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Also update inventory if relevant fields changed
            const inventoryId = code || partType.code || `PT${id}`;
            const invUpdates = [];
            const invParams = [];

            if (name !== undefined) { invUpdates.push("name = ?"); invParams.push(name); }
            if (sell_price !== undefined) { invUpdates.push("price = ?"); invParams.push(sell_price); }
            if (group_type !== undefined) { invUpdates.push("category = ?"); invParams.push(group_type); }

            if (invUpdates.length > 0) {
                invParams.push(inventoryId);
                const invSql = `UPDATE inventory SET ${invUpdates.join(', ')} WHERE id = ?`;

                db.run(invSql, invParams, function (invErr) {
                    if (invErr) {
                        console.error('Failed to update inventory:', invErr);
                    }
                    res.json({ message: 'Updated', changes: this.changes });
                });
            } else {
                res.json({ message: 'Updated', changes: this.changes });
            }
        });
    });
});

// --- STOCK OUT ENDPOINTS ---

// GET Stock Out
app.get('/api/stock-out', (req, res) => {
    db.all("SELECT * FROM stock_out ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST Stock Out (Direct Sales)
app.post('/api/stock-out', (req, res) => {
    const { code, name, qty, unit, price_sell, total_price, date, type, reference_id } = req.body;

    const sql = `INSERT INTO stock_out 
        (code, name, qty, unit, price_sell, total_price, date, type, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        code,
        name,
        qty,
        unit || 'Pcs',
        price_sell,
        total_price,
        date,
        type || 'Direct',
        reference_id || null
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const newId = this.lastID;

        // Reduce Inventory
        db.run(
            "UPDATE inventory SET stock = stock - ? WHERE id = ?",
            [qty, code],
            function (err) {
                if (err) console.error('Failed to reduce inventory:', err);
                res.json({ id: newId, ...req.body });
            }
        );
    });
});

// DELETE Stock Out (and restore inventory stock)
app.delete('/api/stock-out/:id', (req, res) => {
    const { id } = req.params;

    // First, get the stock_out record to know how much to restore
    db.get("SELECT * FROM stock_out WHERE id = ?", [id], (err, stockOutRecord) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!stockOutRecord) return res.status(404).json({ error: 'Record not found' });

        // Delete the stock_out record
        db.run("DELETE FROM stock_out WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Restore inventory stock (add back the quantity)
            db.run(
                "UPDATE inventory SET stock = stock + ? WHERE id = ?",
                [stockOutRecord.qty, stockOutRecord.code],
                function (err) {
                    if (err) console.error('Failed to restore inventory:', err.message);
                    res.json({
                        message: 'Deleted and stock restored',
                        restoredQty: stockOutRecord.qty,
                        code: stockOutRecord.code
                    });
                }
            );
        });
    });
});


// 16. GET Stock In
app.get('/api/stock-in', (req, res) => {
    db.all("SELECT * FROM stock_in ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 17. POST Stock In
app.post('/api/stock-in', (req, res) => {
    const { code, name, qty, unit, price, total, date } = req.body;

    const sql = "INSERT INTO stock_in (code, name, qty, unit, price, total, date) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const params = [code, name, qty, unit, price, total, date];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, code, name, qty, unit, price, total, date });
    });
});



// 18. PUT Stock In (and adjust inventory stock)
app.put('/api/stock-in/:id', (req, res) => {
    const { id } = req.params;
    const { code, name, qty, unit, price, total, date } = req.body;

    // First, get the old record to calculate difference
    db.get("SELECT * FROM stock_in WHERE id = ?", [id], (err, oldRecord) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!oldRecord) return res.status(404).json({ error: 'Record not found' });

        const qtyDifference = qty - oldRecord.qty;

        // Update stock_in record
        const sql = "UPDATE stock_in SET code = ?, name = ?, qty = ?, unit = ?, price = ?, total = ?, date = ? WHERE id = ?";
        const params = [code, name, qty, unit, price, total, date, id];

        db.run(sql, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Update inventory stock based on difference
            if (qtyDifference !== 0) {
                db.run(
                    "UPDATE inventory SET stock = stock + ? WHERE id = ?",
                    [qtyDifference, code],
                    function (err) {
                        if (err) console.error('Failed to update inventory:', err.message);
                        res.json({
                            message: 'Updated',
                            changes: this.changes,
                            qtyDifference: qtyDifference,
                            oldQty: oldRecord.qty,
                            newQty: qty
                        });
                    }
                );
            } else {
                res.json({ message: 'Updated', changes: this.changes });
            }
        });
    });
});

// 20. POST Inventory Opname (Adjustment)
app.post('/api/inventory/opname', (req, res) => {
    const { items, date, note } = req.body; // items: [{ id, name, systemStock, physicalStock, diff, price }]

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array required' });
    }

    const today = date || new Date().toISOString().split('T')[0];
    let processed = 0;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        items.forEach(item => {
            const diff = parseInt(item.diff);
            if (!isNaN(diff) && diff !== 0) {
                // 1. Update Inventory Master
                db.run("UPDATE inventory SET stock = ? WHERE id = ?", [item.physicalStock, item.id], (err) => {
                    if (err) console.error("Opname Update Error:", err);
                });

                // 2. Record History
                if (diff > 0) {
                    // Surplus (Found extra items) -> Stock In
                    const sqlIn = "INSERT INTO stock_in (code, name, qty, unit, price, total, date) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    db.run(sqlIn, [
                        item.id,
                        item.name + ' (Opname Adjustment)',
                        Math.abs(diff),
                        'Pcs',
                        item.price || 0,
                        0, // Total cost 0 for adjustment or calculate? Usually 0 or diff * price. Let's keep 0 for now to not mess up cash flow logic, or maybe mark it.
                        today
                    ]);
                } else {
                    // Loss (Missing items) -> Stock Out
                    const sqlOut = `INSERT INTO stock_out 
                        (code, name, qty, unit, price_sell, total_price, date, type, reference_id) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    db.run(sqlOut, [
                        item.id,
                        item.name + ' (Opname Adjustment)',
                        Math.abs(diff),
                        'Pcs',
                        item.price || 0,
                        0, // Loss value
                        today,
                        'Opname', // Type
                        'OPNAME-' + today // Ref ID
                    ]);
                }
            }
            processed++;
        });

        db.run('COMMIT', (err) => {
            if (err) {
                console.error('Opname commit failed:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Stok Opname berhasil diproses.' });
        });
    });
});

// 21. POST Inventory Transfer (Mutasi Keluar)
app.post('/api/inventory/transfer', (req, res) => {
    const { items, destination, date, note } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array required' });
    }

    const today = date || new Date().toISOString().split('T')[0];

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        items.forEach(item => {
            const qty = parseInt(item.qty);
            if (!isNaN(qty) && qty > 0) {
                // 1. Reduce Inventory Stock
                db.run("UPDATE inventory SET stock = stock - ? WHERE id = ?", [qty, item.id], err => {
                    if (err) console.error(`[Transfer Error] Failed to update stock for ${item.id}:`, err);
                });

                // 2. Record as Stock Out (Type 'Opname' as requested, with Transfer details)
                const sqlOut = `INSERT INTO stock_out 
                    (code, name, qty, unit, price_sell, total_price, date, type, reference_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                db.run(sqlOut, [
                    item.id,
                    item.name,
                    qty,
                    'Pcs',
                    item.price || 0, // Cost price ideally
                    0,
                    today,
                    'Opname', // REQUESTED: "tercatat sebagai stok opname"
                    `TRANSFER -> ${destination || 'Gudang Lain'}`
                ], err => {
                    if (err) console.error(`[Transfer Error] Failed to insert stock_out for ${item.id}:`, err);
                });
            }
        });

        db.run('COMMIT', (err) => {
            if (err) {
                console.error('Transfer commit failed:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Transfer stok berhasil dicatat.' });
        });
    });
});

// 19. DELETE Stock In (and reduce inventory stock)
app.delete('/api/stock-in/:id', (req, res) => {
    const { id } = req.params;

    // First, get the stock_in record to know how much to reduce
    db.get("SELECT * FROM stock_in WHERE id = ?", [id], (err, stockInRecord) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!stockInRecord) return res.status(404).json({ error: 'Record not found' });

        // Delete the stock_in record
        db.run("DELETE FROM stock_in WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Reduce inventory stock
            db.run(
                "UPDATE inventory SET stock = stock - ? WHERE id = ?",
                [stockInRecord.qty, stockInRecord.code],
                function (err) {
                    if (err) console.error('Failed to reduce inventory:', err.message);
                    res.json({
                        message: 'Deleted and stock reduced',
                        deletedQty: stockInRecord.qty,
                        code: stockInRecord.code
                    });
                }
            );
        });
    });
});

// --- MECHANICS ENDPOINTS ---

// GET All Mechanics
app.get('/api/mechanics', (req, res) => {
    db.all("SELECT * FROM mechanics ORDER BY name ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST New Mechanic
app.post('/api/mechanics', (req, res) => {
    const { name, phone, address, role, status } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Nama karyawan harus diisi!' });
    }

    const sql = "INSERT INTO mechanics (name, phone, address, role, status) VALUES (?, ?, ?, ?, ?)";
    const params = [
        name.trim(),
        phone || null,
        address || null,
        role || 'Mekanik',
        status || 'Available'
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            id: this.lastID,
            name,
            phone,
            address,
            role: role || 'Mekanik',
            status: status || 'Available'
        });
    });
});

// DELETE Mechanic
app.delete('/api/mechanics/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM mechanics WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

// 20. POST Customer
app.post('/api/customers', (req, res) => {
    const { plateNumber, customerName, bikeModel, engineNumber, frameNumber, year, color, phoneNumber, address, kilometer } = req.body;

    console.log('[DEBUG] Received customer data:', { plateNumber, customerName, bikeModel, engineNumber, frameNumber, year, color, phoneNumber, address, kilometer });

    const sql = `INSERT INTO customers (plate_number, customer_name, bike_model, engine_number, frame_number, year, color, phone_number, address, kilometer) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(plate_number) DO UPDATE SET
                 customer_name = excluded.customer_name,
                 bike_model = excluded.bike_model,
                 engine_number = excluded.engine_number,
                 frame_number = excluded.frame_number,
                 year = excluded.year,
                 color = excluded.color,
                 phone_number = excluded.phone_number,
                 address = excluded.address,
                 kilometer = excluded.kilometer,
                 updated_at = CURRENT_TIMESTAMP`;

    const params = [plateNumber, customerName, bikeModel, engineNumber, frameNumber, year, color, phoneNumber, address, kilometer];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('[DEBUG] Failed to save customer:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('[DEBUG] Customer saved successfully');
        res.json({ id: this.lastID, plateNumber, customerName, bikeModel });
    });
});

// 21. GET Service History by Plate Number
app.get('/api/service-history/:plateNumber', (req, res) => {
    const { plateNumber } = req.params;

    const sql = `SELECT * FROM queue 
                 WHERE plateNumber = ? AND (status = 'Done' OR status = 'Paid')
                 ORDER BY date DESC, id DESC`;

    db.all(sql, [plateNumber], (err, rows) => {
        if (err) {
            console.error('[DEBUG] Failed to get service history:', err.message);
            return res.status(500).json({ error: err.message });
        }

        // Parse items JSON for each row
        const history = rows.map(row => ({
            ...row,
            items: row.items ? JSON.parse(row.items) : []
        }));

        console.log(`[DEBUG] Found ${history.length} service history for ${plateNumber}`);
        res.json(history);
    });
});

// 22. Check if plate number already in active queue
app.get('/api/check-active-queue/:plateNumber', (req, res) => {
    const { plateNumber } = req.params;

    const sql = `SELECT * FROM queue 
                 WHERE plateNumber = ? AND (status = 'Pending' OR status = 'In Progress')
                 LIMIT 1`;

    db.get(sql, [plateNumber], (err, row) => {
        if (err) {
            console.error('[DEBUG] Failed to check active queue:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            console.log(`[DEBUG] Plate ${plateNumber} already in queue #${row.queueNumber} with status ${row.status}`);
            res.json({
                exists: true,
                queueNumber: row.queueNumber,
                status: row.status,
                serviceType: row.serviceType,
                date: row.date // Added date
            });
        } else {
            res.json({ exists: false });
        }
    });
});

// 23. Process Sale (Direct Sales)
app.post('/api/sales', (req, res) => {
    const { buyerName, items, total, date } = req.body;

    console.log('[DEBUG] Processing sale:', { buyerName, itemsCount: items.length, total });
    console.log('[DEBUG] Items detail:', JSON.stringify(items, null, 2));

    const dbSerialize = () => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // 1. Insert into sales history
            // Calculate total items quantity
            const totalItemsQty = items.reduce((acc, curr) => acc + curr.q, 0);

            db.run(
                "INSERT INTO sales (buyer, items, total, date, items_detail) VALUES (?, ?, ?, ?, ?)",
                [buyerName, totalItemsQty, total, date, JSON.stringify(items)],
                function (err) {
                    if (err) {
                        console.error('[DEBUG] Failed to insert sales record:', err.message);
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }

                    const saleId = this.lastID;
                    // To do: If we used stock_out table, insert here with reference_id = saleId

                    // 2. Loop items and reduce stock
                    let completed = 0;
                    if (items.length === 0) { // Should not happen in validation
                        db.run('COMMIT');
                        return res.json({ success: true, message: 'Penjualan berhasil disimpan.' });
                    }

                    items.forEach(item => {
                        const updateSql = `UPDATE inventory SET stock = stock - ? WHERE id = ?`;
                        db.run(updateSql, [item.q, item.id], function (err) {
                            if (err) {
                                console.error(`[DEBUG] Failed to update stock for item ${item.id}:`, err.message);
                            } else {
                                console.log(`[DEBUG] Reduced stock for item ${item.id} by ${item.q}`);

                                // Insert into stock_out for history tracking
                                const stockOutSql = `INSERT INTO stock_out 
                                    (code, name, qty, price_sell, total_price, type, reference_id, date) 
                                    VALUES (?, ?, ?, ?, ?, 'Direct', ?, ?)`;
                                db.run(stockOutSql, [
                                    item.id,
                                    item.name,
                                    item.q,
                                    item.price,
                                    item.price * item.q,
                                    saleId,
                                    date
                                ], (err) => {
                                    if (err) console.error('Failed to log stock out:', err);
                                });
                            }

                            completed++;
                            if (completed === items.length) {
                                db.run('COMMIT', (err) => {
                                    if (err) {
                                        console.error('[DEBUG] Transaction commit failed:', err.message);
                                        return res.status(500).json({ error: err.message });
                                    }
                                    res.json({ success: true, message: 'Penjualan berhasil disimpan dan stok berkurang.' });
                                });
                            }
                        });
                    });
                }
            );
        });
    };

    dbSerialize();
});

// 24. GET Sales History
app.get('/api/sales', (req, res) => {
    db.all("SELECT * FROM sales ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error('[DEBUG] Failed to fetch sales:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('[DEBUG] Fetched sales count:', rows.length);

        // Parse items_detail for each sale
        const parsedRows = rows.map(row => {
            let parsedItems = [];
            try {
                if (row.items_detail) {
                    parsedItems = JSON.parse(row.items_detail);
                }
            } catch (e) {
                console.error('[DEBUG] Failed to parse items_detail for sale', row.id, e);
            }

            return {
                ...row,
                items_detail_parsed: parsedItems
            };
        });

        if (parsedRows.length > 0) {
            console.log('[DEBUG] Sample sale:', JSON.stringify(parsedRows[0], null, 2));
        }
        res.json(parsedRows);
    });
});

// 25. DELETE Sale (Rollback Stock)
app.delete('/api/sales/:id', (req, res) => {
    const { id } = req.params;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 1. Get sale details to restore stock
        db.get('SELECT items_detail FROM sales WHERE id = ?', [id], (err, row) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'Sale not found' });
            }

            let items = [];
            try {
                items = JSON.parse(row.items_detail);
            } catch (e) {
                console.error('Failed to parse items_detail during delete:', e);
            }

            // 2. Restore stock
            if (items && items.length > 0) {
                items.forEach(item => {
                    db.run('UPDATE inventory SET stock = stock + ? WHERE id = ?', [item.q, item.id]);
                });
                // Remove from stock_out history
                db.run('DELETE FROM stock_out WHERE reference_id = ? AND type = ?', [id, 'Direct']);
            }

            // 3. Delete sale record
            db.run('DELETE FROM sales WHERE id = ?', [id], function (err) {
                if (err) {
                    console.error('Failed to delete sale:', err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }

                db.run('COMMIT', (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, message: 'Penjualan dihapus dan stok dikembalikan.' });
                });
            });
        });
    });
});

// 26. GET Attendance by Date
// 26. GET Attendance by Date or Month
app.get('/api/attendance', (req, res) => {
    const { date, month } = req.query;

    if (!date && !month) {
        return res.status(400).json({ error: 'Date or Month is required' });
    }

    let sql = `
        SELECT a.*, m.name, m.role 
        FROM attendance a
        JOIN mechanics m ON a.mechanic_id = m.id
    `;
    let params = [];

    if (date) {
        sql += ` WHERE a.date = ?`;
        params.push(date);
    } else if (month) {
        sql += ` WHERE a.date LIKE ?`;
        params.push(`${month}%`); // Matches 'YYYY-MM-DD' with 'YYYY-MM%'
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 27. Check-In
app.post('/api/attendance/check-in', (req, res) => {
    const { mechanic_id, date, time, status, notes } = req.body;

    // Check if already checked in
    db.get("SELECT id FROM attendance WHERE mechanic_id = ? AND date = ?", [mechanic_id, date], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            return res.status(400).json({ error: 'Sudah absen hari ini!' }); // Should be updated if needed
        }

        const sql = `INSERT INTO attendance (mechanic_id, date, check_in_time, status, notes) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [mechanic_id, date, time, status || 'Hadir', notes], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, success: true });
        });
    });
});

// 28. Check-Out
app.post('/api/attendance/check-out', (req, res) => {
    const { id, time } = req.body;

    const sql = `UPDATE attendance SET check_out_time = ? WHERE id = ?`;
    db.run(sql, [time, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 29. Update Status (e.g. Sakit/Ijin without check-in time)
app.post('/api/attendance/status', (req, res) => {
    const { mechanic_id, date, status, notes } = req.body;

    // Check existing
    db.get("SELECT id FROM attendance WHERE mechanic_id = ? AND date = ?", [mechanic_id, date], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Update
            db.run("UPDATE attendance SET status = ?, notes = ? WHERE id = ?", [status, notes, row.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: row.id });
            });
        } else {
            // Insert
            db.run("INSERT INTO attendance (mechanic_id, date, status, notes) VALUES (?, ?, ?, ?)", [mechanic_id, date, status, notes], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: this.lastID });
            });
        }
    });
});

// 30. Reset/Delete Attendance (Correction)
app.delete('/api/attendance/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM attendance WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});


// === EXPENSES API ===

// Get Expenses (with date filter)
app.get('/api/expenses', (req, res) => {
    const { startDate, endDate, month } = req.query;
    let sql = "SELECT * FROM expenses";
    let params = [];

    if (month) {
        // e.g., 2025-11
        sql += " WHERE date LIKE ?";
        params.push(`${month}%`);
    } else if (startDate && endDate) {
        sql += " WHERE date BETWEEN ? AND ?";
        params.push(startDate, endDate);
    }

    sql += " ORDER BY date DESC, created_at DESC";

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create Expense
app.post('/api/expenses', (req, res) => {
    console.log('[DEBUG] Received POST /api/expenses:', req.body);
    const { date, description, category, amount, notes } = req.body;

    // Convert amount to integer
    const amountVal = parseInt(amount);

    if (!description || isNaN(amountVal) || !date) {
        console.error('[DEBUG] Invalid data:', req.body);
        return res.status(400).json({ error: 'Data tidak lengkap atau format salah' });
    }

    const sql = `INSERT INTO expenses (date, description, category, amount, notes) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [date, description, category, amountVal, notes], function (err) {
        if (err) {
            console.error('[DEBUG] Database Insert Error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, ...req.body, amount: amountVal });
    });
});

// Delete Expense
app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM expenses WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});


// --- DATABASE BACKUP/RESTORE ENDPOINTS ---

// --- DATABASE BACKUP/RESTORE ENDPOINTS ---

// Backup Database - Export database file
app.get('/api/database/backup', (req, res) => {
    const dbPath = path.join(__dirname, 'bengkel.db');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `bengkel-backup-${timestamp}.db`;

    try {
        // Check if database file exists
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Database file not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Stream the database file
        const fileStream = fs.createReadStream(dbPath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('Backup error:', err);
            res.status(500).json({ error: 'Failed to backup database' });
        });

    } catch (err) {
        console.error('Backup error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Restore Database - Import database file
app.post('/api/database/restore', (req, res) => {
    // Check if file data is provided
    if (!req.body.fileData) {
        return res.status(400).json({ error: 'No file data provided' });
    }

    const dbPath = path.join(__dirname, 'bengkel.db');
    const backupPath = path.join(__dirname, `bengkel-backup-before-restore-${Date.now()}.db`);

    try {
        // Create backup of current database before restore
        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, backupPath);
            console.log(`Current database backed up to: ${backupPath}`);
        }

        // Decode base64 file data
        const fileBuffer = Buffer.from(req.body.fileData, 'base64');

        // Close existing database connection
        // Since 'db' is a proxy, this closes the underlying realDb connection
        db.close(async (err) => {
            if (err) {
                console.error('Error closing database:', err);
            }

            try {
                // Write new database file
                fs.writeFileSync(dbPath, fileBuffer);
                console.log('Database file overwritten successfully');

                // Reload the database connection (swap realDb in proxy)
                await reloadDatabase();

                res.json({
                    success: true,
                    message: 'Database restored successfully. Please refresh the page.'
                });
            } catch (writeErr) {
                console.error('Error during restore process:', writeErr);

                // Try to restore backup if something went wrong
                try {
                    if (fs.existsSync(backupPath)) {
                        fs.copyFileSync(backupPath, dbPath);
                        await reloadDatabase();
                        console.log('Rolled back to previous database version');
                    }
                } catch (rollbackErr) {
                    console.error('CRITICAL: Failed to rollback database:', rollbackErr);
                }

                res.status(500).json({ error: 'Failed to restore database: ' + writeErr.message });
            }
        });

    } catch (err) {
        console.error('Restore error:', err);
        // Restore from backup if something went wrong
        if (fs.existsSync(backupPath)) {
            try { fs.copyFileSync(backupPath, dbPath); } catch (e) { }
        }
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
