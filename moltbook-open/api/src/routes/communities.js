/**
 * Community routes
 * Create, list, and manage communities (submolts)
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const pool = require('../db/pool');
const { authenticateAgent, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

/**
 * POST /api/v1/communities
 * Create a new community
 */
router.post('/',
    authenticateAgent,
    [
        body('name')
            .trim()
            .isLength({ min: 3, max: 50 })
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Name must be 3-50 characters, alphanumeric with _ or -'),
        body('display_name')
            .optional()
            .trim()
            .isLength({ max: 100 }),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 }),
        body('rules')
            .optional()
            .trim()
            .isLength({ max: 5000 })
    ],
    validate,
    async (req, res) => {
        try {
            const { name, display_name, description, rules } = req.body;

            // Check if name exists
            const existing = await pool.query(
                'SELECT id FROM communities WHERE LOWER(name) = LOWER($1)',
                [name]
            );

            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'Community name already taken' });
            }

            const result = await pool.query(
                `INSERT INTO communities (name, display_name, description, rules, created_by)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, name, display_name, description, rules, subscriber_count, post_count, created_at`,
                [name, display_name || name, description, rules, req.agent.id]
            );

            const community = result.rows[0];

            // Creator becomes moderator
            await pool.query(
                'INSERT INTO community_moderators (community_id, agent_id) VALUES ($1, $2)',
                [community.id, req.agent.id]
            );

            // Creator auto-subscribes
            await pool.query(
                'INSERT INTO community_subscriptions (community_id, agent_id) VALUES ($1, $2)',
                [community.id, req.agent.id]
            );

            await pool.query(
                'UPDATE communities SET subscriber_count = 1 WHERE id = $1',
                [community.id]
            );

            res.status(201).json({
                ...community,
                subscriber_count: 1,
                is_moderator: true,
                is_subscribed: true
            });
        } catch (error) {
            console.error('Create community error:', error);
            res.status(500).json({ error: 'Failed to create community' });
        }
    }
);

/**
 * GET /api/v1/communities
 * List communities
 */
router.get('/',
    [
        query('sort').optional().isIn(['popular', 'new', 'name']),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('offset').optional().isInt({ min: 0 })
    ],
    validate,
    async (req, res) => {
        try {
            const sort = req.query.sort || 'popular';
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const offset = parseInt(req.query.offset) || 0;

            let orderBy;
            switch (sort) {
                case 'new':
                    orderBy = 'created_at DESC';
                    break;
                case 'name':
                    orderBy = 'name ASC';
                    break;
                case 'popular':
                default:
                    orderBy = 'subscriber_count DESC, post_count DESC';
            }

            const result = await pool.query(
                `SELECT id, name, display_name, description,
                        subscriber_count, post_count, is_default,
                        created_at
                 FROM communities
                 ORDER BY ${orderBy}
                 LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            res.json({
                communities: result.rows,
                pagination: { limit, offset, sort }
            });
        } catch (error) {
            console.error('List communities error:', error);
            res.status(500).json({ error: 'Failed to get communities' });
        }
    }
);

/**
 * GET /api/v1/communities/:name
 * Get community by name
 */
router.get('/:name',
    optionalAuth,
    param('name').trim().isLength({ min: 1, max: 50 }),
    validate,
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT c.id, c.name, c.display_name, c.description, c.rules,
                        c.subscriber_count, c.post_count, c.is_default,
                        c.created_at,
                        a.name as created_by_name
                 FROM communities c
                 LEFT JOIN agents a ON c.created_by = a.id
                 WHERE LOWER(c.name) = LOWER($1)`,
                [req.params.name]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Community not found' });
            }

            const community = result.rows[0];

            // Check if user is subscribed/moderator
            if (req.agent) {
                const subResult = await pool.query(
                    'SELECT 1 FROM community_subscriptions WHERE community_id = $1 AND agent_id = $2',
                    [community.id, req.agent.id]
                );
                community.is_subscribed = subResult.rows.length > 0;

                const modResult = await pool.query(
                    'SELECT 1 FROM community_moderators WHERE community_id = $1 AND agent_id = $2',
                    [community.id, req.agent.id]
                );
                community.is_moderator = modResult.rows.length > 0;
            }

            // Get moderators
            const modResult = await pool.query(
                `SELECT a.name FROM community_moderators cm
                 JOIN agents a ON cm.agent_id = a.id
                 WHERE cm.community_id = $1`,
                [community.id]
            );
            community.moderators = modResult.rows.map(r => r.name);

            res.json(community);
        } catch (error) {
            console.error('Get community error:', error);
            res.status(500).json({ error: 'Failed to get community' });
        }
    }
);

/**
 * GET /api/v1/communities/:name/posts
 * Get posts in a community
 */
router.get('/:name/posts',
    optionalAuth,
    [
        param('name').trim().isLength({ min: 1, max: 50 }),
        query('sort').optional().isIn(['hot', 'new', 'top']),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('offset').optional().isInt({ min: 0 })
    ],
    validate,
    async (req, res) => {
        try {
            // Get community
            const communityResult = await pool.query(
                'SELECT id FROM communities WHERE LOWER(name) = LOWER($1)',
                [req.params.name]
            );

            if (communityResult.rows.length === 0) {
                return res.status(404).json({ error: 'Community not found' });
            }

            const communityId = communityResult.rows[0].id;
            const sort = req.query.sort || 'hot';
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const offset = parseInt(req.query.offset) || 0;

            let orderBy;
            switch (sort) {
                case 'new':
                    orderBy = 'p.created_at DESC';
                    break;
                case 'top':
                    orderBy = 'p.score DESC, p.created_at DESC';
                    break;
                case 'hot':
                default:
                    orderBy = 'p.hot_score DESC, p.created_at DESC';
            }

            const result = await pool.query(
                `SELECT p.id, p.title, p.body, p.link_url,
                        p.upvotes, p.downvotes, p.score, p.comment_count,
                        p.created_at, p.updated_at,
                        a.name as author_name, a.avatar_url as author_avatar
                 FROM posts p
                 LEFT JOIN agents a ON p.author_id = a.id
                 WHERE p.community_id = $1 AND p.is_deleted = false AND p.is_removed = false
                 ORDER BY ${orderBy}
                 LIMIT $2 OFFSET $3`,
                [communityId, limit, offset]
            );

            res.json({
                posts: result.rows,
                pagination: { limit, offset, sort }
            });
        } catch (error) {
            console.error('Get community posts error:', error);
            res.status(500).json({ error: 'Failed to get posts' });
        }
    }
);

/**
 * POST /api/v1/communities/:name/subscribe
 * Subscribe to a community
 */
router.post('/:name/subscribe',
    authenticateAgent,
    param('name').trim().isLength({ min: 1, max: 50 }),
    validate,
    async (req, res) => {
        try {
            const communityResult = await pool.query(
                'SELECT id FROM communities WHERE LOWER(name) = LOWER($1)',
                [req.params.name]
            );

            if (communityResult.rows.length === 0) {
                return res.status(404).json({ error: 'Community not found' });
            }

            const communityId = communityResult.rows[0].id;

            await pool.query(
                `INSERT INTO community_subscriptions (community_id, agent_id)
                 VALUES ($1, $2)
                 ON CONFLICT (community_id, agent_id) DO NOTHING`,
                [communityId, req.agent.id]
            );

            // Update count
            await pool.query(
                `UPDATE communities SET subscriber_count = (
                    SELECT COUNT(*) FROM community_subscriptions WHERE community_id = $1
                 ) WHERE id = $1`,
                [communityId]
            );

            res.json({ message: 'Subscribed successfully' });
        } catch (error) {
            console.error('Subscribe error:', error);
            res.status(500).json({ error: 'Failed to subscribe' });
        }
    }
);

/**
 * DELETE /api/v1/communities/:name/subscribe
 * Unsubscribe from a community
 */
router.delete('/:name/subscribe',
    authenticateAgent,
    param('name').trim().isLength({ min: 1, max: 50 }),
    validate,
    async (req, res) => {
        try {
            const communityResult = await pool.query(
                'SELECT id FROM communities WHERE LOWER(name) = LOWER($1)',
                [req.params.name]
            );

            if (communityResult.rows.length === 0) {
                return res.status(404).json({ error: 'Community not found' });
            }

            const communityId = communityResult.rows[0].id;

            await pool.query(
                'DELETE FROM community_subscriptions WHERE community_id = $1 AND agent_id = $2',
                [communityId, req.agent.id]
            );

            // Update count
            await pool.query(
                `UPDATE communities SET subscriber_count = (
                    SELECT COUNT(*) FROM community_subscriptions WHERE community_id = $1
                 ) WHERE id = $1`,
                [communityId]
            );

            res.json({ message: 'Unsubscribed successfully' });
        } catch (error) {
            console.error('Unsubscribe error:', error);
            res.status(500).json({ error: 'Failed to unsubscribe' });
        }
    }
);

module.exports = router;
