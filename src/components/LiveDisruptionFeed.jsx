import { useState, useEffect } from "react";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

const LiveDisruptionFeed = ({ pinCode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/disruptions/${pinCode || '600001'}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Feed fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [pinCode]);

  if (loading) return <div style={styles.loading}>📡 Syncing live weather feed...</div>;

  return (
    <div style={styles.outerContainer}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Live Disruption Feed</h2>
        <div style={styles.liveIndicator}>
          <div style={styles.liveDot} />
          <span style={styles.liveText}>Live</span>
        </div>
      </div>

      <div style={styles.feedWrapper}>
        {data?.disruptions?.length > 0 ? (
          data.disruptions.map((d, i) => {
            const isHigh = d.severity === 'HIGH';
            const timeAgo = i === 0 ? "2 min ago" : i === 1 ? "8 min ago" : i === 2 ? "15 min ago" : i === 3 ? "22 min ago" : i === 4 ? "31 min ago" : "45 min ago";
            
            return (
              <div key={d.id} style={styles.card}>
                <div style={styles.iconSection}>
                  <span style={styles.iconEmoji}>{d.icon}</span>
                </div>
                
                <div style={styles.detailsSection}>
                  <div style={styles.itemTitle}>{d.message.split(':')[0]}</div>
                  <div style={styles.itemSubtitle}>{d.message.split(':')[1]?.trim() || d.message}</div>
                </div>

                <div style={styles.statusSection}>
                  <div style={{
                    ...styles.badge,
                    background: isHigh ? '#FEE2E2' : '#FEF3C7',
                    color: isHigh ? '#EF4444' : '#D97706'
                  }}>
                    {d.severity}
                  </div>
                  <div style={styles.timeText}>{timeAgo}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>No active disruptions in your zone.</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    padding: '2px 0 16px 0',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '0 4px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A1512',
    margin: 0,
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    background: '#EF4444',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite',
  },
  liveText: {
    fontSize: '12px',
    color: '#9B9589',
    fontWeight: '600',
  },
  feedWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #E5E7EB',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  iconSection: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: '24px',
  },
  detailsSection: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1A1512',
    marginBottom: '2px',
  },
  itemSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '400',
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 10px',
    borderRadius: '6px',
    letterSpacing: '0.05em',
  },
  timeText: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    background: '#F9FAFB',
    borderRadius: '16px',
    color: '#6B7280',
    fontSize: '14px',
    border: '1px dashed #E5E7EB',
  }
};

export default LiveDisruptionFeed;
