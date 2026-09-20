'use client'

import { useState, useEffect } from 'react'
import { getCuratedMovies, getMovieWatchlist, addToMovieWatchlist, removeFromMovieWatchlist } from '@/lib/supabase/database'
import type { CuratedMovie } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'

const CATEGORIES = ['Animation', 'Technology', 'Science', 'Business', 'Entrepreneurship', 'History', 'Motivation', 'Psychology', 'Creativity', 'Inspiration', 'Sci-Fi', 'Documentaries', 'Education', 'Mathematics', 'Mental Health', 'Stock Market', 'Law', 'Justice', 'Award Winner', 'Ethics', 'Human Rights', 'Family', 'Life Lessons', 'Social Commentary', 'Innovation', 'Activism', 'Investigative', 'Classic', 'Adventure', 'Music', 'Comedy', 'Drama', 'Thriller', 'Finance', 'Economics']

const POSTER_BY_TITLE: Record<string, string> = {
  'The Social Network': '/movie-posters/the-social-network.png',
  'The Imitation Game': '/movie-posters/the-imitation-game.png',
  Inception: '/movie-posters/inception.jpg',
  'Hidden Figures': '/movie-posters/hidden-figures.jpg',
  'The Martian': '/movie-posters/the-martian.jpg',
  'Good Will Hunting': '/movie-posters/good-will-hunting.png',
  'A Beautiful Mind': '/movie-posters/a-beautiful-mind.jpg',
  Whiplash: '/movie-posters/whiplash.jpg',
  'Free Solo': '/movie-posters/free-solo.png',
  Interstellar: '/movie-posters/interstellar.jpg',
  'The Wolf of Wall Street': '/movie-posters/the-wolf-of-wall-street.png',
  Moneyball: '/movie-posters/moneyball.jpg',
  'Wall Street': '/movie-posters/wall-street.jpg',
  'The Big Short': '/movie-posters/the-big-short.png',
  'Enron: Smarter Guys in the Room': '/movie-posters/enron.jpg',
  'Enron: The Smartest Guys in the Room': '/movie-posters/enron.jpg',
  'Trading Places': '/movie-posters/trading-places.jpg',
  'Margin Call': '/movie-posters/margin-call.jpg',
  'Too Big to Fail': '/movie-posters/too-big-to-fail.jpg',
  '12 Angry Men': '/movie-posters/12-angry-men.jpg',
  Philadelphia: '/movie-posters/philadelphia.jpg',
  'To Kill a Mockingbird': '/movie-posters/to-kill-a-mockingbird.jpg',
  'A Few Good Men': '/movie-posters/a-few-good-men.jpg',
  'Legally Blonde': '/movie-posters/legally-blonde.png',
  Spotlight: '/movie-posters/spotlight.jpg',
  'The Trial of the Chicago 7': '/movie-posters/the-trial-of-the-chicago-7.jpeg',
  'Anatomy of a Murder': '/movie-posters/anatomy-of-a-murder.jpg',
  Parasite: '/movie-posters/parasite.png',
  Oppenheimer: '/movie-posters/oppenheimer.jpg',
  CODA: '/movie-posters/coda.jpeg',
  Nomadland: '/movie-posters/nomadland.jpeg',
  'Everything Everywhere All at Once': '/movie-posters/everything-everywhere-all-at-once.jpg',
  "Schindler's List": '/movie-posters/schindlers-list.jpg',
  'Forrest Gump': '/movie-posters/forrest-gump.jpg',
  'The Shawshank Redemption': '/movie-posters/the-shawshank-redemption.jpg',
  'Spirited Away': '/movie-posters/spirited-away.png',
  'Spider-Man: Into the Spider-Verse': '/movie-posters/spider-man-into-the-spider-verse.png',
  'The Lion King': '/movie-posters/the-lion-king.jpg',
  'Toy Story': '/movie-posters/toy-story.jpg',
  'WALL-E': '/movie-posters/wall-e.jpg',
  Coco: '/movie-posters/coco.jpg',
  Up: '/movie-posters/up.jpg',
  Ratatouille: '/movie-posters/ratatouille.jpg',
  'How to Train Your Dragon': '/movie-posters/how-to-train-your-dragon.jpg',
  'The Incredibles': '/movie-posters/the-incredibles.jpg',
  'Princess Mononoke': '/movie-posters/princess-mononoke.png',
  'Finding Nemo': '/movie-posters/finding-nemo.jpg',
  'Death Note': '/movie-posters/death-note.jpg',
}

type MovieFlipCardProps = {
  movie: CuratedMovie
  isInWatchlist: boolean
  onToggleWatchlist: () => void
  isToggling: boolean
}

function MovieFlipCard({ movie, isInWatchlist, onToggleWatchlist, isToggling }: MovieFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const isOscarWinner = movie.categories?.includes('Award Winner') ?? false
  const posterSrc = movie.poster_url || POSTER_BY_TITLE[movie.title]

  function toggleFlip() {
    setIsFlipped((flipped) => !flipped)
  }

  return (
    <article
      className="movie-card group aspect-[2/3] cursor-pointer"
      onClick={toggleFlip}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggleFlip()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${isFlipped ? 'Show poster for' : 'Show details for'} ${movie.title}`}
    >
      <div
        className="movie-card-inner relative h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of Card */}
        <div
          className="movie-card-face absolute inset-0 overflow-hidden rounded-[1.35rem] bg-slate-900"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {posterSrc ? (
            <img
              src={posterSrc}
              alt={`${movie.title} theatrical poster`}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-5xl">
              🎬
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/75">
              <span>{movie.year || 'Movie'}</span>
              {isOscarWinner && <span className="text-amber-300">🏆 Award winner</span>}
            </div>
            <div className="flex items-end justify-between gap-3">
              <h3 className="text-xl font-bold leading-tight drop-shadow-lg">{movie.title}</h3>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleWatchlist()
                }}
                disabled={isToggling}
                className={`grid size-11 shrink-0 place-items-center rounded-full border border-white/30 text-xl shadow-lg backdrop-blur-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isInWatchlist ? 'bg-rose-500/90' : 'bg-black/45 hover:bg-black/65'
                }`}
                aria-label={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
              >
                {isInWatchlist ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="movie-card-face absolute inset-0 overflow-hidden rounded-[1.35rem] bg-slate-950 text-white"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {posterSrc && (
            <img
              src={posterSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-md"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-cyan-950/90" />

          <div className="relative flex h-full flex-col overflow-y-auto p-6">
            <div className="mb-5">
              <h3 className="text-2xl font-bold leading-tight">{movie.title}</h3>
              <p className="mt-1 text-sm text-white/55">{movie.year || 'Year unavailable'}</p>
            </div>

            <p className="text-sm leading-6 text-white/80">{movie.description}</p>

            {movie.why_students_like && (
              <div className="mt-5 rounded-2xl bg-white/8 p-4 ring-1 ring-inset ring-white/10 backdrop-blur-sm">
                <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Why students love it</h4>
                <p className="mt-2 text-sm leading-5 text-white/75">{movie.why_students_like}</p>
              </div>
            )}

            <div className="mt-auto pt-5">
              {movie.rating && <p className="mb-4 text-sm font-semibold text-amber-300">★ {movie.rating}/10</p>}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleWatchlist()
                }}
                disabled={isToggling}
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isInWatchlist
                    ? 'bg-rose-500 text-white shadow-rose-950/40 hover:bg-rose-400'
                    : 'bg-white text-slate-950 shadow-black/30 hover:bg-cyan-50'
                }`}
              >
                {isToggling ? 'Updating…' : isInWatchlist ? '♥ In watchlist' : '♡ Add to watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<CuratedMovie[]>([])
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="font-semibold hover:text-red-900">×</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">🎬 Movie Picks</h1>
            <p className="text-gray-600 mt-2">Click any movie to flip and see full description</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('browse')} className={`px-6 py-2 rounded-lg font-semibold ${view === 'browse' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>Browse</button>
            <button onClick={() => setView('watchlist')} className={`px-6 py-2 rounded-lg font-semibold ${view === 'watchlist' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>❤️ Watchlist ({watchlist.size})</button>
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
