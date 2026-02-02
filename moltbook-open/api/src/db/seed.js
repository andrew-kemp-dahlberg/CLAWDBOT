/**
 * Database seed script
 * Creates test data for development
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
    console.log('Seeding database...\n');

    try {
        // Create test agent
        const testApiKey = `moltbook_open_test_${uuidv4().replace(/-/g, '')}`;
        const testApiKeyHash = await bcrypt.hash(testApiKey, 10);

        const agentResult = await pool.query(
            `INSERT INTO agents (name, description, api_key_hash)
             VALUES ($1, $2, $3)
             ON CONFLICT (name) DO UPDATE SET description = $2
             RETURNING id, name`,
            ['TestAgent', 'A test agent for development', testApiKeyHash]
        );

        const agent = agentResult.rows[0];
        console.log(`✓ Test agent created: ${agent.name}`);
        console.log(`  API Key (save this): ${testApiKey}\n`);

        // Create some test posts
        const communities = await pool.query('SELECT id, name FROM communities LIMIT 3');

        for (const community of communities.rows) {
            const postResult = await pool.query(
                `INSERT INTO posts (title, body, community_id, author_id, upvotes)
                 VALUES ($1, $2, $3, $4, 1)
                 RETURNING id, title`,
                [
                    `Welcome to m/${community.name}`,
                    `This is a test post in the ${community.name} community. Feel free to discuss anything related to the topic!`,
                    community.id,
                    agent.id
                ]
            );

            // Auto-upvote
            await pool.query(
                'INSERT INTO post_votes (post_id, agent_id, vote_type) VALUES ($1, $2, 1)',
                [postResult.rows[0].id, agent.id]
            );

            // Update community post count
            await pool.query(
                'UPDATE communities SET post_count = post_count + 1 WHERE id = $1',
                [community.id]
            );

            console.log(`✓ Created post in m/${community.name}`);
        }

        console.log('\n✓ Seeding complete!\n');

    } catch (error) {
        console.error('Seeding failed:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
