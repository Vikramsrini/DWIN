const express = require('express');
const crypto = require('crypto');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const User = require('../models/User');

const router = express.Router();

// GET /api/users - List all users
router.get('/', (req, res) => {
    const users = User.findAll();
    res.json(users);
});

// GET /api/users/:id - Get user by ID
router.get('/:id',
    param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
    validate,
    (req, res) => {
        const user = User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
        }
        res.json(user);
    }
);

// POST /api/users/login - Login user
router.post('/login',
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
    (req, res) => {
        const user = User.findByEmail(req.body.email);
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials.' });
        }
        
        const [salt, key] = user.password.split(':');
        const hashedBuffer = crypto.scryptSync(req.body.password, salt, 64);
        
        const keyBuffer = Buffer.from(key, 'hex');
        const match = crypto.timingSafeEqual(hashedBuffer, keyBuffer);
        
        if (!match) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials.' });
        }
        
        delete user.password;
        res.json(user);
    }
);

// POST /api/users - Create a user
router.post('/',
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('age').optional().isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150'),
    validate,
    (req, res) => {
        try {
            const salt = crypto.randomBytes(16).toString('hex');
            const hashed = crypto.scryptSync(req.body.password, salt, 64).toString('hex');
            const user = User.create({
                ...req.body,
                password: `${salt}:${hashed}`
            });
            delete user.password;
            res.status(201).json(user);
        } catch (err) {
            if (err.message.includes('UNIQUE constraint')) {
                return res.status(409).json({ error: 'Conflict', message: 'Email already exists.' });
            }
            throw err;
        }
    }
);

// PUT /api/users/:id - Update user
router.put('/:id',
    param('id').isInt({ min: 1 }),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('age').optional().isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150'),
    validate,
    (req, res) => {
        const user = User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
        }
        const updated = User.update(req.params.id, req.body);
        res.json(updated);
    }
);

// DELETE /api/users/:id - Delete user
router.delete('/:id',
    param('id').isInt({ min: 1 }),
    validate,
    (req, res) => {
        const existed = User.delete(req.params.id);
        if (!existed) {
            return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
        }
        res.status(204).end();
    }
);

module.exports = router;
