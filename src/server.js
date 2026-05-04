require('dotenv').config();
const app = require('./app');
const { getDb, closeDb } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Initialize database
getDb();

const server = app.listen(PORT, () => {
    console.log(`\n🏥 Digital Twin Health Tracker`);
    console.log(`   Server running at http://localhost:${PORT}`);
    console.log(`   API base: http://localhost:${PORT}/api`);
    console.log(`   Dashboard: http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    closeDb();
    server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
    closeDb();
    server.close(() => process.exit(0));
});
