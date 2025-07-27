"use client"

import { useState, useEffect } from "react"
import Signin from "./Components/Signin"
import Signup from "./Components/Signup"
import MovieSearch from "./App/MovieSearch"
import SplashScreen from "./Components/SplashScreen"
import { auth } from "./firebaseconfig"
import { onAuthStateChanged } from "firebase/auth"
import Toast from "./Components/Toast"

function App() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [splashMessage, setSplashMessage] = useState("Loading your movie experience...")
  const [isSignupFlow, setIsSignupFlow] = useState(false)
  const [isSignoutFlow, setIsSignoutFlow] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "Auth state changed:",
        currentUser?.email,
        "Signup flow:",
        isSignupFlow,
        "Signout flow:",
        isSignoutFlow,
      )

      // If we're in signup flow
      if (isSignupFlow) {
        if (currentUser) {
          // User just got created, don't show MovieSearch, keep in signup flow
          console.log("User created, staying in signup flow")
          return
        } else {
          // User got signed out after creation, show success splash
          console.log("User signed out after creation, showing success splash")
          setSplashMessage("Account created successfully! Redirecting to sign in...")
          setShowSplash(true)
          setTimeout(() => {
            setShowSplash(false)
            setIsSignIn(true)
            setIsSignupFlow(false)
            setLoading(false)
          }, 2500)
          return
        }
      }

      // If we're in signout flow
      if (isSignoutFlow) {
        if (!currentUser) {
          console.log("User signed out, showing signout splash")
          setSplashMessage("Signing out... See you soon!")
          setShowSplash(true)
          setTimeout(() => {
            setShowSplash(false)
            setIsSignIn(true)
            setIsSignoutFlow(false)
            setLoading(false)
          }, 2500)
          return
        }
      }

      // Normal authentication flow (not in signup or signout flow)
      if (!isSignupFlow && !isSignoutFlow) {
        console.log("Normal auth flow, setting user:", currentUser?.email)
        setUser(currentUser)

        // Initial app load - show splash for a bit
        if (loading) {
          setTimeout(() => {
            setShowSplash(false)
            setLoading(false)
          }, 1500)
        } else {
          setShowSplash(false)
        }
      }
    })

    return () => unsubscribe()
  }, [isSignupFlow, isSignoutFlow, loading])

  const handleSignupStart = () => {
    console.log("Signup started, setting signup flow to true")
    setIsSignupFlow(true)
    setLoading(true)
    setSplashMessage("Creating your account...")
    setShowSplash(true)
  }

  const handleSignOut = () => {
    console.log("Signout started, setting signout flow to true")
    setIsSignoutFlow(true)
    setLoading(true)
  }

  // Show splash screen during loading or specific flows
  if (loading || showSplash) {
    return <SplashScreen message={splashMessage} />
  }

  // Show MovieSearch only if user exists and we're not in any special flow
  if (user && !isSignupFlow && !isSignoutFlow) {
    return <MovieSearch onSignOut={handleSignOut} />
  }

  // Show authentication forms
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-red-900 to-gray-900 text-white p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-center">
            <span className="text-red-500">Movie</span>Mate
          </h1>
          <p className="text-gray-300 text-center mt-2">Your Personal Cinema Companion</p>
        </div>
      </div>

      {/* Auth Container */}
      {isSignIn ? (
        <Signin onSwitchToSignUp={() => setIsSignIn(false)} />
      ) : (
        <Signup onSwitchToSignIn={() => setIsSignIn(true)} onSignupStart={handleSignupStart} />
      )}
      <Toast />
    </div>
  )
}

export default App
