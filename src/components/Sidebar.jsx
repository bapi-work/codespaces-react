import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout, darkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', roles: ['admin', 'manager', 'employee'] },
    { id: 'assets', label: 'Assets', icon: '🏷️', href: '/assets', roles: ['admin', 'manager', 'employee'] },
    { id: 'employees', label: 'Employees', icon: '👥', href: '/employees', roles: ['admin', 'manager'] },
    { id: 'assignments', label: 'Assignments', icon: '📤', href: '/assignments', roles: ['admin', 'manager', 'employee'] },
    { id: 'audit', label: 'Audit Trail', icon: '📋', href: '/audit', roles: ['admin', 'manager'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings', roles: ['admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role));

  const isActive = (href) => location.pathname === href;

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} ${
      darkMode ? 'bg-secondary-900 border-secondary-800' : 'bg-white border-secondary-200'
    } border-r transition-all duration-300 flex flex-col h-screen`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        darkMode ? 'border-secondary-800' : 'border-secondary-200'
      } flex items-center justify-between`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              📦
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Asset Mgmt
            </h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'hover:bg-secondary-800 text-secondary-400' 
              : 'hover:bg-secondary-100 text-secondary-600'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                active
                  ? darkMode
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : darkMode
                    ? 'text-secondary-300 hover:bg-secondary-800'
                    : 'text-secondary-700 hover:bg-secondary-100'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`text-xl transition-transform duration-200 ${
                active ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {!isCollapsed && active && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t ${
        darkMode ? 'border-secondary-800' : 'border-secondary-200'
      } space-y-2`}>
        {/* User info when expanded */}
        {!isCollapsed && (
          <div className={`px-3 py-3 rounded-lg mb-3 ${
            darkMode ? 'bg-secondary-800' : 'bg-secondary-100'
          }`}>
            <p className={`text-xs font-semibold ${
              darkMode ? 'text-secondary-300' : 'text-secondary-600'
            } uppercase tracking-wide`}>
              Logged in as
            </p>
            <p className={`text-sm font-medium mt-1 ${
              darkMode ? 'text-white' : 'text-secondary-900'
            }`}>
              {user?.firstName || user?.username}
            </p>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={onLogout}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            darkMode
              ? 'bg-red-900 hover:bg-red-800 text-red-100 hover:shadow-lg'
              : 'bg-red-50 hover:bg-red-100 text-red-700 hover:shadow-md'
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span>🚪</span>
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
