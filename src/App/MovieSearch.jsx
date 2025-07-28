"use client"

import { useState, useEffect, useRef } from "react"
import { auth } from "../firebaseconfig"
import { signOut } from "firebase/auth"
import toast from "react-hot-toast"
import Toast from "../Components/Toast"
import { Search, LogOut, Loader2, User, Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

export default function MovieSearch({ onSignOut, onMovieSelect }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [movies, setMovies] = useState([])
  const [isLoadingTrending, setIsLoadingTrending] = useState(true)
  const [filteredMovies, setFilteredMovies] = useState([])
  const carouselRef = useRef(null)
  const user = auth.currentUser

  // Load trending movies on component mount
  useEffect(() => {
    fetchTrendingMovies()
  }, [])

  const fetchTrendingMovies = async () => {
    setIsLoadingTrending(true)
    try {
      const response = await fetch("http://localhost:8000/trending-movies")
      if (!response.ok) {
        throw new Error("Failed to fetch trending movies")
      }
      const data = await response.json()
      setMovies(data)
      setFilteredMovies(data)

      toast.success("Trending movies loaded!", {
        duration: 2000,
        icon: "🎬",
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })
    } catch (error) {
      console.error("Error fetching trending movies:", error)
      toast.error("Failed to load trending movies. Please check your connection.", {
        duration: 4000,
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
    } finally {
      setIsLoadingTrending(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Searching movies...", {
      style: {
        borderRadius: "10px",
        background: "#1f2937",
        color: "#fff",
      },
    })

    try {
      // Filter the trending movies by search query
      const searchResults = movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.overview.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      setFilteredMovies(searchResults)

      toast.success(`Found ${searchResults.length} results for "${searchQuery}"`, {
        id: toastId,
        duration: 3000,
        icon: "🎬",
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })
    } catch (error) {
      toast.error("Failed to search movies. Please try again.", {
        id: toastId,
        duration: 4000,
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      toast.success("Signing out...", {
        duration: 1500,
        icon: "👋",
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

      onSignOut()

      setTimeout(async () => {
        await signOut(auth)
      }, 500)
    } catch (error) {
      toast.error("Failed to sign out. Please try again.", {
        duration: 4000,
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })
      console.error("Sign out error:", error)
      setIsSigningOut(false)
    }
  }

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.svg?height=400&width=300&text=No+Image"
    return `https://image.tmdb.org/t/p/w500${path}`
  }

  const handleMovieClick = (movie) => {
    onMovieSelect(movie)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setFilteredMovies(movies)
  }

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320 // Width of one movie card + gap
      const currentScroll = carouselRef.current.scrollLeft
      const newScroll = direction === "left" ? currentScroll - scrollAmount * 3 : currentScroll + scrollAmount * 3

      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toast />

      {/* Header with user info */}
      <div className="bg-gradient-to-r from-red-900 to-gray-900 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-red-500">Movie</span>Mate
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <User className="h-4 w-4" />
              <span>Welcome, {user?.displayName || user?.email || "User"}</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={`flex items-center px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ${isSigningOut ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Discover Your Next Favorite Movie</h2>
          <p className="text-gray-400">Search through thousands of movies and get personalized recommendations</p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center px-6 py-3 bg-red-600 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Movies Carousel */}
        {isLoadingTrending ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-red-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading trending movies...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {searchQuery ? `Search Results (${filteredMovies.length})` : "Trending Movies"}
              </h3>

              {/* Navigation Buttons */}
              {filteredMovies.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => scrollCarousel("left")}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollCarousel("right")}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Carousel Container */}
            {filteredMovies.length > 0 ? (
              <div className="relative overflow-hidden">
                <div
                  ref={carouselRef}
                  className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitScrollbar: { display: "none" },
                  }}
                >
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => handleMovieClick(movie)}
                      className="flex-shrink-0 w-72 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-red-500"
                    >
                      <div className="relative">
                        <img
                          src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
                          alt={movie.title}
                          className="w-full h-96 object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=400&width=300&text=No+Image"
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full px-2 py-1 flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-white">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2 hover:text-red-400 transition-colors text-lg">
                          {movie.title}
                        </h3>
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                          </div>
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">{movie.vote_count} votes</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{movie.overview}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No movies found. Try a different search term.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
