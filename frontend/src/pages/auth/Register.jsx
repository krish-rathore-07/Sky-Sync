import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import ThemeToggle from '../../components/common/ThemeToggle'
import skySyncLogo from '../../assets/logo/skysync-logo.png'
import skySyncIcon from '../../assets/logo/skysync-icon.png'
import { registerUser } from '../../services/authservice.js'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const validateForm = () => {
    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password
    const confirmPassword = formData.confirmPassword

    if (!name) {
      return 'Please enter your name.'
    }

    if (name.length < 2) {
      return 'Name must contain at least 2 characters.'
    }

    if (!email) {
      return 'Please enter your email.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.'
    }

    if (!password) {
      return 'Please enter a password.'
    }

    if (password.length < 6) {
      return 'Password must contain at least 6 characters.'
    }

    if (!confirmPassword) {
      return 'Please confirm your password.'
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }

    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    try {
      setLoading(true)

      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })

      toast.success('Account created successfully!')

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 700)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Unable to create your account. Please try again.'

      setError(
        typeof message === 'string'
          ? message
          : 'Unable to create your account. Please try again.'
      )

      toast.error(
        typeof message === 'string'
          ? message
          : 'Registration failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />

        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link
          to="/login"
          className="group flex items-center"
          aria-label="SkySync Home"
        >
          <img
            src={skySyncLogo}
            alt="SkySync"
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-10"
          />
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-black/20 sm:p-8">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 shadow-lg shadow-sky-500/10 dark:border-sky-900/50 dark:bg-sky-950/50">
                  <img
                    src={skySyncIcon}
                    alt=""
                    className="h-10 w-10 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Start sharing your files securely with SkySync.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-4
                      text-sm text-slate-900
                      outline-none
                      transition-all duration-200
                      placeholder:text-slate-400
                      focus:border-sky-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-sky-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                      dark:placeholder:text-slate-600
                      dark:focus:border-sky-500
                      dark:focus:bg-slate-950
                      dark:focus:ring-sky-500/10
                    "
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-4
                      text-sm text-slate-900
                      outline-none
                      transition-all duration-200
                      placeholder:text-slate-400
                      focus:border-sky-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-sky-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                      dark:placeholder:text-slate-600
                      dark:focus:border-sky-500
                      dark:focus:bg-slate-950
                      dark:focus:ring-sky-500/10
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-12
                      text-sm text-slate-900
                      outline-none
                      transition-all duration-200
                      placeholder:text-slate-400
                      focus:border-sky-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-sky-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                      dark:placeholder:text-slate-600
                      dark:focus:border-sky-500
                      dark:focus:bg-slate-950
                      dark:focus:ring-sky-500/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="
                      absolute right-3 top-1/2
                      flex h-8 w-8
                      -translate-y-1/2
                      items-center justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-slate-200
                      hover:text-slate-600
                      disabled:cursor-not-allowed
                      dark:hover:bg-slate-800
                      dark:hover:text-slate-200
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-12
                      text-sm text-slate-900
                      outline-none
                      transition-all duration-200
                      placeholder:text-slate-400
                      focus:border-sky-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-sky-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                      dark:placeholder:text-slate-600
                      dark:focus:border-sky-500
                      dark:focus:bg-slate-950
                      dark:focus:ring-sky-500/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    className="
                      absolute right-3 top-1/2
                      flex h-8 w-8
                      -translate-y-1/2
                      items-center justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-slate-200
                      hover:text-slate-600
                      disabled:cursor-not-allowed
                      dark:hover:bg-slate-800
                      dark:hover:text-slate-200
                    "
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password hint */}
              <p className="px-1 text-xs text-slate-500 dark:text-slate-500">
                Use at least 6 characters for your password.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group mt-2 flex h-12 w-full
                  items-center justify-center gap-2
                  rounded-xl
                  bg-sky-500
                  px-5
                  text-sm font-semibold
                  text-white
                  shadow-lg
                  shadow-sky-500/20
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-sky-600
                  hover:shadow-xl
                  hover:shadow-sky-500/25
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  disabled:hover:translate-y-0
                  dark:bg-sky-500
                  dark:hover:bg-sky-400
                "
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

              <span className="text-xs font-medium text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() =>
                toast('Google sign-up will be available soon.')
              }
              className="
                flex h-12 w-full
                items-center justify-center gap-3
                rounded-xl
                border border-slate-200
                bg-white
                text-sm font-medium
                text-slate-700
                transition-all duration-200
                hover:bg-slate-50
                hover:shadow-sm
                dark:border-slate-700
                dark:bg-slate-950
                dark:text-slate-200
                dark:hover:bg-slate-900
              "
            >
              {/* Google icon */}
              <span className="text-base font-bold">
                G
              </span>

              Continue with Google
            </button>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="
                  font-semibold
                  text-sky-500
                  transition-colors
                  hover:text-sky-600
                  dark:text-sky-400
                  dark:hover:text-sky-300
                "
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
            By creating an account, you agree to use SkySync responsibly
            and securely.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Register