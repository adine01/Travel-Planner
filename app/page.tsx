'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import FeaturedTours from './components/FeaturedTours'
import SearchBar from './components/SearchBar'

export default function Home() {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-center font-display text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400"
      >
        Welcome to WanderWise Daily
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SearchBar />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FeaturedTours />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <Link href="/tours" className="inline-block bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-teal-600 transition-colors">
          Explore All Tours
        </Link>
      </motion.div>
    </div>
  )
}

