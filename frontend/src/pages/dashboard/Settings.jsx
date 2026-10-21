import { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/layout/Sidebar'
import Navbar from '../../components/layout/Navbar'
import ThemeToggle from '../../components/common/ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { changePassword, updateCurrentProfile } from '../../services/authservice.js'


const PREFERENCES_KEY = 'skysync-settings-preferences'

const defaultPreferences = {
  emailNotifications: true,
  shareNotifications: true,
  productUpdates: false,
}

function readPreferences() {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY)
    return saved
      ? { ...defaultPreferences, ...JSON.parse(saved) }
      : defaultPreferences
  } catch {
    return defaultPreferences
  }
}

function Settings() {
  const { user, updateUser } = useAuth()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')
  const [preferences, setPreferences] = useState(readPreferences)
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  useEffect(() => {
    setDisplayName(user?.name || '')
  }, [user?.name])

  const sections = [
    { id: 'profile', label: 'Profile', icon: UserRound },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ]

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  const savePreferences = () => {
    setSavingPreferences(true)
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
      toast.success('Preferences saved on this device')
    } catch {
      toast.error('Could not save preferences in this browser')
    } finally {
      setSavingPreferences(false)
    }
  }

  const saveProfileName = async () => {
    const trimmedName = displayName.trim()

    if (!trimmedName) {
      toast.error('Display name cannot be empty')
      return
    }

    if (trimmedName.length > 80) {
      toast.error('Display name cannot exceed 80 characters')
      return
    }

    if (trimmedName === (user?.name || '')) {
      toast.success('Your profile information is up to date')
      return
    }

    if (typeof updateUser !== 'function') {
      toast.error('Profile update is not fully configured. Update AuthContext first.')
      return
    }

    try {
      setSavingProfile(true)

      const updatedProfile = await updateCurrentProfile({
        name: trimmedName,
      })

      updateUser({
        name: updatedProfile.name,
        email: updatedProfile.email,
      })

      setDisplayName(updatedProfile.name)
      toast.success('Profile updated successfully')
    } catch (error) {
      const responseMessage = error.response?.data?.message
      const fallbackMessage =
        error.response?.status === 401
          ? 'Your session has expired. Please sign in again.'
          : 'Could not update your profile. Please try again.'

      toast.error(
        typeof responseMessage === 'string'
          ? responseMessage
          : fallbackMessage
      )
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordInput = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((current) => ({ ...current, [field]: !current[field] }))
  }

  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false })
  }

  const passwordStrength = (() => {
    const value = passwordForm.newPassword
    if (!value) return 0
    let score = 0
    if (value.length >= 8) score += 1
    if (value.length >= 12) score += 1
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
    if (/\d/.test(value)) score += 1
    if (/[^A-Za-z0-9]/.test(value)) score += 1
    return Math.min(score, 4)
  })()

  const handleChangePassword = async (event) => {
    event.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Complete all password fields.')
      return
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      toast.error('New password must contain 8–72 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }
    if (currentPassword === newPassword) {
      toast.error('Choose a password different from your current password.')
      return
    }

    try {
      setChangingPassword(true)
      await changePassword({ currentPassword, newPassword })
      resetPasswordForm()
      toast.success('Your password has been changed successfully.')
    } catch (error) {
      const status = error.response?.status
      const body = error.response?.data
      const responseMessage = typeof body === 'string' ? body : body?.message

      if (status === 401) {
        toast.error('Your session is invalid or expired. Please sign in again.')
      } else if (status === 400) {
        toast.error(responseMessage || 'Check your current and new password.')
      } else if (status === 403) {
        toast.error('You are not authorized to change this password.')
      } else {
        toast.error(responseMessage || 'Could not change password. Please try again.')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(false)
    toast.error('Account deletion is not connected yet. No data was deleted.')
  }

  const scrollToSection = (id) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const cardClass =
    'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
  const headingClass =
    'text-base font-semibold text-slate-900 dark:text-white'
  const descriptionClass =
    'mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>Workspace</span>
                  <ChevronRight size={15} />
                  <span className="font-medium text-sky-600 dark:text-sky-400">
                    Settings
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Settings
                    </h1>
                    <p className={descriptionClass}>
                      Manage your profile, preferences, and account security.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:inline">
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-6">
                  <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Preferences
                  </p>
                  <nav className="flex gap-1 overflow-x-auto lg:flex-col">
                    {sections.map((section) => {
                      const Icon = section.icon
                      const selected = activeSection === section.id

                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            selected
                              ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
                              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon size={18} />
                          {section.label}
                        </button>
                      )
                    })}
                  </nav>

                  <div className="mt-5 hidden rounded-xl bg-sky-50 p-3 dark:bg-sky-950/30 lg:block">
                    <div className="flex items-center gap-2 text-sm font-semibold text-sky-800 dark:text-sky-300">
                      <ShieldCheck size={17} />
                      Your files, your control
                    </div>
                    <p className="mt-1 text-xs leading-5 text-sky-800/75 dark:text-sky-300/70">
                      Review your preferences and keep your account details up to date.
                    </p>
                  </div>
                </aside>

                <div className="space-y-6">
                  <section id="profile" className={`${cardClass} scroll-mt-6 p-5 sm:p-6`}>
                    <div className="mb-6 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <UserRound size={20} />
                      </div>
                      <div>
                        <h2 className={headingClass}>Profile information</h2>
                        <p className={descriptionClass}>
                          Your account details used by SkySync.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-sky-500/20">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {user?.name || 'SkySync user'}
                        </p>
                        <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                          {user?.email || 'No email available'}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Check size={13} />
                          Signed in
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Display name
                        </span>
                        <input
                          value={displayName}
                          onChange={(event) => setDisplayName(event.target.value)}
                          maxLength={80}
                          autoComplete="name"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          placeholder="Your name"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email address
                        </span>
                        <input
                          value={user?.email || ''}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        />
                      </label>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Your changes will be saved to your SkySync account.
                      </p>
                      <button
                        type="button"
                        onClick={saveProfileName}
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={16} />
                        {savingProfile ? 'Saving…' : 'Save profile'}
                      </button>
                    </div>
                  </section>

                  <section id="appearance" className={`${cardClass} scroll-mt-6 p-5 sm:p-6`}>
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <Palette size={20} />
                      </div>
                      <div>
                        <h2 className={headingClass}>Appearance</h2>
                        <p className={descriptionClass}>
                          Choose the look that feels right for you.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          <Sun size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">Light and dark mode</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Use the theme control in the sidebar.
                          </p>
                        </div>
                        <ThemeToggle />
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                          <Monitor size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Responsive layout</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            SkySync adapts to your screen size.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section id="notifications" className={`${cardClass} scroll-mt-6 p-5 sm:p-6`}>
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Bell size={20} />
                      </div>
                      <div>
                        <h2 className={headingClass}>Notifications</h2>
                        <p className={descriptionClass}>
                          Control your local notification preferences.
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        {
                          key: 'emailNotifications',
                          title: 'Email notifications',
                          detail: 'Preference for receiving important account updates.',
                        },
                        {
                          key: 'shareNotifications',
                          title: 'File-sharing activity',
                          detail: 'Preference for updates about shared files and links.',
                        },
                        {
                          key: 'productUpdates',
                          title: 'Product announcements',
                          detail: 'Preference for new features and SkySync updates.',
                        },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between gap-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {item.detail}
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={preferences[item.key]}
                            aria-label={item.title}
                            onClick={() => updatePreference(item.key, !preferences[item.key])}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                              preferences[item.key] ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                preferences[item.key] ? 'left-[22px]' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={savePreferences}
                        disabled={savingPreferences}
                        className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={16} />
                        {savingPreferences ? 'Saving…' : 'Save preferences'}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      These preferences are stored in this browser only. Email or push notifications are not sent by this UI.
                    </p>
                  </section>

                  <section id="security" className={`${cardClass} scroll-mt-6 p-5 sm:p-6`}>
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h2 className={headingClass}>Security</h2>
                        <p className={descriptionClass}>
                          Review the security options currently available in your account.
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleChangePassword}
                      className="rounded-xl border border-slate-200 p-4 sm:p-5 dark:border-slate-700"
                    >
                      <div className="mb-5 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <KeyRound size={19} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">Change password</h3>
                          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            Confirm your current password before setting a new one. Your password is never stored in browser preferences.
                          </p>
                        </div>
                      </div>

                      {[{
                        name: 'currentPassword',
                        label: 'Current password',
                        placeholder: 'Enter your current password',
                        autocomplete: 'current-password',
                      }, {
                        name: 'newPassword',
                        label: 'New password',
                        placeholder: 'Create a new password',
                        autocomplete: 'new-password',
                      }, {
                        name: 'confirmPassword',
                        label: 'Confirm new password',
                        placeholder: 'Enter the new password again',
                        autocomplete: 'new-password',
                      }].map((field) => (
                        <label key={field.name} className="mb-4 block">
                          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {field.label}
                          </span>
                          <span className="relative block">
                            <input
                              type={showPasswords[field.name] ? 'text' : 'password'}
                              name={field.name}
                              value={passwordForm[field.name]}
                              onChange={handlePasswordInput}
                              autoComplete={field.autocomplete}
                              required
                              maxLength={72}
                              spellCheck={false}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                              placeholder={field.placeholder}
                              aria-label={field.label}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(field.name)}
                              aria-label={`${showPasswords[field.name] ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              {showPasswords[field.name] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </span>
                          {field.name === 'newPassword' && passwordForm.newPassword && (
                            <span className="mt-3 block" aria-live="polite">
                              <span className="mb-1.5 flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Password strength</span>
                                <span className={`font-medium ${passwordStrength <= 1 ? 'text-red-500' : passwordStrength <= 2 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                                </span>
                              </span>
                              <span className="grid grid-cols-4 gap-1" aria-hidden="true">
                                {[1, 2, 3, 4].map((segment) => (
                                  <span key={segment} className={`h-1.5 rounded-full ${passwordStrength >= segment ? (passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-slate-700'}`} />
                                ))}
                              </span>
                            </span>
                          )}
                          {field.name === 'confirmPassword' && passwordForm.confirmPassword && (
                            <span className={`mt-2 block text-xs ${passwordForm.newPassword === passwordForm.confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                              {passwordForm.newPassword === passwordForm.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </span>
                          )}
                        </label>
                      ))}

                      <div className="mb-5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                        <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">For a stronger password</p>
                        <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <li className={passwordForm.newPassword.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                            {passwordForm.newPassword.length >= 8 ? '✓' : '•'} At least 8 characters
                          </li>
                          <li className={/[A-Z]/.test(passwordForm.newPassword) && /[a-z]/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                            {/[A-Z]/.test(passwordForm.newPassword) && /[a-z]/.test(passwordForm.newPassword) ? '✓' : '•'} Mix uppercase and lowercase letters
                          </li>
                          <li className={/\d/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                            {/\d/.test(passwordForm.newPassword) ? '✓' : '•'} Include a number
                          </li>
                        </ul>
                      </div>

                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                          You'll need your new password the next time you sign in.
                        </p>
                        <div className="flex gap-2 sm:shrink-0">
                          <button
                            type="button"
                            onClick={resetPasswordForm}
                            disabled={changingPassword || (!passwordForm.currentPassword && !passwordForm.newPassword && !passwordForm.confirmPassword)}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Clear
                          </button>
                          <button
                            type="submit"
                            disabled={changingPassword || !passwordForm.currentPassword || passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 72 || passwordForm.newPassword !== passwordForm.confirmPassword || passwordForm.currentPassword === passwordForm.newPassword}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <KeyRound size={16} />
                            {changingPassword ? 'Changing…' : 'Update password'}
                          </button>
                        </div>
                      </div>
                    </form>

                    <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <Eye size={19} className="mt-0.5 shrink-0 text-slate-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">Account privacy</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Keep your login credentials private and only share file links with people you trust.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/50 dark:bg-slate-900 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                        <Trash2 size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                          Danger zone
                        </h2>
                        <p className={descriptionClass}>
                          Account deletion is permanent. It must be handled by a verified backend operation.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-red-100 pt-5 dark:border-red-900/40 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">Delete account</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          No account data will be deleted from this screen yet.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={16} />
                        Delete account
                      </button>
                    </div>
                  </section>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                    <CircleHelp size={18} className="mt-0.5 shrink-0" />
                    <p>
                      Some account actions are informational until matching backend endpoints are implemented. Your existing login, file upload, sharing, and logout flows are not changed by this page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDeleteConfirmation(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <Trash2 size={21} />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close confirmation"
              >
                <X size={18} />
              </button>
            </div>
            <h3 id="delete-account-title" className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This action is not connected to the backend yet. No files or account information will be deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
