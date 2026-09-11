import * as Icons from 'lucide-react';
import './MapPin.css';

export default function MapPin({ location, isSelected, onClick }) {
  const IconComponent = Icons[location.icon] || Icons.MapPin;

  return (
    <button
      className={`map-pin ${isSelected ? 'map-pin-selected' : ''}`}
      style={{
        left: `${location.position.x}%`,
        top: `${location.position.y}%`,
      }}
      onClick={onClick}
      aria-label={location.name}
      title={location.name}
    >
      <div className="map-pin-marker">
        <IconComponent size={14} />
      </div>
      <div className="map-pin-label">{location.shortName}</div>
      {isSelected && <div className="map-pin-pulse" />}
    </button>
  );
}
