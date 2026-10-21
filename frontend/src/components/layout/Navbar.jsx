import {
  Bell,
  Menu,
  Search,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

function Navbar({ onMenuClick, searchValue, onSearchChange }) {
  const { user } = useAuth()

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
      <div className="flex w-full items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="relative max-w-xl flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchValue}
            onChange={(event) =>
              onSearchChange?.(event.target.value)
            }
            placeholder="Search your files..."
            className="
              h-11 w-full rounded-xl
              border border-slate-200
              bg-slate-50
              pl-10 pr-4
              text-sm text-slate-900
              outline-none
              transition-all duration-200
              placeholder:text-slate-400
              focus:border-sky-400
              focus:bg-white
              focus:ring-4
              focus:ring-sky-500/10
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

        {/* Right */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Notification */}
          <button
            type="button"
            className="
              relative flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-500
              transition-all duration-200
              hover:bg-slate-50
              hover:text-slate-900
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
            aria-label="Notifications"
          >
            <Bell size={18} />

            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
          </button>

          {/* User */}
          <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-md shadow-sky-500/20">
              {userInitial}
            </div>

            <div className="hidden min-w-0 xl:block">
              <p className="max-w-[130px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </p>

              <p className="max-w-[150px] truncate text-xs text-slate-500 dark:text-slate-500">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar