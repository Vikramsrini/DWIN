const { getDb } = require('../config/database');

class Activity {
    static findByUser(userId, { date, type } = {}) {
        const db = getDb();
        let query = 'SELECT * FROM activities WHERE user_id = ?';
        const params = [userId];

        if (date) {
            query += ' AND date = ?';
            params.push(date);
        }

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        query += ' ORDER BY date DESC, created_at DESC';
        return db.prepare(query).all(...params);
    }

    static findById(id, userId) {
        const db = getDb();
        return db.prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?').get(id, userId);
    }

    static create({ user_id, date, type, value, unit, notes }) {
        const db = getDb();
        const stmt = db.prepare(
            'INSERT INTO activities (user_id, date, type, value, unit, notes) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const result = stmt.run(user_id, date, type, value, unit, notes || null);
        return this.findById(result.lastInsertRowid, user_id);
    }

    static update(id, userId, { date, type, value, unit, notes }) {
        const db = getDb();
        const fields = [];
        const values = [];

        if (date !== undefined) { fields.push('date = ?'); values.push(date); }
        if (type !== undefined) { fields.push('type = ?'); values.push(type); }
        if (value !== undefined) { fields.push('value = ?'); values.push(value); }
        if (unit !== undefined) { fields.push('unit = ?'); values.push(unit); }
        if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }

        if (fields.length === 0) return this.findById(id, userId);

        values.push(id, userId);
        db.prepare(`UPDATE activities SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
        return this.findById(id, userId);
    }

    static delete(id, userId) {
        const db = getDb();
        const result = db.prepare('DELETE FROM activities WHERE id = ? AND user_id = ?').run(id, userId);
        return result.changes > 0;
    }

    static getDailySummary(userId, date) {
        const db = getDb();
        const rows = db.prepare(`
      SELECT type, SUM(value) as total, unit
      FROM activities
      WHERE user_id = ? AND date = ?
      GROUP BY type
    `).all(userId, date);

        return rows;
    }

    static getWeeklyData(userId, endDate) {
        const db = getDb();
        // Get 7 days of data ending at endDate
        const rows = db.prepare(`
      SELECT date, type, SUM(value) as total, unit
      FROM activities
      WHERE user_id = ? AND date BETWEEN date(?, '-6 days') AND ?
      GROUP BY date, type
      ORDER BY date ASC
    `).all(userId, endDate, endDate);

        return rows;
    }
}

module.exports = Activity;
