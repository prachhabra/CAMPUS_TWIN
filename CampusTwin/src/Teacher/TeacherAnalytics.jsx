import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { BarChart2, Users, Layers, CalendarCheck } from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TeacherAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getTeacherAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load faculty analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader message="Compiling lecture attendance analytics..." />;
  }

  const subjectStats = data?.subjectStats || [];
  const barLabels = subjectStats.map((s) => s.subject);
  const barRates = subjectStats.map((s) => s.rate);

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Average Class Attendance Rate (%)',
        data: barRates,
        backgroundColor: '#243B6B',
        borderRadius: 8
      }
    ]
  };

  const barChartOptions = {
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
            <BarChart2 size={24} color="var(--primary)" /> Academic & Instruction Analytics
          </h2>
          <p className="page-subtitle">
            Aggregated lecture attendance rates and course enrollment telemetry
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Classes</span>
            <span className="stat-value">{data?.classCount || 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Active instruction courses
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Enrolled Students</span>
            <span className="stat-value">{data?.totalStudents || 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Unique registered scholars
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}
          >
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Attendance Logs</span>
            <span className="stat-value">{data?.totalAttendanceMarked || 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Check-ins recorded
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
            <span className="stat-label">Average Attendance</span>
            <span className="stat-value">{data?.averageAttendanceRate || 0}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              Aggregate attendance rate
            </span>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <Card title="Course Attendance Rate Comparison">
        {subjectStats.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="No lecture data recorded"
            description="Attendance charts will render as soon as students check in to your lectures."
          />
        ) : (
          <div style={{ height: 320 }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherAnalytics;
