'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            WanderWise
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link href="/tours" className="text-white hover:text-teal-400 transition-colors">Tours</Link>
            <Link href="/about" className="text-white hover:text-teal-400 transition-colors">About</Link>
            <Link href="/contact" className="text-white hover:text-teal-400 transition-colors">Contact</Link>
            <Link href="/login" className="text-white hover:text-teal-400 transition-colors">Login</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="md:hidden" onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-gray-800 py-4"
        >
          <nav className="flex flex-col items-center space-y-4">
            <Link href="/tours" className="text-white hover:text-teal-400 transition-colors">Tours</Link>
            <Link href="/about" className="text-white hover:text-teal-400 transition-colors">About</Link>
            <Link href="/contact" className="text-white hover:text-teal-400 transition-colors">Contact</Link>
            <Link href="/login" className="text-white hover:text-teal-400 transition-colors">Login</Link>
          </nav>
        </motion.div>
      )}
    </header>
  )
}

