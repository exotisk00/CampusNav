import { useState, useMemo } from 'react';
import { Plus, Minus, Compass } from 'lucide-react';
import { campusLocations } from '../../data/locations';
import MapPin from './MapPin';
import MapPopover from './MapPopover';
import './CampusMap.css';

export default function CampusMap({
  selectedLocation,
  onSelectLocation,
  onGetDirections,
  searchQuery = '',
  activeCategory = 'All',
  showRoute = false,
  routeFrom = null,
  routeTo = null,
  className = '',
}) {
  const [zoom, setZoom] = useState(1);
  const [popoverLocation, setPopoverLocation] = useState(null);

  const filteredLocations = useMemo(() => {
    return campusLocations.filter((loc) => {
      const matchesCategory = activeCategory === 'All' || loc.category === activeCategory;
      const matchesSearch = !searchQuery || loc.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const handlePinClick = (location) => {
    setPopoverLocation(location);
    onSelectLocation?.(location);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));

  return (
    <div className={`campus-map-wrapper ${className}`}>
      {/* Map Canvas */}
      <div className="campus-map-canvas" style={{ transform: `scale(${zoom})` }}>
        {/* Background grid and paths */}
        <svg className="campus-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Campus boundary */}
          <rect x="5" y="5" width="90" height="90" rx="3" fill="none" stroke="#E2E8F0" strokeWidth="0.3" strokeDasharray="1,1" />

          {/* Roads */}
          <path d="M10 85 L10 15 L90 15" fill="none" stroke="#CBD5E1" strokeWidth="0.5" />
          <path d="M10 85 L50 85 L50 15" fill="none" stroke="#CBD5E1" strokeWidth="0.5" />
          <path d="M10 50 L90 50" fill="none" stroke="#CBD5E1" strokeWidth="0.3" strokeDasharray="1,1" />
          <path d="M30 15 L30 85" fill="none" stroke="#CBD5E1" strokeWidth="0.3" strokeDasharray="1,1" />
          <path d="M70 15 L70 85" fill="none" stroke="#CBD5E1" strokeWidth="0.3" strokeDasharray="1,1" />

          {/* Green areas */}
          <ellipse cx="48" cy="55" rx="6" ry="4" fill="rgba(34, 197, 94, 0.08)" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="0.2" />
          <ellipse cx="20" cy="30" rx="4" ry="3" fill="rgba(34, 197, 94, 0.06)" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="0.2" />

          {/* Route animation */}
          {showRoute && routeFrom && routeTo && (
            <path
              d={`M${routeFrom.position.x} ${routeFrom.position.y} Q${(routeFrom.position.x + routeTo.position.x) / 2} ${Math.min(routeFrom.position.y, routeTo.position.y) - 10} ${routeTo.position.x} ${routeTo.position.y}`}
              fill="none"
              stroke="#F26522"
              strokeWidth="0.6"
              strokeDasharray="2,1"
              className="route-path"
            />
          )}
        </svg>

        {/* Location Pins */}
        {filteredLocations.map((location) => (
          <MapPin
            key={location.id}
            location={location}
            isSelected={selectedLocation?.id === location.id}
            onClick={() => handlePinClick(location)}
          />
        ))}

        {/* Popover */}
        {popoverLocation && (
          <MapPopover
            location={popoverLocation}
            onClose={() => setPopoverLocation(null)}
            onViewDetails={(loc) => {
              onSelectLocation?.(loc);
              setPopoverLocation(null);
            }}
            onGetDirections={(loc) => {
              onGetDirections?.(loc);
              setPopoverLocation(null);
            }}
          />
        )}

        {/* Mock label */}
        <div className="campus-map-label">
          <span>Campus Map</span>
          <span className="text-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Mock view — real map integration pending
          </span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="campus-map-controls">
        <button className="map-control-btn" onClick={handleZoomIn} aria-label="Zoom in">
          <Plus size={18} />
        </button>
        <button className="map-control-btn" onClick={handleZoomOut} aria-label="Zoom out">
          <Minus size={18} />
        </button>
        <button className="map-control-btn" onClick={() => setZoom(1)} aria-label="Reset view">
          <Compass size={18} />
        </button>
      </div>
    </div>
  );
}
