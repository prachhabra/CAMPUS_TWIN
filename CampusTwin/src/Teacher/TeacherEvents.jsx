import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EVENT_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import Pagination from '../components/Pagination';
import { Calendar, Plus, Users, Clock, MapPin, Trash2, Edit2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const TeacherEvents = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    venue: '',
    category: 'Technical',
    registrationLimit: 100,
    status: 'upcoming'
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({ page, limit: 10 });
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
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.venue) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, formData);
        showSuccess('Event updated successfully!');
      } else {
        await eventService.createEvent(formData);
        showSuccess('Event created and published on campus calendar!');
      }
      setShowCreateModal(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        venue: '',
        category: 'Technical',
        registrationLimit: 100,
        status: 'upcoming'
      });
      fetchEvents();
    } catch (err) {
      showError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      showSuccess('Event deleted');
      fetchEvents();
      if (selectedEvent) setSelectedEvent(null);
    } catch (err) {
      showError(err.message || 'Failed to delete event');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Calendar size={24} color="var(--primary)" /> Campus Event Management
          </h2>
          <p className="page-subtitle">
            Organize workshops, guest lectures, seminars, and oversee attendee registrations
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              description: '',
              date: new Date().toISOString().split('T')[0],
              time: '10:00 AM',
              venue: '',
              category: 'Technical',
              registrationLimit: 100,
              status: 'upcoming'
            });
            setShowCreateModal(true);
          }}
        >
          <Plus size={18} /> Schedule New Event
        </button>
      </div>

      <Card>
        {loading ? (
          <Loader message="Loading event schedules..." />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events scheduled"
            description="Create the first seminar, workshop, or technical hackathon."
            action={
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={14} /> Schedule Event
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt._id}>
                    <td style={{ fontWeight: 700, color: 'var(--text)' }}>{evt.title}</td>
                    <td>
                      <span className="status-badge student">{evt.category}</span>
                    </td>
                    <td>{formatDate(evt.date)} • {evt.time}</td>
                    <td>{evt.venue}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {evt.registeredStudents?.length || 0} / {evt.registrationLimit}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={evt.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedEvent(evt)}
                        >
                          <Users size={13} /> RSVPs
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingEvent(evt);
                            setFormData({
                              title: evt.title,
                              description: evt.description,
                              date: evt.date ? evt.date.split('T')[0] : '',
                              time: evt.time,
                              venue: evt.venue,
                              category: evt.category,
                              registrationLimit: evt.registrationLimit,
                              status: evt.status
                            });
                            setShowCreateModal(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(evt._id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={10}
          onPageChange={setPage}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingEvent ? 'Edit Event Schedule' : 'Schedule Campus Event'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Event Title" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AI in Healthcare Symposium"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                {EVENT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Event Status" required>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FormField label="Date" required>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Time" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 10:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Attendee Limit" required>
              <input
                type="number"
                className="form-input"
                min="10"
                value={formData.registrationLimit}
                onChange={(e) => setFormData({ ...formData, registrationLimit: parseInt(e.target.value, 10) })}
                required
              />
            </FormField>
          </div>

          <FormField label="Campus Venue / Auditorium" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sir C.V. Raman Auditorium / Seminar Hall 2"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Event Description" required>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Agenda, prerequisites, speakers, and topics covered..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingEvent ? 'Save Updates' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RSVPs Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Registered Attendees: ${selectedEvent.title}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>Capacity: {selectedEvent.registrationLimit}</span>
              <span>Total Booked: <strong>{selectedEvent.registeredStudents?.length || 0} Students</strong></span>
            </div>

            {(!selectedEvent.registeredStudents || selectedEvent.registeredStudents.length === 0) ? (
              <EmptyState
                icon={Users}
                title="No attendees registered yet"
                description="Students who RSVP for this event will appear in this verified roster."
              />
            ) : (
              <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedEvent.registeredStudents.map((reg, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{reg.student?.name || 'Enrolled Student'}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                        Roll No: {reg.student?.rollNumber || 'N/A'} • {reg.student?.department}
                      </div>
                    </div>
                    <span style={{ color: 'var(--muted)' }}>{formatDate(reg.registeredAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherEvents;
