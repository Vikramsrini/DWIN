const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const Activity = require('../models/Activity');
const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const VALID_TYPES = ['calories', 'sleep', 'hygiene', 'exercise'];
const VALID_UNITS = { calories: 'kcal', sleep: 'hours', hygiene: 'score', exercise: 'minutes' };

// Middleware: verify user exists
function ensureUser(req, res, next) {
    const user = User.findById(req.params.userId);
    if (!user) {
        return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
    }
    req.user = user;
    next();
}

router.use(ensureUser);

// GET /api/users/:userId/activities - List activities
router.get('/',
    query('date').optional().isDate().withMessage('Date must be YYYY-MM-DD'),
    query('type').optional().isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
    validate,
    (req, res) => {
        const activities = Activity.findByUser(req.params.userId, {
            date: req.query.date,
            type: req.query.type
        });
        res.json(activities);
    }
);

// GET /api/users/:userId/activities/:id - Get single activity
router.get('/:id',
    param('id').isInt({ min: 1 }),
    validate,
    (req, res) => {
        const activity = Activity.findById(req.params.id, req.params.userId);
        if (!activity) {
            return res.status(404).json({ error: 'Not Found', message: 'Activity not found.' });
        }
        res.json(activity);
    }
);

// POST /api/users/:userId/activities - Log an activity
router.post('/',
    body('type').isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a non-negative number'),
    body('unit').isIn(Object.values(VALID_UNITS)).withMessage(`Unit must be one of: ${Object.values(VALID_UNITS).join(', ')}`),
    body('date').isDate().withMessage('Date must be YYYY-MM-DD format'),
    body('notes').optional().trim(),
    validate,
    (req, res) => {
        const activity = Activity.create({
            user_id: parseInt(req.params.userId),
            ...req.body
        });
        res.status(201).json(activity);
    }
);

// PUT /api/users/:userId/activities/:id - Update activity
router.put('/:id',
    param('id').isInt({ min: 1 }),
    body('type').optional().isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
    body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a non-negative number'),
    body('unit').optional().isIn(Object.values(VALID_UNITS)).withMessage(`Unit must be one of: ${Object.values(VALID_UNITS).join(', ')}`),
    body('date').optional().isDate().withMessage('Date must be YYYY-MM-DD format'),
    body('notes').optional().trim(),
    validate,
    (req, res) => {
        const existing = Activity.findById(req.params.id, req.params.userId);
        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Activity not found.' });
        }
        const updated = Activity.update(req.params.id, req.params.userId, req.body);
        res.json(updated);
    }
);

// DELETE /api/users/:userId/activities/:id - Delete activity
router.delete('/:id',
    param('id').isInt({ min: 1 }),
    validate,
    (req, res) => {
        const existed = Activity.delete(req.params.id, req.params.userId);
        if (!existed) {
            return res.status(404).json({ error: 'Not Found', message: 'Activity not found.' });
        }
        res.status(204).end();
    }
);

module.exports = router;
