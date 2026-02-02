/**
 * Global error handler
 */

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors
        });
    }

    // Database errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                return res.status(409).json({
                    error: 'Resource already exists',
                    detail: err.detail
                });
            case '23503': // Foreign key violation
                return res.status(400).json({
                    error: 'Referenced resource does not exist',
                    detail: err.detail
                });
            case '22P02': // Invalid UUID
                return res.status(400).json({
                    error: 'Invalid ID format'
                });
        }
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
};

module.exports = { errorHandler };
