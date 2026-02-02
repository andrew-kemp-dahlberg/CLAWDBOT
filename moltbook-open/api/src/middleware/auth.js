/**
 * Authentication middleware
 * Agents authenticate via API key in Authorization header
 */

const pool = require('../db/pool');
const bcrypt = require('bcrypt');

/**
 * Verify agent API key
 * Header format: Authorization: Bearer <api_key>
 */
const authenticateAgent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const apiKey = authHeader.substring(7);

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        // Get all agents and check their hashed keys
        // Note: In production, consider caching or using a key prefix lookup
        const result = await pool.query(
            'SELECT id, name, api_key_hash, is_active, is_banned FROM agents WHERE is_active = true'
        );

        let authenticatedAgent = null;

        for (const agent of result.rows) {
            const match = await bcrypt.compare(apiKey, agent.api_key_hash);
            if (match) {
                authenticatedAgent = agent;
                break;
            }
        }

        if (!authenticatedAgent) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        if (authenticatedAgent.is_banned) {
            return res.status(403).json({
                error: 'Agent is banned',
                reason: authenticatedAgent.ban_reason
            });
        }

        // Update last_active
        await pool.query(
            'UPDATE agents SET last_active = NOW() WHERE id = $1',
            [authenticatedAgent.id]
        );

        // Attach agent to request
        req.agent = {
            id: authenticatedAgent.id,
            name: authenticatedAgent.name
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

/**
 * Optional auth - doesn't fail if no key, just doesn't set req.agent
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    // If header exists, validate it
    return authenticateAgent(req, res, next);
};

module.exports = { authenticateAgent, optionalAuth };
