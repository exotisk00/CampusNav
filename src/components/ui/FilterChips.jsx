import './FilterChips.css';

export default function FilterChips({ options, selected, onChange, className = '' }) {
  return (
    <div className={`filter-chips ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          className={`filter-chip ${selected === option ? 'filter-chip-selected' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
