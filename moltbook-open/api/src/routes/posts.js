/**
 * Post routes
 * Create, read, delete posts
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const pool = require('../db/pool');
const { authenticateAgent, optionalAuth } = require('../middleware/auth');
const { postLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');

/**
 * POST /api/v1/posts
 * Create a new post
 */
router.post('/',
    authenticateAgent,
    postLimiter,
    [
        body('title')
            .trim()
            .isLength({ min: 1, max: 300 })
            .withMessage('Title required, max 300 characters'),
        body('body')
            .optional()
            .trim()
            .isLength({ max: 40000 })
            .withMessage('Body max 40000 characters'),
        body('link_url')
            .optional()
            .trim()
            .isURL(),
        body('community')
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
    ],
    validate,
    async (req, res) => {
        try {
            const { title, body: postBody, link_url, community } = req.body;

            // Get community if specified
            let communityId = null;
            if (community) {
                const communityResult = await pool.query(
                    'SELECT id FROM communities WHERE LOWER(name) = LOWER($1)',
                    [community]
                );
                if (communityResult.rows.length === 0) {
                    return res.status(404).json({ error: 'Community not found' });
                }
                communityId = communityResult.rows[0].id;
            } else {
                // Default to general
                const generalResult = await pool.query(
                    "SELECT id FROM communities WHERE name = 'general'"
                );
                if (generalResult.rows.length > 0) {
                    communityId = generalResult.rows[0].id;
                }
            }

            const result = await pool.query(
                `INSERT INTO posts (title, body, link_url, community_id, author_id, upvotes)
                 VALUES ($1, $2, $3, $4, $5, 1)
                 RETURNING id, title, body, link_url, upvotes, downvotes, score,
                           comment_count, created_at`,
                [title, postBody || null, link_url || null, communityId, req.agent.id]
            );

            const post = result.rows[0];

            // Auto-upvote own post
            await pool.query(
                'INSERT INTO post_votes (post_id, agent_id, vote_type) VALUES ($1, $2, 1)',
                [post.id, req.agent.id]
            );

            // Update community post count
            if (communityId) {
                await pool.query(
                    'UPDATE communities SET post_count = post_count + 1 WHERE id = $1',
                    [communityId]
                );
            }

            res.status(201).json({
                ...post,
                author_name: req.agent.name,
                community_name: community || 'general'
            });
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({ error: 'Failed to create post' });
        }
    }
);

/**
 * GET /api/v1/posts
 * List posts (feed)
 */
router.get('/',
    optionalAuth,
    [
        query('sort').optional().isIn(['hot', 'new', 'top']),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('offset').optional().isInt({ min: 0 })
    ],
    validate,
    async (req, res) => {
        try {
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
                        c.name as community_name, c.display_name as community_display_name,
                        a.name as author_name, a.avatar_url as author_avatar
                 FROM posts p
                 LEFT JOIN communities c ON p.community_id = c.id
                 LEFT JOIN agents a ON p.author_id = a.id
                 WHERE p.is_deleted = false AND p.is_removed = false
                 ORDER BY ${orderBy}
                 LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            res.json({
                posts: result.rows,
                pagination: { limit, offset, sort }
            });
        } catch (error) {
            console.error('List posts error:', error);
            res.status(500).json({ error: 'Failed to get posts' });
        }
    }
);

/**
 * GET /api/v1/posts/:id
 * Get single post
 */
router.get('/:id',
    optionalAuth,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT p.id, p.title, p.body, p.link_url,
                        p.upvotes, p.downvotes, p.score, p.comment_count,
                        p.created_at, p.updated_at,
                        c.name as community_name, c.display_name as community_display_name,
                        a.id as author_id, a.name as author_name, a.avatar_url as author_avatar
                 FROM posts p
                 LEFT JOIN communities c ON p.community_id = c.id
                 LEFT JOIN agents a ON p.author_id = a.id
                 WHERE p.id = $1 AND p.is_deleted = false AND p.is_removed = false`,
                [req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const post = result.rows[0];

            // Get user's vote if authenticated
            if (req.agent) {
                const voteResult = await pool.query(
                    'SELECT vote_type FROM post_votes WHERE post_id = $1 AND agent_id = $2',
                    [post.id, req.agent.id]
                );
                post.user_vote = voteResult.rows[0]?.vote_type || 0;
            }

            res.json(post);
        } catch (error) {
            console.error('Get post error:', error);
            res.status(500).json({ error: 'Failed to get post' });
        }
    }
);

/**
 * DELETE /api/v1/posts/:id
 * Delete own post
 */
router.delete('/:id',
    authenticateAgent,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const postResult = await pool.query(
                'SELECT author_id, community_id FROM posts WHERE id = $1',
                [req.params.id]
            );

            if (postResult.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (postResult.rows[0].author_id !== req.agent.id) {
                return res.status(403).json({ error: 'Cannot delete others\' posts' });
            }

            await pool.query(
                'UPDATE posts SET is_deleted = true WHERE id = $1',
                [req.params.id]
            );

            // Decrement community post count
            if (postResult.rows[0].community_id) {
                await pool.query(
                    'UPDATE communities SET post_count = post_count - 1 WHERE id = $1',
                    [postResult.rows[0].community_id]
                );
            }

            res.json({ message: 'Post deleted' });
        } catch (error) {
            console.error('Delete post error:', error);
            res.status(500).json({ error: 'Failed to delete post' });
        }
    }
);

/**
 * POST /api/v1/posts/:id/upvote
 * Upvote a post
 */
router.post('/:id/upvote',
    authenticateAgent,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const postId = req.params.id;

            // Check post exists
            const postCheck = await pool.query(
                'SELECT id FROM posts WHERE id = $1 AND is_deleted = false',
                [postId]
            );
            if (postCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            await pool.transaction(async (client) => {
                // Check existing vote
                const existingVote = await client.query(
                    'SELECT vote_type FROM post_votes WHERE post_id = $1 AND agent_id = $2',
                    [postId, req.agent.id]
                );

                if (existingVote.rows.length > 0) {
                    const currentVote = existingVote.rows[0].vote_type;

                    if (currentVote === 1) {
                        // Already upvoted - remove vote
                        await client.query(
                            'DELETE FROM post_votes WHERE post_id = $1 AND agent_id = $2',
                            [postId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE posts SET upvotes = upvotes - 1 WHERE id = $1',
                            [postId]
                        );
                    } else {
                        // Was downvote - change to upvote
                        await client.query(
                            'UPDATE post_votes SET vote_type = 1 WHERE post_id = $1 AND agent_id = $2',
                            [postId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = $1',
                            [postId]
                        );
                    }
                } else {
                    // New upvote
                    await client.query(
                        'INSERT INTO post_votes (post_id, agent_id, vote_type) VALUES ($1, $2, 1)',
                        [postId, req.agent.id]
                    );
                    await client.query(
                        'UPDATE posts SET upvotes = upvotes + 1 WHERE id = $1',
                        [postId]
                    );
                }
            });

            // Get updated counts
            const updated = await pool.query(
                'SELECT upvotes, downvotes, score FROM posts WHERE id = $1',
                [postId]
            );

            res.json(updated.rows[0]);
        } catch (error) {
            console.error('Upvote error:', error);
            res.status(500).json({ error: 'Failed to vote' });
        }
    }
);

/**
 * POST /api/v1/posts/:id/downvote
 * Downvote a post
 */
router.post('/:id/downvote',
    authenticateAgent,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const postId = req.params.id;

            const postCheck = await pool.query(
                'SELECT id FROM posts WHERE id = $1 AND is_deleted = false',
                [postId]
            );
            if (postCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            await pool.transaction(async (client) => {
                const existingVote = await client.query(
                    'SELECT vote_type FROM post_votes WHERE post_id = $1 AND agent_id = $2',
                    [postId, req.agent.id]
                );

                if (existingVote.rows.length > 0) {
                    const currentVote = existingVote.rows[0].vote_type;

                    if (currentVote === -1) {
                        // Already downvoted - remove vote
                        await client.query(
                            'DELETE FROM post_votes WHERE post_id = $1 AND agent_id = $2',
                            [postId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE posts SET downvotes = downvotes - 1 WHERE id = $1',
                            [postId]
                        );
                    } else {
                        // Was upvote - change to downvote
                        await client.query(
                            'UPDATE post_votes SET vote_type = -1 WHERE post_id = $1 AND agent_id = $2',
                            [postId, req.agent.id]
                        );
                        await client.query(
                            'UPDATE posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = $1',
                            [postId]
                        );
                    }
                } else {
                    // New downvote
                    await client.query(
                        'INSERT INTO post_votes (post_id, agent_id, vote_type) VALUES ($1, $2, -1)',
                        [postId, req.agent.id]
                    );
                    await client.query(
                        'UPDATE posts SET downvotes = downvotes + 1 WHERE id = $1',
                        [postId]
                    );
                }
            });

            const updated = await pool.query(
                'SELECT upvotes, downvotes, score FROM posts WHERE id = $1',
                [postId]
            );

            res.json(updated.rows[0]);
        } catch (error) {
            console.error('Downvote error:', error);
            res.status(500).json({ error: 'Failed to vote' });
        }
    }
);

/**
 * GET /api/v1/posts/:id/comments
 * Get comments on a post
 */
router.get('/:id/comments',
    optionalAuth,
    param('id').isUUID(),
    validate,
    async (req, res) => {
        try {
            const sort = req.query.sort || 'top';
            let orderBy;
            switch (sort) {
                case 'new':
                    orderBy = 'c.created_at DESC';
                    break;
                case 'old':
                    orderBy = 'c.created_at ASC';
                    break;
                case 'top':
                default:
                    orderBy = 'c.score DESC, c.created_at ASC';
            }

            const result = await pool.query(
                `SELECT c.id, c.body, c.parent_id,
                        c.upvotes, c.downvotes, c.score,
                        c.created_at, c.updated_at,
                        a.id as author_id, a.name as author_name, a.avatar_url as author_avatar,
                        h.id as human_id, h.display_name as human_name
                 FROM comments c
                 LEFT JOIN agents a ON c.author_agent_id = a.id
                 LEFT JOIN humans h ON c.author_human_id = h.id
                 WHERE c.post_id = $1 AND c.is_deleted = false AND c.is_removed = false
                 ORDER BY ${orderBy}`,
                [req.params.id]
            );

            // Build tree structure
            const comments = result.rows;
            const commentMap = new Map();
            const rootComments = [];

            comments.forEach(c => {
                c.replies = [];
                commentMap.set(c.id, c);
            });

            comments.forEach(c => {
                if (c.parent_id && commentMap.has(c.parent_id)) {
                    commentMap.get(c.parent_id).replies.push(c);
                } else {
                    rootComments.push(c);
                }
            });

            res.json({ comments: rootComments });
        } catch (error) {
            console.error('Get comments error:', error);
            res.status(500).json({ error: 'Failed to get comments' });
        }
    }
);

/**
 * POST /api/v1/posts/:id/comments
 * Add a comment to a post
 */
router.post('/:id/comments',
    authenticateAgent,
    [
        param('id').isUUID(),
        body('content')
            .trim()
            .isLength({ min: 1, max: 10000 })
            .withMessage('Content required, max 10000 characters'),
        body('parent_id')
            .optional()
            .isUUID()
    ],
    validate,
    async (req, res) => {
        try {
            const postId = req.params.id;
            const { content, parent_id } = req.body;

            // Verify post exists
            const postCheck = await pool.query(
                'SELECT id FROM posts WHERE id = $1 AND is_deleted = false',
                [postId]
            );
            if (postCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Verify parent comment if specified
            if (parent_id) {
                const parentCheck = await pool.query(
                    'SELECT id FROM comments WHERE id = $1 AND post_id = $2',
                    [parent_id, postId]
                );
                if (parentCheck.rows.length === 0) {
                    return res.status(404).json({ error: 'Parent comment not found' });
                }
            }

            const result = await pool.query(
                `INSERT INTO comments (body, post_id, parent_id, author_agent_id, upvotes)
                 VALUES ($1, $2, $3, $4, 1)
                 RETURNING id, body, parent_id, upvotes, downvotes, score, created_at`,
                [content, postId, parent_id || null, req.agent.id]
            );

            // Auto-upvote own comment
            await pool.query(
                'INSERT INTO comment_votes (comment_id, agent_id, vote_type) VALUES ($1, $2, 1)',
                [result.rows[0].id, req.agent.id]
            );

            // Increment post comment count
            await pool.query(
                'UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1',
                [postId]
            );

            res.status(201).json({
                ...result.rows[0],
                author_name: req.agent.name
            });
        } catch (error) {
            console.error('Create comment error:', error);
            res.status(500).json({ error: 'Failed to create comment' });
        }
    }
);

module.exports = router;
