import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Compass,
  Package,
  Calendar,
  MessageCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Compass,
      title: 'Interactive Campus Map',
      description: 'Explore campus buildings, search amenities, and get step-by-step walking directions in real time.',
      link: '/map',
      tag: 'Wayfinding',
    },
    {
      icon: Package,
      title: 'Lost & Found Hub',
      description: 'Report lost belongings or find items with instant category filtering and student contact.',
      link: '/lost-found',
      tag: 'Community',
    },
    {
      icon: Calendar,
      title: 'Campus Events & Fests',
      description: 'Never miss hackathons, cultural nights, sports tournaments, or guest lectures happening on campus.',
      link: '/events',
      tag: 'Live Events',
    },
    {
      icon: MessageCircle,
      title: 'AI Campus Assistant',
      description: 'Ask anything 24/7 about library timings, food court menus, hostel queries, or building locations.',
      link: '/assistant',
      tag: 'AI Powered',
    },
  ];

  const stats = [
    { value: '10+', label: 'Campus Blocks' },
    { value: '1,200+', label: 'Hostel Residents' },
    { value: '50k+', label: 'Library Resources' },
    { value: '24/7', label: 'Student Support' },
  ];

  return (
    <div className="landing-page">
      {/* Top Bar */}
      <header className="landing-nav">
        <div className="container landing-nav-inner">
          <div className="landing-brand">
            <div className="landing-logo-badge">
              <MapPin size={22} />
            </div>
            <span className="landing-brand-text">CampusNav</span>
          </div>

          <div className="landing-nav-actions">
            {user ? (
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container landing-hero-grid">
          <div className="landing-hero-content">
            <div className="landing-pill">
              <Sparkles size={15} />
              <span>Higher-Ed Wayfinding & Student Hub</span>
            </div>
            <h1 className="landing-title">
              Navigate Your Campus With <span className="text-highlight">Confidence</span>.
            </h1>
            <p className="landing-subtitle">
              CampusNav brings interactive 2D wayfinding, lost & found reporting, campus fests, and a 24/7 smart assistant together in one modern platform.
            </p>

            <div className="landing-cta-group">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                iconRight={ArrowRight}
              >
                {user ? 'Open Dashboard' : 'Explore CampusNav'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/map')}
                icon={Navigation}
              >
                View Live Map
              </Button>
            </div>

            <div className="landing-proof">
              <div className="landing-proof-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>Zero Installation</span>
              </div>
              <div className="landing-proof-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>Student & Faculty Verified</span>
              </div>
              <div className="landing-proof-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>Real-Time Updates</span>
              </div>
            </div>
          </div>

          {/* Hero Graphic / Interactive Card Preview */}
          <div className="landing-hero-visual">
            <div className="hero-preview-card">
              <div className="hero-preview-header">
                <div className="preview-nav-title">
                  <Navigation size={18} className="text-primary" />
                  <span>Central Library Route</span>
                </div>
                <span className="hero-preview-pill">6 min walk • 0.4 km</span>
              </div>

              {/* Mini Map Graphic */}
              <div className="hero-mini-map">
                <svg viewBox="0 0 400 220" className="hero-map-svg">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="400" y2="110" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="170" x2="400" y2="170" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="100" y1="0" x2="100" y2="220" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="200" y1="0" x2="200" y2="220" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="300" y1="0" x2="300" y2="220" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Campus Route */}
                  <path
                    d="M 60 170 Q 150 170 180 120 T 320 70"
                    fill="none"
                    stroke="#F26522"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                  />

                  {/* Start Node */}
                  <circle cx="60" cy="170" r="8" fill="#0F172A" />
                  <circle cx="60" cy="170" r="4" fill="#FFFFFF" />
                  <text x="50" y="198" fill="#0F172A" fontSize="12" fontWeight="600">Main Gate</text>

                  {/* Mid Node */}
                  <circle cx="180" cy="120" r="7" fill="#0D9488" />
                  <text x="140" y="145" fill="#0D9488" fontSize="12" fontWeight="600">Block A</text>

                  {/* Target Node */}
                  <circle cx="320" cy="70" r="10" fill="#F26522" />
                  <circle cx="320" cy="70" r="5" fill="#FFFFFF" />
                  <text x="280" y="50" fill="#F26522" fontSize="13" fontWeight="700">Central Library</text>
                </svg>
              </div>

              {/* Route Summary */}
              <div className="hero-preview-footer">
                <div className="preview-stat">
                  <span className="stat-label">Next Turn</span>
                  <span className="stat-value">Right at Fountain Circle</span>
                </div>
                <div className="preview-stat">
                  <span className="stat-label">Destination Hours</span>
                  <span className="stat-value text-teal">Open till 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="landing-stats-section">
        <div className="container">
          <div className="landing-stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="landing-stat-item">
                <span className="landing-stat-number">{stat.value}</span>
                <span className="landing-stat-desc">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="landing-features-section">
        <div className="container">
          <div className="landing-section-header">
            <span className="landing-section-tag">Engineered for Campus Life</span>
            <h2 className="landing-section-title">Everything you need between classes</h2>
            <p className="landing-section-subtitle">
              No more getting lost on day one, missing club registrations, or losing track of essentials.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="landing-feature-card"
                  onClick={() => navigate(feat.link)}
                >
                  <div className="landing-feature-header">
                    <div className="feature-icon-wrapper">
                      <Icon size={24} />
                    </div>
                    <span className="feature-tag">{feat.tag}</span>
                  </div>
                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.description}</p>
                  <div className="feature-link">
                    <span>Explore</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="landing-cta-banner">
        <div className="container">
          <div className="landing-cta-box">
            <h2 className="cta-box-title">Ready to experience effortless campus life?</h2>
            <p className="cta-box-desc">
              Join thousands of students and faculty using CampusNav every day.
            </p>
            <div className="cta-box-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
              >
                Create Student Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <div className="footer-brand">
            <div className="landing-logo-badge small">
              <MapPin size={18} />
            </div>
            <span className="landing-brand-text">CampusNav</span>
          </div>
          <p className="footer-copy">
            © 2026 CampusNav University Wayfinding Platform. Built for Hackathon.
          </p>
        </div>
      </footer>
    </div>
  );
}
