import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Check, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useCampusData } from '../context/CampusDataContext';
import Button from '../components/ui/Button';
import './LanguageSettings.css';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Default' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'India' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'India' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'India' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'India' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'India' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'India' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'International' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'International' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'International' },
];

export default function LanguageSettings() {
  const navigate = useNavigate();
  const { language, setLanguage } = useCampusData();
  const [selectedLang, setSelectedLang] = useState(language || 'en');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLanguage(selectedLang);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate('/profile');
    }, 1500);
  };

  return (
    <div className="page-content language-page">
      <div className="container language-container">
        {/* Back Link */}
        <button className="lang-back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={16} />
          <span>Back to Profile</span>
        </button>

        {/* Header */}
        <div className="language-header">
          <div className="language-header-tag">
            <Globe size={16} />
            <span>Accessibility & Localization</span>
          </div>
          <h1 className="text-display-lg language-title">Language Selection</h1>
          <p className="language-subtitle">
            Choose your preferred language for campus directions, building directories, and student services.
          </p>
        </div>

        {saved && (
          <div className="lang-saved-banner">
            <CheckCircle2 size={18} />
            <span>Language preference updated! Reloading campus strings...</span>
          </div>
        )}

        {/* Language Grid */}
        <div className="language-grid">
          {languages.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <div
                key={lang.code}
                className={`language-tile ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedLang(lang.code)}
              >
                <div className="lang-tile-left">
                  <span className="lang-native-name">{lang.nativeName}</span>
                  <span className="lang-english-name">{lang.name}</span>
                </div>

                <div className="lang-tile-right">
                  <span className="lang-region-badge">{lang.region}</span>
                  <div className={`lang-check-circle ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="language-footer-actions">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleSave}>
            Save Language Preference
          </Button>
        </div>
      </div>
    </div>
  );
}
