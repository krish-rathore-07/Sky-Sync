import { useEffect, useState } from 'react'

import {
  Files,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Settings,
  Upload,
  X,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../common/ThemeToggle'
import skySyncLogo from '../../assets/logo/skysync-logo.png'

function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()

  const [isDesktop, setIsDesktop] = useState(false)

  const userName = user?.name || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  // -----------------------------------------
  // Navigation Items
  // -----------------------------------------

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'My Files',
      path: '/dashboard/files',
      icon: Files,
    },
    {
      label: 'Shared Files',
      path: '/dashboard/shared',
      icon: LinkIcon,
    },
  ]

  const secondaryItems = [
    {
      label: 'Settings',
      path: '/dashboard/settings',
      icon: Settings,
    },
  ]

  // -----------------------------------------
  // Responsive Screen Detection
  // -----------------------------------------

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const handleResize = () => {
      setIsDesktop(mediaQuery.matches)
    }

    handleResize()

    mediaQuery.addEventListener('change', handleResize)

    return () => {
      mediaQuery.removeEventListener('change', handleResize)
    }
  }, [])

  // -----------------------------------------
  // Mobile Drawer Behavior
  // -----------------------------------------

  useEffect(() => {
    if (!mobileOpen || isDesktop) return

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [mobileOpen, isDesktop, onClose])

  // -----------------------------------------
  // Logout
  // -----------------------------------------

  const handleLogout = () => {
    onClose?.()

    toast.success('You have been logged out successfully.')

    logout()
  }

  // -----------------------------------------
  // Navigation Link Styling
  // -----------------------------------------

  const navLinkClass = ({ isActive }) => `
    group flex min-h-11 items-center gap-3
    rounded-xl px-3 py-2.5
    text-sm font-medium
    transition-all duration-200

    ${
      isActive
        ? `
          bg-sky-500/10
          text-sky-600
          dark:bg-sky-500/10
          dark:text-sky-400
        `
        : `
          text-slate-600
          hover:bg-slate-100
          hover:text-slate-900
          dark:text-slate-400
          dark:hover:bg-slate-800
          dark:hover:text-white
        `
    }
  `

  // -----------------------------------------
  // Navigation Renderer
  // -----------------------------------------

  const renderNavigation = (items) =>
    items.map((item) => {
      const Icon = item.icon

      return (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/dashboard'}
          onClick={onClose}
          className={navLinkClass}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={19}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="shrink-0"
              />

              <span className="min-w-0 truncate">
                {item.label}
              </span>

              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              )}
            </>
          )}
        </NavLink>
      )
    })

  return (
    <>
      {/* =====================================
          MOBILE BACKDROP
      ====================================== */}

      <button
        type="button"
        tabIndex={-1}
        disabled={!mobileOpen}
        onClick={onClose}
        aria-label="Close navigation menu"
        className={`
          fixed inset-0 z-40
          bg-slate-950/50
          backdrop-blur-sm
          transition-opacity duration-300
          lg:hidden

          ${
            mobileOpen
              ? 'pointer-events-auto visible opacity-100'
              : 'pointer-events-none invisible opacity-0'
          }
        `}
      />

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        aria-hidden={!isDesktop && !mobileOpen}
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[280px] max-w-[88vw]
          flex-col

          border-r border-slate-200
          bg-white

          transition-[transform,visibility] duration-300 ease-in-out

          dark:border-slate-800
          dark:bg-slate-900

          ${
            mobileOpen
              ? 'visible translate-x-0'
              : 'invisible -translate-x-full'
          }

          lg:visible
          lg:sticky
          lg:top-0
          lg:z-20
          lg:h-screen
          lg:w-[270px]
          lg:max-w-none
          lg:shrink-0
          lg:translate-x-0
          lg:transition-none
        `}
      >
        {/* =====================================
            LOGO HEADER
        ====================================== */}

        <div
          className="
            flex h-16 shrink-0
            items-center justify-between
            border-b border-slate-200
            px-5
            dark:border-slate-800
            sm:h-[72px]
          "
        >
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="group flex min-w-0 items-center"
            aria-label="SkySync Dashboard"
          >
            <img
              src={skySyncLogo}
              alt="SkySync"
              className="
                h-9 max-w-full w-auto
                object-contain
                transition-transform duration-300
                group-hover:scale-[1.02]
              "
            />
          </NavLink>

          {/* Close Button */}

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* =====================================
            NAVIGATION
        ====================================== */}

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-4 sm:py-6">

          {/* Workspace */}

          <div>
            <p
              className="
                mb-3 px-3
                text-[11px] font-semibold
                uppercase tracking-wider
                text-slate-400
                dark:text-slate-600
              "
            >
              Workspace
            </p>

            <nav
              className="space-y-1"
              aria-label="Workspace navigation"
            >
              {renderNavigation(navigationItems)}
            </nav>
          </div>

          {/* Preferences */}

          <div className="mt-8">
            <p
              className="
                mb-3 px-3
                text-[11px] font-semibold
                uppercase tracking-wider
                text-slate-400
                dark:text-slate-600
              "
            >
              Preferences
            </p>

            <nav
              className="space-y-1"
              aria-label="Preferences navigation"
            >
              {renderNavigation(secondaryItems)}
            </nav>
          </div>

          {/* =====================================
              UPLOAD INFORMATION CARD
          ====================================== */}

          <div
            className="
              mt-8 rounded-2xl
              border border-sky-100
              bg-sky-50
              p-4
              dark:border-sky-900/40
              dark:bg-sky-950/20
            "
          >
            <div
              className="
                mb-3 flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-sky-500
                text-white
                shadow-lg shadow-sky-500/20
              "
            >
              <Upload size={18} />
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Keep your files safe
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Upload, manage and securely share your files with SkySync.
            </p>
          </div>
        </div>

        {/* =====================================
            BOTTOM USER SECTION
        ====================================== */}

        <div
          className="
            shrink-0
            border-t border-slate-200
            p-3 sm:p-4
            dark:border-slate-800
          "
        >
          {/* User Profile */}

          <div
            className="
              mb-3 flex min-w-0
              items-center gap-3
              rounded-xl p-2
            "
          >
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-gradient-to-br from-sky-400 to-blue-600
                text-sm font-bold text-white
                shadow-md shadow-sky-500/20
              "
            >
              {userInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {userName}
              </p>

              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          {/* Theme and Logout */}

          <div className="flex min-w-0 items-center gap-2">
            <div className="shrink-0">
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex h-11 min-w-0 flex-1
                items-center justify-center
                gap-2 rounded-xl
                border border-slate-200
                bg-white
                px-3
                text-sm font-medium
                text-slate-600
                transition-all duration-200

                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600

                active:scale-[0.98]

                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-400

                dark:hover:border-red-900/50
                dark:hover:bg-red-950/20
                dark:hover:text-red-400
              "
            >
              <LogOut size={17} className="shrink-0" />

              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar