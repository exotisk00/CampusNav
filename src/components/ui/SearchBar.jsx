import { Search } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  onSubmit,
  className = '',
  compact = false,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className={`search-bar ${compact ? 'search-bar-compact' : ''} ${className}`}>
      <Search size={18} className="search-bar-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className="search-bar-input"
      />
    </div>
  );
}
