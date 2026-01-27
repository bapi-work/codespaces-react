import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import pages and components
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Employees from './pages/Employees';
import Assignments from './pages/Assignments';
import Settings from './pages/Settings';
import AuditTrail from './pages/AuditTrail';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    setDarkMode(savedDarkMode);

    if (token) {
      // Verify token and fetch user
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios
        .get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
          fetchSettings();
        })
        .catch((err) => {
          localStorage.removeItem('token');
          console.error('Token verification failed:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setSettings(res.data);
      if (res.data.enableDarkMode) {
        setDarkMode(true);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchSettings();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const appClass = darkMode ? 'dark' : '';

  return (
    <div className={appClass}>
      <BrowserRouter>
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/setup" element={<Setup onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar user={user} onLogout={handleLogout} darkMode={darkMode} />
            <div className="flex-1 flex flex-col">
              <Header 
                user={user} 
                onLogout={handleLogout}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                settings={settings}
              />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard settings={settings} /></ProtectedRoute>} />
                  <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
                  <Route path="/assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
                  <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                  <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute roles={['admin']}><Settings settings={settings} onSettingsUpdate={setSettings} /></ProtectedRoute>} />
                  <Route path="/audit" element={<ProtectedRoute roles={['admin', 'manager']}><AuditTrail /></ProtectedRoute>} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
            </div>
          </div>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
