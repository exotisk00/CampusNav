import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Navigation,
  MapPin,
  Compass,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useCampusData } from '../context/CampusDataContext';
import FilterChips from '../components/ui/FilterChips';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './Notifications.css';

const iconMap = {
  Calendar,
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Navigation,
  MapPin,
  Compass,
  Bell,
  Info,
};

// Fallback icon selector based on notification type
function getDefaultIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('event')) return Calendar;
  if (t.includes('lost') || t.includes('found')) return Search;
  if (t.includes('nav') || t.includes('map')) return Navigation;
  if (t.includes('announce') || t.includes('campus') || t.includes('alert')) return AlertTriangle;
  return Bell;
}

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications: notifs,
    notificationsLoading,
    notificationsError,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
  } = useCampusData();

  const [filter, setFilter] = useState('All');

  const filterOptions = [
    'All',
    'Unread',
    'Events',
    'Lost & Found',
    'Announcements',
    'Navigation',
    'System',
  ];

  const filteredNotifs = useMemo(() => {
    return notifs.filter((n) => {
      const typeNorm = (n.type || '').toLowerCase().replace(/[^a-z]/g, '');
      if (filter === 'Unread') return !n.read;
      if (filter === 'Events') return typeNorm.includes('event');
      if (filter === 'Lost & Found') return typeNorm.includes('lost') || typeNorm.includes('found');
      if (filter === 'Announcements') return typeNorm.includes('announce') || typeNorm.includes('campus') || typeNorm.includes('alert');
      if (filter === 'Navigation') return typeNorm.includes('nav') || typeNorm.includes('map');
      if (filter === 'System') return typeNorm.includes('system');
      return true;
    });
  }, [notifs, filter]);

  const markAllAsRead = () => {
    markAllNotificationsRead();
  };

  const clearAll = () => {
    clearNotifications();
  };

  const markAsRead = (id) => {
    markNotificationRead(id);
  };

  const deleteNotif = (id, e) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const formatTime = (ts) => {
    if (!ts) return 'Recent';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTypeBadge = (type) => {
    if (!type) return 'System';
    if (type === 'lost_found') return 'Lost & Found';
    if (type === 'campus') return 'Announcement';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="page-content notifications-page">
      <div className="container notifications-container">
        {/* Header */}
        <div className="notif-page-header">
          <div>
            <div className="notif-header-tag">
              <Bell size={16} />
              <span>Campus Alerts & Updates</span>
            </div>
            <h1 className="text-display-lg notif-title">Notifications</h1>
            <p className="notif-subtitle">
              Stay on top of campus announcements, event reminders, lost & found matches, and navigation alerts.
            </p>
          </div>

          <div className="notif-header-actions">
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={markAllAsRead}
              disabled={notifs.length === 0 || notifs.every((n) => n.read)}
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={clearAll}
              disabled={notifs.length === 0}
            >
              Clear all
            </Button>
          </div>
        </div>

        {/* Error State Banner */}
        {notificationsError && (
          <div className="notif-error-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>Unable to sync with Firestore live: {notificationsError}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="notif-filters-card">
          <FilterChips
            options={filterOptions}
            selected={filter}
            onChange={setFilter}
          />
        </div>

        {/* Notifications List */}
        <div className="notif-list">
          {notificationsLoading && notifs.length === 0 ? (
            // Loading Skeletons
            [1, 2, 3].map((idx) => (
              <div key={`skel_${idx}`} className="notif-loading-card">
                <div className="notif-skeleton-icon" />
                <div className="notif-skeleton-content">
                  <div className="notif-skeleton-line" style={{ width: '40%' }} />
                  <div className="notif-skeleton-line" style={{ width: '85%' }} />
                  <div className="notif-skeleton-line" style={{ width: '25%' }} />
                </div>
              </div>
            ))
          ) : filteredNotifs.length === 0 ? (
            <div className="notif-empty-card">
              <Bell size={40} className="empty-notif-icon" />
              <h3 className="text-headline-sm">No notifications</h3>
              <p className="text-body-md text-secondary">
                {filter === 'All'
                  ? "You're all caught up! New campus updates will appear here in real time."
                  : `No ${filter.toLowerCase()} notifications found.`}
              </p>
            </div>
          ) : (
            filteredNotifs.map((item) => {
              const IconComponent = iconMap[item.icon] || getDefaultIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={`notif-card ${!item.read ? 'unread' : ''}`}
                  onClick={() => {
                    markAsRead(item.id);
                    if (item.actionUrl) navigate(item.actionUrl);
                  }}
                >
                  <div className="notif-icon-col">
                    <div className="notif-type-icon">
                      <IconComponent size={20} />
                    </div>
                  </div>

                  <div className="notif-body-col">
                    <div className="notif-title-row">
                      <h4 className="notif-card-title">{item.title}</h4>
                      <span className="notif-time-text">
                        <Clock size={12} />
                        {formatTime(item.timestamp || item.createdAt)}
                      </span>
                    </div>

                    <p className="notif-card-message">{item.message}</p>

                    <div className="notif-footer-row">
                      <Badge variant="category">{formatTypeBadge(item.type)}</Badge>
                      {item.actionUrl && (
                        <span className="notif-action-link">
                          View details <ArrowRight size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notif-actions-col">
                    {!item.read && <span className="notif-unread-dot" />}
                    <button
                      className="notif-delete-btn"
                      onClick={(e) => deleteNotif(item.id, e)}
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
