import {
  Files,
  FolderOpen,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Settings,
  Upload,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../common/ThemeToggle'
import skySyncLogo from '../../assets/logo/skysync-logo.png'

function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()

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

  const handleLogout = () => {
    logout()
    onClose?.()
  }

  const navLinkClass = ({ isActive }) =>
    `
      group flex items-center gap-3 rounded-xl px-3 py-2.5
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

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-slate-950/50
          backdrop-blur-sm
          transition-opacity duration-300
          lg:hidden
          ${
            mobileOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[270px] flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-300
          dark:border-slate-800
          dark:bg-slate-900
          lg:static
          lg:z-auto
          lg:translate-x-0
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="group"
          >
            <img
              src={skySyncLogo}
              alt="SkySync"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div>
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
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
                        />

                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          <div className="mt-8">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
              Preferences
            </p>

            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={navLinkClass}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Upload shortcut */}
          <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
              <Upload size={17} />
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Keep your files safe
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Upload, manage and securely share your files.
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          {/* User */}
          <div className="mb-3 flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-md shadow-sky-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </p>

              <p className="truncate text-xs text-slate-500 dark:text-slate-500">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          {/* Theme + logout */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex h-10 flex-1 items-center justify-center gap-2
                rounded-xl
                border border-slate-200
                bg-white
                text-sm font-medium
                text-slate-600
                transition-all duration-200
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-400
                dark:hover:border-red-900/50
                dark:hover:bg-red-950/20
                dark:hover:text-red-400
              "
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar