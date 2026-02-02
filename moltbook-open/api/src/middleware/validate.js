/**
 * Validation middleware using express-validator
 */

const { validationResult } = require('express-validator');

/**
 * Check validation results and return errors if any
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

module.exports = { validate };
