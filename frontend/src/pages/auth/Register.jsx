import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import ThemeToggle from '../../components/common/ThemeToggle'
import skySyncLogo from '../../assets/logo/skysync-logo.png'
import skySyncIcon from '../../assets/logo/skysync-icon.png'
import { registerUser } from '../../services/authservice.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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

  // Keep these rules aligned with the backend password validation.
  const passwordChecks = [
    {
      label: 'At least 8 characters',
      passed: formData.password.length >= 8 && formData.password.length <= 64,
    },
    {
      label: 'At least one uppercase letter (A-Z)',
      passed: /[A-Z]/.test(formData.password),
    },
    {
      label: 'At least one lowercase letter (a-z)',
      passed: /[a-z]/.test(formData.password),
    },
    {
      label: 'At least one number (0-9)',
      passed: /\d/.test(formData.password),
    },
    {
      label: 'At least one special character (@$!%*?&)',
      passed:
        /[@$!%*?&]/.test(formData.password) &&
        !/[^A-Za-z\d@$!%*?&]/.test(formData.password),
    },
  ]

  const passedPasswordChecks = passwordChecks.filter((check) => check.passed).length
  const isPasswordStrong = passedPasswordChecks === passwordChecks.length
  const emailValue = formData.email.trim()
  const isEmailValid = emailValue.length > 0 && EMAIL_REGEX.test(emailValue)

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword

  const passwordStrengthLabel =
    passedPasswordChecks <= 2
      ? 'Weak'
      : passedPasswordChecks <= 4
        ? 'Almost there'
        : 'Strong'

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

    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address.'
    }

    if (!password) {
      return 'Please enter a password.'
    }

    if (password.length < 8 || password.length > 64) {
      return 'Password must contain between 8 and 64 characters.'
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.'
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.'
    }

    if (!/\d/.test(password)) {
      return 'Password must contain at least one number.'
    }

    if (!/[@$!%*?&]/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&).'
    }

    if (/[^A-Za-z\d@$!%*?&]/.test(password)) {
      return 'Password contains an unsupported character. Use letters, numbers, and @$!%*?&.'
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

    const loadingToastId = toast.loading('Creating your SkySync account...')

    try {
      setLoading(true)

      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })

      toast.success('Account created successfully!', {
        id: loadingToastId,
      })

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
          : 'Registration failed.',
        { id: loadingToastId }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />

        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:min-h-20 sm:px-7 sm:py-5 lg:px-10">
        {/* Logo */}
        <Link
          to="/login"
          className="group flex items-center"
          aria-label="SkySync Home"
        >
          <img
            src={skySyncLogo}
            alt="SkySync"
            className="h-8 w-auto max-w-[min(62vw,210px)] object-contain object-left transition-transform duration-300 group-hover:scale-[1.03] sm:h-10 sm:max-w-[230px]"
          />
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="relative z-10 flex min-h-[calc(100dvh-64px)] w-full items-start justify-center px-3 pb-8 pt-3 sm:min-h-[calc(100dvh-80px)] sm:px-6 sm:pb-12 sm:pt-5 lg:items-center">
        <div className="w-full min-w-0 max-w-md">
          {/* Card */}
          <div className="w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-colors duration-300 sm:rounded-3xl sm:p-6 md:p-8 dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-black/20">
            {/* Icon */}
            <div className="mb-4 flex justify-center sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 shadow-lg shadow-sky-500/10 sm:h-16 sm:w-16 dark:border-sky-900/50 dark:bg-sky-950/50">
                  <img
                    src={skySyncIcon}
                    alt=""
                    className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                  />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-5 text-center sm:mb-7">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white md:text-3xl">
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
                    autoCapitalize="words"
                    maxLength={80}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      min-h-12 w-full min-w-0 rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-4
                      text-base text-slate-900 sm:text-sm
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
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={emailValue.length > 0 && !isEmailValid}
                    aria-describedby="email-feedback"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      min-h-12 w-full min-w-0 rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-4
                      text-base text-slate-900 sm:text-sm
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

                {emailValue.length > 0 && (
                  <p
                    id="email-feedback"
                    className={`mt-2 flex items-center gap-1.5 px-1 text-xs ${
                      isEmailValid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}
                    role="status"
                  >
                    {isEmailValid ? (
                      <>
                        <CheckCircle2 size={13} />
                        Valid email format
                      </>
                    ) : (
                      'Enter a valid email address, e.g. name@example.com.'
                    )}
                  </p>
                )}
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
                    maxLength={64}
                    spellCheck={false}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      min-h-12 w-full min-w-0 rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-12
                      text-base text-slate-900 sm:text-sm
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
                      flex h-10 w-10
                      -translate-y-1/2
                      items-center justify-center
                      rounded-lg
                      text-slate-400
                      focus:outline-none focus:ring-2 focus:ring-sky-500/40
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

                {/* Live password strength and requirements */}
                {formData.password.length > 0 && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-950/70" aria-live="polite">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password strength
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isPasswordStrong
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : passedPasswordChecks >= 3
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {passwordStrengthLabel}
                      </span>
                    </div>

                    <div className="mb-3 grid grid-cols-5 gap-1.5" aria-label={`${passedPasswordChecks} of 5 password requirements met`}>
                      {passwordChecks.map((check) => (
                        <div
                          key={check.label}
                          className={`h-1.5 rounded-full ${
                            check.passed
                              ? 'bg-emerald-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {passwordChecks.map((check) => (
                        <li
                          key={check.label}
                          className={`flex items-center gap-2 text-xs ${
                            check.passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {check.passed ? (
                            <CheckCircle2 size={14} className="shrink-0" />
                          ) : (
                            <Circle size={14} className="shrink-0" />
                          )}
                          {check.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                    maxLength={64}
                    spellCheck={false}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      min-h-12 w-full min-w-0 rounded-xl
                      border border-slate-200
                      bg-slate-50
                      pl-11 pr-12
                      text-base text-slate-900 sm:text-sm
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
                      flex h-10 w-10
                      -translate-y-1/2
                      items-center justify-center
                      rounded-lg
                      text-slate-400
                      focus:outline-none focus:ring-2 focus:ring-sky-500/40
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

              {/* Confirm password feedback */}
              {formData.confirmPassword.length > 0 && (
                <p
                  className={`-mt-2 px-1 text-xs ${
                    passwordsMatch
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                  role="status"
                >
                  {passwordsMatch
                    ? 'Passwords match.'
                    : 'Passwords do not match.'}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isEmailValid || !isPasswordStrong || !passwordsMatch}
                className="
                  group mt-2 flex min-h-12 w-full
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
            <div className="my-5 flex items-center gap-3 sm:my-6">
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
                flex min-h-12 w-full
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
            <p className="mt-6 px-1 text-center text-sm leading-6 text-slate-500 sm:mt-7 dark:text-slate-400">
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
          <p className="mx-auto mt-5 max-w-md px-2 text-center text-[11px] leading-5 text-slate-400 sm:mt-6 sm:text-xs dark:text-slate-600">
            By creating an account, you agree to use SkySync responsibly
            and securely.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Register