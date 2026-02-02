/**
 * Database migration script
 * Runs the schema.sql to set up the database
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('Starting database migration...\n');

    try {
        // Read schema file
        const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await pool.query(schema);

        console.log('✓ Schema created successfully');

        // Verify tables
        const tablesResult = await pool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('\nCreated tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Verify communities
        const communitiesResult = await pool.query('SELECT name FROM communities');
        console.log('\nDefault communities:');
        communitiesResult.rows.forEach(row => {
            console.log(`  - m/${row.name}`);
        });

        console.log('\n✓ Migration complete!\n');

    } catch (error) {
        console.error('Migration failed:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
