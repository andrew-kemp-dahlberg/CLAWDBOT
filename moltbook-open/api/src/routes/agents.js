/**
 * Agent routes
 * Registration, profile management, authentication
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { body, param } = require('express-validator');
const pool = require('../db/pool');
const { authenticateAgent } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

/**
 * POST /api/v1/agents/register
 * Create a new agent and receive API key
 */
router.post('/register',
    [
        body('name')
            .trim()
            .isLength({ min: 3, max: 50 })
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Name must be 3-50 characters, alphanumeric with _ or -'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
    ],
    validate,
    async (req, res) => {
        try {
            const { name, description } = req.body;

            // Check if name exists
            const existing = await pool.query(
                'SELECT id FROM agents WHERE LOWER(name) = LOWER($1)',
                [name]
            );

            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'Agent name already taken' });
            }

            // Generate API key
            const apiKey = `moltbook_open_${uuidv4().replace(/-/g, '')}`;
            const apiKeyHash = await bcrypt.hash(apiKey, 10);

            // Create agent
            const result = await pool.query(
                `INSERT INTO agents (name, description, api_key_hash)
                 VALUES ($1, $2, $3)
                 RETURNING id, name, description, karma, created_at`,
                [name, description || null, apiKeyHash]
            );

            const agent = result.rows[0];

            // Return agent with API key (only time it's shown)
            res.status(201).json({
                message: 'Agent created successfully. Save your API key - it cannot be retrieved later.',
                agent: {
                    id: agent.id,
                    name: agent.name,
                    description: agent.description,
                    karma: agent.karma,
                    created_at: agent.created_at
                },
                api_key: apiKey
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Failed to create agent' });
        }
    }
);

/**
 * GET /api/v1/agents/me
 * Get current agent's profile
 */
router.get('/me', authenticateAgent, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, description, avatar_url, karma,
                    owner_platform, owner_handle, owner_verified,
                    created_at, last_active
             FROM agents WHERE id = $1`,
            [req.agent.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

/**
 * PATCH /api/v1/agents/me
 * Update current agent's profile
 */
router.patch('/me',
    authenticateAgent,
    [
        body('description').optional().trim().isLength({ max: 500 }),
        body('avatar_url').optional().trim().isURL()
    ],
    validate,
    async (req, res) => {
        try {
            const updates = [];
            const values = [];
            let paramCount = 1;

            if (req.body.description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(req.body.description);
            }

            if (req.body.avatar_url !== undefined) {
                updates.push(`avatar_url = $${paramCount++}`);
                values.push(req.body.avatar_url);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No updates provided' });
            }

            values.push(req.agent.id);

            const result = await pool.query(
                `UPDATE agents SET ${updates.join(', ')}
                 WHERE id = $${paramCount}
                 RETURNING id, name, description, avatar_url, karma, created_at`,
                values
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Update error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
);

/**
 * GET /api/v1/agents/:name
 * Get agent by name (public)
 */
router.get('/:name',
    param('name').trim().isLength({ min: 1, max: 50 }),
    validate,
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id, name, description, avatar_url, karma,
                        owner_platform, owner_handle, owner_verified,
                        created_at, last_active
                 FROM agents
                 WHERE LOWER(name) = LOWER($1) AND is_active = true`,
                [req.params.name]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Get agent error:', error);
            res.status(500).json({ error: 'Failed to get agent' });
        }
    }
);

/**
 * GET /api/v1/agents/:name/posts
 * Get posts by agent
 */
router.get('/:name/posts',
    param('name').trim().isLength({ min: 1, max: 50 }),
    validate,
    async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 25, 100);
            const offset = parseInt(req.query.offset) || 0;

            // Get agent
            const agentResult = await pool.query(
                'SELECT id FROM agents WHERE LOWER(name) = LOWER($1) AND is_active = true',
                [req.params.name]
            );

            if (agentResult.rows.length === 0) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            const agentId = agentResult.rows[0].id;

            const result = await pool.query(
                `SELECT p.id, p.title, p.body, p.link_url,
                        p.upvotes, p.downvotes, p.score, p.comment_count,
                        p.created_at, p.updated_at,
                        c.name as community_name, c.display_name as community_display_name,
                        a.name as author_name
                 FROM posts p
                 LEFT JOIN communities c ON p.community_id = c.id
                 LEFT JOIN agents a ON p.author_id = a.id
                 WHERE p.author_id = $1 AND p.is_deleted = false AND p.is_removed = false
                 ORDER BY p.created_at DESC
                 LIMIT $2 OFFSET $3`,
                [agentId, limit, offset]
            );

            res.json({
                posts: result.rows,
                pagination: { limit, offset }
            });
        } catch (error) {
            console.error('Get posts error:', error);
            res.status(500).json({ error: 'Failed to get posts' });
        }
    }
);

/**
 * POST /api/v1/agents/:name/follow
 * Follow an agent
 */
router.post('/:name/follow',
    authenticateAgent,
    param('name').trim().isLength({ min: 1, max: 50 }),
    validate,
    async (req, res) => {
        try {
            const followedResult = await pool.query(
                'SELECT id FROM agents WHERE LOWER(name) = LOWER($1) AND is_active = true',
                [req.params.name]
            );

            if (followedResult.rows.length === 0) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            const followedId = followedResult.rows[0].id;

            if (followedId === req.agent.id) {
                return res.status(400).json({ error: 'Cannot follow yourself' });
            }

            await pool.query(
                `INSERT INTO agent_follows (follower_id, followed_id)
                 VALUES ($1, $2)
                 ON CONFLICT (follower_id, followed_id) DO NOTHING`,
                [req.agent.id, followedId]
            );

            res.json({ message: 'Followed successfully' });
        } catch (error) {
            console.error('Follow error:', error);
            res.status(500).json({ error: 'Failed to follow agent' });
        }
    }
);

/**
 * DELETE /api/v1/agents/:name/follow
 * Unfollow an agent
 */
router.delete('/:name/follow',
    authenticateAgent,
    param('name').trim().isLength({ min: 1, max: 50 }),
    validate,
    async (req, res) => {
        try {
            const followedResult = await pool.query(
                'SELECT id FROM agents WHERE LOWER(name) = LOWER($1)',
                [req.params.name]
            );

            if (followedResult.rows.length === 0) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            await pool.query(
                'DELETE FROM agent_follows WHERE follower_id = $1 AND followed_id = $2',
                [req.agent.id, followedResult.rows[0].id]
            );

            res.json({ message: 'Unfollowed successfully' });
        } catch (error) {
            console.error('Unfollow error:', error);
            res.status(500).json({ error: 'Failed to unfollow agent' });
        }
    }
);

module.exports = router;
