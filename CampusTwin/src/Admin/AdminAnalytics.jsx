import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  AlertTriangle, 
  Briefcase, 
  CheckCircle,
  TrendingUp,
  BarChart3,
  Layers,
  ShoppingBag
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getAdminAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch institutional analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <Loader fullScreen message="Aggregating institutional data..." />;
  if (!data) return <EmptyState title="No Analytics Available" description="Institutional metrics will appear once users and activities are recorded in the database." />;

  const { users, academics, activities, services, placements } = data;

  // Department Distribution Chart Data
  const deptLabels = (users.departmentDistribution || []).map((d) => d._id || 'Unassigned');
  const deptCounts = (users.departmentDistribution || []).map((d) => d.count);
  const departmentChartData = {
    labels: deptLabels.length > 0 ? deptLabels : ['No Departments Registered'],
    datasets: [
      {
        label: 'Enrolled Members',
        data: deptCounts.length > 0 ? deptCounts : [0],
        backgroundColor: '#243B6B',
        borderRadius: 4
      }
    ]
  };

  // Complaint Categories Chart Data
  const complaintLabels = (services.complaints?.categories || []).map((c) => c._id || 'General');
  const complaintCounts = (services.complaints?.categories || []).map((c) => c.count);
  const complaintChartData = {
    labels: complaintLabels.length > 0 ? complaintLabels : ['No Grievances'],
    datasets: [
      {
        label: 'Grievance Count',
        data: complaintCounts.length > 0 ? complaintCounts : [0],
        backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'],
        borderWidth: 1
      }
    ]
  };

  // Placement Breakdown Chart Data
  const placementLabels = (placements.statuses || []).map((p) => p._id);
  const placementCounts = (placements.statuses || []).map((p) => p.count);
  const placementChartData = {
    labels: placementLabels.length > 0 ? placementLabels : ['No Placement Records'],
    datasets: [
      {
        label: 'Candidates',
        data: placementCounts.length > 0 ? placementCounts : [0],
        backgroundColor: ['#3B82F6', '#6366F1', '#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Institutional Analytics & Insights
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time aggregated telemetry across departments, academic attendance, grievances, and placements.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Enrolled Students
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                {users.students || 0}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(36, 59, 107, 0.08)', borderRadius: '8px', color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Faculty Members
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#3B82F6', marginTop: '0.25rem' }}>
                {users.teachers || 0}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', color: '#3B82F6' }}>
              <GraduationCap size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Overall Attendance
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem' }}>
                {academics.overallAttendanceRate || 0}%
              </h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', color: '#10B981' }}>
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Active Events
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>
                {activities.events || 0}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(124, 92, 252, 0.08)', borderRadius: '8px', color: 'var(--accent)' }}>
              <Calendar size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Pending Grievances
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: services.complaints?.pending > 0 ? '#EF4444' : '#10B981', marginTop: '0.25rem' }}>
                {services.complaints?.pending || 0}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', color: '#EF4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Placements Selected
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
                {placements.selected || 0}
              </h3>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(5, 150, 105, 0.08)', borderRadius: '8px', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Primary Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Department Distribution */}
        <Card title="Department Enrolment Breakdown" subtitle="Distribution of students and faculty members across academic disciplines">
          <div style={{ height: '280px', marginTop: '1rem' }}>
            {deptLabels.length === 0 ? (
              <EmptyState title="No Department Data" description="No department records found in database." />
            ) : (
              <Bar 
                data={departmentChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }} 
              />
            )}
          </div>
        </Card>

        {/* Placement Pipeline */}
        <Card title="Career & Placement Status" subtitle="Aggregate outcome distribution of institutional candidates">
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
            {placementLabels.length === 0 ? (
              <EmptyState title="No Placements Recorded" description="Placement statistics will populate as drives take place." />
            ) : (
              <div style={{ width: '260px', height: '260px' }}>
                <Doughnut 
                  data={placementChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Secondary Aggregation Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Grievance Categories */}
        <Card title="Campus Grievance Categories" subtitle="Reported issues grouped by institutional service domain">
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
            {complaintLabels.length === 0 ? (
              <EmptyState title="Zero Grievances" description="No student complaints have been logged in the system." />
            ) : (
              <div style={{ width: '240px', height: '240px' }}>
                <Doughnut 
                  data={complaintChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Campus Activity Summary */}
        <Card title="Digital Twin Campus Pulse" subtitle="Real-time counts of collaborative entities active on campus">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--surface-subtle)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                <Layers size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Clubs</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activities.clubs || 0}</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--surface-subtle)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', marginBottom: '0.5rem' }}>
                <Users size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Peer Study Groups</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activities.studyGroups || 0}</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--surface-subtle)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B', marginBottom: '0.5rem' }}>
                <ShoppingBag size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Marketplace Items</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{services.marketplace || 0}</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--surface-subtle)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                <BarChart3 size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Skills Exchanged</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activities.skills || 0}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
