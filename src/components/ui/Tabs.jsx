import './Tabs.css';

export function SegmentedTabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`segmented-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`segmented-tab ${activeTab === tab.value ? 'segmented-tab-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
          {tab.count !== undefined && (
            <span className="segmented-tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function UnderlineTabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`underline-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`underline-tab ${activeTab === tab.value ? 'underline-tab-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.icon && <tab.icon size={16} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
