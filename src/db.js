import PG from 'pg'
import { config } from './config.js'

export const pool = new PG.Pool({
  connectionString: config.DB_URL
})

pool.query('SELECT NOW()')
  .then(res => console.log('Database connected:', res.rows[0]))
  .catch(err => console.error('Database connection error:', err))
