"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import Toast from "../Components/Toast"
import { ArrowLeft, Star, Calendar, Clock, Play, Heart, Share2, Bookmark } from "lucide-react"
import { useFavorites } from "../hooks/useFavorites"
import { useWatchlist } from "../hooks/useWatchlist"
import { useRating } from "../hooks/useRating"
import RatingStars from "../Components/RatingStars"

export default function MovieScreen({ movie, onBack }) {
  const { isFavorite, isLoading: isFavoriteLoading, toggleFavorite } = useFavorites(movie.id)
  const { isInWatchlist, isLoading: isWatchlistLoading, toggleWatchlist } = useWatchlist(movie.id)
  const { userRating, isLoading: isRatingLoading, setRating } = useRating(movie.id)

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.svg?height=600&width=400&text=No+Image"
    return `https://image.tmdb.org/t/p/w780${path}`
  }

  const getBackdropUrl = (path) => {
    if (!path) return "/placeholder.svg?height=400&width=800&text=No+Backdrop"
    return `https://image.tmdb.org/t/p/w1280${path}`
  }

  const handleFavorite = async () => {
    await toggleFavorite(movie)
  }

  const handleBookmark = async () => {
    await toggleWatchlist(movie)
  }

  const handleShare = () => {
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

  const handleWatchTrailer = () => {
    toast.success("Opening trailer...", {
      duration: 2000,
      icon: "🎬",
      style: {
        borderRadius: "10px",
        background: "#22c55e",
        color: "#fff",
      },
    })
    // Here you would typically open a trailer modal or redirect to trailer
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
            onClick={handleShare}
            className="p-2 bg-black bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all"
          >
            <Share2 className="h-4 w-4" />
          </button>
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
                <RatingStars
                  rating={userRating}
                  onRate={setRating}
                  isLoading={isRatingLoading}
                />
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
                {isFavoriteLoading 
                  ? "Loading..." 
                  : isFavorite 
                    ? "Favorited" 
                    : "Add to Favorites"}
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
                {isWatchlistLoading 
                  ? "Loading..." 
                  : isInWatchlist 
                    ? "In Watchlist" 
                    : "Add to Watchlist"}
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
