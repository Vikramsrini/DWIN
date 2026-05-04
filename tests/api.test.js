const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

// Setup test environment
process.env.DB_PATH = './data/test-health.db';
const fs = require('fs');
const path = require('path');

// Clean test DB before tests
const testDbPath = path.resolve(process.env.DB_PATH);
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

const app = require('../src/app');
const { closeDb } = require('../src/config/database');

let userId;
let activityId;

describe('Health Activity Tracking API', () => {
    after(() => {
        closeDb();
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    });

    // ─── Users ───
    describe('Users', () => {
        it('POST /api/users — create a user', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({ name: 'Test User', email: 'test@example.com', age: 25, password: 'password123' })
                .expect(201);

            assert.strictEqual(res.body.name, 'Test User');
            assert.strictEqual(res.body.email, 'test@example.com');
            assert.ok(res.body.id);
            userId = res.body.id;
        });

        it('GET /api/users — list users', async () => {
            const res = await request(app).get('/api/users').expect(200);
            assert.ok(Array.isArray(res.body));
            assert.strictEqual(res.body.length, 1);
        });

        it('GET /api/users/:id — get user', async () => {
            const res = await request(app).get(`/api/users/${userId}`).expect(200);
            assert.strictEqual(res.body.name, 'Test User');
        });

        it('GET /api/users/999 — not found', async () => {
            await request(app).get('/api/users/999').expect(404);
        });

        it('PUT /api/users/:id — update user', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .send({ name: 'Updated User' })
                .expect(200);
            assert.strictEqual(res.body.name, 'Updated User');
        });

        it('POST /api/users — duplicate email', async () => {
            await request(app)
                .post('/api/users')
                .send({ name: 'Dup', email: 'test@example.com', password: 'password123' })
                .expect(409);
        });

        it('POST /api/users — validation error (no name)', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({ email: 'x@y.com', password: 'password123' })
                .expect(400);
            assert.strictEqual(res.body.error, 'Validation Error');
        });
    });

    // ─── Activities ───
    describe('Activities', () => {
        it('POST — log a calories activity', async () => {
            const res = await request(app)
                .post(`/api/users/${userId}/activities`)
                .send({ type: 'calories', value: 500, unit: 'kcal', date: '2026-03-13' })
                .expect(201);

            assert.strictEqual(res.body.type, 'calories');
            assert.strictEqual(res.body.value, 500);
            activityId = res.body.id;
        });

        it('POST — log a sleep activity', async () => {
            await request(app)
                .post(`/api/users/${userId}/activities`)
                .send({ type: 'sleep', value: 7.5, unit: 'hours', date: '2026-03-13' })
                .expect(201);
        });

        it('POST — log exercise', async () => {
            await request(app)
                .post(`/api/users/${userId}/activities`)
                .send({ type: 'exercise', value: 45, unit: 'minutes', date: '2026-03-13' })
                .expect(201);
        });

        it('POST — log hygiene', async () => {
            await request(app)
                .post(`/api/users/${userId}/activities`)
                .send({ type: 'hygiene', value: 8, unit: 'score', date: '2026-03-13' })
                .expect(201);
        });

        it('GET — list all activities', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}/activities`)
                .expect(200);
            assert.strictEqual(res.body.length, 4);
        });

        it('GET — filter by type', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}/activities?type=sleep`)
                .expect(200);
            assert.strictEqual(res.body.length, 1);
            assert.strictEqual(res.body[0].type, 'sleep');
        });

        it('GET — filter by date', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}/activities?date=2026-03-13`)
                .expect(200);
            assert.strictEqual(res.body.length, 4);
        });

        it('GET — single activity', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}/activities/${activityId}`)
                .expect(200);
            assert.strictEqual(res.body.value, 500);
        });

        it('PUT — update activity', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}/activities/${activityId}`)
                .send({ value: 600 })
                .expect(200);
            assert.strictEqual(res.body.value, 600);
        });

        it('POST — validation error (invalid type)', async () => {
            await request(app)
                .post(`/api/users/${userId}/activities`)
                .send({ type: 'dancing', value: 30, unit: 'minutes', date: '2026-03-13' })
                .expect(400);
        });

        it('POST — activities for non-existent user', async () => {
            await request(app)
                .post('/api/users/999/activities')
                .send({ type: 'sleep', value: 8, unit: 'hours', date: '2026-03-13' })
                .expect(404);
        });
    });

    // ─── Twin Status ───
    describe('Twin Status', () => {
        it('GET — twin status with data', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}/twin-status?date=2026-03-13`)
                .expect(200);

            assert.ok(res.body.status);
            assert.ok(res.body.status.calories);
            assert.ok(res.body.status.sleep);
            assert.ok(res.body.status.exercise);
            assert.ok(res.body.status.hygiene);
            assert.ok(res.body.overallHealth);

            // Verify values
            assert.strictEqual(res.body.status.calories.total, 600); // updated from 500 to 600
            assert.strictEqual(res.body.status.sleep.total, 7.5);
            assert.strictEqual(res.body.status.sleep.rating, 'good');
        });

        it('GET — twin status for non-existent user', async () => {
            await request(app)
                .get('/api/users/999/twin-status')
                .expect(404);
        });
    });

    // ─── Cleanup ───
    describe('Cleanup', () => {
        it('DELETE — delete activity', async () => {
            await request(app)
                .delete(`/api/users/${userId}/activities/${activityId}`)
                .expect(204);
        });

        it('DELETE — delete user (cascade)', async () => {
            await request(app)
                .delete(`/api/users/${userId}`)
                .expect(204);

            // Verify cascade
            const res = await request(app).get('/api/users').expect(200);
            assert.strictEqual(res.body.length, 0);
        });
    });
});
