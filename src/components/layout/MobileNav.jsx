import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Package, CalendarDays, User } from 'lucide-react';
import './MobileNav.css';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/lost-found', label: 'Lost & Found', icon: Package },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  // Hide on landing/login/signup
  const hide = ['/', '/login', '/signup'].includes(location.pathname);
  if (hide) return null;

  return (
    <nav className="mobile-nav">
      {tabs.map((tab) => {
        const isActive =
          location.pathname === tab.to ||
          (tab.to !== '/dashboard' && location.pathname.startsWith(`${tab.to}/`));
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`mobile-nav-tab ${isActive ? 'mobile-nav-tab-active' : ''}`}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
