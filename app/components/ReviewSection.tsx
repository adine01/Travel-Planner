'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface Review {
  id: number
  author: string
  rating: number
  comment: string
  date: string
}

// This is mock data. In a real application, you would fetch this data from your API.
const mockReviews: Review[] = [
  { id: 1, author: 'John Doe', rating: 5, comment: 'Amazing tour! Highly recommended.', date: '2023-05-15' },
  { id: 2, author: 'Jane Smith', rating: 4, comment: 'Great experience overall. The guide was very knowledgeable.', date: '2023-05-10' },
]

export default function ReviewSection({ tourId }: { tourId: string }) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    const review: Review = {
      id: reviews.length + 1,
      author: 'Current User', // In a real app, you'd get this from the authenticated user
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
    }
    setReviews([...reviews, review])
    setNewReview({ rating: 5, comment: '' })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} className="mb-4 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="ml-2 font-bold">{review.author}</span>
          </div>
          <p className="mb-2">{review.comment}</p>
          <span className="text-sm text-gray-500">{review.date}</span>
        </div>
      ))}
      
      <form onSubmit={handleSubmitReview} className="mt-8">
        <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
        <div className="mb-4">
          <label className="block mb-2">Rating:</label>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 cursor-pointer ${i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
              />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block mb-2">Comment:</label>
          <textarea
            id="comment"
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
            required
          ></textarea>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Submit Review
        </button>
      </form>
    </div>
  )
}

