import db from '../db'

export interface Tour {
  id: number
  name: string
  description: string
  price: number
  image: string
  rating: number
  duration: string
  group_size: string
}

export async function getAllTours(): Promise<Tour[]> {
  const result = await db.query('SELECT * FROM tours')
  return result.rows
}

export async function getTourById(id: number): Promise<Tour | null> {
  const result = await db.query('SELECT * FROM tours WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function createTour(tour: Omit<Tour, 'id'>): Promise<Tour> {
  const { name, description, price, image, rating, duration, group_size } = tour
  const result = await db.query(
    'INSERT INTO tours (name, description, price, image, rating, duration, group_size) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, description, price, image, rating, duration, group_size]
  )
  return result.rows[0]
}

export async function updateTour(id: number, tour: Partial<Tour>): Promise<Tour | null> {
  const { name, description, price, image, rating, duration, group_size } = tour
  const result = await db.query(
    'UPDATE tours SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), image = COALESCE($4, image), rating = COALESCE($5, rating), duration = COALESCE($6, duration), group_size = COALESCE($7, group_size) WHERE id = $8 RETURNING *',
    [name, description, price, image, rating, duration, group_size, id]
  )
  return result.rows[0] || null
}

export async function deleteTour(id: number): Promise<boolean> {
  const result = await db.query('DELETE FROM tours WHERE id = $1', [id])
  return result.rowCount > 0
}

