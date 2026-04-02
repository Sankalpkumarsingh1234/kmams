// Skeleton loader components for loading states

export function SkeletonCard({ width = '100%', height = 100 }) {
  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(90deg, #F0EBE5 25%, #E8DFD7 50%, #F0EBE5 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
      borderRadius: 12,
    }} />
  )
}

export function SkeletonText({ width = '80%', height = 14 }) {
  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(90deg, #F0EBE5 25%, #E8DFD7 50%, #F0EBE5 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
      borderRadius: 4,
      marginBottom: 8
    }} />
  )
}

export function SkeletonCircle({ size = 40 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(90deg, #F0EBE5 25%, #E8DFD7 50%, #F0EBE5 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
    }} />
  )
}

export function LoadingSpinner({ size = 40 }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: '3px solid #E0D9D0',
      borderTop: '3px solid #FF6B35',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center',
        boxShadow: '0 4px 40px rgba(0,0,0,0.15)'
      }}>
        <LoadingSpinner size={48} />
        <p style={{
          marginTop: 16,
          color: '#6B6258',
          fontSize: 14,
          fontWeight: 500
        }}>
          {message}
        </p>
      </div>
    </div>
  )
}

// Add this CSS to index.css:
const globalStyles = `
@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`

export default globalStyles
