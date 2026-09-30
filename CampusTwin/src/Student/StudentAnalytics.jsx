import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { BarChart2, PieChart as PieIcon, CheckCircle2, Award, Briefcase } from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StudentAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getStudentAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader message="Generating academic telemetry & charts..." />;
  }

  const attendance = data?.attendance || {
    totalClasses: 0,
    attendedClasses: 0,
    overallAttendance: 0,
    subjectAttendance: []
  };

  const hasAttendanceData = attendance.totalClasses > 0;

  // Doughnut Chart Data for Overall Attendance
  const doughnutData = {
    labels: ['Attended Classes', 'Absent Classes'],
    datasets: [
      {
        data: [
          attendance.attendedClasses,
          attendance.totalClasses - attendance.attendedClasses
        ],
        backgroundColor: ['#2E9B67', '#D9534F'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  // Bar Chart Data for Subject Attendance
  const subjectLabels = attendance.subjectAttendance.map((s) => s.subject);
  const subjectPercentages = attendance.subjectAttendance.map((s) => s.percentage);

  const barData = {
    labels: subjectLabels,
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: subjectPercentages,
        backgroundColor: '#7C5CFC',
        borderRadius: 8
      }
    ]
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <BarChart2 size={24} color="var(--primary)" /> Academic Analytics
          </h2>
          <p className="page-subtitle">
            Real-time analytics computed directly from your academic records
          </p>
        </div>
      </div>

      {/* Key Metric Overview */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Overall Attendance</span>
            <span className="stat-value">{attendance.overallAttendance}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              {attendance.attendedClasses} of {attendance.totalClasses} attended
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Campus Badges</span>
            <span className="stat-value">{data?.badgesCount || 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              {data?.points || 0} Points earned
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Job Applications</span>
            <span className="stat-value">{data?.placement?.total || 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Career applications
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}
          >
            <BarChart2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Subjects Tracked</span>
            <span className="stat-value">{attendance.subjectAttendance.length}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Enrolled courses
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid-cols-2">
        <Card title="Attendance Ratio">
          {!hasAttendanceData ? (
            <EmptyState
              icon={PieIcon}
              title="No attendance records"
              description="Your attendance ratio chart will populate once your attendance is marked."
            />
          ) : (
            <div style={{ height: 280, display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            </div>
          )}
        </Card>

        <Card title="Subject-wise Attendance Distribution">
          {attendance.subjectAttendance.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="No course attendance data"
              description="Subject-wise statistics will render when classes are recorded."
            />
          ) : (
            <div style={{ height: 280 }}>
              <Bar data={barData} options={barOptions} />
            </div>
          )}
        </Card>
      </div>

      {/* Subject-Wise Summary Table */}
      {attendance.subjectAttendance.length > 0 && (
        <Card title="Subject Attendance Breakdown">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Classes Conducted</th>
                  <th>Classes Attended</th>
                  <th>Attendance %</th>
                  <th>Eligibility Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.subjectAttendance.map((sub, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{sub.subject}</td>
                    <td>{sub.total}</td>
                    <td>{sub.attended}</td>
                    <td style={{ fontWeight: 700 }}>{sub.percentage}%</td>
                    <td>
                      <span
                        className={`status-badge ${
                          sub.percentage >= 75 ? 'present' : 'absent'
                        }`}
                      >
                        {sub.percentage >= 75 ? 'Eligible (>=75%)' : 'Shortage (<75%)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentAnalytics;
