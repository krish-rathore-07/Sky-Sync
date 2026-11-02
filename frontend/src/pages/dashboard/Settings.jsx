import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  KeyRound,
  Monitor,
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
import { useNavigate } from 'react-router-dom'
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
  const { user, updateUser, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [deletingAccount, setDeletingAccount] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')
  const preferencesSlotRef = useRef(null)
  const [preferencesSidebarLeft, setPreferencesSidebarLeft] = useState(null)

  // Keep the preferences panel pinned to its exact grid-column position.
  // Measuring the slot avoids hard-coding the width of the main navigation
  // sidebar or the horizontal padding of the page.
  useLayoutEffect(() => {
    const updatePreferencesSidebarPosition = () => {
      const slot = preferencesSlotRef.current
      if (!slot) return

      setPreferencesSidebarLeft(slot.getBoundingClientRect().left)
    }

    updatePreferencesSidebarPosition()
    window.addEventListener('resize', updatePreferencesSidebarPosition)

    return () => {
      window.removeEventListener('resize', updatePreferencesSidebarPosition)
    }
  }, [])
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

  useEffect(() => {
    if (!showDeleteConfirmation) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showDeleteConfirmation])

  useEffect(() => {
    if (!showDeleteConfirmation || deletingAccount) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowDeleteConfirmation(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDeleteConfirmation, deletingAccount])

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
      toast.success('Notification preferences saved on this device.')
    } catch {
      toast.error('Could not save preferences in this browser.')
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

    const loadingToastId = toast.loading('Updating your profile...')

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
      toast.success('Profile updated successfully', {
        id: loadingToastId,
      })
    } catch (error) {
      const responseMessage = error.response?.data?.message
      const fallbackMessage =
        error.response?.status === 401
          ? 'Your session has expired. Please sign in again.'
          : 'Could not update your profile. Please try again.'

      toast.error(
        typeof responseMessage === 'string'
          ? responseMessage
          : fallbackMessage,
        { id: loadingToastId }
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

  const newPasswordChecks = [
    {
      label: '8–64 characters',
      passed:
        passwordForm.newPassword.length >= 8 &&
        passwordForm.newPassword.length <= 64,
    },
    {
      label: 'One uppercase letter',
      passed: /[A-Z]/.test(passwordForm.newPassword),
    },
    {
      label: 'One lowercase letter',
      passed: /[a-z]/.test(passwordForm.newPassword),
    },
    {
      label: 'One number',
      passed: /\d/.test(passwordForm.newPassword),
    },
    {
      label: 'One special character (@$!%*?&)',
      passed:
        /[@$!%*?&]/.test(passwordForm.newPassword) &&
        !/[^A-Za-z\d@$!%*?&]/.test(passwordForm.newPassword),
    },
  ]

  const passwordStrength = newPasswordChecks.filter(
    (check) => check.passed
  ).length

  const isNewPasswordStrong = passwordStrength === newPasswordChecks.length
  const passwordsMatch =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword === passwordForm.confirmPassword

  const handleChangePassword = async (event) => {
    event.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Complete all password fields.')
      return
    }
    if (newPassword.length < 8 || newPassword.length > 64) {
      toast.error('New password must contain 8–64 characters.')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Add at least one uppercase letter.')
      return
    }
    if (!/[a-z]/.test(newPassword)) {
      toast.error('Add at least one lowercase letter.')
      return
    }
    if (!/\d/.test(newPassword)) {
      toast.error('Add at least one number.')
      return
    }
    if (!/[@$!%*?&]/.test(newPassword)) {
      toast.error('Add at least one special character (@$!%*?&).')
      return
    }
    if (/[^A-Za-z\d@$!%*?&]/.test(newPassword)) {
      toast.error('Use only letters, numbers, and @$!%*?& in your password.')
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

    const loadingToastId = toast.loading('Changing your password...')

    try {
      setChangingPassword(true)
      await changePassword({ currentPassword, newPassword })
      resetPasswordForm()
      toast.success('Your password has been changed successfully.', {
        id: loadingToastId,
      })
    } catch (error) {
      const status = error.response?.status
      const body = error.response?.data
      const responseMessage = typeof body === 'string' ? body : body?.message

      if (status === 401) {
        toast.error('Your session is invalid or expired. Please sign in again.', { id: loadingToastId })
      } else if (status === 400) {
        toast.error(responseMessage || 'Check your current and new password.', { id: loadingToastId })
      } else if (status === 403) {
        toast.error('You are not authorized to change this password.', { id: loadingToastId })
      } else {
        toast.error(responseMessage || 'Could not change password. Please try again.', { id: loadingToastId })
      }
    } finally {
      setChangingPassword(false)
    }
  }


const handleDeleteAccount = async () => {
  const loadingToastId = toast.loading('Deleting your SkySync account...')

  try {
    setDeletingAccount(true)

    await deleteAccount()

    // Authentication data is cleared by AuthContext.
    localStorage.removeItem(PREFERENCES_KEY)

    setShowDeleteConfirmation(false)

    toast.success('Your SkySync account has been deleted.', {
      id: loadingToastId,
    })

    navigate('/login', { replace: true })
  } catch (error) {
    console.error('Account deletion failed:', error)

    const responseData = error?.response?.data
    const message =
      typeof responseData === 'string'
        ? responseData
        : responseData?.message ||
          'Unable to delete your account. Please try again.'

    toast.error(message, { id: loadingToastId })
  } finally {
    setDeletingAccount(false)
  }
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
    <div className="min-h-screen w-full overflow-x-clip bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen w-full">
        <div className="min-h-screen shrink-0 self-stretch lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto [&_aside]:!min-h-screen">
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

          <main className="w-full min-w-0 px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl min-w-0">
              <div className="mb-8 min-w-0 lg:ml-[244px] xl:ml-[254px]">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>Workspace</span>
                  <ChevronRight size={15} />
                  <span className="font-medium text-sky-600 dark:text-sky-400">
                    Settings
                  </span>
                </div>

                <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Settings
                    </h1>
                    <p className={descriptionClass}>
                      Manage your profile, preferences, and account security.
                    </p>
                  </div>


                </div>
              </div>

              <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)]">
                {/* Keeps the preferences column reserved while the panel itself is fixed. */}
                <div
                  ref={preferencesSlotRef}
                  className="hidden min-w-0 lg:block lg:w-[220px] xl:w-[230px]"
                  aria-hidden="true"
                />

                <aside
                  style={
                    preferencesSidebarLeft === null
                      ? undefined
                      : { left: `${preferencesSidebarLeft}px` }
                  }
                  className="min-w-0 w-full rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 sm:p-3 lg:fixed lg:top-20 lg:z-30 lg:h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-5rem)] lg:w-[220px] lg:overflow-y-auto xl:w-[230px]"
                >
                  <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Preferences
                  </p>
                  <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:flex lg:flex-col">
                    {sections.map((section) => {
                      const Icon = section.icon
                      const selected = activeSection === section.id

                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          aria-current={selected ? 'location' : undefined}
                          className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium transition sm:gap-3 sm:px-3 sm:text-sm ${
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
                  <section id="profile" className={`${cardClass} scroll-mt-6 p-4 sm:p-6`}>
                    <div className="mb-6 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <UserRound size={20} />
                      </div>
                      <div className="min-w-0">
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
                        <p className="break-words font-semibold text-slate-900 dark:text-white">
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
                          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                          className="min-h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-500 outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
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
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        <Save size={16} />
                        {savingProfile ? 'Saving…' : 'Save profile'}
                      </button>
                    </div>
                  </section>

                  <section id="appearance" className={`${cardClass} scroll-mt-6 p-4 sm:p-6`}>
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <Palette size={20} />
                      </div>
                      <div className="min-w-0">
                        <h2 className={headingClass}>Appearance</h2>
                        <p className={descriptionClass}>
                          Choose the look that feels right for you.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3 sm:flex-nowrap sm:p-4 dark:border-slate-700">
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

                      <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3 sm:flex-nowrap sm:p-4 dark:border-slate-700">
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

                  <section id="notifications" className={`${cardClass} scroll-mt-6 p-4 sm:p-6`}>
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Bell size={20} />
                      </div>
                      <div className="min-w-0">
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
                        <div key={item.key} className="flex min-w-0 items-center justify-between gap-3 py-4 sm:gap-4">
                          <div className="min-w-0 flex-1">
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
                            className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                              preferences[item.key] ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                preferences[item.key] ? 'left-[26px]' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-stretch border-t border-slate-100 pt-4 dark:border-slate-800 sm:justify-end">
                      <button
                        type="button"
                        onClick={savePreferences}
                        disabled={savingPreferences}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        <Save size={16} />
                        {savingPreferences ? 'Saving…' : 'Save preferences'}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      These preferences are stored in this browser only. Email or push notifications are not sent by this UI.
                    </p>
                  </section>

                  <section id="security" className={`${cardClass} scroll-mt-6 p-4 sm:p-6`}>
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="min-w-0">
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
                              maxLength={field.name === 'currentPassword' ? 128 : 64}
                              spellCheck={false}
                              aria-invalid={
                                field.name === 'confirmPassword' &&
                                passwordForm.confirmPassword.length > 0 &&
                                !passwordsMatch
                              }
                              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-12 text-base outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                              placeholder={field.placeholder}
                              aria-label={field.label}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(field.name)}
                              aria-label={`${showPasswords[field.name] ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`}
                              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              {showPasswords[field.name] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </span>
                          {field.name === 'newPassword' && passwordForm.newPassword && (
                            <span className="mt-3 block rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60" aria-live="polite">
                              <span className="mb-2 flex items-center justify-between gap-2 text-xs">
                                <span className="font-medium text-slate-600 dark:text-slate-300">Password strength</span>
                                <span className={`font-semibold ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 4 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 4 ? 'Almost there' : 'Strong'}
                                </span>
                              </span>
                              <span className="mb-3 grid grid-cols-5 gap-1" aria-hidden="true">
                                {[1, 2, 3, 4, 5].map((segment) => (
                                  <span
                                    key={segment}
                                    className={`h-1.5 rounded-full ${
                                      passwordStrength >= segment
                                        ? (passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 4 ? 'bg-amber-500' : 'bg-emerald-500')
                                        : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                                  />
                                ))}
                              </span>
                              <span className="grid gap-2 sm:grid-cols-2">
                                {newPasswordChecks.map((check) => (
                                  <span
                                    key={check.label}
                                    className={`flex items-center gap-2 text-xs ${
                                      check.passed
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}
                                  >
                                    {check.passed ? <Check size={14} className="shrink-0" /> : <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-current" />}
                                    {check.label}
                                  </span>
                                ))}
                              </span>
                            </span>
                          )}
                          {field.name === 'confirmPassword' && passwordForm.confirmPassword && (
                            <span className={`mt-2 block text-xs ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`} role="status">
                              {passwordsMatch ? 'Passwords match.' : 'Passwords do not match.'}
                            </span>
                          )}
                        </label>
                      ))}



                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                          You'll need your new password the next time you sign in.
                        </p>
                        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:shrink-0">
                          <button
                            type="button"
                            onClick={resetPasswordForm}
                            disabled={changingPassword || (!passwordForm.currentPassword && !passwordForm.newPassword && !passwordForm.confirmPassword)}
                            className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Clear
                          </button>
                          <button
                            type="submit"
                            disabled={
                              changingPassword ||
                              !passwordForm.currentPassword ||
                              !isNewPasswordStrong ||
                              !passwordsMatch ||
                              passwordForm.currentPassword === passwordForm.newPassword
                            }
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
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

                
<section className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-6 dark:border-red-900/50 dark:bg-slate-900">
  <div className="flex items-start gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
      <Trash2 size={20} />
    </div>

    <div className="min-w-0 flex-1">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        Danger zone
      </h2>

      <p className={descriptionClass}>
        Deleting your account is permanent. Your account and associated files
        will be deleted, and this action cannot be undone.
      </p>
    </div>
  </div>

  <div className="mt-5 flex flex-col gap-3 border-t border-red-100 pt-5 dark:border-red-900/40 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        Delete account
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Permanently delete your account and associated files.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setShowDeleteConfirmation(true)}
      disabled={deletingAccount}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      <Trash2 size={16} />
      Delete account
    </button>
  </div>
</section>



                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                    <CircleHelp size={18} className="mt-0.5 shrink-0" />
                    <p>
                      Notification preferences are stored on this device. Account and file actions are handled securely by your SkySync account services.
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
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingAccount) {
              setShowDeleteConfirmation(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="my-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <Trash2 size={21} />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={deletingAccount}
                className="flex h-10 w-10 items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                aria-label="Close confirmation"
              >
                <X size={18} />
              </button>
            </div>
            <h3 id="delete-account-title" className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This will permanently delete your SkySync account and associated files. You will be signed out, and this action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={deletingAccount}
                className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAccount ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
