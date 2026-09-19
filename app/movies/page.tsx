'use client'

import { useState, useEffect } from 'react'
import { getCuratedMovies, getMovieWatchlist, addToMovieWatchlist, removeFromMovieWatchlist } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'

const CATEGORIES = ['Technology', 'Science', 'Business', 'Entrepreneurship', 'History', 'Motivation', 'Psychology', 'Creativity', 'Inspiration', 'Sci-Fi', 'Documentaries', 'Education', 'Mathematics', 'Mental Health', 'Stock Market', 'Law', 'Justice', 'Award Winner', 'Ethics', 'Human Rights', 'Family', 'Life Lessons', 'Social Commentary', 'Innovation', 'Activism', 'Investigative', 'Classic', 'Adventure', 'Music', 'Comedy', 'Drama', 'Thriller', 'Finance', 'Economics']

function MovieFlipCard({ movie, isInWatchlist, onToggleWatchlist, isToggling }: { movie: any; isInWatchlist: boolean; onToggleWatchlist: () => void; isToggling: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false)

  const isOscarWinner = movie.categories?.includes('Award Winner') ?? false

  return (
    <div className="h-80 cursor-pointer perspective" onClick={() => setIsFlipped(!isFlipped)}>
      <div
        className="relative w-full h-full transition-transform duration-500 transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of Card */}
        <div
          className="absolute w-full h-full bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative h-full flex flex-col">
            {/* Poster */}
            <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <div className="text-gray-600 text-center text-sm">📽️ {movie.title}</div>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{movie.title}</h3>
                {movie.year && <p className="text-sm text-gray-600 mt-1">📅 {movie.year}</p>}
              </div>

              {/* Award Badge */}
              {isOscarWinner && (
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-2 mt-2">
                  <p className="text-sm font-bold text-yellow-800">🏆 Oscar Winner</p>
                </div>
              )}
            </div>

            {/* Watchlist Button */}
            <div className="p-4 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleWatchlist()
                }}
                disabled={isToggling}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  isInWatchlist
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isInWatchlist ? '❤️ In Watchlist' : '🤍 Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute w-full h-full bg-white rounded-lg shadow-lg p-4 overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-700 mb-4">{movie.description}</p>
            {movie.why_students_like && (
              <>
                <h4 className="text-md font-bold text-gray-900 mb-2">Why Students Like It</h4>
                <p className="text-sm text-green-700 mb-4">✨ {movie.why_students_like}</p>
              </>
            )}
            {movie.rating && <p className="text-sm font-semibold mt-auto">⭐ {movie.rating}/10</p>}
            {movie.imdb_url && (
              <a
                href={movie.imdb_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 hover:underline text-sm font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                View on IMDb →
              </a>
            )}
            <p className="text-xs text-gray-500 mt-4 text-center">Click to flip</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [view, setView] = useState<'browse' | 'watchlist'>('browse')
  const [toggling, setToggling] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  async function loadData() {
    try {
      setError(null)
      const moviesData = await getCuratedMovies(selectedCategory || undefined)
      const watchlistData = await getMovieWatchlist()
      setMovies(moviesData)
      setWatchlist(new Set(watchlistData.map(w => w.movie_id)))
    } catch (err: any) {
      setError(`Failed to load movies: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function toggleWatchlist(movieId: string, inWatchlist: boolean) {
    if (toggling.has(movieId)) return

    setToggling(prev => new Set([...prev, movieId]))
    try {
      setError(null)
      if (inWatchlist) {
        await removeFromMovieWatchlist(movieId)
        setWatchlist(prev => {
          const next = new Set(prev)
          next.delete(movieId)
          return next
        })
      } else {
        await addToMovieWatchlist(movieId, 'want_to_watch')
        setWatchlist(prev => new Set([...prev, movieId]))
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error'
      if (errorMsg.includes('duplicate key')) {
        setWatchlist(prev => new Set([...prev, movieId]))
      } else {
        setError(inWatchlist ? `Failed to remove: ${errorMsg}` : `Failed to add: ${errorMsg}`)
      }
    } finally {
      setToggling(prev => {
        const next = new Set(prev)
        next.delete(movieId)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="movies" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="font-semibold hover:text-red-900">×</button>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎬 Movie Picks</h1>
        <p className="text-gray-600 mb-8">Click any movie to flip and see full description</p>

        <div className="flex gap-2 mb-8">
          <button onClick={() => setView('browse')} className={`px-6 py-2 rounded-lg font-semibold ${view === 'browse' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>Browse Movies</button>
          <button onClick={() => setView('watchlist')} className={`px-6 py-2 rounded-lg font-semibold ${view === 'watchlist' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>❤️ My Watchlist ({watchlist.size})</button>
        </div>

        {view === 'browse' && (
          <>
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>All</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading movies...</p>
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg"><h3 className="text-lg font-semibold text-gray-900">No movies found</h3></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((movie) => (
                  <MovieFlipCard
                    key={movie.id}
                    movie={movie}
                    isInWatchlist={watchlist.has(movie.id)}
                    onToggleWatchlist={() => toggleWatchlist(movie.id, watchlist.has(movie.id))}
                    isToggling={toggling.has(movie.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'watchlist' && (
          <div>
            {watchlist.size === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Your watchlist is empty</h3>
                <p className="text-gray-600">Click 🤍 to add movies to your watchlist!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.filter(m => watchlist.has(m.id)).map((movie) => (
                  <MovieFlipCard
                    key={movie.id}
                    movie={movie}
                    isInWatchlist={true}
                    onToggleWatchlist={() => toggleWatchlist(movie.id, true)}
                    isToggling={toggling.has(movie.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
