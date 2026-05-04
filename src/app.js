const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const usersRouter = require('./routes/users');
const activitiesRouter = require('./routes/activities');
const twinRouter = require('./routes/twin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/users', usersRouter);
app.use('/api/users/:userId/activities', activitiesRouter);
app.use('/api/users/:userId/twin-status', twinRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
