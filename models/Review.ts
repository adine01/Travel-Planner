import db from '../db'

export interface Review {
  id: number
  tour_id: number
  user_id: number
  rating: number
  comment: string
}

export async function getReviewsByTourId(tourId: number): Promise<Review[]> {
  const result = await db.query('SELECT * FROM reviews WHERE tour_id = $1', [tourId])
  return result.rows
}

export async function createReview(review: Omit<Review, 'id'>): Promise<Review> {
  const { tour_id, user_id, rating, comment } = review
  const result = await db.query(
    'INSERT INTO reviews (tour_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
    [tour_id, user_id, rating, comment]
  )
  return result.rows[0]
}

export async function updateReview(id: number, review: Partial<Review>): Promise<Review | null> {
  const { rating, comment } = review
  const result = await db.query(
    'UPDATE reviews SET rating = COALESCE($1, rating), comment = COALESCE($2, comment) WHERE id = $3 RETURNING *',
    [rating, comment, id]
  )
  return result.rows[0] || null
}

export async function deleteReview(id: number): Promise<boolean> {
  const result = await db.query('DELETE FROM reviews WHERE id = $1', [id])
  return result.rowCount > 0
}

