/*
╔════════════════════════════════════════════════════════════════════════════╗
║              INSURER DASHBOARD POLISH - Chart.js Integration                ║
║              Add forecasts, fraud cards, real data visualization            ║
╚════════════════════════════════════════════════════════════════════════════╝

CURRENT STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: src/components/InsurerDashboard.jsx
  - Static card data (no charts)
  - Pie chart placeholder (not functional)
  - Fraud score shows percentage visually

WHAT TO ADD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Install Chart.js
2. Create Chart components (reusable)
3. Wire Chart to dashboard data
4. Polish fraud score cards
5. Add trend visualization


STEP 1: Install Chart.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In project root (vite-project/):

npm install chart.js react-chartjs-2

Verify installation:
  npm list chart.js react-chartjs-2

Should show:
  chart.js@4.4.0
  react-chartjs-2@5.2.0


STEP 2: Create Reusable Chart Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create: src/components/Charts/ForecastChart.jsx

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function ForecastChart() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Predicted Payouts (₹)',
        data: [120, 140, 110, 160, 90, 140, 130],
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#FF6B35',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Actual Claims',
        data: [100, 130, 105, 145, 85, 135, 125],
        borderColor: '#4CAF82',
        backgroundColor: 'rgba(76, 175, 130, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#4CAF82',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#6B6258',
          font: { size: 12, weight: '600' },
        },
      },
      title: {
        display: true,
        text: '7-Day Forecast vs Actual',
        color: '#1A1512',
        font: { size: 14, weight: '700' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 200,
        ticks: { color: '#9B8E84', font: { size: 11 } },
        grid: { color: 'rgba(224, 217, 208, 0.3)' },
      },
      x: {
        ticks: { color: '#9B8E84', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ padding: '16px', background: '#FAFAF8', borderRadius: 12 }}>
      <Line data={data} options={options} />
    </div>
  );
}

Create: src/components/Charts/ZoneDistributionChart.jsx

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ZoneDistributionChart() {
  const data = {
    labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'],
    datasets: [
      {
        data: [25, 20, 18, 22, 15],
        backgroundColor: [
          '#FF6B35',
          '#F59E0B',
          '#4CAF82',
          '#3B82F6',
          '#9C27B0',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#6B6258', font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ padding: '16px', background: '#FAFAF8', borderRadius: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1A1512', marginBottom: 10 }}>
        Risk by Zone
      </h3>
      <Pie data={data} options={options} />
    </div>
  );
}


STEP 3: Update InsurerDashboard to use Charts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In: src/components/InsurerDashboard.jsx

Add imports:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { ForecastChart } from './Charts/ForecastChart.jsx';
import { ZoneDistributionChart } from './Charts/ZoneDistributionChart.jsx';

In render (tab: "forecast"):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{activeTab === "forecast" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <ForecastChart />
    <ZoneDistributionChart />
    <div style={{ padding: "16px", background: "#FFF8F5", borderRadius: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#7C3D1F", marginBottom: 8 }}>
        📊 Insights
      </div>
      <ul style={{ fontSize: 11, color: "#6B6258", margin: 0, paddingLeft: 16 }}>
        <li>Zone A: 35% of total claims (increasing trend)</li>
        <li>Average payout: ₹1,245/week</li>
        <li>Prediction accuracy: 94%</li>
      </ul>
    </div>
  </div>
)}


STEP 4: Polish Fraud Score Cards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current state:
  - Simple % circle
  - Red/yellow/green based on score

Improvements:
  1. Add trend indicator (↑ ↓ →)
  2. Show score breakdown (weather, sequence, location)
  3. Add action buttons (Approve, Review, Reject)
  4. Color confidence levels

Example fraud card component:

function FraudCard({ score, trend, details }) {
  const color = score > 75 ? "#EF4444" : score > 50 ? "#F59E0B" : "#4CAF82";
  
  return (
    <div style={{ 
      padding: "12px", 
      background: `${color}15`, 
      borderLeft: `4px solid ${color}`,
      borderRadius: 8 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>
            Score: {score}%
          </div>
          <div style={{ fontSize: 11, color: "#6B6258", marginTop: 2 }}>
            {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '→'} 
            {' '}Trend
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #E0D9D0", fontSize: 10 }}>
            ✓ Approve
          </button>
          <button style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #E0D9D0", fontSize: 10 }}>
            ✕ Reject
          </button>
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: "#6B6258" }}>
        {details}
      </div>
    </div>
  );
}


STEP 5: Add Real Data from Supabase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When dashboard loads:

useEffect(() => {
  // Fetch fraud flags
  supabase
    .from('fraud_flags')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
    .then(({ data }) => setFraudFlags(data));

  // Fetch 7-day forecast data
  supabase
    .from('payout_forecasts')
    .select('*')
    .order('date')
    .then(({ data }) => setForecast(data));
}, []);


TESTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Install Chart.js
2. Create chart components
3. Import into InsurerDashboard
4. Click "Forecast" tab → should see line chart
5. Check responsive: resize browser, chart should adapt
6. Mobile: chart should be readable at 480px width


PERFORMANCE TIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Reduce data points for mobile (7 days, not 30)
⚡ Use canvas (Chart.js is fast, DOM-heavy SVG is slow)
⚡ Memoize chart components: React.memo(Chart)
⚡ Lazy load charts: <Suspense><Chart /></Suspense>


NEXT FEATURES (After MVP):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Export dashboard as PDF
□ Real-time WebSocket updates
□ Custom date range selector
□ Comparison tool (week vs week)
□ Email alerts for high fraud scores
□ CLV (Customer Lifetime Value) charts

*/
