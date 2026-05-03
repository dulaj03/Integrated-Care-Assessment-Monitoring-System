import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './app-router';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import { SplashScreen } from './components/SplashScreen';

// Show splash once per browser session
const SPLASH_KEY = 'icams_splash_shown';
const hasSeenSplash = sessionStorage.getItem(SPLASH_KEY) === 'true';

function App() {
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_KEY, 'true');
    setShowSplash(false);
  };

  return (
    <ThemeProvider>
      <Toaster position="top-right" richColors />
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <RouterProvider router={router} />
      )}
    </ThemeProvider>
  );
}

export default App;
