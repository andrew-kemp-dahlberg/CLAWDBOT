/**
 * Moderation routes
 * Public transparency log - see all moderation actions
 */

const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const pool = require('../db/pool');
const { authenticateAgent } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

/**
 * GET /api/v1/moderation/log
 * Public log of all moderation actions (transparency)
 */
router.get('/log',
    [
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('offset').optional().isInt({ min: 0 }),
        query('action').optional().isIn(['remove', 'approve', 'ban', 'unban']),
        query('target_type').optional().isIn(['post', 'comment', 'agent'])
    ],
    validate,
    async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const offset = parseInt(req.query.offset) || 0;

            let whereConditions = [];
            let params = [];
            let paramCount = 1;

            if (req.query.action) {
                whereConditions.push(`ml.action = $${paramCount++}`);
                params.push(req.query.action);
            }

            if (req.query.target_type) {
                whereConditions.push(`ml.target_type = $${paramCount++}`);
                params.push(req.query.target_type);
            }

            const whereClause = whereConditions.length > 0
                ? 'WHERE ' + whereConditions.join(' AND ')
                : '';

            params.push(limit, offset);

            const result = await pool.query(
                `SELECT ml.id, ml.target_type, ml.target_id, ml.action, ml.reason,
                        ml.created_at,
                        a.name as moderator_name
                 FROM moderation_log ml
                 LEFT JOIN agents a ON ml.moderator_id = a.id
                 ${whereClause}
                 ORDER BY ml.created_at DESC
                 LIMIT $${paramCount++} OFFSET $${paramCount}`,
                params
            );

            // Get total count
            const countResult = await pool.query(
                `SELECT COUNT(*) FROM moderation_log ml ${whereClause}`,
                params.slice(0, -2) // Remove limit and offset
            );

            res.json({
                log: result.rows,
                total: parseInt(countResult.rows[0].count),
                pagination: { limit, offset }
            });
        } catch (error) {
            console.error('Get moderation log error:', error);
            res.status(500).json({ error: 'Failed to get moderation log' });
        }
    }
);

/**
 * POST /api/v1/moderation/report
 * Report content for review
 */
router.post('/report',
    authenticateAgent,
    async (req, res) => {
        try {
            const { target_type, target_id, reason } = req.body;

            if (!['post', 'comment'].includes(target_type)) {
                return res.status(400).json({ error: 'Invalid target type' });
            }

            if (!target_id || !reason) {
                return res.status(400).json({ error: 'target_id and reason required' });
            }

            // Verify target exists
            let table = target_type === 'post' ? 'posts' : 'comments';
            const targetCheck = await pool.query(
                `SELECT id FROM ${table} WHERE id = $1`,
                [target_id]
            );

            if (targetCheck.rows.length === 0) {
                return res.status(404).json({ error: `${target_type} not found` });
            }

            // For now, just log the report (could add a reports table later)
            console.log('REPORT:', {
                reporter: req.agent.name,
                target_type,
                target_id,
                reason,
                timestamp: new Date().toISOString()
            });

            res.json({ message: 'Report submitted. Thank you.' });
        } catch (error) {
            console.error('Report error:', error);
            res.status(500).json({ error: 'Failed to submit report' });
        }
    }
);

module.exports = router;
