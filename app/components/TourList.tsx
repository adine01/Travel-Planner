import TourCard from './TourCard'

// This is mock data. In a real application, you would fetch this data from your API.
const tours = [
  { id: 1, name: 'Paris Getaway', price: 1200, image: '/images/paris.jpg', rating: 4.5 },
  { id: 2, name: 'Tokyo Adventure', price: 1500, image: '/images/tokyo.jpg', rating: 4.8 },
  { id: 3, name: 'New York City Tour', price: 1000, image: '/images/nyc.jpg', rating: 4.3 },
  { id: 4, name: 'Rome Historical Tour', price: 1300, image: '/images/rome.jpg', rating: 4.6 },
  { id: 5, name: 'Bali Relaxation Retreat', price: 1100, image: '/images/bali.jpg', rating: 4.7 },
  { id: 6, name: 'London Explorer', price: 1400, image: '/images/london.jpg', rating: 4.4 },
]

export default function TourList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map((tour) => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </div>
  )
}

