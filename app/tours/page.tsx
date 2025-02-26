'use client'

import { Suspense } from 'react'
import TourList from '@/app/components/TourList'
import SearchBar from '@/app/components/SearchBar'
import Loading from '@/app/components/Loading'

export default function ToursPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Explore Our Tours</h1>
      <SearchBar />
      <Suspense fallback={<Loading />}>
        <TourList />
      </Suspense>
    </div>
  )
}