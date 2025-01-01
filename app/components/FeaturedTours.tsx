'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import TourCard from './TourCard'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// This is a mock data. In a real application, you would fetch this data from your API.
const featuredTours = [
  { id: 1, name: 'Paris Getaway', price: 1200, image: '/images/paris.jpg', rating: 4.5 },
  { id: 2, name: 'Tokyo Adventure', price: 1500, image: '/images/tokyo.jpg', rating: 4.8 },
  { id: 3, name: 'New York City Tour', price: 1000, image: '/images/nyc.jpg', rating: 4.3 },
  { id: 4, name: 'Rome Historical Tour', price: 1300, image: '/images/rome.jpg', rating: 4.6 },
  { id: 5, name: 'Bali Relaxation Retreat', price: 1100, image: '/images/bali.jpg', rating: 4.7 },
]

export default function FeaturedTours() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center font-display text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Featured Tours</h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {featuredTours.map((tour) => (
          <SwiperSlide key={tour.id}>
            <TourCard tour={tour} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

