import { ArrowUp, ArrowRight, ArrowLeft, MapPin, RotateCcw, X, Navigation, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import './DirectionsPanel.css';

// Map OSRM maneuver modifier → icon
function getStepIcon(step) {
  const modifier = step?.maneuver?.modifier || '';
  const type     = step?.maneuver?.type     || '';
  if (type === 'arrive')         return MapPin;
  if (modifier === 'right')      return ArrowRight;
  if (modifier === 'left')       return ArrowLeft;
  if (modifier === 'uturn')      return RotateCcw;
  // Legacy mock-data icon strings
  if (step.icon === 'ArrowRight') return ArrowRight;
  if (step.icon === 'ArrowLeft')  return ArrowLeft;
  if (step.icon === 'MapPin')     return MapPin;
  return ArrowUp;
}

// Format OSRM step instruction
function formatInstruction(step) {
  // Real OSRM step
  if (step.maneuver) {
    const type     = step.maneuver.type || '';
    const modifier = step.maneuver.modifier || '';
    const name     = step.name || '';
    if (type === 'depart')  return `Start on ${name || 'the road'}`;
    if (type === 'arrive')  return `Arrive at your destination${name ? ` on ${name}` : ''}`;
    if (type === 'turn')    return `Turn ${modifier}${name ? ` onto ${name}` : ''}`;
    if (type === 'roundabout') return `At the roundabout, take the exit`;
    if (type === 'continue') return `Continue${name ? ` on ${name}` : ''}`;
    return step.maneuver.instruction || `${type} ${modifier}`.trim();
  }
  // Fallback for legacy mock steps
  return step.instruction || '';
}

// Format metres → human-readable
function formatDistance(metres) {
  if (!metres && metres !== 0) return '';
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export default function DirectionsPanel({ directions, onClose, loading }) {
  if (!directions && !loading) return null;

  return (
    <div className="directions-panel">
      <div className="directions-header">
        <div className="directions-header-content">
          <Navigation size={18} className="directions-icon" />
          <div>
            <p className="text-label-md" style={{ color: 'var(--color-surface-dark-text)' }}>
              {directions?.from} → {directions?.to}
            </p>
            <p className="text-title-md" style={{ color: 'var(--color-text-inverse)' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} />
                  Calculating route…
                </span>
              ) : (
                <>
                  <span className="tabular-nums">{directions?.duration}</span>
                  <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
                  <span className="tabular-nums">{directions?.distance}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <button className="directions-close" onClick={onClose} aria-label="Close directions">
          <X size={18} />
        </button>
      </div>

      {!loading && directions?.routeError && (
        <div className="directions-error-bar">
          ⚠️ {directions.routeError}
        </div>
      )}

      {!loading && directions?.steps?.length > 0 && (
        <div className="directions-steps">
          {directions.steps.map((step, index) => {
            const StepIcon = getStepIcon(step);
            return (
              <div key={index} className="directions-step">
                <div className="directions-step-icon">
                  <StepIcon size={16} />
                </div>
                <div className="directions-step-content">
                  <p className="text-body-md">{formatInstruction(step)}</p>
                  {step.distance > 0 && (
                    <p className="text-body-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                      {formatDistance(step.distance)}
                    </p>
                  )}
                  {step.distance == null && step.distance_text && (
                    <p className="text-body-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                      {step.distance_text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="directions-footer">
        <Button variant="primary" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
