const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'checkin.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create check_ins table
db.run(`
    CREATE TABLE IF NOT EXISTS check_ins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        phone TEXT NOT NULL,
        idNumber TEXT NOT NULL,
        purpose TEXT NOT NULL,
        status TEXT DEFAULT 'INSIDE',
        checkInTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        checkOutTime DATETIME
    )
`);

// API Routes

// 1. Get all check-ins
app.get('/api/checkins', (req, res) => {
    db.all("SELECT * FROM check_ins ORDER BY checkInTime DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 2. New check-in entry
app.post('/api/checkins', (req, res) => {
    const { fullName, phone, idNumber, purpose } = req.body;
    if (!fullName || !phone || !idNumber || !purpose) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = `INSERT INTO check_ins (fullName, phone, idNumber, purpose) VALUES (?, ?, ?, ?)`;
    db.run(query, [fullName, phone, idNumber, purpose], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, fullName, phone, idNumber, purpose, status: 'INSIDE' });
    });
});

// 3. Visitor check-out
app.patch('/api/checkins/:id/checkout', (req, res) => {
    const { id } = req.params;
    const checkOutTime = new Date().toISOString();
    
    const query = `UPDATE check_ins SET status = 'CHECKED_OUT', checkOutTime = ? WHERE id = ?`;
    db.run(query, [checkOutTime, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Visitor checked out successfully', id, status: 'CHECKED_OUT', checkOutTime });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});