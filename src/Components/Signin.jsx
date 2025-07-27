"use client"

import { useState } from "react"
import { auth } from "../firebaseconfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import toast from "react-hot-toast"
import Toast from "./Toast"
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from "lucide-react"

export default function Signin({ onSwitchToSignUp }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    const toastId = toast.loading("Signing in...", {
      style: {
        borderRadius: "10px",
        background: "#1f2937",
        color: "#fff",
      },
    })

    try {
      const { email, password } = formData
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      toast.success(`Welcome back, ${user.displayName || user.email}!`, {
        id: toastId,
        duration: 3000,
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      let errorMessage = ""

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later"
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password"
      } else {
        errorMessage = "An unexpected error occurred. Please try again."
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Toast />
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-96 border border-red-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">
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
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}

            <label className="block text-sm font-medium text-gray-300 mb-3 mt-4" htmlFor="password">
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
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-400">
              Remember me
            </label>
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
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </span>
            )}
          </button>
          <p className="mt-4 text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-red-400 hover:text-red-300 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
