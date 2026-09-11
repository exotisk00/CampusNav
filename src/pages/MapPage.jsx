import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Navigation,
  Clock,
  Route,
  Building,
  X,
} from 'lucide-react';
import { campusLocations, locationCategories, mockDirections } from '../data/locations';
import CampusMap from '../components/map/CampusMap';
import DirectionsPanel from '../components/map/DirectionsPanel';
import FilterChips from '../components/ui/FilterChips';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './MapPage.css';

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(campusLocations[0]);
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState('loc_010'); // Main Gate
  const [routeDest, setRouteDest] = useState('loc_003'); // Central Library
  const [activeDirections, setActiveDirections] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Filtered list
  const filteredList = useMemo(() => {
    return campusLocations.filter((loc) => {
      const matchCat = selectedCategory === 'All' || loc.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const originLocation = campusLocations.find((l) => l.id === routeOrigin) || campusLocations[9];
  const destLocation = campusLocations.find((l) => l.id === routeDest) || campusLocations[2];

  useEffect(() => {
    const locId = searchParams.get('location');
    if (!locId) return;
    const loc = campusLocations.find((l) => l.id === locId);
    if (!loc) return;
    setSelectedLocation(loc);
    setRouteDest(loc.id);
    if (searchParams.get('directions') === '1') {
      setIsDirectionsMode(true);
      setActiveDirections({
        ...mockDirections,
        from: originLocation.name,
        to: loc.name,
      });
    }
    // originLocation is current at mount; deep-link only needs dest
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleStartDirections = (destLoc) => {
    if (destLoc) {
      setRouteDest(destLoc.id);
    }
    setIsDirectionsMode(true);
    setActiveDirections({
      ...mockDirections,
      from: originLocation.name,
      to: destLoc ? destLoc.name : destLocation.name,
    });
  };

  const handleCloseDirections = () => {
    setIsDirectionsMode(false);
    setActiveDirections(null);
  };

  return (
    <div className="map-page-wrapper">
      {/* ── Left Sidebar (420px fixed on desktop) ── */}
      <aside className={`map-sidebar ${mobileDrawerOpen ? 'mobile-expanded' : ''}`}>
        {/* Mobile handle bar */}
        <div
          className="map-mobile-handle"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        >
          <div className="handle-pill" />
          <span className="handle-text">
            {mobileDrawerOpen ? 'Swipe down to view map' : 'View Campus Directory & Routes'}
          </span>
        </div>

        {/* Sidebar Header */}
        <div className="map-sidebar-header">
          <div className="sidebar-header-top">
            <h1 className="text-headline-sm map-page-title">Campus Directory</h1>
            <Button
              variant={isDirectionsMode ? 'primary' : 'outline'}
              size="sm"
              icon={Route}
              onClick={() => {
                if (isDirectionsMode) {
                  handleCloseDirections();
                } else {
                  handleStartDirections(selectedLocation);
                }
              }}
            >
              {isDirectionsMode ? 'Exit Route' : 'Get Directions'}
            </Button>
          </div>

          {/* Search bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search buildings, rooms, amenities..."
            className="map-search-bar"
          />

          {/* Categories */}
          <FilterChips
            options={locationCategories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            className="map-categories"
          />
        </div>

        {/* Route Planner Container when Directions Mode Active */}
        {isDirectionsMode && (
          <div className="route-planner-box">
            <div className="planner-row">
              <div className="planner-dot origin-dot" />
              <div className="planner-select-wrap">
                <label className="planner-label">Starting Point</label>
                <select
                  className="planner-select"
                  value={routeOrigin}
                  onChange={(e) => {
                    setRouteOrigin(e.target.value);
                    const newOrigin = campusLocations.find((l) => l.id === e.target.value);
                    setActiveDirections((prev) => ({
                      ...prev,
                      from: newOrigin?.name || 'Origin',
                    }));
                  }}
                >
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="planner-connector" />

            <div className="planner-row">
              <div className="planner-dot dest-dot" />
              <div className="planner-select-wrap">
                <label className="planner-label">Destination</label>
                <select
                  className="planner-select"
                  value={routeDest}
                  onChange={(e) => {
                    setRouteDest(e.target.value);
                    const newDest = campusLocations.find((l) => l.id === e.target.value);
                    setSelectedLocation(newDest);
                    setActiveDirections((prev) => ({
                      ...prev,
                      to: newDest?.name || 'Destination',
                    }));
                  }}
                >
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="planner-summary-pill">
              <Navigation size={14} />
              <span>Est: 6 min walk • 0.4 km • Flat terrain</span>
            </div>
          </div>
        )}

        {/* Location List */}
        <div className="map-locations-list">
          <div className="list-count-bar">
            <span>{filteredList.length} locations found</span>
          </div>

          {filteredList.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <div
                key={loc.id}
                className={`location-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedLocation(loc);
                  setMobileDrawerOpen(false);
                }}
              >
                <div className="loc-item-header">
                  <div className="loc-item-title-wrap">
                    <span className="loc-item-name">{loc.name}</span>
                    <Badge variant="category">{loc.category}</Badge>
                  </div>
                  <span className={`loc-status-pill ${loc.status === 'open' ? '' : 'closed'}`}>
                    {loc.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>

                <p className="loc-item-desc">{loc.description}</p>

                <div className="loc-item-details">
                  <span className="loc-detail">
                    <Clock size={12} />
                    {loc.hours}
                  </span>
                  <span className="loc-detail">
                    <Building size={12} />
                    {loc.floors} {loc.floors === 1 ? 'Floor' : 'Floors'}
                  </span>
                </div>

                <div className="loc-item-amenities">
                  {loc.amenities.map((amenity, idx) => (
                    <span key={idx} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="loc-item-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Route}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartDirections(loc);
                    }}
                  >
                    Directions
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Right Canvas: Interactive Campus Map ── */}
      <main className="map-canvas-container">
        <CampusMap
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
          onGetDirections={handleStartDirections}
          searchQuery={searchQuery}
          activeCategory={selectedCategory}
          showRoute={isDirectionsMode}
          routeFrom={originLocation}
          routeTo={destLocation}
        />

        {/* Directions Step-by-Step Floating Overlay if active */}
        {activeDirections && (
          <div className="map-directions-overlay">
            <DirectionsPanel
              directions={activeDirections}
              onClose={handleCloseDirections}
            />
          </div>
        )}

        {/* Selected Location Card floating on desktop */}
        {selectedLocation && !activeDirections && (
          <div className="selected-location-floating-card">
            <div className="selected-card-header">
              <div>
                <Badge variant="category">{selectedLocation.category}</Badge>
                <h3 className="text-title-md" style={{ marginTop: '4px' }}>
                  {selectedLocation.name}
                </h3>
              </div>
              <button
                className="close-floating-btn"
                onClick={() => setSelectedLocation(null)}
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-body-sm text-secondary" style={{ margin: '8px 0' }}>
              {selectedLocation.description}
            </p>
            <div className="selected-card-footer">
              <span className="text-body-sm text-secondary">
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {selectedLocation.hours}
              </span>
              <Button
                variant="primary"
                size="sm"
                icon={Navigation}
                onClick={() => handleStartDirections(selectedLocation)}
              >
                Directions
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
