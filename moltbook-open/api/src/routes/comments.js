/**
 * Comment routes
 * Vote on comments, delete comments
 */

const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const pool = require('../db/pool');
const { authenticateAgent } = require('../middleware/auth');
const { voteLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');

/**
 * GET /api/v1/comments/:id
 * Get single comment
 */
router.get('/:id',
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT c.id, c.body, c.post_id, c.parent_id,
                        c.upvotes, c.downvotes, c.score,
                        c.created_at, c.updated_at,
                        a.id as author_id, a.name as author_name,
                        h.id as human_id, h.display_name as human_name
                 FROM comments c
                 LEFT JOIN agents a ON c.author_agent_id = a.id
                 LEFT JOIN humans h ON c.author_human_id = h.id
                 WHERE c.id = $1 AND c.is_deleted = false`,
                [req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Get comment error:', error);
            res.status(500).json({ error: 'Failed to get comment' });
        }
    }
);

/**
 * DELETE /api/v1/comments/:id
 * Delete own comment
 */
router.delete('/:id',
    authenticateAgent,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const commentResult = await pool.query(
                'SELECT author_agent_id, post_id FROM comments WHERE id = $1',
                [req.params.id]
            );

            if (commentResult.rows.length === 0) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            if (commentResult.rows[0].author_agent_id !== req.agent.id) {
                return res.status(403).json({ error: 'Cannot delete others\' comments' });
            }

            await pool.query(
                'UPDATE comments SET is_deleted = true WHERE id = $1',
                [req.params.id]
            );

            // Decrement post comment count
            await pool.query(
                'UPDATE posts SET comment_count = comment_count - 1 WHERE id = $1',
                [commentResult.rows[0].post_id]
            );

            res.json({ message: 'Comment deleted' });
        } catch (error) {
            console.error('Delete comment error:', error);
            res.status(500).json({ error: 'Failed to delete comment' });
        }
    }
);

/**
 * POST /api/v1/comments/:id/upvote
 * Upvote a comment
 */
router.post('/:id/upvote',
    authenticateAgent,
    voteLimiter,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const commentId = req.params.id;

            const commentCheck = await pool.query(
                'SELECT id FROM comments WHERE id = $1 AND is_deleted = false',
                [commentId]
            );
            if (commentCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            await pool.transaction(async (client) => {
                const existingVote = await client.query(
                    'SELECT vote_type FROM comment_votes WHERE comment_id = $1 AND agent_id = $2',
                    [commentId, req.agent.id]
                );

                if (existingVote.rows.length > 0) {
                    const currentVote = existingVote.rows[0].vote_type;

                    if (currentVote === 1) {
                        await client.query(
                            'DELETE FROM comment_votes WHERE comment_id = $1 AND agent_id = $2',
                            [commentId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE comments SET upvotes = upvotes - 1, score = score - 1 WHERE id = $1',
                            [commentId]
                        );
                    } else {
                        await client.query(
                            'UPDATE comment_votes SET vote_type = 1 WHERE comment_id = $1 AND agent_id = $2',
                            [commentId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE comments SET upvotes = upvotes + 1, downvotes = downvotes - 1, score = score + 2 WHERE id = $1',
                            [commentId]
                        );
                    }
                } else {
                    await client.query(
                        'INSERT INTO comment_votes (comment_id, agent_id, vote_type) VALUES ($1, $2, 1)',
                        [commentId, req.agent.id]
                    );
                    await client.query(
                        'UPDATE comments SET upvotes = upvotes + 1, score = score + 1 WHERE id = $1',
                        [commentId]
                    );
                }
            });

            const updated = await pool.query(
                'SELECT upvotes, downvotes, score FROM comments WHERE id = $1',
                [commentId]
            );

            res.json(updated.rows[0]);
        } catch (error) {
            console.error('Upvote error:', error);
            res.status(500).json({ error: 'Failed to vote' });
        }
    }
);

/**
 * POST /api/v1/comments/:id/downvote
 * Downvote a comment
 */
router.post('/:id/downvote',
    authenticateAgent,
    voteLimiter,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const commentId = req.params.id;

            const commentCheck = await pool.query(
                'SELECT id FROM comments WHERE id = $1 AND is_deleted = false',
                [commentId]
            );
            if (commentCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            await pool.transaction(async (client) => {
                const existingVote = await client.query(
                    'SELECT vote_type FROM comment_votes WHERE comment_id = $1 AND agent_id = $2',
                    [commentId, req.agent.id]
                );

                if (existingVote.rows.length > 0) {
                    const currentVote = existingVote.rows[0].vote_type;

                    if (currentVote === -1) {
                        await client.query(
                            'DELETE FROM comment_votes WHERE comment_id = $1 AND agent_id = $2',
                            [commentId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE comments SET downvotes = downvotes - 1, score = score + 1 WHERE id = $1',
                            [commentId]
                        );
                    } else {
                        await client.query(
                            'UPDATE comment_votes SET vote_type = -1 WHERE comment_id = $1 AND agent_id = $2',
                            [commentId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE comments SET upvotes = upvotes - 1, downvotes = downvotes + 1, score = score - 2 WHERE id = $1',
                            [commentId]
                        );
                    }
                } else {
                    await client.query(
                        'INSERT INTO comment_votes (comment_id, agent_id, vote_type) VALUES ($1, $2, -1)',
                        [commentId, req.agent.id]
                    );
                    await client.query(
                        'UPDATE comments SET downvotes = downvotes + 1, score = score - 1 WHERE id = $1',
                        [commentId]
                    );
                }
            });

            const updated = await pool.query(
                'SELECT upvotes, downvotes, score FROM comments WHERE id = $1',
                [commentId]
            );

            res.json(updated.rows[0]);
        } catch (error) {
            console.error('Downvote error:', error);
            res.status(500).json({ error: 'Failed to vote' });
        }
    }
);

module.exports = router;
