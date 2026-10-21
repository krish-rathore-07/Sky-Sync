import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/common/ThemeToggle'

import skySyncLogo from '../../assets/logo/skysync-logo.png'
import skySyncIcon from '../../assets/logo/skysync-icon.png'

function Login() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setError('')
    setSuccess('')
  }

  // =========================================================
  // EMAIL AND PASSWORD LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!formData.password) {
      setError('Please enter your password.')
      return
    }

    try {
      setLoading(true)

      await login({
        email: formData.email,
        password: formData.password,
      })

      setSuccess('Login successful.')

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message ||
            'Invalid email or password. Please try again.'

      setError(message)

      console.error('Login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setSuccess('')

    if (!credentialResponse?.credential) {
      setError(
        'Google did not return a valid credential. Please try again.'
      )
      return
    }

    try {
      setLoading(true)

      await googleLogin(credentialResponse.credential)

      setSuccess('Google login successful.')

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message ||
            'Google login failed. Please try again.'

      setError(message)

      console.error('Google login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // GOOGLE LOGIN ERROR
  // =========================================================

  const handleGoogleError = () => {
    setError(
      'Google sign-in was unsuccessful. Please try again.'
    )
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      {/* Theme Toggle */}
      <div className="absolute right-5 top-5 z-30">
        <ThemeToggle />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Logo */}
            <div>
              <img
                src={skySyncLogo}
                alt="SkySync"
                className="h-14 w-auto max-w-[230px] object-contain object-left"
              />
            </div>

            {/* Main Content */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                <ShieldCheck
                  size={16}
                  className="text-sky-400"
                />

                Secure file sharing
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
                Your files.
                <br />

                <span className="text-sky-400">
                  Anywhere.
                </span>

                <br />

                Anytime.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Store, manage and securely share your files
                with anyone, from anywhere.
              </p>

              <div className="mt-8 space-y-4">
                {/* Feature 1 */}
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <ShieldCheck
                      size={17}
                      className="text-sky-400"
                    />
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Secure file storage
                    </p>

                    <p className="text-xs text-slate-500">
                      Keep your files safe and organized
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Mail
                      size={17}
                      className="text-sky-400"
                    />
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Easy file sharing
                    </p>

                    <p className="text-xs text-slate-500">
                      Share your files with a single link
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <CheckCircle2
                      size={17}
                      className="text-sky-400"
                    />
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Access anywhere
                    </p>

                    <p className="text-xs text-slate-500">
                      Your files are available wherever you go
                    </p>
                  </div>
                </div>
              </div>

              {/* Icon and Branding */}
              <div className="mt-10 flex items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-sky-500/10 backdrop-blur">
                  <img
                    src={skySyncIcon}
                    alt="SkySync icon"
                    className="h-16 w-16 object-contain"
                  />
                </div>

                <div className="ml-5">
                  <p className="text-sm font-semibold text-white">
                    SkySync
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Secure file sharing made simple.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} SkySync.
              Secure file sharing made simple.
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 flex items-center justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <img
                  src={skySyncIcon}
                  alt="SkySync"
                  className="h-12 w-12 object-contain"
                />

                <img
                  src={skySyncLogo}
                  alt="SkySync"
                  className="h-10 w-auto max-w-[170px] object-contain object-left"
                />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Sign in to SkySync
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                Enter your credentials to access your files.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>{success}</p>
              </div>
            )}

            {/* ================================================= */}
            {/* EMAIL AND PASSWORD FORM */}
            {/* ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-white
                      pl-11 pr-4
                      text-sm
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-sky-500
                      focus:ring-4
                      focus:ring-sky-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:border-slate-800
                      dark:bg-slate-900
                      dark:placeholder:text-slate-600
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    disabled={loading}
                    className="text-xs font-medium text-sky-500 transition hover:text-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-white
                      pl-11 pr-12
                      text-sm
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-sky-500
                      focus:ring-4
                      focus:ring-sky-500/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      dark:border-slate-800
                      dark:bg-slate-900
                      dark:placeholder:text-slate-600
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={loading}
                    className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      rounded-lg p-2
                      text-slate-400
                      transition
                      hover:bg-slate-100
                      hover:text-slate-600
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      dark:hover:bg-slate-800
                      dark:hover:text-slate-200
                    "
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-sky-500 dark:border-slate-700 dark:bg-slate-900"
                />

                <label
                  htmlFor="remember"
                  className="cursor-pointer text-sm text-slate-500 dark:text-slate-400"
                >
                  Remember me
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group relative flex h-12 w-full
                  items-center justify-center
                  overflow-hidden rounded-xl
                  bg-sky-500
                  text-sm font-semibold text-white
                  shadow-lg shadow-sky-500/20
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-sky-600
                  hover:shadow-xl
                  hover:shadow-sky-500/25
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                  disabled:hover:translate-y-0
                "
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Signing in...
                  </span>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* ================================================= */}
            {/* DIVIDER */}
            {/* ================================================= */}

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

              <span className="text-xs text-slate-400">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* ================================================= */}
            {/* GOOGLE LOGIN */}
            {/* ================================================= */}

            <div
              className={`flex w-full justify-center ${
                loading
                  ? 'pointer-events-none opacity-60'
                  : ''
              }`}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
                text="continue_with"
                width="400"
                logo_alignment="left"
              />
            </div>

            {/* Register */}
            <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}

              <Link
                to="/register"
                className="font-semibold text-sky-500 transition hover:text-sky-400"
              >
                Create account
              </Link>
            </p>

            {/* Mobile Footer */}
            <div className="mt-10 flex items-center justify-center gap-2 lg:hidden">
              <img
                src={skySyncIcon}
                alt=""
                className="h-5 w-5 object-contain"
              />

              <span className="text-xs text-slate-400">
                Secure file sharing made simple.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login