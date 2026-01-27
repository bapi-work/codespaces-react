import React from 'react';

const Header = ({ user, onLogout, darkMode, onToggleDarkMode, settings }) => {
  return (
    <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {settings?.companyLogo && (
          <img src={settings.companyLogo} alt="Company Logo" className="h-8" />
        )}
        <div>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {settings?.companyName || 'Asset Management System'}
          </h2>
          {settings?.headerText && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{settings.headerText}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
          title="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className={`text-right`}>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.firstName || user?.username}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.role}</p>
        </div>

        <img
          src={`https://ui-avatars.com/api/?name=${user?.firstName || user?.username}&background=random`}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </header>
  );
};

export default Header;
