import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { lostFoundCategories } from '../data/lostFound';
import { useCampusData } from '../context/CampusDataContext';
import { SegmentedTabs } from '../components/ui/Tabs';
import FilterChips from '../components/ui/FilterChips';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import './LostFound.css';

export default function LostFound() {
  const navigate = useNavigate();
  const { lostFoundItems: items } = useCampusData();
  const [typeTab, setTypeTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const tabs = [
    { value: 'all', label: 'All Items', count: items.length },
    { value: 'lost', label: 'Lost Items', count: items.filter((i) => i.type === 'lost').length },
    { value: 'found', label: 'Found Items', count: items.filter((i) => i.type === 'found').length },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchType = typeTab === 'all' || item.type === typeTab;
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchCat && matchSearch;
    });
  }, [items, typeTab, selectedCategory, searchQuery]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setActiveItemModal(null);
    }, 1800);
  };

  return (
    <div className="page-content lost-found-page">
      <div className="container">
        {/* Page Header */}
        <div className="lost-found-header">
          <div>
            <div className="lf-header-tag">
              <Package size={16} />
              <span>Campus Community Service</span>
            </div>
            <h1 className="text-display-lg lf-title">Lost & Found Hub</h1>
            <p className="lf-subtitle">
              Lost an item on campus or found someone's belonging? Connect with fellow students to return items safely.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={PlusCircle}
            onClick={() => navigate('/lost-found/post')}
          >
            Report Item
          </Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="lf-controls-card">
          <div className="lf-controls-top">
            <SegmentedTabs
              tabs={tabs}
              activeTab={typeTab}
              onChange={setTypeTab}
              className="lf-type-tabs"
            />

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by keyword, item name, or location..."
              className="lf-search-bar"
            />
          </div>

          <div className="lf-category-scroll">
            <FilterChips
              options={lostFoundCategories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="lf-items-grid">
          {filteredItems.length === 0 ? (
            <div className="lf-empty-state">
              <Package size={48} className="empty-icon" />
              <h3 className="text-headline-sm">No items found</h3>
              <p className="text-body-md text-secondary">
                Try clearing your search filters or report a new item if yours isn't listed.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setTypeTab('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isFound = item.type === 'found';
              const isResolved = item.status === 'resolved';
              return (
                <div
                  key={item.id}
                  className={`lf-card ${isResolved ? 'resolved' : ''}`}
                  onClick={() => setActiveItemModal(item)}
                >
                  <div className="lf-card-header">
                    <Badge variant={isFound ? 'found' : 'lost'}>
                      {isResolved ? 'Resolved' : item.type}
                    </Badge>
                    <Badge variant="category">{item.category}</Badge>
                  </div>

                  <h3 className="lf-card-title">{item.title}</h3>
                  <p className="lf-card-desc">{item.description}</p>

                  <div className="lf-card-meta">
                    <div className="lf-meta-row">
                      <MapPin size={14} className="meta-icon" />
                      <span>{item.location}</span>
                    </div>
                    <div className="lf-meta-row">
                      <Calendar size={14} className="meta-icon" />
                      <span>{item.date} • {item.time}</span>
                    </div>
                  </div>

                  <div className="lf-card-footer">
                    <div className="lf-reporter-info">
                      <User size={14} className="reporter-icon" />
                      <span>{item.postedByName}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveItemModal(item);
                      }}
                    >
                      {isFound ? 'Claim Item' : 'I Found This'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Item Detail & Contact Modal */}
      {activeItemModal && (
        <Modal
          isOpen={Boolean(activeItemModal)}
          onClose={() => setActiveItemModal(null)}
          title={activeItemModal.title}
          size="md"
        >
          <div className="lf-modal-content">
            <div className="lf-modal-badges">
              <Badge variant={activeItemModal.type === 'found' ? 'found' : 'lost'}>
                {activeItemModal.type.toUpperCase()}
              </Badge>
              <Badge variant="category">{activeItemModal.category}</Badge>
              {activeItemModal.status === 'resolved' && (
                <Badge variant="default">Resolved</Badge>
              )}
            </div>

            <div className="lf-modal-info-box">
              <div className="modal-info-item">
                <span className="info-label">Reported Location</span>
                <span className="info-value">
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {activeItemModal.location}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="info-label">Date & Time</span>
                <span className="info-value">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {activeItemModal.date} at {activeItemModal.time}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="info-label">Reported By</span>
                <span className="info-value">{activeItemModal.postedByName}</span>
              </div>
              <div className="modal-info-item">
                <span className="info-label">Direct Contact</span>
                <span className="info-value text-primary">{activeItemModal.contact}</span>
              </div>
            </div>

            <div className="lf-modal-desc-box">
              <h4 className="text-title-md" style={{ marginBottom: '8px' }}>
                Item Description
              </h4>
              <p className="text-body-md text-secondary">
                {activeItemModal.description}
              </p>
            </div>

            {/* Simulated claim / message form */}
            <div className="lf-contact-form-box">
              <h4 className="text-title-md" style={{ marginBottom: '8px' }}>
                {activeItemModal.type === 'found'
                  ? 'Claim this item (Provide proof of ownership)'
                  : 'Have you seen this item?'}
              </h4>

              {contactSuccess ? (
                <div className="contact-success-alert">
                  <CheckCircle2 size={20} />
                  <span>Message sent to {activeItemModal.postedByName}! They will contact you shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <textarea
                    className="lf-contact-textarea"
                    placeholder={
                      activeItemModal.type === 'found'
                        ? 'Describe identifying details (e.g. serial number, scratches, wallpaper, contents)...'
                        : 'Tell the owner where you saw it or how they can reach you...'
                    }
                    required
                    rows={3}
                  />
                  <div className="modal-actions-row">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        navigate(
                          activeItemModal.locationId
                            ? `/map?location=${activeItemModal.locationId}`
                            : '/map'
                        )
                      }
                      icon={Navigation}
                    >
                      View on Map
                    </Button>
                    <Button type="submit" variant="primary">
                      Send Secure Message
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
