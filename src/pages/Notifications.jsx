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
};

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications: notifs,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
  } = useCampusData();
  const [filter, setFilter] = useState('All');

  const filterOptions = ['All', 'Unread', 'Events', 'Campus Alerts', 'Lost & Found'];

  const filteredNotifs = useMemo(() => {
    return notifs.filter((n) => {
      if (filter === 'Unread') return !n.read;
      if (filter === 'Events') return n.type === 'event';
      if (filter === 'Campus Alerts') return n.type === 'campus';
      if (filter === 'Lost & Found') return n.type === 'lost_found';
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
    const d = new Date(ts);
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              Stay on top of campus announcements, event reminders, and lost & found matches.
            </p>
          </div>

          <div className="notif-header-actions">
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={markAllAsRead}
              disabled={notifs.every((n) => n.read)}
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
          {filteredNotifs.length === 0 ? (
            <div className="notif-empty-card">
              <Bell size={40} className="empty-notif-icon" />
              <h3 className="text-headline-sm">No notifications</h3>
              <p className="text-body-md text-secondary">
                You're all caught up! New campus updates will appear here.
              </p>
            </div>
          ) : (
            filteredNotifs.map((item) => {
              const IconComponent = iconMap[item.icon] || Bell;
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
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    <p className="notif-card-message">{item.message}</p>

                    <div className="notif-footer-row">
                      <Badge variant="category">{item.type.replace('_', ' ')}</Badge>
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
