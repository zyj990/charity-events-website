// ============================================================
// api/server.js
// PROG2002 A2 - Express RESTful API for the charity events website
//
// How to run:
//   cd api
//   npm install express mysql2 cors
//   node server.js            -> API available at http://localhost:3000
//
// Endpoints (all GET, POST/PUT/DELETE come in Assessment 3):
//   GET /api/events                  Home: active + upcoming events (with category)
//   GET /api/categories              Search page dropdown list
//   GET /api/events/search           Filter: ?date=YYYY-MM-DD&location=...&category=id
//   GET /api/events/:id              Full details of one event
// ============================================================

const express = require('express');
const cors = require('cors');
const db = require('../database/event_db');

const app = express();
const PORT = 3000;

app.use(cors());                 // lets the client pages call this API from a browser
app.use(express.json());

// ------------------------------------------------------------
// Home page: all current & upcoming active events, with category
// Past events (event_date < today) and suspended ones are excluded.
// ------------------------------------------------------------
app.get('/api/events', async (req, res, next) => {
    try {
        const sql = `
            SELECT e.event_id, e.name, e.event_date, e.event_time, e.location,
                   e.ticket_price, e.image_url, c.name AS category
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            WHERE e.status = 'active'
              AND e.event_date >= CURDATE()
            ORDER BY e.event_date ASC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ------------------------------------------------------------
// Categories: used to fill the search page dropdown
// ------------------------------------------------------------
app.get('/api/categories', async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT category_id, name FROM categories ORDER BY name'
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ------------------------------------------------------------
// Search: filter active events by date / location / category.
// All criteria are optional and combinable (use one or several).
// Example:
//   /api/events/search?category=2
//   /api/events/search?date=2026-10-25&location=Park
// ------------------------------------------------------------
app.get('/api/events/search', async (req, res, next) => {
    try {
        const { date, location, category } = req.query;

        let sql = `
            SELECT e.event_id, e.name, e.event_date, e.event_time, e.location,
                   e.ticket_price, c.name AS category
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            WHERE e.status = 'active'
        `;
        const params = [];

        if (date) {
            sql += ' AND e.event_date = ?';       // exact date match
            params.push(date);
        }
        if (location) {
            sql += ' AND e.location LIKE ?';      // partial text match
            params.push('%' + location + '%');
        }
        if (category) {
            sql += ' AND e.category_id = ?';      // category id from dropdown
            params.push(category);
        }

        sql += ' ORDER BY e.event_date ASC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// ------------------------------------------------------------
// Event details: everything needed by the event detail page,
// including fundraising goal vs progress.
// ------------------------------------------------------------
app.get('/api/events/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT e.event_id, e.name, e.description, e.purpose,
                   e.event_date, e.event_time, e.location,
                   e.ticket_price, e.goal_amount, e.raised_amount, e.image_url,
                   c.name AS category, o.name AS organisation, o.mission
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
            JOIN organisations o ON e.organisation_id = o.organisation_id
            WHERE e.event_id = ? AND e.status = 'active'
        `;
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// ------------------------------------------------------------
// 404 handler + central error handler
// ------------------------------------------------------------
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});
//（注：内容由AI生成）
