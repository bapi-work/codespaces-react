import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ user, onLogout, darkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', roles: ['admin', 'manager', 'employee'] },
    { id: 'assets', label: 'Assets', icon: '🏷️', href: '/assets', roles: ['admin', 'manager', 'employee'] },
    { id: 'employees', label: 'Employees', icon: '👥', href: '/employees', roles: ['admin', 'manager'] },
    { id: 'assignments', label: 'Assignments', icon: '📤', href: '/assignments', roles: ['admin', 'manager', 'employee'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings', roles: ['admin'] },
    { id: 'audit', label: 'Audit Trail', icon: '📋', href: '/audit', roles: ['admin', 'manager'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-blue-600">Asset Mgmt</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {visibleItems.map(item => (
          <Link
            key={item.id}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={onLogout}
          className={`w-${isCollapsed ? '12' : 'full'} py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition`}
        >
          {isCollapsed ? '🚪' : 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
