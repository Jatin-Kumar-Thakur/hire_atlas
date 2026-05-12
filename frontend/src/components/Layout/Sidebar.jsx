import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Columns,
  BarChart2,
  Settings,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Briefcase,        label: 'Applications' },
  { to: '/kanban',       icon: Columns,          label: 'Kanban Board' },
  { to: '/analytics',    icon: BarChart2,         label: 'Analytics' },
  { to: '/settings',     icon: Settings,          label: 'Settings' },
];

const Sidebar = ({ isOpen, onClose }) => (
  <>
    {/* Mobile backdrop */}
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-20 lg:hidden"
        onClick={onClose}
      />
    )}

    <aside
      className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
      `}
    >
      {/* Logo row */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">HireAtlas</span>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Version tag */}
      <div className="px-6 py-4 border-t border-gray-100 shrink-0">
        <span className="text-xs text-gray-300">HireAtlas v1.0</span>
      </div>
    </aside>
  </>
);

export default Sidebar;
