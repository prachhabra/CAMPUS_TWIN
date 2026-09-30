import React, { useEffect, useState } from 'react';
import { classService } from '../services/classService';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { DEPARTMENTS, YEARS } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Layers, Plus, Users, UserPlus, Trash2, Edit2, BookOpen } from 'lucide-react';

const TeacherClasses = () => {
  const { showSuccess, showError } = useToast();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [studentRollOrId, setStudentRollOrId] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subject: '',
    department: DEPARTMENTS[0],
    year: YEARS[0],
    semester: 'Semester 1',
    schedule: ''
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getTeacherClasses();
      if (res.success) {
        setClasses(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.subject) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingClass) {
        await classService.updateClass(editingClass._id, formData);
        showSuccess('Class details updated successfully!');
      } else {
        await classService.createClass(formData);
        showSuccess('Class created successfully!');
      }
      setShowCreateModal(false);
      setEditingClass(null);
      setFormData({
        name: '',
        code: '',
        subject: '',
        department: DEPARTMENTS[0],
        year: YEARS[0],
        semester: 'Semester 1',
        schedule: ''
      });
      fetchClasses();
    } catch (err) {
      showError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await classService.deleteClass(id);
      showSuccess('Class deleted');
      fetchClasses();
      if (selectedClass) setSelectedClass(null);
    } catch (err) {
      showError(err.message || 'Failed to delete class');
    }
  };

  const handleOpenEnrollModal = async (classObj) => {
    setSelectedClass(classObj);
    try {
      // Fetch student roster for direct selection
      const res = await authService.getProfile(); // or dedicated getStudents
      setShowEnrollModal(true);
    } catch (e) {
      setShowEnrollModal(true);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!studentRollOrId.trim()) return;

    try {
      setSubmitting(true);
      await classService.enrollStudent(selectedClass._id, studentRollOrId.trim());
      showSuccess('Student enrolled into class!');
      setStudentRollOrId('');
      setShowEnrollModal(false);
      fetchClasses();
    } catch (err) {
      showError(err.message || 'Failed to enroll student. Ensure valid Student ObjectId.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await classService.removeStudent(selectedClass._id, studentId);
      showSuccess('Student removed from course roster');
      // Update selectedClass view
      setSelectedClass((prev) => ({
        ...prev,
        students: prev.students.filter((s) => (s._id || s) !== studentId)
      }));
      fetchClasses();
    } catch (err) {
      showError(err.message || 'Failed to remove student');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Layers size={24} color="var(--primary)" /> Academic Classes & Courses
          </h2>
          <p className="page-subtitle">
            Configure lecture subjects, schedules, and manage enrolled student rosters
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingClass(null);
            setFormData({
              name: '',
              code: '',
              subject: '',
              department: DEPARTMENTS[0],
              year: YEARS[0],
              semester: 'Semester 1',
              schedule: ''
            });
            setShowCreateModal(true);
          }}
        >
          <Plus size={18} /> Create New Class
        </button>
      </div>

      {loading ? (
        <Loader message="Loading assigned courses..." />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No classes created yet"
          description="Create your first classroom code to begin enrolling students and generating attendance."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Course
            </button>
          }
        />
      ) : (
        <div className="grid-cols-3">
          {classes.map((cls) => (
            <Card
              key={cls._id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 20
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <code
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontWeight: 700
                    }}
                  >
                    {cls.code}
                  </code>
                  <span className="status-badge student">
                    <Users size={12} /> {cls.students?.length || 0} Students
                  </span>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  {cls.name}
                </h3>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {cls.subject}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                  {cls.department} • {cls.year} • {cls.semester}
                </div>

                {cls.schedule && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                    <strong>Schedule:</strong> {cls.schedule}
                  </div>
                )}
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
                  onClick={() => setSelectedClass(cls)}
                >
                  <Users size={14} /> Student Roster
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingClass(cls);
                      setFormData({
                        name: cls.name,
                        code: cls.code,
                        subject: cls.subject,
                        department: cls.department,
                        year: cls.year,
                        semester: cls.semester,
                        schedule: cls.schedule || ''
                      });
                      setShowCreateModal(true);
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteClass(cls._id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingClass ? 'Edit Course Details' : 'Create New Course / Class'}
      >
        <form onSubmit={handleCreateOrUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Class Name" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech CS 3rd Year - Section A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Class Unique Code" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CS301A"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Subject / Course" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Database Management Systems"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Department" required>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Academic Year" required>
              <select
                className="form-select"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Semester" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Semester 5"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Lecture Timing / Schedule">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Mon, Wed 10:00 AM - 11:30 AM (Room 402)"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
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
              {submitting ? 'Saving...' : editingClass ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Roster Modal */}
      {selectedClass && (
        <Modal
          isOpen={!!selectedClass}
          onClose={() => setSelectedClass(null)}
          title={`Enrolled Students: ${selectedClass.name} (${selectedClass.code})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                Total Enrolled: <strong>{selectedClass.students?.length || 0} Students</strong>
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowEnrollModal(true)}
              >
                <UserPlus size={14} /> Enroll Student ID
              </button>
            </div>

            {(!selectedClass.students || selectedClass.students.length === 0) ? (
              <EmptyState
                icon={Users}
                title="No students enrolled yet"
                description="Use the button above to enroll student user IDs or provide the class code for student self-registration."
              />
            ) : (
              <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedClass.students.map((st) => (
                  <div
                    key={st._id || st}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{st.name || 'Student'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        Roll No: {st.rollNumber || 'N/A'} • {st.email}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveStudent(st._id || st)}
                      title="Remove student from class"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Enroll by Student User ID Modal */}
      {showEnrollModal && (
        <Modal
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          title="Enroll Student in Class"
        >
          <form onSubmit={handleEnrollStudent}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Enter the student's unique user ID or copy it from the Students Directory to assign them to {selectedClass?.name}.
            </p>

            <FormField label="Student MongoDB User ID" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 660f845231c9451..."
                value={studentRollOrId}
                onChange={(e) => setStudentRollOrId(e.target.value)}
                required
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEnrollModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherClasses;
