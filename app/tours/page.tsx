import { Suspense } from 'react'
import TourList from '../components/TourList'
import SearchBar from '../components/SearchBar'
import Loading from '../components/Loading'

export default function ToursPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Explore Our Tours</h1>
      <SearchBar />
      <Suspense fallback={<Loading />}>
        <TourList />
      </Suspense>
    </div>
  )
}

