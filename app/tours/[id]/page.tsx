'use client'

import Image from 'next/image'
import { Star, MapPin, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import ReviewSection from '../../components/ReviewSection'

// This is mock data. In a real application, you would fetch this data from your API based on the tour ID.
const tour = {
  id: 1,
  name: 'Paris Getaway',
  description: 'Experience the magic of Paris with our 7-day tour. Visit iconic landmarks, enjoy French cuisine, and immerse yourself in Parisian culture.',
  price: 1200,
  image: '/images/paris.jpg',
  rating: 4.5,
  duration: '7 days',
  groupSize: '10-15 people',
  included: ['Hotel accommodation', 'Breakfast', 'Guided tours', 'Airport transfers'],
  itinerary: [
    { day: 1, description: 'Arrival and welcome dinner' },
    { day: 2, description: 'Eiffel Tower and Seine River cruise' },
    { day: 3, description: 'Louvre Museum and Champs-Élysées' },
    { day: 4, description: 'Versailles Palace day trip' },
    { day: 5, description: 'Montmartre and Sacré-Cœur' },
    { day: 6, description: 'Free day for shopping and exploration' },
    { day: 7, description: 'Departure' },
  ],
}

export default async function TourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="bg-gray-900 text-white">
      <div className="relative h-96 mb-8">
        <Image src={tour.image} alt={tour.name} layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-4 left-4 text-4xl font-bold text-white"
        >
          {tour.name}
        </motion.h1>
      </div>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center mb-4"
        >
          <Star className="w-6 h-6 text-yellow-400 fill-current" />
          <span className="ml-2 text-xl">{tour.rating}</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl mb-4"
        >
          ${tour.price} per person
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-300 mb-8"
        >
          {tour.description}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Tour Details</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                Duration: {tour.duration}
              </li>
              <li className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Group Size: {tour.groupSize}
              </li>
              {tour.included.map((item, index) => (
                <li key={index} className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Itinerary</h2>
            <ul className="space-y-2">
              {tour.itinerary.map((day) => (
                <li key={day.day} className="mb-2">
                  <span className="font-bold text-blue-400">Day {day.day}:</span> {day.description}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-teal-600 transition-colors mb-8"
        >
          Book Now
        </motion.button>
        
        <ReviewSection tourId={id} />
      </div>
    </div>
  )
}

