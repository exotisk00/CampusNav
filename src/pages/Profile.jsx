import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Settings,
  Globe,
  Edit3,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { uploadAvatar } from '../firebase';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { registeredEventIds, lostFoundItems } = useCampusData();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Anish Kumar',
    email: user?.email || 'anish.kumar@university.edu',
    phone: user?.phone || '+91 98765 43210',
    department: user?.department || 'Computer Science & Engineering',
    year: user?.year || '3rd Year',
    studentId: user?.studentId || 'CSE2024031',
    bio: user?.bio || 'Full-stack developer, hackathon enthusiast, and campus explorer.',
  });

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      year: user.year || '',
      studentId: user.studentId || '',
      bio: user.bio || '',
    });
  }, [user]);

  const handleAvatarChange = async (file, previewUrl) => {
    updateProfile({ avatar: previewUrl });
    const uid = user?.uid || user?.id;
    if (file && uid) {
      setUploadingAvatar(true);
      try {
        const downloadUrl = await uploadAvatar(file, uid);
        if (downloadUrl) {
          updateProfile({ avatar: downloadUrl });
        }
      } catch (err) {
        console.error('Failed to upload avatar:', err);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    await updateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="page-content profile-page">
      <div className="container profile-container">
        {/* Profile Card */}
        <div className="profile-hero-card">
          <div className="profile-header-banner">
            <div className="banner-pattern" />
          </div>

          <div className="profile-hero-body">
            <div className="profile-avatar-row">
              <div className="profile-avatar-container">
                <Avatar
                  src={user?.avatar}
                  name={formData.name}
                  size={96}
                  editable={!uploadingAvatar}
                  className={uploadingAvatar ? 'avatar-uploading' : ''}
                  onImageChange={handleAvatarChange}
                />
              </div>

              <div className="profile-header-actions">
                <Button
                  variant={isEditing ? 'outline' : 'primary'}
                  size="sm"
                  icon={isEditing ? Check : Edit3}
                  onClick={() => {
                    if (isEditing) {
                      handleSave({ preventDefault: () => {} });
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
            </div>

            <div className="profile-title-block">
              <h1 className="text-headline-lg profile-name">{formData.name}</h1>
              <p className="profile-role">
                {formData.department} • {formData.year}
              </p>
              <p className="profile-student-id">Student ID: {formData.studentId}</p>
            </div>

            {saveSuccess && (
              <div className="profile-save-alert">
                <CheckCircle2 size={18} />
                <span>Profile details saved successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="profile-stats-grid">
          <div className="profile-stat-tile">
            <span className="profile-stat-number">{registeredEventIds.size}</span>
            <span className="profile-stat-label">Events Registered</span>
          </div>
          <div className="profile-stat-tile">
            <span className="profile-stat-number">
              {lostFoundItems.filter((i) => i.postedBy === user?.id || i.postedByName === formData.name).length}
            </span>
            <span className="profile-stat-label">Lost & Found Posts</span>
          </div>
          <div className="profile-stat-tile">
            <span className="profile-stat-number">14</span>
            <span className="profile-stat-label">Campus Routes Explored</span>
          </div>
        </div>

        {/* Details & Quick Links Grid */}
        <div className="profile-details-grid">
          {/* Main Info Form / View */}
          <div className="profile-info-card">
            <div className="info-card-header">
              <h2 className="text-headline-sm">Academic & Personal Details</h2>
              <span className="text-body-sm text-secondary">
                {isEditing ? 'Editing details' : 'Verified Student'}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="profile-edit-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year of Study</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.studentId}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">About / Bio</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="profile-form-actions">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Details
                  </Button>
                </div>
              </form>
            ) : (
              <div className="profile-view-list">
                <div className="profile-view-item">
                  <Mail size={18} className="view-item-icon" />
                  <div className="view-item-text">
                    <span className="view-item-label">University Email</span>
                    <span className="view-item-value">{formData.email}</span>
                  </div>
                </div>

                <div className="profile-view-item">
                  <Phone size={18} className="view-item-icon" />
                  <div className="view-item-text">
                    <span className="view-item-label">Phone</span>
                    <span className="view-item-value">{formData.phone}</span>
                  </div>
                </div>

                <div className="profile-view-item">
                  <GraduationCap size={18} className="view-item-icon" />
                  <div className="view-item-text">
                    <span className="view-item-label">Department</span>
                    <span className="view-item-value">{formData.department}</span>
                  </div>
                </div>

                <div className="profile-view-item">
                  <Calendar size={18} className="view-item-icon" />
                  <div className="view-item-text">
                    <span className="view-item-label">Member Since</span>
                    <span className="view-item-value">August 2024</span>
                  </div>
                </div>

                <div className="profile-bio-box">
                  <span className="view-item-label">Bio</span>
                  <p className="profile-bio-text">{formData.bio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Settings Shortcuts */}
          <div className="profile-shortcuts-col">
            <div className="profile-info-card">
              <h3 className="text-title-md" style={{ marginBottom: '16px' }}>
                Account & Preferences
              </h3>

              <div className="shortcut-buttons-list">
                <button
                  className="profile-shortcut-tile"
                  onClick={() => navigate('/settings')}
                >
                  <div className="shortcut-icon-wrap">
                    <Settings size={20} />
                  </div>
                  <div className="shortcut-text-wrap">
                    <span className="shortcut-title">Settings</span>
                    <span className="shortcut-desc">Notifications, theme & privacy</span>
                  </div>
                </button>

                <button
                  className="profile-shortcut-tile"
                  onClick={() => navigate('/language')}
                >
                  <div className="shortcut-icon-wrap">
                    <Globe size={20} />
                  </div>
                  <div className="shortcut-text-wrap">
                    <span className="shortcut-title">Language</span>
                    <span className="shortcut-desc">English, हिन्दी, தமிழ் & more</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
