const { getDb } = require('../config/database');

class User {
    static findAll() {
        const db = getDb();
        return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    }

    static findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    static findByEmail(email) {
        const db = getDb();
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    static create({ name, email, password, age }) {
        const db = getDb();
        const stmt = db.prepare('INSERT INTO users (name, email, password, age) VALUES (?, ?, ?, ?)');
        const result = stmt.run(name, email, password || null, age || null);
        return this.findById(result.lastInsertRowid);
    }

    static update(id, { name, email, age }) {
        const db = getDb();
        const fields = [];
        const values = [];

        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email); }
        if (age !== undefined) { fields.push('age = ?'); values.push(age); }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        return this.findById(id);
    }

    static delete(id) {
        const db = getDb();
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
        return result.changes > 0;
    }
}

module.exports = User;
