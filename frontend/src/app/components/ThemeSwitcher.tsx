import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg
        bg-slate-100 dark:bg-slate-800
        text-slate-600 dark:text-slate-300
        hover:bg-slate-200 dark:hover:bg-slate-700
        focus:outline-none focus:ring-2 focus:ring-offset-2
        dark:focus:ring-offset-slate-950
        focus:ring-blue-500 dark:focus:ring-blue-400
        transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
