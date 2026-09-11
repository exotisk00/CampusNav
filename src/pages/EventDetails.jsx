import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Navigation,
  Check,
} from 'lucide-react';
import { useCampusData } from '../context/CampusDataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { events = [], isEventRegistered, toggleEventRsvp } = useCampusData();
  const event = events.find((e) => e.id === id);
  const [copied, setCopied] = useState(false);

  if (!event) {
    return (
      <div className="page-content event-details-page">
        <div className="container event-details-container">
          <button className="details-back-btn" onClick={() => navigate('/events')}>
            <ArrowLeft size={16} />
            <span>Back to All Events</span>
          </button>
          <div className="details-hero-card">
            <h1 className="text-headline-lg">Event not found</h1>
            <p className="text-body-md text-secondary" style={{ marginTop: '8px' }}>
              This event may have been removed or the link is incorrect.
            </p>
            <div style={{ marginTop: '20px' }}>
              <Button variant="primary" onClick={() => navigate('/events')}>
                Browse Campus Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isRegistered = isEventRegistered(event.id);
  const relatedEvents = events.filter((e) => e.id !== event.id).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content event-details-page">
      <div className="container event-details-container">
        {/* Back Link */}
        <button className="details-back-btn" onClick={() => navigate('/events')}>
          <ArrowLeft size={16} />
          <span>Back to All Events</span>
        </button>

        {/* Hero Card */}
        <div className="details-hero-card">
          <div className="details-hero-header">
            <div className="details-badge-group">
              <Badge variant="category">{event.category}</Badge>
              <Badge variant={event.registrationOpen ? 'open' : 'closed'}>
                {event.registrationOpen ? 'Registration Open' : 'Registration Closed'}
              </Badge>
              {isRegistered && <Badge variant="success">Attending ✓</Badge>}
            </div>

            <div className="details-action-buttons">
              <button
                className="details-icon-btn"
                onClick={handleShare}
                title="Share Event Link"
              >
                {copied ? <Check size={18} className="text-success" /> : <Share2 size={18} />}
              </button>
            </div>
          </div>

          <h1 className="text-display-lg details-title">{event.title}</h1>
          <p className="details-organizer">Organized by {event.organizer}</p>

          {/* Quick Schedule Grid */}
          <div className="details-schedule-grid">
            <div className="schedule-item">
              <Calendar size={20} className="schedule-icon" />
              <div>
                <span className="schedule-label">Date</span>
                <span className="schedule-val">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="schedule-item">
              <Clock size={20} className="schedule-icon" />
              <div>
                <span className="schedule-label">Time</span>
                <span className="schedule-val">
                  {event.time} – {event.endTime || 'End of day'}
                </span>
              </div>
            </div>

            <div className="schedule-item">
              <MapPin size={20} className="schedule-icon" />
              <div>
                <span className="schedule-label">Location</span>
                <span className="schedule-val">{event.location}</span>
              </div>
            </div>

            <div className="schedule-item">
              <Users size={20} className="schedule-icon" />
              <div>
                <span className="schedule-label">Capacity</span>
                <span className="schedule-val">
                  {event.attendees} / {event.maxAttendees} registered
                </span>
              </div>
            </div>
          </div>

          <div className="details-cta-bar">
            <Button
              variant={isRegistered ? 'secondary' : 'primary'}
              size="lg"
              disabled={!event.registrationOpen && !isRegistered}
              onClick={() => toggleEventRsvp(event.id)}
            >
              {!event.registrationOpen && !isRegistered
                ? 'Registration Closed'
                : isRegistered
                  ? 'Registered (Click to cancel RSVP)'
                  : 'RSVP for Event'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={Navigation}
              onClick={() => navigate(`/map?location=${event.locationId}`)}
            >
              View Venue on Campus Map
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="details-body-grid">
          <div className="details-main-content">
            <div className="details-section-card">
              <h3 className="text-headline-sm" style={{ marginBottom: '12px' }}>
                About this Event
              </h3>
              <p className="text-body-lg text-secondary" style={{ lineHeight: 1.7 }}>
                {event.description}
              </p>

              <div className="details-tags-row">
                {event.tags?.map((tag, idx) => (
                  <span key={idx} className="event-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="details-section-card">
              <h3 className="text-headline-sm" style={{ marginBottom: '12px' }}>
                Important Guidelines
              </h3>
              <ul className="guidelines-list">
                <li>• Please bring your University Student ID Card for event entry verification.</li>
                <li>• Laptops and chargers required for hackathon and coding workshop sessions.</li>
                <li>• Refreshments and event kits will be provided at the registration desk.</li>
                <li>• Reach the venue 15 minutes before scheduled start time.</li>
              </ul>
            </div>
          </div>

          {/* Related Events Sidebar */}
          <div className="details-sidebar">
            <div className="details-section-card">
              <h3 className="text-title-md" style={{ marginBottom: '16px' }}>
                More Campus Events
              </h3>
              <div className="related-events-list">
                {relatedEvents.map((re) => (
                  <div
                    key={re.id}
                    className="related-event-item"
                    onClick={() => navigate(`/events/${re.id}`)}
                  >
                    <Badge variant="category">{re.category}</Badge>
                    <h4 className="related-title">{re.title}</h4>
                    <span className="related-meta">
                      <Calendar size={12} />
                      {re.date} • {re.location}
                    </span>
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
