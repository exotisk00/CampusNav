import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import './Signup.css';

import { translateAuthError } from '../firebase';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    password: '',
    confirmPassword: '',
    terms: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Electrical & Electronics',
    'Biotechnology',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.terms) {
      setError('You must agree to campus terms & policies.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        year: formData.year,
        studentId: 'STU' + Math.floor(100000 + Math.random() * 900000),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container signup-container">
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
            <h1 className="text-headline-lg">Join CampusNav</h1>
            <p className="auth-subtext">
              Create your verified student account to navigate campus and connect with peers.
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
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">University Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="rollno@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year of Study</label>
                <select
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="Min 8 chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <span>
                  I agree to the University Honor Code & CampusNav terms.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Create Student Account
            </Button>
          </form>

          <div className="auth-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <Link to="/" className="auth-back-link">
          ← Back to campus home
        </Link>
      </div>
    </div>
  );
}
