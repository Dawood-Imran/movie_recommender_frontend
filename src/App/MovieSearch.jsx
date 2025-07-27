"use client"

import { useState } from "react"
import { auth } from "../firebaseconfig"
import { signOut } from "firebase/auth"
import toast from "react-hot-toast"
import Toast from "../Components/Toast"
import { Search, LogOut, Loader2, User } from "lucide-react"

export default function MovieSearch({ onSignOut }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const user = auth.currentUser

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
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(`Found results for "${searchQuery}"`, {
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

      // Trigger the sign out flow (splash screen then sign-in)
      onSignOut()

      // Sign out after a brief delay to show the toast
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Discover Your Next Favorite Movie</h2>
          <p className="text-gray-400">Search through thousands of movies and get personalized recommendations</p>
        </div>

        <div className="max-w-3xl mx-auto">
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
          </form>
        </div>
      </div>
    </div>
  )
}
