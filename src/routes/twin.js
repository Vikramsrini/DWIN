const express = require('express');
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const Activity = require('../models/Activity');
const User = require('../models/User');

const router = express.Router({ mergeParams: true });

// Health rating thresholds
const THRESHOLDS = {
    calories: { good: [1800, 2500], moderate: [1200, 3000] },
    sleep: { good: [7, 9], moderate: [5, 10] },
    hygiene: { good: [7, 10], moderate: [4, 10] },
    exercise: { good: [30, 120], moderate: [15, 180] }
};

function getHealthRating(type, value) {
    const t = THRESHOLDS[type];
    if (!t) return 'unknown';
    if (value >= t.good[0] && value <= t.good[1]) return 'good';
    if (value >= t.moderate[0] && value <= t.moderate[1]) return 'moderate';
    return 'poor';
}

function getOverallHealth(statuses) {
    const ratings = Object.values(statuses).map(s => s.rating);
    if (ratings.length === 0) return 'no-data';
    const score = ratings.reduce((sum, r) => {
        if (r === 'good') return sum + 3;
        if (r === 'moderate') return sum + 2;
        return sum + 1;
    }, 0) / ratings.length;

    if (score >= 2.5) return 'good';
    if (score >= 1.5) return 'moderate';
    return 'poor';
}

// GET /api/users/:userId/twin-status
router.get('/',
    query('date').optional().isDate().withMessage('Date must be YYYY-MM-DD'),
    validate,
    (req, res) => {
        const user = User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
        }

        const date = req.query.date || new Date().toISOString().split('T')[0];
        const summary = Activity.getDailySummary(req.params.userId, date);
        const weekly = Activity.getWeeklyData(req.params.userId, date);

        // Build status object
        const status = {};
        const defaultUnits = { calories: 'kcal', sleep: 'hours', hygiene: 'score', exercise: 'minutes' };

        for (const type of ['calories', 'sleep', 'hygiene', 'exercise']) {
            const entry = summary.find(s => s.type === type);
            const total = entry ? entry.total : 0;
            status[type] = {
                total,
                unit: entry ? entry.unit : defaultUnits[type],
                rating: total > 0 ? getHealthRating(type, total) : 'no-data'
            };
        }

        res.json({
            userId: parseInt(req.params.userId),
            user: { name: user.name, email: user.email },
            date,
            status,
            overallHealth: getOverallHealth(status),
            weeklyTrends: weekly
        });
    }
);

module.exports = router;
