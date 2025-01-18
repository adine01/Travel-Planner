import { Pool } from 'pg'
import { config } from 'dotenv'

config() // Load environment variables from .env file

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect()
}

