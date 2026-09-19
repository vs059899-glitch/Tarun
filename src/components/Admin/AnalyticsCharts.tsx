import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AnalyticsChartsProps {
  charts: {
    timeline: { date: string; consumer: number; business: number; total: number }[];
    concerns: { name: string; count: number }[];
    brands: { name: string; value: number }[];
    userModes: { name: string; value: number }[];
    funnel: { stage: string; count: number }[];
    contactActions: { name: string; count: number }[];
  };
}

const BRAND_COLORS = ['#9C7A5B', '#B38E5D', '#4A6B5D', '#7D6357'];
const MODE_COLORS = ['#8C7355', '#201E1D'];
const CONTACT_COLORS = ['#25D366', '#8C7355', '#201E1D'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ charts }) => {
  const hasTimeline = charts.timeline && charts.timeline.length > 0;
  const hasConcerns = charts.concerns && charts.concerns.length > 0;
  const hasBrands = charts.brands && charts.brands.some(b => b.value > 0);

  return (
    <div id="analytics-charts-container" className="space-y-6">
      {/* Row 1: Conversations Over Time & Consumer Concerns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Conversations Over Time (Line Chart) */}
        <div
          id="chart-conversations-over-time"
          className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#201E1D]">
                Conversations Over Time
              </h3>
              <p className="text-xs text-[#7A746B]">
                Daily volume split by Consumer and Business intent
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#8C7355] bg-[#FAF5EC] px-2.5 py-1 rounded-full">
              Line Chart
            </span>
          </div>

          <div className="h-64 w-full">
            {hasTimeline ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#8C867D' }}
                    tickFormatter={val => val.slice(5)}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8C867D' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#201E1D',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="consumer"
                    name="Consumer"
                    stroke="#8C7355"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="business"
                    name="Business"
                    stroke="#201E1D"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8C867D]">
                No session timeline activity recorded in selected timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Consumer Concerns (Bar Chart) */}
        <div
          id="chart-consumer-concerns"
          className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#201E1D]">
                Consumer Concerns
              </h3>
              <p className="text-xs text-[#7A746B]">
                Most frequently stated haircare & skincare concerns
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#8C7355] bg-[#FAF5EC] px-2.5 py-1 rounded-full">
              Bar Chart
            </span>
          </div>

          <div className="h-64 w-full">
            {hasConcerns ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.concerns} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#8C867D' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8C867D' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#201E1D',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="count" name="Consultations" fill="#8C7355" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8C867D]">
                No consumer concerns logged yet. Start a beauty consultation in chat.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Brand Recommendations & Consumer vs Business */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 3: Brand Recommendations (Donut Chart) */}
        <div
          id="chart-brand-recommendations"
          className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
        >
          <div className="mb-3">
            <h3 className="font-serif font-bold text-base text-[#201E1D]">
              Brand Recommendations
            </h3>
            <p className="text-xs text-[#7A746B]">Configured engine triggers</p>
          </div>

          <div className="h-56 w-full">
            {hasBrands ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.brands}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {charts.brands.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#201E1D',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8C867D]">
                No brand recommendations triggered yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Consumer vs Business (Donut/Pie Chart) */}
        <div
          id="chart-consumer-vs-business"
          className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
        >
          <div className="mb-3">
            <h3 className="font-serif font-bold text-base text-[#201E1D]">
              Consumer vs Business
            </h3>
            <p className="text-xs text-[#7A746B]">Intent classification split</p>
          </div>

          <div className="h-56 w-full">
            {charts.userModes.some(m => m.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.userModes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {charts.userModes.map((entry, index) => (
                      <Cell key={`mode-cell-${index}`} fill={MODE_COLORS[index % MODE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#201E1D',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8C867D]">
                No user modes recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 5: Business Enquiry Funnel */}
        <div
          id="chart-business-funnel"
          className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
        >
          <div className="mb-3">
            <h3 className="font-serif font-bold text-base text-[#201E1D]">
              Business Enquiry Funnel
            </h3>
            <p className="text-xs text-[#7A746B]">Session → Started → Submitted</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.funnel} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#8C867D' }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: '#5C5750' }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#201E1D',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Bar dataKey="count" fill="#4A6B5D" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Contact Actions Breakdown */}
      <div
        id="chart-contact-actions"
        className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#201E1D]">
              Direct Contact Actions
            </h3>
            <p className="text-xs text-[#7A746B]">
              User triggers for WhatsApp, Direct Call, and Contact inquiries
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#8C7355] bg-[#FAF5EC] px-2.5 py-1 rounded-full">
            Channels
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {charts.contactActions.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#ECE5D8] bg-[#FAF8F4] flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-[#7A746B] font-medium">{item.name}</span>
                <div className="text-xl font-serif font-bold text-[#201E1D] mt-0.5">
                  {item.count}
                </div>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                style={{ backgroundColor: CONTACT_COLORS[idx % CONTACT_COLORS.length] }}
              >
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
