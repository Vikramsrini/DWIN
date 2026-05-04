require('dotenv').config();
const { getDb, closeDb } = require('./config/database');

function seed() {
    const db = getDb();

    console.log('🌱 Seeding database...\n');

    // Clear existing data
    db.exec('DELETE FROM activities; DELETE FROM users;');

    // Create demo user
    const user = db.prepare(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)'
    ).run('Vikram', 'vikram@example.com', 20);

    const userId = user.lastInsertRowid;
    console.log(`✅ Created user: Vikram (ID: ${userId})`);

    // Generate 7 days of activity data
    const today = new Date();
    const activities = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Calories (1500-2800 kcal)
        activities.push({
            user_id: userId, date: dateStr, type: 'calories',
            value: Math.round(1500 + Math.random() * 1300),
            unit: 'kcal', notes: 'Daily calorie intake'
        });

        // Sleep (4-9 hours)
        activities.push({
            user_id: userId, date: dateStr, type: 'sleep',
            value: Math.round((4 + Math.random() * 5) * 10) / 10,
            unit: 'hours', notes: 'Night sleep'
        });

        // Hygiene (3-10 score)
        activities.push({
            user_id: userId, date: dateStr, type: 'hygiene',
            value: Math.round(3 + Math.random() * 7),
            unit: 'score', notes: 'Daily hygiene routine'
        });

        // Exercise (0-90 minutes)
        activities.push({
            user_id: userId, date: dateStr, type: 'exercise',
            value: Math.round(Math.random() * 90),
            unit: 'minutes', notes: 'Workout session'
        });
    }

    const insertStmt = db.prepare(
        'INSERT INTO activities (user_id, date, type, value, unit, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const insertMany = db.transaction((items) => {
        for (const a of items) {
            insertStmt.run(a.user_id, a.date, a.type, a.value, a.unit, a.notes);
        }
    });

    insertMany(activities);
    console.log(`✅ Created ${activities.length} activities (7 days × 4 types)\n`);

    // Create a second user
    const user2 = db.prepare(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)'
    ).run('Priya', 'priya@example.com', 24);
    console.log(`✅ Created user: Priya (ID: ${user2.lastInsertRowid})`);

    console.log('\n🎉 Seeding complete!');
    closeDb();
}

seed();
