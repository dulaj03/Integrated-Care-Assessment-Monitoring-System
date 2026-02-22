/**
 * HealthTrendChart Component
 * 
 * Displays vitals trends with Weekly/Monthly filtering options.
 * Supports toggling between different time ranges for flexible data visualization.
 */

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthLog } from '../lib/mockData';
import { Calendar, TrendingUp } from 'lucide-react';

interface HealthTrendChartProps {
  logs: HealthLog[];
  title?: string;
  height?: number;
}

export type ViewPeriod = 'weekly' | 'monthly';

/**
 * Filter logs based on view period
 * Weekly: Last 7 days
 * Monthly: Last 30 days
 */
const filterLogsByPeriod = (logs: HealthLog[], period: ViewPeriod): HealthLog[] => {
  const now = new Date();
  const daysToFilter = period === 'weekly' ? 7 : 30;
  const cutoffDate = new Date(now.getTime() - daysToFilter * 24 * 60 * 60 * 1000);

  return logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= cutoffDate;
  });
};

/**
 * Transform logs to chart-friendly data format
 */
const transformLogsToChartData = (logs: HealthLog[], period: ViewPeriod) => {
  const filteredLogs = filterLogsByPeriod(logs, period);

  // Sort chronologically (oldest to newest) for proper chart display
  const sortedLogs = [...filteredLogs].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Format date based on period
  return sortedLogs.map(log => ({
    date: formatDateForChart(log.date, period),
    fullDate: new Date(log.date).toLocaleString(),
    systolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[0]) : 0,
    diastolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[1]) : 0,
    heartRate: log.vitals.heartRate || 0,
    oxygen: log.vitals.oxygenLevel || 0,
    temperature: log.vitals.temperature || 0,
  }));
};

/**
 * Format date for chart x-axis based on view period
 * Weekly: Show date (e.g., "Feb 22")
 * Monthly: Show date with day (e.g., "Feb 22")
 */
const formatDateForChart = (dateString: string, period: ViewPeriod): string => {
  const date = new Date(dateString);

  if (period === 'weekly') {
    // Show abbreviated month and date (Feb 22)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    // Monthly: Show date without repeating too much (every few days)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

/**
 * Get summary statistics for the filtered period
 */
const getChartStatistics = (chartData: ReturnType<typeof transformLogsToChartData>) => {
  if (chartData.length === 0) return null;

  const avgHR = Math.round(chartData.reduce((sum, d) => sum + d.heartRate, 0) / chartData.length);
  const avgO2 = Math.round(chartData.reduce((sum, d) => sum + d.oxygen, 0) / chartData.length);
  const avgSystolic = Math.round(chartData.reduce((sum, d) => sum + d.systolic, 0) / chartData.length);

  return { avgHR, avgO2, avgSystolic };
};

export function HealthTrendChart({ logs, title = 'Health Trends', height = 320 }: HealthTrendChartProps) {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly');

  // Transform data based on selected period
  const chartData = transformLogsToChartData(logs, viewPeriod);
  const stats = getChartStatistics(chartData);

  // Handle empty data
  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow dark:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            {title}
          </h3>
        </div>
        <div className="h-80 flex items-center justify-center text-slate-500 dark:text-slate-400">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow dark:shadow-xl">
      {/* Header with Title and Filter Buttons */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          {title}
        </h3>

        {/* Period Toggle Buttons */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewPeriod('weekly')}
            className={`px-4 py-2 rounded font-medium transition-all duration-200 text-sm ${viewPeriod === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <Calendar className="inline h-4 w-4 mr-1" />
            Weekly
          </button>
          <button
            onClick={() => setViewPeriod('monthly')}
            className={`px-4 py-2 rounded font-medium transition-all duration-200 text-sm ${viewPeriod === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <Calendar className="inline h-4 w-4 mr-1" />
            Monthly
          </button>
        </div>
      </div>

      {/* Statistics Row */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Avg Systolic</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.avgSystolic} mmHg</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Avg Heart Rate</div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">{stats.avgHR} bpm</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Avg SpO2</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.avgO2}%</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: `${height}px`, width: '100%' }} className="animate-fade-in">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4b5563" />
            <XAxis
              dataKey="date"
              stroke="#8a92a1"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#8a92a1"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[60, 110]}
              stroke="#8a92a1"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
                fontSize: '12px'
              }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return value.toFixed(0);
                }
                return value;
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              verticalAlign="top"
              height={36}
            />

            {/* Chart Lines */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="systolic"
              stroke="#3B82F6"
              name="Systolic BP"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="diastolic"
              stroke="#93C5FD"
              name="Diastolic BP"
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="heartRate"
              stroke="#EF4444"
              name="Heart Rate"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="oxygen"
              stroke="#10B981"
              name="SpO2 %"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
        {chartData.length} data point{chartData.length !== 1 ? 's' : ''} shown •
        {viewPeriod === 'weekly' ? ' Last 7 days' : ' Last 30 days'}
      </div>
    </div>
  );
}

export default HealthTrendChart;
