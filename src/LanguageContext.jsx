import { createContext, useState, useContext } from 'react';

export const LanguageContext = createContext();

export const translations = {
  en: {
    // Onboarding
    title: "Let's set up your shield",
    subtitle: "Takes 60 seconds. No documents needed.",
    yourName: "Your name",
    platform: "Platform",
    operatingPin: "Operating pin code",
    averageEarnings: "Average weekly earnings (₹)",
    calculateRisk: "Calculate my risk profile →",
    pinErrorMessage: "Pin code not in network yet — using city average.",
    
    // Risk Screen
    riskProfile: "'s risk profile",
    basedOnPin: "Based on your pin code in",
    nfiRiskScore: "NFI Risk Score",
    zoneRisk: "Zone risk (pin-code NFI)",
    seasonalFactor: "Seasonal factor",
    priorClaimsBonus: "No prior claims bonus",
    platformExposure: "Platform (outdoor rider)",
    disruptions: "disruption days",
    withoutCoverage: "without coverage",
    seeMyPlanOptions: "See my plan options →",
    standardExposure: "Standard exposure",
    hadDisruptionDays: "had",
    inPast12Months: "in the past 12 months. Workers here lose ~₹",
    workersLose: "Workers here lose",
    
    // Policy
    chooseYourShield: "Choose your shield",
    weeklyPricing: "Weekly pricing — debited every Monday.",
    perWeek: "per week",
    coverageLabel: "Max weekly payout",
    activateMyShield: "Activate my GigShield →",
    basePremium: "Base premium",
    nfiSurcharge: "NFI surcharge",
    noClaimLoyalty: "No-claim loyalty",
    
    // Dashboard
    welcomeBack: "Welcome back,",
    active: "Active",
    dashboard: "Dashboard",
    liveWeather: "Live Weather",
    askAI: "Ask AI",
    heatIndex: "Heat Index",
    riskMap: "Risk Map",
    claims: "Claims",
    policy: "Policy",
    whatsapp: "WhatsApp",
    protected: "Protected",
    thisMonth: "this month",
    premium: "Premium",
    nfi: "NFI score",
    // Dashboard tabs
    dashboard: "Dashboard",
    liveWeather: "Live Weather",
    askAI: "Ask AI",
    heatIndex: "Heat Index",
    riskMap: "Risk Map",
    claims: "Claims",
    policy: "Policy",
    whatsapp: "WhatsApp",
    
    // Dashboard content
    active: "Active",
    protected: "Protected",
    thisMonth: "this month",
    premium: "Premium",
    nfi: "NFI score",
    highRisk: "High risk",
    moderate: "Moderate",
    stormWindowAlert: "⚡ Storm Window Alert",
    heavyRainPredicted: "Heavy rain predicted in 6 hrs. Extend coverage?",
    simulateDisruption: "🌧 Simulate disruption trigger",
    detectingDisruption: "⏳ Detecting disruption...",
    payoutProcessed: "✓ Payout processed",
    autoPayoutProcessed: "✅ Auto-payout processed",
    trigger: "Trigger",
    upiTransferComplete: "UPI transfer complete",
    liveDisruptionFeed: "Live disruption feed",
    live: "Live",
    
    // Insurer View
    insurerDashboard: "GigShield Admin",
    activePolicies: "Active policies",
    premiumThisWeek: "Premium this week",
    claimsPaid: "Claims paid",
    lossRatio: "Loss ratio",
    recentFraudFlags: "Recent fraud flags",
    zoneRiskBreakdown: "Zone risk breakdown",
    predictiveOutlook: "📈 Predictive outlook — next 7 days",
    workersAtRisk: "workers at risk",
    collected: "collected",
    healthy: "healthy",
    workerView: "← Worker view",
  },
  hi: {
    // Onboarding
    title: "अपनी सुरक्षा स्थापित करें",
    subtitle: "60 सेकंड लगते हैं। कोई दस्तावेज़ की आवश्यकता नहीं।",
    yourName: "आपका नाम",
    platform: "प्लेटफॉर्म",
    operatingPin: "ऑपरेटिंग पिन कोड",
    averageEarnings: "औसत साप्ताहिक कमाई (₹)",
    calculateRisk: "मेरा जोखिम प्रोफाइल गणना करें →",
    pinErrorMessage: "पिन कोड अभी नेटवर्क में नहीं है - शहर के औसत का उपयोग कर रहे हैं।",
    
    // Risk Screen
    riskProfile: "का जोखिम प्रोफाइल",
    basedOnPin: "आपके पिन कोड के आधार पर",
    nfiRiskScore: "NFI जोखिम स्कोर",
    zoneRisk: "क्षेत्र जोखिम (पिन-कोड NFI)",
    seasonalFactor: "मौसमी कारक",
    priorClaimsBonus: "पूर्व दावा बोनस नहीं",
    platformExposure: "प्लेटफॉर्म (आउटडोर राइडर)",
    disruptions: "व्यवधान दिन",
    withoutCoverage: "कवरेज के बिना",
    seeMyPlanOptions: "मेरे प्लान विकल्प देखें →",
    standardExposure: "मानक जोखिम",
    hadDisruptionDays: "था",
    inPast12Months: "पिछले 12 महीनों में। यहां के कर्मचारी लगभग ₹",
    workersLose: "यहां के कर्मचारी",
    
    // Policy
    chooseYourShield: "अपनी सुरक्षा चुनें",
    weeklyPricing: "साप्ताहिक मूल्य निर्धारण — हर सोमवार कटौती।",
    perWeek: "प्रति सप्ताह",
    coverageLabel: "अधिकतम साप्ताहिक भुगतान",
    activateMyShield: "मेरा GigShield सक्रिय करें →",
    basePremium: "आधार प्रीमियम",
    nfiSurcharge: "NFI अधिभार",
    noClaimLoyalty: "बिना दावा आनुगत्य",
    
    // Dashboard
    welcomeBack: "वापसी का स्वागत है,",
    active: "सक्रिय",
    dashboard: "डैशबोर्ड",
    liveWeather: "लाइव मौसम",
    askAI: "AI से पूछें",
    heatIndex: "गर्मी सूचकांक",
    riskMap: "जोखिम मानचित्र",
    claims: "दावे",
    policy: "नीति",
    whatsapp: "व्हाट्सएप",
    protected: "सुरक्षित",
    thisMonth: "इस महीने",
    premium: "प्रीमियम",
    nfi: "NFI स्कोर",
    // Dashboard tabs
    dashboard: "डैशबोर्ड",
    liveWeather: "लाइव मौसम",
    askAI: "AI से पूछें",
    heatIndex: "गर्मी सूचकांक",
    riskMap: "जोखिम मानचित्र",
    claims: "दावे",
    policy: "नीति",
    whatsapp: "व्हाट्सएप",
    
    // Dashboard content
    active: "सक्रिय",
    protected: "सुरक्षित",
    thisMonth: "इस महीने",
    premium: "प्रीमियम",
    nfi: "NFI स्कोर",
    highRisk: "उच्च जोखिम",
    moderate: "मध्यम",
    stormWindowAlert: "⚡ तूफान विंडो अलर्ट",
    heavyRainPredicted: "6 घंटे में भारी बारिश की भविष्यवाणी। कवरेज बढ़ाएं?",
    simulateDisruption: "🌧 व्यवधान ट्रिगर सिमुलेट करें",
    detectingDisruption: "⏳ व्यवधान का पता लगा रहा है...",
    payoutProcessed: "✓ भुगतान संसाधित",
    autoPayoutProcessed: "✅ स्वचालित भुगतान संसाधित",
    trigger: "ट्रिगर",
    upiTransferComplete: "UPI स्थानांतरण पूर्ण",
    liveDisruptionFeed: "लाइव व्यवधान फीड",
    live: "लाइव",
    
    // Insurer View
    insurerDashboard: "GigShield प्रशासक",
    activePolicies: "सक्रिय नीतियां",
    premiumThisWeek: "इस हफ्ते प्रीमियम",
    claimsPaid: "दावे भुगतान किए",
    lossRatio: "नुकसान अनुपात",
    recentFraudFlags: "हाल के धोखाधड़ी झंडे",
    zoneRiskBreakdown: "क्षेत्र जोखिम विभाजन",
    predictiveOutlook: "📈 पूर्वानुमानित दृष्टिकोण — अगले 7 दिन",
    workersAtRisk: "जोखिम में लोग",
    collected: "एकत्र",
    healthy: "स्वस्थ",
    workerView: "← कर्मचारी दृश्य",
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };
  
  const toggleLanguage = () => {
    setLanguage(lang => lang === 'en' ? 'hi' : 'en');
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}