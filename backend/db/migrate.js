// db/migrate.js
const pool = require('./db');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
    // First, create migrations table if it doesn't exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    try {
        // Get all migration files
        const migrationFiles = await fs.readdir(path.join(__dirname, '../migrations'));
        
        for (const file of migrationFiles.sort()) {
            // Check if migration was already executed
            const { rows } = await pool.query(
                'SELECT id FROM migrations WHERE name = $1',
                [file]
            );

            if (rows.length === 0) {
                // Read and execute migration file
                console.log(`Executing migration: ${file}`);
                const migration = require(path.join(__dirname, '../migrations', file));
                
                // Start transaction
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    
                    // Execute migration
                    await client.query(migration);
                    
                    // Record migration
                    await client.query(
                        'INSERT INTO migrations (name) VALUES ($1)',
                        [file]
                    );
                    
                    await client.query('COMMIT');
                    console.log(`Migration ${file} completed successfully`);
                } catch (error) {
                    await client.query('ROLLBACK');
                    throw error;
                } finally {
                    client.release();
                }
            } else {
                console.log(`Migration ${file} already executed`);
            }
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations
runMigrations();
