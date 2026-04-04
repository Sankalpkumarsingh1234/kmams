import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import StepDots from "./StepDots.jsx";
import OnboardingScreen from "./OnboardingScreen.jsx";
import RiskScreen from "./RiskScreen.jsx";
import PolicyScreen from "./PolicyScreen.jsx";
import DashboardScreen from "./DashboardScreen.jsx";
import InsurerDashboard from "./InsurerDashboard.jsx";

// ── Styles ─────────────────────────────────────────────────────────────────
const labelStyle = { display: "flex", flexDirection: "column", gap: 6 };
const labelText = { fontSize: 13, fontWeight: 600, color: "#1A1512" };
const inputStyle = { padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E0D9D0", fontSize: 14, color: "#1A1512", background: "#FAFAF8", outline: "none", fontFamily: "inherit", transition: "border 0.2s" };
const ctaBtn = { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#FF6B35", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s", letterSpacing: "0.01em" };

// Screen transition animation - smoother dual fade
const screenAnimationStyle = {
  animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
};

// CSS for animations
export const GlobalStyle = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 0.8; }
      100% { transform: scale(0.95); opacity: 0.5; }
    }
    .fade-mask {
      mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
    }
  `}</style>
);

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default function OnboardingFlow() {
  const { language, toggleLanguage } = useLanguage();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({});
  const [showInsurer, setShowInsurer] = useState(false);
  const contentRef = useRef(null);
  const isMobile = useIsMobile();

  function goNext(data) {
    setUserData(prev => ({ ...prev, ...data }));
    setStep(s => s + 1);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (step > 0) setStep(s => s - 1);
  }

  // Responsive styles
  const containerPadding = isMobile ? 12 : 16;
  const cardMaxWidth = isMobile ? "95%" : 440;
  const headerPadding = isMobile ? "12px 16px" : "14px 20px";
  const headerFontSize = isMobile ? 13 : 15;
  const contentPaddingTop = isMobile ? "16px" : "22px";

  if (showInsurer) {
    return <InsurerDashboard onBack={() => setShowInsurer(false)} />;
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #F5F0EB 0%, #FFF5F0 100%)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: containerPadding, 
      fontFamily: "'Plus Jakarta Sans',sans-serif"
    }}>
      <GlobalStyle />
      <div style={{ 
        width: "100%", 
        maxWidth: cardMaxWidth, 
        background: "#fff", 
        borderRadius: 24, 
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)", 
        overflow: "hidden",
        animation: "scaleIn 0.4s ease-out"
      }}>
        {/* Header */}
        <div style={{ 
          padding: headerPadding, 
          background: "linear-gradient(135deg, #1A1512 0%, #2D2420 100%)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              background: "linear-gradient(135deg, #FF6B35 0%, #FF5520 100%)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: 16,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              🛵
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: headerFontSize }}>GigShield</div>
              <div style={{ color: "#A89B91", fontSize: isMobile ? 9 : 11, marginTop: 2 }}>Income protection</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <button 
              onClick={toggleLanguage} 
              style={{ 
                padding: "4px 8px", 
                borderRadius: 6, 
                border: "1px solid rgba(255,255,255,0.3)", 
                background: "transparent", 
                color: "rgba(255,255,255,0.8)", 
                fontSize: 10, 
                fontWeight: 600, 
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
              onMouseOut={(e) => e.target.style.background = "transparent"}
            >
              {language === 'en' ? 'हिंदी' : 'EN'}
            </button>
            <button 
              onClick={() => setShowInsurer(true)} 
              style={{ 
                padding: "4px 10px", 
                borderRadius: 7, 
                border: "1px solid rgba(255,255,255,0.2)", 
                background: "transparent", 
                color: "rgba(255,255,255,0.7)", 
                fontSize: isMobile ? 8 : 10, 
                fontWeight: 600, 
                cursor: "pointer", 
                letterSpacing: "0.04em",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
              onMouseOut={(e) => e.target.style.background = "transparent"}
            >
              {isMobile ? "ADMIN" : "INSURER VIEW"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} style={{ 
          paddingTop: contentPaddingTop,
          paddingLeft: isMobile ? "16px" : "22px",
          paddingRight: isMobile ? "16px" : "22px",
          paddingBottom: "22px",
          maxHeight: "82vh", 
          overflowY: "auto" 
        }}>
          {step < 4 && <StepDots current={step} total={4} />}
          
          <div style={screenAnimationStyle} key={step}>
            {step === 0 && <OnboardingScreen onNext={goNext} />}
            {step === 1 && <RiskScreen data={userData} onNext={goNext} onBack={goBack} />}
            {step === 2 && <PolicyScreen data={userData} onNext={goNext} onBack={goBack} />}
            {step === 3 && <DashboardScreen data={userData} onBack={goBack} />}
          </div>
        </div>
      </div>
    </div>
  );
}
