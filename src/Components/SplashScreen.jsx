"use client"
import { Loader2, Film } from "lucide-react"

export default function SplashScreen({ message = "Loading your movie experience..." }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Film className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-red-500">Movie</span>
            <span className="text-white">Mate</span>
          </h1>
          <p className="text-gray-400 text-lg">Your Personal Cinema Companion</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
          <p className="text-gray-400 animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  )
}
