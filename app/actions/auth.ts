'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '@/lib/db'

export async function login(email: string, password: string) {
  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return { success: false, message: 'Invalid email or password' }
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password' }
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    })

    // Set cookie
    ;(await
      // Set cookie
      cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    })

    return { success: true, message: 'Logged in successfully' }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'An error occurred during login' }
  }
}

