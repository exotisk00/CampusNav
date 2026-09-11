import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
} from 'lucide-react';
import { eventCategories } from '../data/events';
import { useCampusData } from '../context/CampusDataContext';
import FilterChips from '../components/ui/FilterChips';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './Events.css';

export default function Events() {
  const navigate = useNavigate();
  const { events: eventsList = [], isEventRegistered, toggleEventRsvp } = useCampusData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRegister = (eventId, e) => {
    e.stopPropagation();
    toggleEventRsvp(eventId);
  };

  const filteredEvents = useMemo(() => {
    return eventsList.filter((evt) => {
      const matchCat = selectedCategory === 'All' || evt.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [eventsList, selectedCategory, searchQuery]);

  return (
    <div className="page-content events-page">
      <div className="container">
        {/* Header */}
        <div className="events-header">
          <div>
            <div className="events-header-tag">
              <Sparkles size={16} />
              <span>Campus Life & Happenings</span>
            </div>
            <h1 className="text-display-lg events-title">Campus Events</h1>
            <p className="events-subtitle">
              Discover hackathons, cultural festivals, sports tournaments, and workshops taking place across the university.
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="events-controls-card">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search events by name, club, or venue..."
            className="events-search-bar"
          />

          <div className="events-categories-scroll">
            <FilterChips
              options={eventCategories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {filteredEvents.length === 0 ? (
            <div className="events-empty-state">
              <Calendar size={48} className="empty-icon" />
              <h3 className="text-headline-sm">No events found</h3>
              <p className="text-body-md text-secondary">
                No campus events matched your search filters.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Clear Search Filters
              </Button>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isRegistered = isEventRegistered(evt.id);
              const percentFilled = Math.round((evt.attendees / evt.maxAttendees) * 100);

              return (
                <div
                  key={evt.id}
                  className="event-card"
                  onClick={() => navigate(`/events/${evt.id}`)}
                >
                  <div className="event-card-top">
                    <div className="event-date-box">
                      <span className="event-month">
                        {new Date(evt.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="event-day">
                        {new Date(evt.date).getDate()}
                      </span>
                    </div>

                    <div className="event-card-badges">
                      <Badge variant="category">{evt.category}</Badge>
                      {isRegistered && <Badge variant="success">Attending ✓</Badge>}
                    </div>
                  </div>

                  <h3 className="event-card-title">{evt.title}</h3>
                  <p className="event-card-organizer">by {evt.organizer}</p>

                  <p className="event-card-desc">{evt.description}</p>

                  <div className="event-card-info-rows">
                    <div className="event-info-row">
                      <Clock size={14} className="info-icon" />
                      <span>{evt.time} {evt.endTime ? `– ${evt.endTime}` : ''}</span>
                    </div>
                    <div className="event-info-row">
                      <MapPin size={14} className="info-icon" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  {/* Attendance Bar */}
                  <div className="event-attendance-section">
                    <div className="attendance-label-row">
                      <span className="attendance-label">
                        <Users size={12} />
                        {evt.attendees} / {evt.maxAttendees} registered
                      </span>
                      <span className="attendance-percent">{percentFilled}% filled</span>
                    </div>
                    <div className="attendance-progress-track">
                      <div
                        className="attendance-progress-bar"
                        style={{
                          width: `${Math.min(percentFilled, 100)}%`,
                          backgroundColor: percentFilled > 80 ? 'var(--color-primary)' : 'var(--color-secondary)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="event-card-footer">
                    <Button
                      variant={isRegistered ? 'secondary' : 'primary'}
                      size="sm"
                      fullWidth
                      disabled={!evt.registrationOpen && !isRegistered}
                      onClick={(e) => toggleRegister(evt.id, e)}
                    >
                      {!evt.registrationOpen
                        ? 'Registration Closed'
                        : isRegistered
                          ? 'Registered ✓'
                          : 'Register for Event'}
                    </Button>
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
