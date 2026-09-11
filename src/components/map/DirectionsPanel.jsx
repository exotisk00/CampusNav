import { ArrowUp, ArrowRight, ArrowLeft, MapPin, X, Navigation } from 'lucide-react';
import Button from '../ui/Button';
import './DirectionsPanel.css';

const iconMap = {
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  MapPin,
};

export default function DirectionsPanel({ directions, onClose }) {
  if (!directions) return null;

  return (
    <div className="directions-panel">
      <div className="directions-header">
        <div className="directions-header-content">
          <Navigation size={18} className="directions-icon" />
          <div>
            <p className="text-label-md" style={{ color: 'var(--color-surface-dark-text)' }}>
              {directions.from} → {directions.to}
            </p>
            <p className="text-title-md" style={{ color: 'var(--color-text-inverse)' }}>
              <span className="tabular-nums">{directions.duration}</span>
              <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
              <span className="tabular-nums">{directions.distance}</span>
            </p>
          </div>
        </div>
        <button className="directions-close" onClick={onClose} aria-label="Close directions">
          <X size={18} />
        </button>
      </div>

      <div className="directions-steps">
        {directions.steps.map((step, index) => {
          const StepIcon = iconMap[step.icon] || ArrowUp;
          return (
            <div key={index} className="directions-step">
              <div className="directions-step-icon">
                <StepIcon size={16} />
              </div>
              <div className="directions-step-content">
                <p className="text-body-md">{step.instruction}</p>
                <p className="text-body-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                  {step.distance}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="directions-footer">
        <Button variant="primary" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
