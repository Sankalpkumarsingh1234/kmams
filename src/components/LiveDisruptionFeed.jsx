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
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.liveDot} />
        <span style={styles.headerText}>LIVE DISRUPTIONS: {data?.location?.toUpperCase()}</span>
      </div>

      <div style={styles.feedList}>
        {data?.disruptions?.length > 0 ? (
          data.disruptions.map((d, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.icon}>{d.icon}</div>
              <div style={styles.content}>
                <div style={styles.type}>{d.type.toUpperCase()} ALERT</div>
                <div style={styles.message}>{d.message}</div>
                <div style={styles.time}>{new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div style={{ ...styles.severity, color: d.severity === 'High' ? '#EF4444' : '#F59E0B' }}>
                {d.severity} Risk
              </div>
            </div>
          ))
        ) : (
          <div style={styles.allClear}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <div style={{ marginLeft: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#1A1512' }}>ALL CLEAR</div>
              <div style={{ fontSize: '10px', color: '#6B6258' }}>No active weather triggers in {pinCode}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #E0D9D0',
    overflow: 'hidden',
    marginBottom: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  header: {
    padding: '10px 14px',
    background: '#F9F8F6',
    borderBottom: '1px solid #E0D9D0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    background: '#EF4444',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite',
  },
  headerText: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.05em',
    color: '#6B6258',
  },
  feedList: {
    padding: '4px 0',
  },
  item: {
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    borderBottom: '1px solid #F5F0EB',
  },
  icon: {
    fontSize: '20px',
    marginTop: '2px',
  },
  content: {
    flex: 1,
  },
  type: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: '2px',
  },
  message: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1A1512',
    lineHeight: '1.4',
  },
  time: {
    fontSize: '9px',
    color: '#9B9589',
    marginTop: '4px',
  },
  severity: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 8px',
    background: '#FAFAF8',
    borderRadius: '6px',
    border: '1px solid #E0D9D0',
    whiteSpace: 'nowrap',
  },
  loading: {
    padding: '24px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#6B6258',
    fontWeight: '600',
  },
  allClear: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    background: '#F0FDF4',
  }
};

export default LiveDisruptionFeed;
