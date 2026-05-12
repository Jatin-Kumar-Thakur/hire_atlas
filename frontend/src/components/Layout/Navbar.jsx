import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Build initials from first + last name word, max 2 chars
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left — hamburger (mobile only) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800 lg:hidden">HireAtlas</span>
      </div>

      {/* Right — notifications + user chip + logout */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
            {initials}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate max-w-[180px]">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
