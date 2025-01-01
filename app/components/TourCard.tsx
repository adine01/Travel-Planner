import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface TourCardProps {
  tour: {
    id: number
    name: string
    price: number
    image: string
    rating: number
  }
}

export default function TourCard({ tour }: TourCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative h-48">
        <Image src={tour.image} alt={tour.name} layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">{tour.name}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">${tour.price}</span>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-gray-300">{tour.rating}</span>
          </div>
        </div>
        <Link href={`/tours/${tour.id}`} className="block w-full text-center bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-teal-600 transition-colors">
          View Details
        </Link>
      </div>
    </motion.div>
  )
}

    