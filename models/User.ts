import db from '../db'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  name: string
  email: string
  password: string
  role: string
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const { name, email, password, role } = user
  const hashedPassword = await bcrypt.hash(password, 10)
  const result = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashedPassword, role]
  )
  return result.rows[0]
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (user && await bcrypt.compare(password, user.password)) {
    return user
  }
  return null
}

