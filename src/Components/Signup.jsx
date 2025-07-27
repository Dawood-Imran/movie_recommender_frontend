"use client"

import { useState } from "react"
import { auth, db } from "../firebaseconfig"
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import toast from "react-hot-toast"
import Toast from "./Toast"
import { Eye, EyeOff, Loader2, User, Mail, Lock, CheckCircle } from "lucide-react"

export default function Signup({ onSwitchToSignIn, onSignupStart }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    // IMPORTANT: Set signup flow state BEFORE authentication starts
    onSignupStart()

    const toastId = toast.loading("Creating your account...", {
      style: {
        borderRadius: "10px",
        background: "#1f2937",
        color: "#fff",
      },
    })

    try {
      const { email, password, name } = formData
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile with display name
      await updateProfile(user, { displayName: name })

      // Store user data in Firestore using the user's UID as the document ID
      const userDocRef = doc(db, "users", user.uid)
      await setDoc(userDocRef, {
        userId: user.uid,
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
      })

      // Show success toast
      toast.success("Account created successfully!", {
        id: toastId,
        duration: 2000,
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })

      // Sign out the user immediately
      await signOut(auth)
    } catch (error) {
      console.error("Error creating user:", error)
      let errorMessage = "An unexpected error occurred"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Weak password, please choose a stronger password"
      } else if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please try again."
      } else {
        errorMessage = error.message || "An unexpected error occurred"
      }

      toast.error(errorMessage, {
        id: toastId,
        duration: 5000,
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      })

      setErrors({ submit: errorMessage })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Toast />
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-96 border border-red-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            {/* Name Input */}
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 bg-gray-700 border ${errors.name ? "border-red-500" : "border-gray-600"} rounded focus:outline-none focus:ring-2 ${errors.name ? "focus:ring-red-500" : "focus:ring-red-400"} text-white placeholder-gray-400`}
                placeholder="Enter your name"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}

            {/* Email Input */}
            <label className="block text-sm font-medium text-gray-300 mb-2 mt-4" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 bg-gray-700 border ${errors.email ? "border-red-500" : "border-gray-600"} rounded focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500" : "focus:ring-red-400"} text-white placeholder-gray-400`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}

            {/* Password Input */}
            <label className="block text-sm font-medium text-gray-300 mb-2 mt-4" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 bg-gray-700 border ${errors.password ? "border-red-500" : "border-gray-600"} rounded focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500" : "focus:ring-red-400"} text-white placeholder-gray-400`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}

            {/* Confirm Password Input */}
            <label className="block text-sm font-medium text-gray-300 mb-2 mt-4" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 bg-gray-700 border ${errors.confirmPassword ? "border-red-500" : "border-gray-600"} rounded focus:outline-none focus:ring-2 ${errors.confirmPassword ? "focus:ring-red-500" : "focus:ring-red-400"} text-white placeholder-gray-400`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
          </div>

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded border border-red-700">{errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-8 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Sign Up
              </span>
            )}
          </button>
          <p className="mt-4 text-sm text-center text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-red-400 hover:text-red-300 hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
