import {
  Bell,
  Menu,
  Search,
  X,
} from 'lucide-react'

import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

function Navbar({
  onMenuClick,
  searchValue = '',
  onSearchChange,
}) {
  const { user } = useAuth()

  const userName = user?.name?.trim() || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  // Clear search
  const handleClearSearch = () => {
    onSearchChange?.('')
  }

  // Notification placeholder
  const handleNotifications = () => {
    toast('Notifications are coming soon!', {
      icon: '🔔',
      duration: 3000,
    })
  }

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-16 sm:h-[72px]
        items-center
        border-b border-slate-200
        bg-white/90
        px-3 sm:px-5 lg:px-8
        backdrop-blur-xl
        transition-colors duration-300
        dark:border-slate-800
        dark:bg-slate-900/90
      "
    >
      <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">

        {/* Mobile / Tablet Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            text-slate-600
            transition-all duration-200
            hover:bg-slate-100
            hover:text-slate-900
            active:scale-95
            dark:text-slate-400
            dark:hover:bg-slate-800
            dark:hover:text-white
            lg:hidden
          "
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="relative min-w-0 max-w-2xl flex-1">

          <Search
            size={18}
            className="
              pointer-events-none
              absolute left-3.5 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="search"
            value={searchValue}
            onChange={(event) =>
              onSearchChange?.(event.target.value)
            }
            placeholder="Search files..."
            aria-label="Search your files"
            className="
              h-10 sm:h-11 w-full min-w-0
              rounded-xl
              border border-slate-200
              bg-slate-50
              pl-10 pr-10
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

          {/* Clear Search */}
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="
                absolute right-2 top-1/2
                flex h-8 w-8
                -translate-y-1/2
                items-center justify-center
                rounded-lg
                text-slate-400
                transition
                hover:bg-slate-200
                hover:text-slate-700
                dark:hover:bg-slate-800
                dark:hover:text-white
              "
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Notifications */}
          <button
            type="button"
            onClick={handleNotifications}
            className="
              relative flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-500
              transition-all duration-200
              hover:bg-slate-50
              hover:text-slate-900
              active:scale-95
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />

            <span
              className="
                absolute right-2.5 top-2
                h-1.5 w-1.5
                rounded-full bg-sky-500
              "
            />
          </button>

          {/* User Profile */}
          <div
            className="
              flex shrink-0 items-center
              gap-2 sm:gap-3
              border-l border-slate-200
              pl-2 sm:pl-3
              dark:border-slate-800
            "
          >
            {/* Avatar */}
            <div
              className="
                flex h-9 w-9 sm:h-10 sm:w-10
                shrink-0 items-center justify-center
                rounded-xl
                bg-gradient-to-br from-sky-400 to-blue-600
                text-sm font-bold text-white
                shadow-md shadow-sky-500/20
              "
              title={userName}
              aria-label={`Logged in as ${userName}`}
            >
              {userInitial}
            </div>

            {/* User Details - Larger Screens */}
            <div className="hidden min-w-0 xl:block">

              <p
                className="
                  max-w-[130px] truncate
                  text-sm font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                {userName}
              </p>

              <p
                className="
                  max-w-[150px] truncate
                  text-xs text-slate-500
                  dark:text-slate-400
                "
              >
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