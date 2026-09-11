import './Card.css';

export default function Card({
  children,
  hoverable = false,
  clickable = false,
  className = '',
  onClick,
  padding = 'default',
  ...props
}) {
  const Component = clickable || onClick ? 'button' : 'div';
  return (
    <Component
      className={`card ${hoverable ? 'card-hoverable' : ''} ${clickable ? 'card-clickable' : ''} card-pad-${padding} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardImage({ src, alt, height = 180, children }) {
  return (
    <div className="card-image" style={{ height }}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="card-image-placeholder">
          {children || <span>{alt}</span>}
        </div>
      )}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`card-content ${className}`}>{children}</div>;
}
