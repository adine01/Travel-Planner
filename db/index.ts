import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config() // Load environment variables from .env file

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Add type for the exported object
interface DbInterface {
  query: (text: string, params?: any[]) => Promise<any>;
  getClient: () => Promise<any>;
}

const db: DbInterface = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect()
}

export default db