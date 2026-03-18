import { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { Toaster } from 'sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    const auth = localStorage.getItem('admin_auth');
    return auth === 'true';
  });

  useEffect(() => {
    // Initial check is now in useState initializer
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) return null; // Prevent flicker

  return (
    <>
      <Toaster position="top-right" expand={true} richColors />
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;
