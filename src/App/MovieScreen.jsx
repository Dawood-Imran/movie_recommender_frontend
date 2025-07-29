"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import Toast from "../Components/Toast"
import { ArrowLeft, Star, Calendar, Clock, Heart, Bookmark } from "lucide-react"
import { useFavorites } from "../hooks/useFavorites"
import { useWatchlist } from "../hooks/useWatchlist"
import { useRating } from "../hooks/useRating"
import RatingStars from "../Components/RatingStars"

// Enhanced tracking function with extensive debugging
async function sendTrackEvent({ user_id, event_type, event_data }) {
  console.log("🚀 sendTrackEvent CALLED with:", { user_id, event_type, event_data })

  // Validate inputs with detailed logging
  if (!user_id) {
    console.error("❌ TRACKING FAILED: No user_id provided")
    console.log("Available window objects:", {
      firebase: !!window?.firebase,
      auth: !!window?.auth,
      firebaseAuth: !!window?.firebase?.auth,
      currentUser: !!window?.firebase?.auth?.currentUser,
    })
    return false
  }

  if (!event_type) {
    console.error("❌ TRACKING FAILED: No event_type provided")
    return false
  }

  if (!event_data) {
    console.error("❌ TRACKING FAILED: No event_data provided")
    return false
  }

  const payload = {
    user_id,
    event_type,
    event_data,
    timestamp: new Date().toISOString(),
  }

  console.log("📦 Payload prepared:", JSON.stringify(payload, null, 2))
  console.log("🌐 Making request to: http://localhost:8000/track")

  try {
    console.log("⏳ Starting fetch request...")

    const response = await fetch("http://localhost:8000/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("📡 Response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ HTTP Error Response:", errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const responseData = await response.json()
    console.log("✅ SUCCESS Response data:", responseData)

    // Show success toast for debugging
    toast.success(`Tracked: ${event_type}`, {
      duration: 2000,
      style: { background: "#10B981", color: "white" },
    })

    return true
  } catch (error) {
    console.error("💥 FETCH ERROR:", error)
    console.error("Error name:", error.name)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    // Show error toast for debugging
    toast.error(`Tracking failed: ${error.message}`, {
      duration: 4000,
      style: { background: "#EF4444", color: "white" },
    })

    return false
  }
}

// Enhanced user ID detection with debugging
function getUserId() {
  console.log("🔍 Getting user ID...")

  // Method 1: Firebase auth current user
  if (window?.firebase?.auth?.currentUser?.uid) {
    const uid = window.firebase.auth.currentUser.uid
    console.log("✅ User ID from firebase.auth.currentUser:", uid)
    return uid
  }

  // Method 2: Direct auth object
  if (window?.auth?.currentUser?.uid) {
    const uid = window.auth.currentUser.uid
    console.log("✅ User ID from auth.currentUser:", uid)
    return uid
  }

  // Method 3: Try to get from localStorage (if you store it there)
  const storedUserId = localStorage.getItem("userId")
  if (storedUserId) {
    console.log("✅ User ID from localStorage:", storedUserId)
    return storedUserId
  }

  // Method 4: Generate a temporary ID for testing
  const tempId = `temp_${Date.now()}`
  console.log("⚠️ No user ID found, using temporary ID:", tempId)
  return tempId
}

export default function MovieScreen({ movie, onBack }) {
  const { isFavorite, isLoading: isFavoriteLoading, toggleFavorite } = useFavorites(movie.id)
  const { isInWatchlist, isLoading: isWatchlistLoading, toggleWatchlist } = useWatchlist(movie.id)
  const { userRating, isLoading: isRatingLoading, setRating } = useRating(movie.id)

  const [userId, setUserId] = useState(null)
  const [debugInfo, setDebugInfo] = useState([])

  // Enhanced user ID detection on mount
  useEffect(() => {
    console.log("🎬 MovieScreen mounted for movie:", movie?.title, "ID:", movie?.id)

    const detectedUserId = getUserId()
    setUserId(detectedUserId)

    addDebugInfo(`User ID detected: ${detectedUserId}`)
    addDebugInfo(`Movie loaded: ${movie?.title} (${movie?.id})`)
  }, [movie])

  // Track movie click with enhanced debugging
  useEffect(() => {
    console.log("👀 Movie view tracking effect triggered")
    console.log("Current userId:", userId)
    console.log("Current movie.id:", movie?.id)

    if (userId && movie?.id) {
      console.log("🎯 Conditions met, tracking movie view...")
      addDebugInfo(`Tracking movie view: ${movie.title}`)

      sendTrackEvent({
        user_id: userId,
        event_type: "click",
        event_data: {
          movie_id: movie.id,
          movie_title: movie.title,
          timestamp: new Date().toISOString(),
        },
      }).then((success) => {
        addDebugInfo(`Movie view tracking ${success ? "SUCCESS" : "FAILED"}`)
      })
    } else {
      console.log("⏸️ Skipping movie view tracking - missing userId or movie.id")
      addDebugInfo(`Skipped view tracking - userId: ${!!userId}, movieId: ${!!movie?.id}`)
    }
  }, [movie.id, userId])

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugInfo((prev) => [...prev.slice(-9), `${timestamp}: ${message}`])
  }

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.svg?height=600&width=400&text=No+Image"
    return `https://image.tmdb.org/t/p/w780${path}`
  }

  const getBackdropUrl = (path) => {
    if (!path) return "/placeholder.svg?height=400&width=800&text=No+Backdrop"
    return `https://image.tmdb.org/t/p/w1280${path}`
  }

  const handleFavorite = async () => {
    console.log("❤️ Favorite button clicked")
    console.log("Current isFavorite state:", isFavorite)
    console.log("Current userId:", userId)

    addDebugInfo(`Favorite clicked - current state: ${isFavorite}`)

    try {
      await toggleFavorite(movie)
      console.log("✅ toggleFavorite completed")

      if (userId) {
        console.log("📊 Tracking favorite event...")
        const success = await sendTrackEvent({
          user_id: userId,
          event_type: "favorite",
          event_data: {
            movie_id: movie.id,
            movie_title: movie.title,
            action: isFavorite ? "remove" : "add",
            timestamp: new Date().toISOString(),
          },
        })
        addDebugInfo(`Favorite tracking ${success ? "SUCCESS" : "FAILED"}`)
      } else {
        console.log("⚠️ No userId for favorite tracking")
        addDebugInfo("Favorite tracking skipped - no userId")
      }
    } catch (error) {
      console.error("💥 Error in handleFavorite:", error)
      addDebugInfo(`Favorite error: ${error.message}`)
    }
  }

  const handleBookmark = async () => {
    console.log("🔖 Bookmark button clicked")
    console.log("Current isInWatchlist state:", isInWatchlist)
    console.log("Current userId:", userId)

    addDebugInfo(`Watchlist clicked - current state: ${isInWatchlist}`)

    try {
      await toggleWatchlist(movie)
      console.log("✅ toggleWatchlist completed")

      if (userId) {
        console.log("📊 Tracking watchlist event...")
        const success = await sendTrackEvent({
          user_id: userId,
          event_type: "watchlist",
          event_data: {
            movie_id: movie.id,
            movie_title: movie.title,
            action: isInWatchlist ? "remove" : "add",
            timestamp: new Date().toISOString(),
          },
        })
        addDebugInfo(`Watchlist tracking ${success ? "SUCCESS" : "FAILED"}`)
      } else {
        console.log("⚠️ No userId for watchlist tracking")
        addDebugInfo("Watchlist tracking skipped - no userId")
      }
    } catch (error) {
      console.error("💥 Error in handleBookmark:", error)
      addDebugInfo(`Watchlist error: ${error.message}`)
    }
  }

  const handleRating = async (rating) => {
    console.log("⭐ Rating changed to:", rating)
    console.log("Previous rating:", userRating)
    console.log("Current userId:", userId)

    addDebugInfo(`Rating changed to: ${rating} (was: ${userRating})`)

    try {
      await setRating(rating)
      console.log("✅ setRating completed")

      if (userId) {
        console.log("📊 Tracking rating event...")
        const success = await sendTrackEvent({
          user_id: userId,
          event_type: "rate",
          event_data: {
            movie_id: movie.id,
            movie_title: movie.title,
            rating: rating,
            previous_rating: userRating,
            timestamp: new Date().toISOString(),
          },
        })
        addDebugInfo(`Rating tracking ${success ? "SUCCESS" : "FAILED"}`)
      } else {
        console.log("⚠️ No userId for rating tracking")
        addDebugInfo("Rating tracking skipped - no userId")
      }
    } catch (error) {
      console.error("💥 Error in handleRating:", error)
      addDebugInfo(`Rating error: ${error.message}`)
    }
  }

  const handleShare = () => {
    console.log("📤 Share button clicked")
    addDebugInfo("Share clicked")

    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!", {
        duration: 2000,
        icon: "📋",
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })
    }
  }

  // Test tracking function
  const testTracking = async () => {
    console.log("🧪 Testing tracking manually...")
    addDebugInfo("Manual tracking test started")

    const success = await sendTrackEvent({
      user_id: userId || "test_user",
      event_type: "test",
      event_data: {
        movie_id: movie.id,
        test: true,
        timestamp: new Date().toISOString(),
      },
    })

    addDebugInfo(`Manual test ${success ? "SUCCESS" : "FAILED"}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toast />

      

      {/* Backdrop Header */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={getBackdropUrl(movie.backdrop_path) || "/placeholder.svg"}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=400&width=800&text=No+Backdrop"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center px-4 py-2 bg-black bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleFavorite}
            className={`p-2 bg-black bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all ${
              isFavorite ? "text-red-500" : ""
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleBookmark}
            disabled={isWatchlistLoading}
            className={`p-2 bg-black bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all ${
              isInWatchlist ? "text-yellow-500" : ""
            } ${isWatchlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Bookmark className={`h-4 w-4 ${isInWatchlist ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
              alt={movie.title}
              className="w-80 h-auto rounded-lg shadow-2xl mx-auto lg:mx-0"
              onError={(e) => {
                e.target.src = "/placeholder.svg?height=600&width=400&text=No+Image"
              }}
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

            {movie.original_title !== movie.title && (
              <p className="text-gray-400 text-lg mb-4">Original Title: {movie.original_title}</p>
            )}

            {/* Rating and Release Info */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-xl font-semibold">{movie.vote_average.toFixed(1)}</span>
                <span className="text-gray-400 ml-1">({movie.vote_count} votes)</span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-sm text-gray-400">Your Rating</span>
                <RatingStars rating={userRating} onRate={handleRating} isLoading={isRatingLoading} />
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span>{new Date(movie.release_date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span>Movie</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={handleFavorite}
                disabled={isFavoriteLoading}
                className={`flex items-center px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                  isFavorite
                    ? "border-red-500 text-red-500 bg-red-500/10"
                    : "border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500"
                } ${isFavoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                {isFavoriteLoading ? "Loading..." : isFavorite ? "Favorited" : "Add to Favorites"}
              </button>

              <button
                onClick={handleBookmark}
                disabled={isWatchlistLoading}
                className={`flex items-center px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
                  isInWatchlist
                    ? "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                    : "border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-500"
                } ${isWatchlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Bookmark className={`mr-2 h-5 w-5 ${isInWatchlist ? "fill-current" : ""}`} />
                {isWatchlistLoading ? "Loading..." : isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Movie Details</h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-white">Language:</span> {movie.original_language.toUpperCase()}
                  </p>
                  <p>
                    <span className="text-white">Popularity:</span> {movie.popularity.toFixed(1)}
                  </p>
                  <p>
                    <span className="text-white">Adult Content:</span> {movie.adult ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Genre IDs</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genre_ids.map((genreId) => (
                    <span key={genreId} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                      {genreId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
