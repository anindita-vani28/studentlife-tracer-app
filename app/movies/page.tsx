'use client'

import { useState, useEffect } from 'react'
import { getCuratedMovies, getMovieWatchlist, addToMovieWatchlist, removeFromMovieWatchlist } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'

const CATEGORIES = ['Technology', 'Science', 'Business', 'Entrepreneurship', 'History', 'Motivation', 'Psychology', 'Creativity', 'Inspiration', 'Sci-Fi', 'Documentaries', 'Education', 'Mathematics', 'Mental Health', 'Stock Market', 'Law', 'Justice', 'Award Winner', 'Ethics', 'Human Rights', 'Family', 'Life Lessons', 'Social Commentary', 'Innovation', 'Activism', 'Investigative', 'Classic', 'Adventure', 'Music', 'Comedy', 'Drama', 'Thriller', 'Finance', 'Economics']

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [view, setView] = useState<'browse' | 'watchlist'>('browse')

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
      console.error('Load error:', err)
      setError(`Failed to load movies: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function toggleWatchlist(movieId: string, inWatchlist: boolean) {
    try {
      setError(null)
      if (inWatchlist) {
        await removeFromMovieWatchlist(movieId)
        setWatchlist(prev => { const next = new Set(prev); next.delete(movieId); return next })
      } else {
        await addToMovieWatchlist(movieId, 'want_to_watch')
        setWatchlist(prev => new Set([...prev, movieId]))
      }
    } catch (err: any) {
      console.error('Watchlist toggle error:', err)
      const errorMsg = err.message || 'Unknown error'
      setError(inWatchlist ? `Failed to remove: ${errorMsg}` : `Failed to add: ${errorMsg}`)
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
        <p className="text-gray-600 mb-8">Curated movies for students - inspiring stories and powerful ideas</p>

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
              <div className="text-center py-12 bg-white rounded-lg"><h3 className="text-lg font-semibold text-gray-900">No movies found</h3><p className="text-gray-600">Make sure the migration SQL has been run in Supabase</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((movie) => (
                  <div key={movie.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                    {movie.poster_url && (
                      <div className="relative h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <div className="text-gray-600 text-center">📽️ {movie.title}</div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 flex-1">{movie.title}</h3>
                        <button 
                          onClick={() => toggleWatchlist(movie.id, watchlist.has(movie.id))}
                          className={`text-2xl ml-2 transition ${watchlist.has(movie.id) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                          title={watchlist.has(movie.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                        >
                          ❤️
                        </button>
                      </div>
                      {movie.year && <p className="text-sm text-gray-600">{movie.year}</p>}
                      {movie.description && <p className="text-sm text-gray-700 mt-2">{movie.description}</p>}
                      {movie.why_students_like && <p className="text-sm text-green-700 mt-2">✨ {movie.why_students_like}</p>}
                      {movie.duration_minutes && <p className="text-xs text-gray-500 mt-2">⏱️ {movie.duration_minutes} min</p>}
                      {movie.rating && <p className="text-sm font-semibold mt-2">⭐ {movie.rating}/10</p>}
                      {movie.imdb_url && (
                        <a href={movie.imdb_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-600 hover:underline text-sm font-semibold">
                          View on IMDb →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'watchlist' && (
          <div>
            {watchlist.size === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center"><h3 className="text-lg font-semibold text-gray-900">Your watchlist is empty</h3><p className="text-gray-600">Click the ❤️ heart on any movie to add it to your watchlist!</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.filter(m => watchlist.has(m.id)).map((movie) => (
                  <div key={movie.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition border-2 border-red-300">
                    {movie.poster_url && (
                      <div className="relative h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <div className="text-gray-600 text-center">📽️ {movie.title}</div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 flex-1">{movie.title}</h3>
                        <button 
                          onClick={() => toggleWatchlist(movie.id, true)}
                          className="text-2xl ml-2 text-red-500 hover:text-red-600 transition"
                          title="Remove from watchlist"
                        >
                          ❤️
                        </button>
                      </div>
                      {movie.year && <p className="text-sm text-gray-600">{movie.year}</p>}
                      <p className="text-sm text-gray-700 mt-2">{movie.description}</p>
                      {movie.why_students_like && <p className="text-sm text-green-700 mt-2">✨ {movie.why_students_like}</p>}
                      {movie.duration_minutes && <p className="text-xs text-gray-500 mt-2">⏱️ {movie.duration_minutes} min</p>}
                      {movie.rating && <p className="text-sm font-semibold mt-2">⭐ {movie.rating}/10</p>}
                      {movie.imdb_url && (
                        <a href={movie.imdb_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-600 hover:underline text-sm font-semibold">
                          View on IMDb →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
