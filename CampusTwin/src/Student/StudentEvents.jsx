import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EVENT_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const StudentEvents = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({
        page,
        limit: 9,
        category: selectedCategory,
        q: searchQuery
      });
      if (res.success) {
        setEvents(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleRegister = async (eventId) => {
    try {
      setActionLoading(true);
      const res = await eventService.register(eventId);
      showSuccess(res.message || 'Successfully registered for event! (+20 Campus Points)');
      fetchEvents();
      if (selectedEvent) {
        setSelectedEvent(res.data);
      }
    } catch (err) {
      showError(err.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      setActionLoading(true);
      const res = await eventService.cancelRegistration(eventId);
      showSuccess(res.message || 'Registration cancelled');
      fetchEvents();
      if (selectedEvent) {
        setSelectedEvent(res.data);
      }
    } catch (err) {
      showError(err.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const isUserRegistered = (event) => {
    if (!event || !event.registeredStudents) return false;
    return event.registeredStudents.some(
      (r) => (r.student?._id || r.student)?.toString() === user?._id?.toString()
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Calendar size={24} color="var(--primary)" /> Campus Events & Hackathons
          </h2>
          <p className="page-subtitle">
            Explore workshops, seminars, cultural fests, and technical competitions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events by title, organizer, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            {EVENT_CATEGORIES.map((cat) => (
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

      {/* Events Grid */}
      {loading ? (
        <Loader message="Loading campus event calendar..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events scheduled"
          description="There are currently no events matching your criteria. Check back soon!"
        />
      ) : (
        <div className="grid-cols-3">
          {events.map((evt) => {
            const registered = isUserRegistered(evt);
            const regCount = evt.registeredStudents?.length || 0;
            const isFull = regCount >= evt.registrationLimit;

            return (
              <Card
                key={evt._id}
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
                      alignItems: 'flex-start',
                      marginBottom: 10
                    }}
                  >
                    <span className="status-badge student" style={{ fontSize: '0.75rem' }}>
                      <Tag size={12} /> {evt.category}
                    </span>
                    <StatusBadge status={evt.status} />
                  </div>

                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginBottom: 8,
                      lineHeight: 1.3
                    }}
                  >
                    {evt.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {evt.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      fontSize: '0.78125rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="var(--primary)" /> {formatDate(evt.date)} at {evt.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="var(--primary)" /> {evt.venue}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} color="var(--primary)" /> {regCount} / {evt.registrationLimit} Registered
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedEvent(evt)}
                  >
                    Details
                  </button>

                  {registered ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelRegistration(evt._id)}
                      disabled={actionLoading}
                    >
                      <XCircle size={14} /> Cancel RSVP
                    </button>
                  ) : (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => handleRegister(evt._id)}
                      disabled={actionLoading || isFull || evt.status !== 'upcoming'}
                    >
                      <CheckCircle2 size={14} />
                      {isFull ? 'Sold Out' : 'Register (+20 Pts)'}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={9}
        onPageChange={setPage}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          footer={
            <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'space-between' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>

              {isUserRegistered(selectedEvent) ? (
                <button
                  className="btn btn-danger"
                  onClick={() => handleCancelRegistration(selectedEvent._id)}
                  disabled={actionLoading}
                >
                  Cancel Registration
                </button>
              ) : (
                <button
                  className="btn btn-accent"
                  onClick={() => handleRegister(selectedEvent._id)}
                  disabled={
                    actionLoading ||
                    (selectedEvent.registeredStudents?.length || 0) >= selectedEvent.registrationLimit ||
                    selectedEvent.status !== 'upcoming'
                  }
                >
                  Register Now
                </button>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="status-badge student">{selectedEvent.category}</span>
              <StatusBadge status={selectedEvent.status} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                Organized by: <strong>{selectedEvent.organizer}</strong>
              </span>
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {selectedEvent.description}
            </p>

            <div
              style={{
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.875rem'
              }}
            >
              <div><strong>Date & Time:</strong> {formatDate(selectedEvent.date)} at {selectedEvent.time}</div>
              <div><strong>Venue:</strong> {selectedEvent.venue}</div>
              <div>
                <strong>Capacity:</strong> {selectedEvent.registeredStudents?.length || 0} of {selectedEvent.registrationLimit} seats booked
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentEvents;
