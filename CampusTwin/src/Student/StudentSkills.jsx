import React, { useEffect, useState } from 'react';
import { skillService } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SKILL_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Sparkles, Plus, Search, MessageSquare, Trash2, Send } from 'lucide-react';

const StudentSkills = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showAddModal, setShowAddModal] = useState(false);
  const [connectModalSkill, setConnectModalSkill] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    skill: '',
    category: 'Programming',
    level: 'Intermediate',
    description: '',
    availability: 'Flexible'
  });

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await skillService.getSkills({
        category: selectedCategory,
        q: searchQuery
      });
      if (res.success) {
        setSkills(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSkills();
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!formData.skill || !formData.description) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await skillService.createSkill(formData);
      showSuccess('Skill added to campus exchange! (+15 Campus Points)');
      setShowAddModal(false);
      setFormData({
        skill: '',
        category: 'Programming',
        level: 'Intermediate',
        description: '',
        availability: 'Flexible'
      });
      fetchSkills();
    } catch (err) {
      showError(err.message || 'Failed to offer skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await skillService.connect(connectModalSkill._id, connectMessage);
      showSuccess(res.message || 'Connection request sent to tutor!');
      setConnectModalSkill(null);
      setConnectMessage('');
    } catch (err) {
      showError(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (skillId) => {
    try {
      await skillService.deleteSkill(skillId);
      showSuccess('Skill listing removed');
      fetchSkills();
    } catch (err) {
      showError(err.message || 'Failed to remove');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Sparkles size={24} color="var(--primary)" /> Peer Skill Exchange
          </h2>
          <p className="page-subtitle">
            Learn from peers or mentor other students in programming, UI/UX, languages, and tools
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Offer a Skill
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search skills (e.g. React, Python, Figma, French, Calculus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {SKILL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Skills Grid */}
      {loading ? (
        <Loader message="Loading peer mentor skills..." />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No skills listed yet"
          description="Be the first to share your talent or proficiency with your campus peers!"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Offer Your Skill
            </button>
          }
        />
      ) : (
        <div className="grid-cols-3">
          {skills.map((item) => {
            const isOwner = (item.user?._id || item.user)?.toString() === user?._id?.toString();

            return (
              <Card
                key={item._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 20
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}
                  >
                    <span className="status-badge student">{item.category}</span>
                    <span className="status-badge ongoing" style={{ fontSize: '0.7rem' }}>
                      {item.level}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginBottom: 8
                    }}
                  >
                    {item.skill}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      marginBottom: 14,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div>Offered by: <strong>{item.user?.name || 'Fellow Peer'}</strong></div>
                    <div style={{ marginTop: 2 }}>Availability: <strong>{item.availability}</strong></div>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {isOwner ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={14} /> Remove Listing
                    </button>
                  ) : (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => setConnectModalSkill(item)}
                    >
                      <MessageSquare size={14} /> Request Connect
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Offer Skill Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Offer a Skill on Campus Exchange"
      >
        <form onSubmit={handleCreateSkill}>
          <FormField label="Skill Name" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React.js & Web Development / Guitar Fundamentals"
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Category" required>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {SKILL_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Proficiency Level" required>
              <select
                className="form-select"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </FormField>
          </div>

          <FormField label="Availability" required>
            <select
              className="form-select"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            >
              <option value="Flexible">Flexible Schedule</option>
              <option value="Weekdays">Weekdays After Classes</option>
              <option value="Weekends">Weekends Only</option>
            </select>
          </FormField>

          <FormField label="Description of Mentorship / Exchange" required>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="What can you teach? What projects have you worked on? Would you like to exchange for another skill?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Offer Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Connect Modal */}
      {connectModalSkill && (
        <Modal
          isOpen={!!connectModalSkill}
          onClose={() => setConnectModalSkill(null)}
          title={`Connect with ${connectModalSkill.user?.name || 'Peer Mentor'}`}
        >
          <form onSubmit={handleConnect}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Send an introductory note to <strong>{connectModalSkill.user?.name}</strong> regarding their{' '}
              <strong>{connectModalSkill.skill}</strong> skill offer.
            </p>

            <FormField label="Introductory Note (Optional)">
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Hi, I'm working on a project / preparing for coursework and would love guidance on this topic..."
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConnectModalSkill(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-accent" disabled={submitting}>
                <Send size={16} /> {submitting ? 'Sending...' : 'Send Connect Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentSkills;
