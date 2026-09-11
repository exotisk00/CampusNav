import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Map,
  Package,
  CalendarDays,
  MessageCircle,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCampusData } from '../../context/CampusDataContext';
import Avatar from '../ui/Avatar';
import './Navbar.css';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/lost-found', label: 'Lost & Found', icon: Package },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/assistant', label: 'Assistant', icon: MessageCircle },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const { notifications } = useCampusData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show navbar on landing, login, signup
  const hideNavbar = ['/', '/login', '/signup'].includes(location.pathname);
  if (hideNavbar) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-logo">
            <MapPin size={22} />
          </div>
          <span className="navbar-brand-text">CampusNav</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${
                location.pathname === link.to ||
                (link.to !== '/dashboard' && location.pathname.startsWith(`${link.to}/`))
                  ? 'navbar-link-active'
                  : ''
              }`}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button
            className="navbar-icon-btn"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="navbar-badge">{unreadCount}</span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="navbar-profile" ref={profileRef}>
            <button
              className="navbar-profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Profile menu"
            >
              <Avatar
                src={user?.avatar}
                name={user?.name || 'User'}
                size={32}
              />
            </button>

            {profileOpen && (
              <div className="navbar-dropdown">
                <div className="navbar-dropdown-header">
                  <p className="text-title-md">{user?.name}</p>
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {user?.email}
                  </p>
                </div>
                <div className="navbar-dropdown-divider" />
                <Link to="/profile" className="navbar-dropdown-item">
                  <User size={16} />
                  Profile
                </Link>
                <Link to="/settings" className="navbar-dropdown-item">
                  <Settings size={16} />
                  Settings
                </Link>
                <Link to="/language" className="navbar-dropdown-item">
                  <Globe size={16} />
                  Language
                </Link>
                <div className="navbar-dropdown-divider" />
                <button className="navbar-dropdown-item navbar-dropdown-danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-mobile-link ${
                location.pathname === link.to ||
                (link.to !== '/dashboard' && location.pathname.startsWith(`${link.to}/`))
                  ? 'navbar-mobile-link-active'
                  : ''
              }`}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </Link>
          ))}
          <div className="navbar-dropdown-divider" />
          <Link to="/profile" className="navbar-mobile-link">
            <User size={20} />
            Profile
          </Link>
          <Link to="/settings" className="navbar-mobile-link">
            <Settings size={20} />
            Settings
          </Link>
          <Link to="/language" className="navbar-mobile-link">
            <Globe size={20} />
            Language
          </Link>
          <div className="navbar-dropdown-divider" />
          <button className="navbar-mobile-link navbar-dropdown-danger" onClick={handleLogout}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
