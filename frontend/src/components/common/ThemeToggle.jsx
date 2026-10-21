import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
        relative flex h-10 w-10 items-center justify-center
        rounded-xl
        border border-slate-200
        bg-white
        text-slate-700
        shadow-sm
        transition-all duration-300
        hover:scale-105
        hover:bg-slate-100
        dark:border-slate-800
        dark:bg-slate-900
        dark:text-slate-200
        dark:hover:bg-slate-800
      "
    >
      {theme === 'dark' ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </button>
  )
}

export default ThemeToggle