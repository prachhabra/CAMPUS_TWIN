import React, { useEffect, useState } from 'react';
import { confessionService } from '../services/confessionService';
import { useToast } from '../context/ToastContext';
import { CONFESSION_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Pagination from '../components/Pagination';
import { MessageSquareQuote, Plus, Heart, Filter, ShieldCheck, Sparkles } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const StudentConfession = () => {
  const { showSuccess, showError } = useToast();

  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      const res = await confessionService.getApproved({
        page,
        limit: 12,
        category: selectedCategory,
        sort: sortOption
      });
      if (res.success) {
        setConfessions(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to load confessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, [page, selectedCategory, sortOption]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showError('Please write your confession');
      return;
    }

    try {
      setSubmitting(true);
      const res = await confessionService.create({
        content: content.trim(),
        category,
        anonymous: true
      });
      showSuccess(res.message || 'Confession submitted! (+5 Campus Points)');
      setShowSubmitModal(false);
      setContent('');
      fetchConfessions();
    } catch (err) {
      showError(err.message || 'Failed to submit confession');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await confessionService.toggleLike(id);
      setConfessions((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, isLiked: res.isLiked, likeCount: res.likeCount }
            : c
        )
      );
    } catch (err) {
      showError('Failed to record like');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <MessageSquareQuote size={24} color="var(--primary)" /> Anonymous Campus Wall
          </h2>
          <p className="page-subtitle">
            Share unspoken thoughts, campus vibes, and advice completely anonymously
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowSubmitModal(true)}>
          <Plus size={18} /> Post Anonymous Confession
        </button>
      </div>

      {/* Filter and Sort Bar */}
      <Card>
        <div className="filters-bar" style={{ marginBottom: 0, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Filter size={16} color="var(--muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 160 }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              {CONFESSION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--background)',
              borderRadius: 'var(--radius-md)',
              padding: 3,
              gap: 4
            }}
          >
            <button
              type="button"
              onClick={() => setSortOption('recent')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: sortOption === 'recent' ? 'var(--surface)' : 'transparent',
                color: sortOption === 'recent' ? 'var(--primary)' : 'var(--muted)',
                boxShadow: sortOption === 'recent' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => setSortOption('popular')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: sortOption === 'popular' ? 'var(--surface)' : 'transparent',
                color: sortOption === 'popular' ? 'var(--primary)' : 'var(--muted)',
                boxShadow: sortOption === 'popular' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              Most Liked
            </button>
          </div>
        </div>
      </Card>

      {/* Confessions Grid */}
      {loading ? (
        <Loader message="Loading anonymous thoughts..." />
      ) : confessions.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="The campus wall is quiet"
          description="Be the first to share an anonymous story or thought with the college community!"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowSubmitModal(true)}>
              <Plus size={16} /> Write First Confession
            </button>
          }
        />
      ) : (
        <div className="grid-cols-3">
          {confessions.map((c) => (
            <Card
              key={c._id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 22,
                position: 'relative'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12
                  }}
                >
                  <span className="status-badge student">{c.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {formatDate(c.createdAt)}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text)',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    marginBottom: 16
                  }}
                >
                  "{c.content}"
                </p>
              </div>

              <div
                style={{
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.75rem',
                    color: 'var(--muted)'
                  }}
                >
                  <ShieldCheck size={14} color="var(--success)" />
                  <span>100% Anonymous</span>
                </div>

                <button
                  onClick={() => handleLike(c._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: c.isLiked ? 'var(--danger-light)' : 'var(--background)',
                    color: c.isLiked ? 'var(--danger)' : 'var(--muted)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                  aria-label="Like confession"
                >
                  <Heart size={14} fill={c.isLiked ? 'currentColor' : 'none'} />
                  <span>{c.likeCount || 0}</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={12}
        onPageChange={setPage}
      />

      {/* Post Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Post Anonymous Campus Confession"
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(124, 92, 252, 0.2)',
              marginBottom: 16,
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <ShieldCheck size={20} color="var(--accent)" flexShrink={0} />
            <span>
              Your identity is protected and strictly excluded from the public board. Confessions undergo administrative review before publishing.
            </span>
          </div>

          <FormField label="Category" required>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CONFESSION_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Confession Text" required>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Write your thought, campus observation, or message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'right', marginTop: 2 }}>
              {content.length} / 1000 characters
            </span>
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSubmitModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Post Anonymously'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentConfession;
