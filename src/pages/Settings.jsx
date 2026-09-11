import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Bell,
  Compass,
  LogOut,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import Button from '../components/ui/Button';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { settings, updateSettings } = useCampusData();

  const [notifications, setNotifications] = useState(settings.notifications);
  const [eventReminders, setEventReminders] = useState(settings.eventReminders);
  const [lostFoundAlerts, setLostFoundAlerts] = useState(settings.lostFoundAlerts);
  const [emailDigest, setEmailDigest] = useState(settings.emailDigest);
  const [highContrastMap, setHighContrastMap] = useState(settings.highContrastMap);
  const [autoCenterMap, setAutoCenterMap] = useState(settings.autoCenterMap);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({
      notifications,
      eventReminders,
      lostFoundAlerts,
      emailDigest,
      highContrastMap,
      autoCenterMap,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearCache = () => {
    if (window.confirm('Clear cached campus routes and mock state?')) {
      localStorage.removeItem('campusnav_lost_found');
      localStorage.removeItem('campusnav_rsvp');
      localStorage.removeItem('campusnav_notifications');
      alert('Local campus cache cleared successfully. Reload the page to restore demo seed data.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="page-content settings-page">
      <div className="container settings-container">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-tag">
            <SettingsIcon size={16} />
            <span>Preferences & Privacy</span>
          </div>
          <h1 className="text-display-lg settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage your notifications, map display preferences, and campus account security.
          </p>
        </div>

        {saved && (
          <div className="settings-saved-banner">
            <CheckCircle2 size={18} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="settings-sections">
          {/* Notifications Section */}
          <div className="settings-card">
            <div className="settings-card-header">
              <Bell size={20} className="section-icon text-primary" />
              <div>
                <h2 className="text-headline-sm">Notification Preferences</h2>
                <p className="text-body-sm text-secondary">
                  Configure how and when you receive campus alerts.
                </p>
              </div>
            </div>

            <div className="settings-items-list">
              <label className="toggle-row">
                <div className="toggle-text">
                  <span className="toggle-label">Push Notifications</span>
                  <span className="toggle-sub">Receive instant alerts on your device</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <span className="toggle-label">Event Reminders</span>
                  <span className="toggle-sub">Get notified 24 hours before registered fests</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={eventReminders}
                  onChange={(e) => setEventReminders(e.target.checked)}
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <span className="toggle-label">Lost & Found Matches</span>
                  <span className="toggle-sub">Alert when someone reports an item matching your post</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={lostFoundAlerts}
                  onChange={(e) => setLostFoundAlerts(e.target.checked)}
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <span className="toggle-label">Weekly Campus Digest</span>
                  <span className="toggle-sub">Summary of upcoming workshops and campus news</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Map Display Preferences */}
          <div className="settings-card">
            <div className="settings-card-header">
              <Compass size={20} className="section-icon text-secondary" />
              <div>
                <h2 className="text-headline-sm">Map & Wayfinding</h2>
                <p className="text-body-sm text-secondary">
                  Customize the interactive 2D campus vector map.
                </p>
              </div>
            </div>

            <div className="settings-items-list">
              <label className="toggle-row">
                <div className="toggle-text">
                  <span className="toggle-label">High-Contrast Route Lines</span>
                  <span className="toggle-sub">Enhances visibility of walking paths in bright daylight</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={highContrastMap}
                  onChange={(e) => setHighContrastMap(e.target.checked)}
                />
              </label>

              <label className="toggle-row">
                <div className="toggle-text">
                  <span className="toggle-label">Auto-Center Map on Selection</span>
                  <span className="toggle-sub">Pans canvas when selecting a building from the directory</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle-switch"
                  checked={autoCenterMap}
                  onChange={(e) => setAutoCenterMap(e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Account Actions & Danger Zone */}
          <div className="settings-card danger-zone-card">
            <div className="settings-card-header">
              <Shield size={20} className="section-icon text-error" />
              <div>
                <h2 className="text-headline-sm">Account & Privacy</h2>
                <p className="text-body-sm text-secondary">
                  Manage local sessions and student data.
                </p>
              </div>
            </div>

            <div className="danger-actions-list">
              <div className="danger-action-row">
                <div>
                  <span className="danger-label">Clear Local Cache</span>
                  <p className="danger-sub">Reset cached route calculations and offline storage</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearCache}>
                  Clear Cache
                </Button>
              </div>

              <div className="danger-action-row">
                <div>
                  <span className="danger-label">Sign Out of CampusNav</span>
                  <p className="danger-sub">You can sign back in anytime with your university credentials</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-footer-actions">
            <Button variant="primary" size="lg" onClick={handleSave}>
              Save All Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
