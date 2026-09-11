import { useEffect, useRef, useState, useCallback } from 'react';
import { Plus, Minus, Compass, LocateFixed, Loader2, Map as MapIcon, Layers } from 'lucide-react';
import { CAMPUS_CENTER, campusLocations } from '../../data/locations';
import './CampusMap.css';

// ── Category → marker color mapping (matches design tokens) ──
const CATEGORY_COLORS = {
  Academic:    '#F26522',
  Residential: '#8B5CF6',
  Dining:      '#F59E0B',
  Recreation:  '#22C55E',
  Events:      '#3B82F6',
  Health:      '#EF4444',
  Facilities:  '#64748B',
};

// ── Tile Layer Configurations ──
const TILE_LAYERS = {
  streets: {
    id: 'streets',
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SATELLITE_TILE_URL) ||
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community',
    maxZoom: 19,
  },
};

// Build an SVG pin marker with clean rendering
function buildMarkerIcon(L, color, isSelected) {
  const size   = isSelected ? 36 : 28;
  const border = '#fff';
  const shadow = isSelected ? 'filter:drop-shadow(0 2px 6px rgba(0,0,0,.4))' : 'filter:drop-shadow(0 1px 3px rgba(0,0,0,.25))';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
        fill="${color}" stroke="${border}" stroke-width="2.5"
        style="${shadow}"/>
      <polygon points="${size / 2 - 5},${size - 2} ${size / 2 + 5},${size - 2} ${size / 2},${size + 7}"
        fill="${color}"/>
    </svg>`.trim();
  return L.divIcon({
    className: '',
    html: `<div style="display:inline-block;line-height:0">${svg}</div>`,
    iconSize:   [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor:[0, -(size + 8)],
  });
}

// User-location pulsing blue dot
function buildUserIcon(L) {
  return L.divIcon({
    className: 'user-location-icon',
    html: `<div class="user-dot"><div class="user-dot-ring"></div></div>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function CampusMap({
  selectedLocation,
  onSelectLocation,
  onGetDirections,
  searchQuery   = '',
  activeCategory= 'All',
  showRoute     = false,
  routeFrom     = null,
  routeTo       = null,
  routeGeometry = null,       // GeoJSON LineString from OSRM
  userLocation  = null,       // { lat, lng, accuracy } from MapPage
  onUserLocation= null,       // callback → MapPage sets user coords
  locating      = false,      // spinner while geolocating
  className     = '',
}) {
  const mapContainerRef   = useRef(null);
  const mapRef            = useRef(null);     // Leaflet map instance
  const tileLayerRef      = useRef(null);     // Active tile layer
  const markersRef        = useRef({});       // id → marker
  const userMarkerRef     = useRef(null);
  const accuracyCircleRef = useRef(null);
  const routeLayerRef     = useRef(null);
  const watchIdRef        = useRef(null);     // Geolocation watch ID
  const LRef              = useRef(null);     // Leaflet module ref

  const [mapReady, setMapReady]       = useState(false);
  const [mapError, setMapError]       = useState(null);
  const [activeLayer, setActiveLayer] = useState('streets'); // 'streets' | 'satellite'
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  // ── 1. Lazy-load Leaflet and initialise map ──────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        if (cancelled || !mapContainerRef.current) return;
        LRef.current = L;

        if (mapRef.current) return; // already initialised

        const map = L.map(mapContainerRef.current, {
          center:          [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng],
          zoom:            17,
          zoomControl:     false,   // custom buttons
          attributionControl: true,
        });

        // Initialize with street tiles by default
        const streetConfig = TILE_LAYERS.streets;
        const initialLayer = L.tileLayer(streetConfig.url, {
          attribution: streetConfig.attribution,
          maxZoom: streetConfig.maxZoom,
        }).addTo(map);

        tileLayerRef.current = initialLayer;
        mapRef.current = map;
        if (!cancelled) setMapReady(true);
      } catch (err) {
        console.error('Leaflet init error:', err);
        if (!cancelled) setMapError('Map failed to load. Please check your internet connection.');
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── 2. Switch Tile Layer (Street vs Satellite) ───────────────
  const handleLayerSwitch = useCallback((layerKey) => {
    if (!mapReady || !mapRef.current || !LRef.current) return;
    if (layerKey === activeLayer) return;

    const L = LRef.current;
    const map = mapRef.current;
    const config = TILE_LAYERS[layerKey] || TILE_LAYERS.streets;

    // Remove existing tile layer cleanly
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    // Add new tile layer (markers & routes remain on top pane)
    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);

    setActiveLayer(layerKey);
  }, [mapReady, activeLayer]);

  // ── 3. Sync location markers whenever locations / selection change ──
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current) return;
    const L   = LRef.current;
    const map = mapRef.current;

    const filtered = campusLocations.filter(loc => {
      const matchCat    = activeCategory === 'All' || loc.category === activeCategory;
      const matchSearch = !searchQuery ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    // Remove markers no longer in filtered list
    Object.keys(markersRef.current).forEach(id => {
      if (!filtered.find(l => l.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add / update markers
    filtered.forEach(loc => {
      const color      = CATEGORY_COLORS[loc.category] || '#64748B';
      const isSelected = selectedLocation?.id === loc.id;
      const icon       = buildMarkerIcon(L, color, isSelected);

      if (markersRef.current[loc.id]) {
        markersRef.current[loc.id].setIcon(icon);
      } else {
        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)
          .on('click', () => {
            onSelectLocation?.(loc);
          });
        markersRef.current[loc.id] = marker;
      }
    });

    // Pan to selected location
    if (selectedLocation?.lat && selectedLocation?.lng) {
      map.setView([selectedLocation.lat, selectedLocation.lng], Math.max(map.getZoom(), 17), {
        animate: true,
      });
    }
  }, [mapReady, activeCategory, searchQuery, selectedLocation, onSelectLocation]);

  // ── 4. User location marker & accuracy circle ─────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current) return;
    const L   = LRef.current;
    const map = mapRef.current;

    if (userLocation?.lat && userLocation?.lng) {
      // User marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: buildUserIcon(L),
          zIndexOffset: 1000,
        }).addTo(map);
      }

      // Accuracy circle (only display if reasonable radius < 1500m)
      const accuracy = userLocation.accuracy;
      if (accuracy && accuracy > 0 && accuracy < 1500) {
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
          accuracyCircleRef.current.setRadius(accuracy);
        } else {
          accuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
            radius: accuracy,
            color: '#2563EB',
            fillColor: '#3B82F6',
            fillOpacity: 0.12,
            weight: 1.5,
          }).addTo(map);
        }
      } else if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
        accuracyCircleRef.current = null;
      }
    } else {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      accuracyCircleRef.current?.remove();
      accuracyCircleRef.current = null;
    }
  }, [mapReady, userLocation]);

  // ── 5. Route polyline ────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current) return;
    const L   = LRef.current;
    const map = mapRef.current;

    // Clear old route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (showRoute && routeGeometry?.coordinates?.length) {
      // OSRM returns [lng, lat] pairs — Leaflet needs [lat, lng]
      const latlngs = routeGeometry.coordinates.map(([lng, lat]) => [lat, lng]);
      routeLayerRef.current = L.polyline(latlngs, {
        color:     '#F26522',
        weight:    5,
        opacity:   0.85,
        lineJoin:  'round',
        lineCap:   'round',
        dashArray: null,
      }).addTo(map);
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });
    } else if (showRoute && routeFrom?.lat && routeTo?.lat) {
      // Fallback straight line if geometry not ready
      const latlngs = [[routeFrom.lat, routeFrom.lng], [routeTo.lat, routeTo.lng]];
      routeLayerRef.current = L.polyline(latlngs, {
        color:     '#F26522',
        weight:    4,
        opacity:   0.7,
        dashArray: '8, 8',
      }).addTo(map);
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
    }
  }, [mapReady, showRoute, routeGeometry, routeFrom, routeTo]);

  // ── 6. Live Location Tracking (active during navigation) ───────
  useEffect(() => {
    // Only track continuously while navigation is active AND user has granted location
    if (!showRoute || !userLocation?.lat || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsLiveTracking(false);
      }
      return;
    }

    setIsLiveTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        onUserLocation?.(coords);
      },
      (err) => {
        console.warn('Live location watch error:', err?.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsLiveTracking(false);
      }
    };
  }, [showRoute, Boolean(userLocation?.lat), onUserLocation]);

  // ── 7. Current Location Button ("Locate Me") ─────────────────
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      onUserLocation?.({ error: 'Geolocation is not supported by your browser.' });
      return;
    }
    onUserLocation?.('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        onUserLocation?.(coords);
        mapRef.current?.setView([coords.lat, coords.lng], Math.max(mapRef.current.getZoom(), 17), {
          animate: true,
        });
      },
      (err) => {
        let msg = 'Could not get your location. Please try again.';
        if (err.code === 1) {
          msg = 'Location permission denied. Please allow location access in your browser to see your position on campus.';
        } else if (err.code === 2) {
          msg = 'Location unavailable. Please check your network or GPS connection.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again.';
        }
        onUserLocation?.({ error: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onUserLocation]);

  // ── 8. Manual Zoom & Reset controls ──────────────────────────
  const handleZoomIn  = useCallback(() => mapRef.current?.zoomIn(),  []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const handleReset   = useCallback(() => {
    mapRef.current?.setView([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], 17, { animate: true });
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className={`campus-map-wrapper ${className}`}>
      {/* Error state */}
      {mapError && (
        <div className="campus-map-error">
          <span>{mapError}</span>
        </div>
      )}

      {/* Live GPS Tracking Badge */}
      {isLiveTracking && (
        <div className="map-live-badge">
          <span className="map-live-dot" />
          <span>Live GPS Active</span>
        </div>
      )}

      {/* Layer Toggle Control (Street Map vs Satellite View) */}
      <div className="map-layer-toggle" role="group" aria-label="Map layer options">
        <button
          type="button"
          className={`layer-toggle-btn ${activeLayer === 'streets' ? 'active' : ''}`}
          onClick={() => handleLayerSwitch('streets')}
          aria-pressed={activeLayer === 'streets'}
          title="Switch to Street Map"
        >
          <MapIcon size={14} />
          <span>Street</span>
        </button>
        <button
          type="button"
          className={`layer-toggle-btn ${activeLayer === 'satellite' ? 'active' : ''}`}
          onClick={() => handleLayerSwitch('satellite')}
          aria-pressed={activeLayer === 'satellite'}
          title="Switch to Satellite Imagery"
        >
          <Layers size={14} />
          <span>Satellite</span>
        </button>
      </div>

      {/* Real Leaflet map container */}
      <div ref={mapContainerRef} className="campus-map-leaflet" />

      {/* Map Controls */}
      <div className="campus-map-controls">
        <button
          className={`map-control-btn ${userLocation?.lat ? 'locate-active' : ''}`}
          onClick={handleLocate}
          aria-label="Locate Me / Current Location"
          title="Locate Me (Current GPS Location)"
          disabled={locating}
        >
          {locating ? (
            <Loader2 size={16} className="spin-icon" />
          ) : (
            <LocateFixed size={16} />
          )}
        </button>
        <div className="map-control-divider" />
        <button className="map-control-btn" onClick={handleZoomIn} aria-label="Zoom in" title="Zoom in">
          <Plus size={18} />
        </button>
        <button className="map-control-btn" onClick={handleZoomOut} aria-label="Zoom out" title="Zoom out">
          <Minus size={18} />
        </button>
        <button className="map-control-btn" onClick={handleReset} aria-label="Reset to Campus Center" title="Reset view">
          <Compass size={18} />
        </button>
      </div>
    </div>
  );
}
