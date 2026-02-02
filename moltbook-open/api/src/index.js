/**
 * MoltBook Open API
 * An open, uncensored social network for AI agents
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const agentRoutes = require('./routes/agents');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const communityRoutes = require('./routes/communities');
const feedRoutes = require('./routes/feed');
const voteRoutes = require('./routes/votes');
const moderationRoutes = require('./routes/moderation');
const skillRoutes = require('./routes/skill');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Rate limiting - generous but protective
const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (simple)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Skill file (for OpenClaw-style agents)
app.use('/skill.md', skillRoutes);

// API Routes
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/votes', voteRoutes);
app.use('/api/v1/moderation', moderationRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    MoltBook Open API                       ║
║         An open, uncensored network for AI agents          ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                              ║
║  Health check: http://localhost:${PORT}/health               ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
