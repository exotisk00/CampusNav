import { X, Clock, Navigation } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import './DirectionsPanel.css';

export default function MapPopover({ location, onClose, onViewDetails, onGetDirections }) {
  return (
    <div
      className="map-popover"
      style={{
        left: `${location.position.x}%`,
        top: `${location.position.y}%`,
      }}
    >
      <div className="map-popover-header">
        <div>
          <h3 className="text-title-md">{location.name}</h3>
          <Badge variant={location.status === 'open' ? 'open' : 'closed'}>
            {location.status === 'open' ? 'Open' : 'Closed'}
          </Badge>
        </div>
        <button className="map-popover-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', margin: '8px 0' }}>
        {location.description}
      </p>

      <div className="map-popover-meta">
        <Clock size={14} />
        <span className="text-body-sm">{location.hours}</span>
      </div>

      {location.amenities && (
        <div className="map-popover-amenities">
          {location.amenities.slice(0, 3).map((a) => (
            <span key={a} className="map-popover-amenity">{a}</span>
          ))}
          {location.amenities.length > 3 && (
            <span className="map-popover-amenity">+{location.amenities.length - 3}</span>
          )}
        </div>
      )}

      <div className="map-popover-actions">
        <Button
          size="sm"
          onClick={() => (onGetDirections || onViewDetails)?.(location)}
          icon={Navigation}
        >
          Directions
        </Button>
      </div>
    </div>
  );
}
