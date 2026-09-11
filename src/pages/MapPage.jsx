import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Navigation,
  Clock,
  Route,
  Building,
  X,
  AlertCircle,
} from 'lucide-react';
import { campusLocations, locationCategories } from '../data/locations';
import CampusMap from '../components/map/CampusMap';
import DirectionsPanel from '../components/map/DirectionsPanel';
import FilterChips from '../components/ui/FilterChips';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './MapPage.css';

// ── OSRM routing (free, no key needed) ──────────────────────
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/foot';

async function fetchRoute(origin, dest) {
  const url = `${OSRM_BASE}/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?steps=true&geometries=geojson&overview=full`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const data = await res.json();
  if (data.code !== 'Ok') throw new Error(data.message || 'Route not found');
  const route = data.routes[0];
  const leg   = route.legs[0];
  return {
    distance: leg.distance < 1000
      ? `${Math.round(leg.distance)} m`
      : `${(leg.distance / 1000).toFixed(1)} km`,
    duration: leg.duration < 60
      ? `${Math.round(leg.duration)} sec walk`
      : `${Math.round(leg.duration / 60)} min walk`,
    steps:    leg.steps,
    geometry: route.geometry,   // GeoJSON LineString
  };
}

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery,       setSearchQuery]       = useState('');
  const [selectedCategory,  setSelectedCategory]  = useState('All');
  const [selectedLocation,  setSelectedLocation]  = useState(null);
  const [isDirectionsMode,  setIsDirectionsMode]  = useState(false);
  const [routeOriginId,     setRouteOriginId]     = useState('loc_010');
  const [routeDestId,       setRouteDestId]       = useState('loc_003');
  const [activeDirections,  setActiveDirections]  = useState(null);
  const [routeGeometry,     setRouteGeometry]     = useState(null);
  const [routeLoading,      setRouteLoading]      = useState(false);
  const [mobileDrawerOpen,  setMobileDrawerOpen]  = useState(false);
  // Geolocation
  const [userLocation,      setUserLocation]      = useState(null);
  const [locating,          setLocating]          = useState(false);
  const [geoError,          setGeoError]          = useState(null);

  const originLocation = useMemo(
    () => campusLocations.find(l => l.id === routeOriginId) || campusLocations[9],
    [routeOriginId]
  );
  const destLocation = useMemo(
    () => campusLocations.find(l => l.id === routeDestId) || campusLocations[2],
    [routeDestId]
  );

  // Filtered list
  const filteredList = useMemo(() => {
    return campusLocations.filter(loc => {
      const matchCat    = selectedCategory === 'All' || loc.category === selectedCategory;
      const matchSearch = !searchQuery ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  // ── Deep-link from other pages ───────────────────────────────
  useEffect(() => {
    const locId = searchParams.get('location');
    if (!locId) return;
    const loc = campusLocations.find(l => l.id === locId);
    if (!loc) return;
    setSelectedLocation(loc);
    setRouteDestId(loc.id);
    if (searchParams.get('directions') === '1') {
      startDirections(loc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── OSRM route fetch ────────────────────────────────────────
  const fetchAndSetRoute = useCallback(async (from, to, fromLabel, toLabel) => {
    setRouteLoading(true);
    setActiveDirections({ from: fromLabel, to: toLabel, steps: [], duration: '…', distance: '…' });
    setRouteGeometry(null);
    try {
      const result = await fetchRoute(from, to);
      setRouteGeometry(result.geometry);
      setActiveDirections({
        from:     fromLabel,
        to:       toLabel,
        duration: result.duration,
        distance: result.distance,
        steps:    result.steps,
      });
    } catch (err) {
      console.warn('OSRM routing error:', err);
      setActiveDirections({
        from:       fromLabel,
        to:         toLabel,
        duration:   'Unknown',
        distance:   'Unknown',
        steps:      [],
        routeError: 'Could not calculate route. Showing approximate path.',
      });
    } finally {
      setRouteLoading(false);
    }
  }, []);

  const startDirections = useCallback((destLoc) => {
    const dest = destLoc || destLocation;
    setRouteDestId(dest.id);
    setIsDirectionsMode(true);

    // Use user's real location as origin if available
    const fromCoords = userLocation?.lat
      ? userLocation
      : { lat: originLocation.lat, lng: originLocation.lng };
    const fromLabel  = userLocation?.lat ? 'My Location' : originLocation.name;

    fetchAndSetRoute(fromCoords, { lat: dest.lat, lng: dest.lng }, fromLabel, dest.name);
  }, [destLocation, originLocation, userLocation, fetchAndSetRoute]);

  const handleStartDirections = useCallback((destLoc) => {
    startDirections(destLoc);
  }, [startDirections]);

  const handleCloseDirections = useCallback(() => {
    setIsDirectionsMode(false);
    setActiveDirections(null);
    setRouteGeometry(null);
  }, []);

  // Re-fetch if route planner selects change
  const handleOriginChange = (e) => {
    const newOriginId = e.target.value;
    setRouteOriginId(newOriginId);
    if (isDirectionsMode) {
      const newOrigin = campusLocations.find(l => l.id === newOriginId);
      const fromCoords = { lat: newOrigin.lat, lng: newOrigin.lng };
      fetchAndSetRoute(fromCoords, { lat: destLocation.lat, lng: destLocation.lng }, newOrigin.name, destLocation.name);
    }
  };

  const handleDestChange = (e) => {
    const newDestId = e.target.value;
    setRouteDestId(newDestId);
    const newDest = campusLocations.find(l => l.id === newDestId);
    setSelectedLocation(newDest);
    if (isDirectionsMode) {
      const fromCoords = userLocation?.lat
        ? userLocation
        : { lat: originLocation.lat, lng: originLocation.lng };
      const fromLabel = userLocation?.lat ? 'My Location' : originLocation.name;
      fetchAndSetRoute(fromCoords, { lat: newDest.lat, lng: newDest.lng }, fromLabel, newDest.name);
    }
  };

  // ── Geolocation callback from CampusMap ─────────────────────
  const handleUserLocation = useCallback((data) => {
    if (data === 'requesting') {
      setLocating(true);
      setGeoError(null);
      return;
    }
    setLocating(false);
    if (data?.error) {
      setGeoError(data.error);
    } else if (data?.lat) {
      setUserLocation(data);
      setGeoError(null);

      // Requirement 4: If destination is chosen & directions active, update route starting point to user GPS
      if (isDirectionsMode && destLocation) {
        fetchAndSetRoute(data, { lat: destLocation.lat, lng: destLocation.lng }, 'My Location', destLocation.name);
      }
    }
  }, [isDirectionsMode, destLocation, fetchAndSetRoute]);

  return (
    <div className="map-page-wrapper">
      {/* ── Left Sidebar ── */}
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
                  handleStartDirections(selectedLocation || destLocation);
                }
              }}
            >
              {isDirectionsMode ? 'Exit Route' : 'Get Directions'}
            </Button>
          </div>

          {/* Geo error banner */}
          {geoError && (
            <div className="geo-error-bar">
              <AlertCircle size={14} />
              <span>{geoError}</span>
            </div>
          )}

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search buildings, rooms, amenities..."
            className="map-search-bar"
          />

          <FilterChips
            options={locationCategories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
            className="map-categories"
          />
        </div>

        {/* Route Planner */}
        {isDirectionsMode && (
          <div className="route-planner-box">
            <div className="planner-row">
              <div className="planner-dot origin-dot" />
              <div className="planner-select-wrap">
                <label className="planner-label">Starting Point</label>
                {userLocation?.lat ? (
                  <div className="planner-location-badge">
                    📍 My Current Location
                  </div>
                ) : (
                  <select
                    className="planner-select"
                    value={routeOriginId}
                    onChange={handleOriginChange}
                  >
                    {campusLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="planner-connector" />

            <div className="planner-row">
              <div className="planner-dot dest-dot" />
              <div className="planner-select-wrap">
                <label className="planner-label">Destination</label>
                <select
                  className="planner-select"
                  value={routeDestId}
                  onChange={handleDestChange}
                >
                  {campusLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeDirections && !routeLoading && (
              <div className="planner-summary-pill">
                <Navigation size={14} />
                <span>
                  {activeDirections.duration} • {activeDirections.distance} • Walking
                </span>
              </div>
            )}
            {routeLoading && (
              <div className="planner-summary-pill">
                <Navigation size={14} />
                <span>Calculating route…</span>
              </div>
            )}
          </div>
        )}

        {/* Location List */}
        <div className="map-locations-list">
          <div className="list-count-bar">
            <span>{filteredList.length} locations found</span>
          </div>

          {filteredList.map(loc => {
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
                    <span key={idx} className="amenity-tag">{amenity}</span>
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

      {/* ── Right Canvas: Leaflet Map ── */}
      <main className="map-canvas-container">
        <CampusMap
          selectedLocation={selectedLocation}
          onSelectLocation={loc => setSelectedLocation(loc)}
          onGetDirections={handleStartDirections}
          searchQuery={searchQuery}
          activeCategory={selectedCategory}
          showRoute={isDirectionsMode}
          routeFrom={originLocation}
          routeTo={destLocation}
          routeGeometry={routeGeometry}
          userLocation={userLocation}
          onUserLocation={handleUserLocation}
          locating={locating}
        />

        {/* Directions overlay */}
        {(activeDirections || routeLoading) && (
          <div className="map-directions-overlay">
            <DirectionsPanel
              directions={activeDirections}
              onClose={handleCloseDirections}
              loading={routeLoading}
            />
          </div>
        )}

        {/* Selected location floating card (desktop only, hide when directions open) */}
        {selectedLocation && !activeDirections && !routeLoading && (
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
