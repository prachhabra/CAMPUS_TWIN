import React, { useEffect, useState } from 'react';
import { achievementService } from '../services/achievementService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { Award, Sparkles, CheckCircle2, Lock, ShieldCheck, Flame, Compass, CheckSquare } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const iconMap = {
  Award,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Compass,
  CheckSquare
};

const StudentAchievements = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    points: 0,
    badges: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await achievementService.getMyAchievements();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return <Loader message="Accessing credential milestone vault..." />;
  }

  const badges = user?.badges || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Award size={24} color="var(--primary)" /> Campus Milestones & Badges
          </h2>
          <p className="page-subtitle">
            Earn verifiable badges and campus points through real academic and institutional engagement
          </p>
        </div>
      </div>

      {/* Points & Badges Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7C5CFC 0%, #5733d6 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            ACTIVE MERIT STATUS
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: 8 }}>
            {user?.points || 0} Campus Points
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.875rem', marginTop: 4 }}>
            Awarded for verifiable attendance, event participation, skill exchanges, and clubs
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(6px)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 24px',
            textAlign: 'center',
            minWidth: 160
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{badges.length}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Badges Unlocked
          </div>
        </div>
      </div>

      {/* Earned Badges Section */}
      <Card
        title={
          <>
            <Sparkles size={18} color="var(--accent)" />
            <span>Unlocked Badges ({badges.length})</span>
          </>
        }
      >
        {badges.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No badges earned yet"
            description="Participate in campus events, check in to lectures, or join clubs to unlock your first badge."
          />
        ) : (
          <div className="grid-cols-4">
            {badges.map((b, idx) => {
              const IconComponent = iconMap[b.icon] || Award;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--surface-alt)',
                    border: '1.5px solid rgba(124, 92, 252, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconComponent size={26} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                    Unlocked on {formatDate(b.awardedAt)}
                  </div>
                  <span className="status-badge present" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* System Milestones Roadmap */}
      {data.achievements?.length > 0 && (
        <Card
          title={
            <>
              <Flame size={18} color="var(--primary)" />
              <span>Available Milestone Quests</span>
            </>
          }
        >
          <div className="grid-cols-3">
            {data.achievements.map((ach) => (
              <div
                key={ach._id}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: ach.unlocked ? 'var(--success-light)' : 'var(--surface-alt)',
                  opacity: ach.unlocked ? 1 : 0.8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="status-badge student">{ach.category}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                    +{ach.points} Pts
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {ach.unlocked ? <CheckCircle2 size={16} color="var(--success)" /> : <Lock size={16} color="var(--muted)" />}
                  {ach.title}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: 4 }}>
                  {ach.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentAchievements;
