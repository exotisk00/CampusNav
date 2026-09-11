import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Map,
  Package,
  Calendar,
  MessageCircle,
  ArrowRight,
  Clock,
  MapPin,
  Search,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { campusLocations } from '../data/locations';
import { useCampusData } from '../context/CampusDataContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    events = [],
    lostFoundItems,
    notifications,
    isEventRegistered,
    toggleEventRsvp,
  } = useCampusData();

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/map');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const toggleRsvp = (eventId, e) => {
    e.stopPropagation();
    toggleEventRsvp(eventId);
  };

  const quickActions = [
    {
      title: 'Campus Map',
      desc: '10 locations • Real-time wayfinding',
      icon: Map,
      link: '/map',
      color: 'var(--color-primary)',
      badge: 'Interactive',
    },
    {
      title: 'Lost & Found',
      desc: `${lostFoundItems.filter((i) => i.status === 'active').length} active listings on campus`,
      icon: Package,
      link: '/lost-found',
      color: 'var(--color-secondary)',
      badge: 'Community',
    },
    {
      title: 'Campus Events',
      desc: `${events.length} upcoming events this month`,
      icon: Calendar,
      link: '/events',
      color: '#8b5cf6',
      badge: 'Fests & Workshops',
    },
    {
      title: 'AI Assistant',
      desc: 'Ask timings, rooms, or directions',
      icon: MessageCircle,
      link: '/assistant',
      color: '#0284c7',
      badge: '24/7 Support',
    },
  ];

  const recentNotifications = notifications.slice(0, 4);
  const featuredEvents = events.slice(0, 3);
  const recentLostFound = lostFoundItems.slice(0, 4);

  return (
    <div className="page-content dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <section className="dashboard-welcome">
          <div className="welcome-text-col">
            <div className="welcome-tag">
              <span className="welcome-dot" />
              <span>Campus Portal • Active Semester</span>
            </div>
            <h1 className="text-display-lg welcome-name">
              Hello, {user?.name || 'Student'}! 👋
            </h1>
            <p className="welcome-subtext">
              {user?.department || 'Engineering Student'} • {user?.year || 'Current Year'} • ID: {user?.studentId || 'CSE2024031'}
            </p>
          </div>

          <div className="welcome-quick-search" onClick={() => navigate('/map')}>
            <Search size={18} className="search-icon" />
            <span>Search buildings, labs, dining...</span>
            <kbd className="search-shortcut">⌘K</kbd>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="quick-actions-section">
          <div className="quick-actions-grid">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div
                  key={idx}
                  className="quick-action-card"
                  onClick={() => navigate(action.link)}
                >
                  <div className="action-card-header">
                    <div
                      className="action-icon-wrap"
                      style={{ backgroundColor: `${action.color}15`, color: action.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="action-pill">{action.badge}</span>
                  </div>
                  <h3 className="text-title-md action-title">{action.title}</h3>
                  <p className="text-body-sm action-desc">{action.desc}</p>
                  <div className="action-arrow">
                    <span>Open</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Two-Column Core Layout */}
        <div className="dashboard-main-grid">
          {/* Left Column: Events & Facilities */}
          <div className="dashboard-col-primary">
            {/* Upcoming Events Module */}
            <div className="dashboard-section-card">
              <div className="section-card-header">
                <div>
                  <h2 className="text-headline-sm">Upcoming Campus Events</h2>
                  <p className="text-body-sm text-secondary">
                    Hackathons, workshops & sports competitions
                  </p>
                </div>
                <Link to="/events" className="view-all-link">
                  View All ({events.length})
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="dashboard-events-list">
                {featuredEvents.map((evt) => {
                  const isRegistered = isEventRegistered(evt.id);
                  return (
                    <div
                      key={evt.id}
                      className="dashboard-event-item"
                      onClick={() => navigate(`/events/${evt.id}`)}
                    >
                      <div className="event-date-badge">
                        <span className="event-date-month">
                          {new Date(evt.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="event-date-day">
                          {new Date(evt.date).getDate()}
                        </span>
                      </div>

                      <div className="event-item-content">
                        <div className="event-item-meta">
                          <Badge variant="category">{evt.category}</Badge>
                          <span className="event-time-text">
                            <Clock size={13} />
                            {evt.time}
                          </span>
                        </div>
                        <h4 className="event-item-title">{evt.title}</h4>
                        <div className="event-location-text">
                          <MapPin size={14} className="text-muted" />
                          <span>{evt.location}</span>
                        </div>
                      </div>

                      <div className="event-item-action">
                        <Button
                          variant={isRegistered ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={(e) => toggleRsvp(evt.id, e)}
                        >
                          {isRegistered ? 'Registered ✓' : 'Register'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Campus Locations Status */}
            <div className="dashboard-section-card">
              <div className="section-card-header">
                <div>
                  <h2 className="text-headline-sm">Campus Facility Status</h2>
                  <p className="text-body-sm text-secondary">
                    Hours and operational status right now
                  </p>
                </div>
                <Link to="/map" className="view-all-link">
                  Campus Map
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="facilities-grid">
                {campusLocations.slice(0, 6).map((loc) => (
                  <div
                    key={loc.id}
                    className="facility-tile"
                    onClick={() => navigate(`/map?location=${loc.id}`)}
                  >
                    <div className="facility-tile-top">
                      <span className="facility-name">{loc.name}</span>
                      <span className={`facility-status-indicator ${loc.status === 'open' ? 'open' : ''}`}>
                        {loc.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="facility-hours">{loc.hours}</p>
                    <div className="facility-amenities-pills">
                      {loc.amenities.slice(0, 2).map((a, i) => (
                        <span key={i} className="facility-amenity-pill">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Lost & Found + Recent Alerts */}
          <div className="dashboard-col-secondary">
            {/* Lost & Found Highlights */}
            <div className="dashboard-section-card">
              <div className="section-card-header">
                <div>
                  <h2 className="text-headline-sm">Lost & Found</h2>
                  <p className="text-body-sm text-secondary">
                    Recent items reported on campus
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/lost-found/post')}
                  icon={PlusCircle}
                >
                  Report
                </Button>
              </div>

              <div className="lost-found-compact-list">
                {recentLostFound.map((item) => (
                  <div
                    key={item.id}
                    className="lost-found-compact-item"
                    onClick={() => navigate('/lost-found')}
                  >
                    <Badge variant={item.type === 'found' ? 'found' : 'lost'}>
                      {item.type}
                    </Badge>
                    <div className="compact-item-info">
                      <span className="compact-item-title">{item.title}</span>
                      <span className="compact-item-loc">
                        <MapPin size={12} />
                        {item.location} • {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-footer-action">
                <Link to="/lost-found" className="card-footer-link">
                  <span>Browse all lost & found items</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Recent Notifications Widget */}
            <div className="dashboard-section-card">
              <div className="section-card-header">
                <div>
                  <h2 className="text-headline-sm">Notifications</h2>
                  <p className="text-body-sm text-secondary">
                    Campus alerts and updates
                  </p>
                </div>
                <Link to="/notifications" className="view-all-link">
                  All
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="notifications-compact-list">
                {recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-compact-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => navigate(n.actionUrl || '/notifications')}
                  >
                    {!n.read && <span className="notif-dot" />}
                    <div className="notif-compact-content">
                      <span className="notif-compact-title">{n.title}</span>
                      <p className="notif-compact-msg">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
