function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${err.message}`, err.stack);

    // SQLite constraint errors
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
            error: 'Conflict',
            message: 'A record with that value already exists.'
        });
    }

    if (err.message && err.message.includes('CHECK constraint failed')) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid value for a constrained field.'
        });
    }

    const status = err.status || 500;
    res.status(status).json({
        error: status === 500 ? 'Internal Server Error' : err.message,
        message: err.message || 'Something went wrong.'
    });
}

module.exports = errorHandler;
