import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Upload,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCampusData } from '../context/CampusDataContext';
import { campusLocations } from '../data/locations';
import { lostFoundCategories } from '../data/lostFound';
import Button from '../components/ui/Button';
import { uploadLostFoundImage } from '../firebase';
import './PostItem.css';

export default function PostItem() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addLostFoundItem } = useCampusData();

  const [type, setType] = useState('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState(campusLocations[0].name);
  const [customLocation, setCustomLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00 PM');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState(user?.email || 'student@university.edu');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      let finalImageUrl = imagePreview;
      const uid = user?.uid || user?.id || 'usr_student';

      if (imageFile) {
        try {
          const uploadedUrl = await uploadLostFoundImage(imageFile, uid);
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
          }
        } catch (uploadErr) {
          console.warn('Image upload to Storage failed, using local preview:', uploadErr);
        }
      }

      await addLostFoundItem({
        id: `lf_${Date.now()}`,
        type,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location === 'Other' ? customLocation.trim() : location,
        locationId: campusLocations.find((l) => l.name === location)?.id || null,
        date,
        time,
        image: finalImageUrl,
        postedBy: uid,
        postedByName: user?.name || 'Campus Student',
        contact,
        status: 'active',
      });

      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/lost-found');
      }, 1500);
    } catch (err) {
      console.error('Error reporting item:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content post-item-page">
      <div className="container post-item-container">
        {/* Back Link */}
        <button
          className="post-back-btn"
          onClick={() => navigate('/lost-found')}
        >
          <ArrowLeft size={16} />
          <span>Back to Lost & Found Hub</span>
        </button>

        <div className="post-card">
          <div className="post-header">
            <div className="post-logo-wrap">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-headline-lg">Report an Item</h1>
              <p className="text-body-md text-secondary">
                Submit details to notify the campus community and matching security logs.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="post-success-banner">
              <CheckCircle2 size={32} className="success-icon" />
              <h3 className="text-headline-sm">Report Submitted Successfully!</h3>
              <p className="text-body-md text-secondary">
                Your report has been broadcast to the CampusNav feed. Redirecting back...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="post-form">
              {/* Type Toggle */}
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <div className="type-toggle-grid">
                  <button
                    type="button"
                    className={`type-toggle-btn ${type === 'lost' ? 'active-lost' : ''}`}
                    onClick={() => setType('lost')}
                  >
                    <span className="toggle-dot lost-dot" />
                    <span>I Lost An Item</span>
                  </button>
                  <button
                    type="button"
                    className={`type-toggle-btn ${type === 'found' ? 'active-found' : ''}`}
                    onClick={() => setType('found')}
                  >
                    <span className="toggle-dot found-dot" />
                    <span>I Found An Item</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Item Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Blue JBL Wireless Earbuds"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category & Location */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {lostFoundCategories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Campus Location</label>
                  <select
                    className="form-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    {campusLocations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                    <option value="Other">Other / Specific Spot</option>
                  </select>
                </div>
              </div>

              {location === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Specify Location Details</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bench outside Canteen, 2nd floor corridor..."
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Date & Time */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 02:30 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Provide color, brand, distinct marks, or exact room where it was lost/found..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Image Upload Preview */}
              <div className="form-group">
                <label className="form-label">Attach Photo (Optional)</label>
                {imagePreview ? (
                  <div className="image-preview-box">
                    <img src={imagePreview} alt="Upload preview" className="preview-img" />
                    <button
                      type="button"
                      className="remove-img-btn"
                      onClick={handleRemoveImage}
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <Upload size={24} className="upload-icon" />
                    <span className="upload-main-text">Click to upload photo or drag and drop</span>
                    <span className="upload-sub-text">PNG, JPG, WEBP up to 5MB</span>
                  </label>
                )}
              </div>

              {/* Contact Information */}
              <div className="form-group">
                <label className="form-label">Contact Email / Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. your email or phone number"
                  required
                />
                <span className="form-hint">
                  This contact information will be shown to users who want to claim or return the item.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="post-actions-row">
                <Button
                  variant="outline"
                  onClick={() => navigate('/lost-found')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                >
                  Publish Report
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
