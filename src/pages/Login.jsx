import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import './Login.css';

import { translateAuthError } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('anish.kumar@university.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setEmail('anish.kumar@university.edu');
    setPassword('password123');
    setLoading(true);
    try {
      if (loginDemo) {
        await loginDemo();
      } else {
        await login('anish.kumar@university.edu', 'password123');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Brand Header */}
        <Link to="/" className="auth-brand">
          <div className="auth-logo-badge">
            <MapPin size={24} />
          </div>
          <span className="auth-brand-text">CampusNav</span>
        </Link>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="text-headline-lg">Welcome Back</h1>
            <p className="auth-subtext">
              Sign in to access campus maps, event RSVPs, and reports.
            </p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">University Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => setForgotModal(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked className="form-checkbox" />
                <span>Remember me on this device</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In to CampusNav
            </Button>

            <button
              type="button"
              className="demo-login-btn"
              onClick={handleDemoLogin}
            >
              <Sparkles size={16} />
              <span>Instant Demo Login (Auto-fill)</span>
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account? </span>
            <Link to="/signup" className="auth-link">
              Create student account
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <Link to="/" className="auth-back-link">
          ← Back to campus home
        </Link>
      </div>

      {/* Forgot Password Dialog */}
      {forgotModal && (
        <div className="modal-overlay" onClick={() => setForgotModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-headline-sm">Reset Password</h3>
              <button
                className="modal-close"
                onClick={() => setForgotModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="text-body-md" style={{ marginBottom: '16px' }}>
                Since this is a hackathon demo preview, enter your university email and we will simulate sending a password reset link.
              </p>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">University Email</label>
                <input
                  type="email"
                  className="form-input"
                  defaultValue="anish.kumar@university.edu"
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  alert('Demo reset instructions sent to your university email!');
                  setForgotModal(false);
                }}
              >
                Send Reset Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
