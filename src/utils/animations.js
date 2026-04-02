// src/utils/animations.js
// Animation utilities and CSS keyframes for GigShield

export const animationStyles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
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
`;

// Inject animation styles globally
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = animationStyles;
  document.head.appendChild(style);
}

// Animation helper functions
export const getAnimationStyle = (animation, duration = '0.3s', delay = '0s', fill = 'both') => ({
  animation: `${animation} ${duration} ease ${delay} ${fill}`,
});

export const getStaggeredAnimation = (index, delay = 0.05) => ({
  animation: `slideIn 0.3s ease ${index * delay}s both`,
});

export const getFadeInUpAnimation = (duration = '0.4s', delay = '0s') => ({
  animation: `slideUp ${duration} ease-out ${delay} both`,
});

export const getPulseAnimation = () => ({
  animation: 'pulse 2s ease-in-out infinite',
});

export const getSpinAnimation = () => ({
  animation: 'spin 0.6s linear infinite',
});

export const getShimmerAnimation = (duration = '2s') => ({
  background: `linear-gradient(90deg, #f0f0f0 -1000px, #e0e0e0 -500px, #f0f0f0 500px)`,
  backgroundSize: '1000px 100%',
  animation: `shimmer ${duration} infinite`,
});
