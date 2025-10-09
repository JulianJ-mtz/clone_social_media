import pg from 'pg'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})
async function createMigrationsTable () {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `
  await pool.query(query)
  console.log('  Migrations table verified')
}

async function getExecutedMigrations () {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id')
  return result.rows.map(row => row.name)
}
function parseMigrationFile (content) {
  const upMatch = content.match(/--\s*UP\s*\n([\s\S]*?)(?=--\s*DOWN|$)/i)
  const downMatch = content.match(/--\s*DOWN\s*\n([\s\S]*?)$/i)

  return {
    up: upMatch ? upMatch[1].trim() : content.trim(),
    down: downMatch ? downMatch[1].trim() : null
  }
}

async function getPendingMigrations () {
  const migrationsDir = path.join(__dirname, 'migrations')

  try {
    await fs.access(migrationsDir)
  } catch {
    await fs.mkdir(migrationsDir, { recursive: true })
    console.log('  Migrations directory created')
    return []
  }

  const files = await fs.readdir(migrationsDir)
  const migrationFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort()

  const executed = await getExecutedMigrations()
  return migrationFiles.filter(f => !executed.includes(f))
}

async function executeMigration (filename) {
  const migrationsDir = path.join(__dirname, 'migrations')
  const filePath = path.join(migrationsDir, filename)
  const content = await fs.readFile(filePath, 'utf-8')
  const { up } = parseMigrationFile(content)

  if (!up) {
    throw new Error(`No SQL to execute found in ${filename}`)
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(up)

    await client.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [filename]
    )

    await client.query('COMMIT')
    console.log(` Migration executed: ${filename}`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(` Error in migration ${filename}:`, error.message)
    throw error
  } finally {
    client.release()
  }
}

async function revertMigration (filename) {
  const migrationsDir = path.join(__dirname, 'migrations')
  const filePath = path.join(migrationsDir, filename)
  const content = await fs.readFile(filePath, 'utf-8')
  const { down } = parseMigrationFile(content)

  if (!down) {
    throw new Error(`No rollback SQL (DOWN) found in ${filename}`)
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(down)

    await client.query(
      'DELETE FROM migrations WHERE name = $1',
      [filename]
    )

    await client.query('COMMIT')
    console.log(` Migration reverted: ${filename}`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(` Error reverting migration ${filename}:`, error.message)
    throw error
  } finally {
    client.release()
  }
}

async function runMigrations () {
  try {
    console.log('Starting migrations...\n')

    await createMigrationsTable()
    const pending = await getPendingMigrations()

    if (pending.length === 0) {
      console.log('  No migrations pending')
      return
    }

    console.log(`\nFound ${pending.length} migrations pending:\n`)

    for (const migration of pending) {
      await executeMigration(migration)
    }

    console.log('\n All migrations completed successfully')
  } catch (error) {
    console.error('\n Error executing migrations:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

async function rollbackMigrations (count = 1) {
  try {
    console.log('Starting rollback...\n')

    await createMigrationsTable()
    const executed = await getExecutedMigrations()

    if (executed.length === 0) {
      console.log('  No migrations to revert')
      return
    }

    const toRevert = executed.slice(-count).reverse()
    console.log(`\nReverting ${toRevert.length} migrations:\n`)

    for (const migration of toRevert) {
      await revertMigration(migration)
    }

    console.log('\n Rollback completed successfully')
  } catch (error) {
    console.error('\n Error in rollback:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

async function createMigration (name) {
  if (!name) {
    console.error('Error: You must provide a name for the migration')
    console.log('Usage: npm run migrate:create <name>')
    process.exit(1)
  }

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const filename = `${timestamp}_${name.replace(/\s+/g, '_')}.sql`
  const migrationsDir = path.join(__dirname, 'migrations')

  await fs.mkdir(migrationsDir, { recursive: true })

  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- UP
-- Write here the changes to apply
-- Example:
-- CREATE TABLE example (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   nombre VARCHAR(100) NOT NULL
-- );

-- DOWN
-- Write here how to revert the changes
-- Example:
-- DROP TABLE IF EXISTS example;
`

  const filePath = path.join(migrationsDir, filename)
  await fs.writeFile(filePath, template)

  console.log(`  Migration created: ${filename}`)
  console.log(`  Path: ${filePath}`)
}

async function showStatus () {
  try {
    await createMigrationsTable()

    const executed = await getExecutedMigrations()
    const migrationsDir = path.join(__dirname, 'migrations')

    let allFiles = []
    try {
      const files = await fs.readdir(migrationsDir)
      allFiles = files.filter(f => f.endsWith('.sql')).sort()
    } catch {
      // No hay directorio de migraciones
      console.log('No migrations directory found')
      return
    }

    console.log('\n=== Migration Status ===\n')

    if (allFiles.length === 0) {
      console.log('No migrations found')
    } else {
      console.log('\nExecuted:')
      executed.forEach(name => {
        console.log(`  ✓ ${name}`)
      })

      const pending = allFiles.filter(f => !executed.includes(f))
      if (pending.length > 0) {
        console.log('\nPending:')
        pending.forEach(name => {
          console.log(`  ○ ${name}`)
        })
      }
    }

    console.log(`\nTotal: ${allFiles.length} migrations (${executed.length} executed, ${allFiles.length - executed.length} pending)\n`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

const command = process.argv[2]
const arg = process.argv[3]

switch (command) {
  case 'up':
    runMigrations()
    break
  case 'down':
    rollbackMigrations(arg ? parseInt(arg) : 1)
    break
  case 'create':
    createMigration(arg)
    pool.end()
    break
  case 'status':
    showStatus()
    break
  default:
    console.log(`
Migration System

Usage:
  npm run migrate:up              Run pending migrations
  npm run migrate:down [n]        Revert last(s) migration(s)
  npm run migrate:create <name>   Create new migration
  npm run migrate:status          Show migration status

Examples:
  npm run migrate:create add_posts_table
  npm run migrate:up
  npm run migrate:down           # Revert last migration
  npm run migrate:down 3         # Revert last 3 migrations
  npm run migrate:status
    `)
    pool.end()
}
