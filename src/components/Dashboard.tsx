'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Calendar, DollarSign, FileText, Filter } from 'lucide-react';

interface RevenueData {
  monthlyData: Array<{
    month: string;
    revenue: number;
    year: string;
    monthNumber: number;
  }>;
  yearlyData: Array<{
    year: string;
    revenue: number;
  }>;
  totalRevenue: number;
  totalInvoices: number;
  availableYears: string[];
  availableMonths: string[];
}

interface DashboardFilters {
  year: string;
  month: string;
  chartType: 'monthly' | 'yearly';
}

// Color scheme for different years
const YEAR_COLORS: { [key: string]: string } = {
  '2024': '#0088FE', // Blue
  '2025': '#00C49F', // Green
  '2026': '#FFBB28', // Yellow
  '2027': '#FF8042', // Orange
  '2028': '#8884D8', // Purple
  '2029': '#82CA9D', // Light Green
  '2030': '#FF6B6B', // Red
  '2031': '#4ECDC4', // Teal
  '2032': '#45B7D1', // Sky Blue
  '2033': '#96CEB4', // Mint
  '2034': '#FFEAA7', // Light Yellow
  '2035': '#DDA0DD', // Plum
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    year: '',
    month: '',
    chartType: 'monthly'
  });

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      
      const response = await fetch(`/api/dashboard/revenue?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch revenue data');
      }
    } catch (err) {
      setError('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [filters]);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
  };

  // Format currency for Y-axis (shorter format)
  const formatCurrencyAxis = (value: number) => {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}k`;
    }
    return `€${value}`;
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
  };

  // Process monthly data to separate by year
  const processMonthlyDataByYear = (monthlyData: any[]) => {
    const dataByYear: { [key: string]: any[] } = {};
    
    monthlyData.forEach(item => {
      const year = item.year;
      if (!dataByYear[year]) {
        dataByYear[year] = [];
      }
      dataByYear[year].push({
        ...item,
        month: item.month.split('-')[1], // Just the month number
        monthName: formatMonth(item.month)
      });
    });
    
    return dataByYear;
  };

  // Create combined data for bar chart with year information
  const createCombinedBarData = (monthlyData: any[]) => {
    const dataByYear = processMonthlyDataByYear(monthlyData);
    const combinedData: any[] = [];
    
    // Get all unique months
    const allMonths = new Set();
    monthlyData.forEach(item => {
      allMonths.add(item.month.split('-')[1]);
    });
    
    // Create data structure for each month
    Array.from(allMonths).sort().forEach(month => {
      const monthData: any = { month };
      
      // Add revenue for each year
      Object.keys(dataByYear).forEach(year => {
        const yearData = dataByYear[year].find(item => item.month === month);
        monthData[`revenue_${year}`] = yearData ? yearData.revenue : 0;
      });
      
      combinedData.push(monthData);
    });
    
    return combinedData;
  };

  // Get color for a specific year
  const getYearColor = (year: string) => {
    return YEAR_COLORS[year] || '#888888';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">
            {filters.chartType === 'monthly' 
              ? `${new Date(2024, parseInt(label) - 1).toLocaleDateString('nl-NL', { month: 'long' })}`
              : label
            }
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchRevenueData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const chartData = filters.chartType === 'monthly' ? data.monthlyData : data.yearlyData;
  const monthlyDataByYear = processMonthlyDataByYear(data.monthlyData);
  const combinedBarData = createCombinedBarData(data.monthlyData);
  const years = Object.keys(monthlyDataByYear).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>Real-time data</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Years</option>
            {data.availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filters.month}
            onChange={(e) => handleFilterChange('month', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Months</option>
            {data.availableMonths.map(month => (
              <option key={month} value={month}>
                {new Date(2024, parseInt(month) - 1).toLocaleDateString('nl-NL', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={filters.chartType}
            onChange={(e) => handleFilterChange('chartType', e.target.value as 'monthly' | 'yearly')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="monthly">Monthly View</option>
            <option value="yearly">Yearly View</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average per Invoice</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalInvoices > 0 ? formatCurrency(data.totalRevenue / data.totalInvoices) : '€0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue {filters.chartType === 'monthly' ? 'by Month' : 'by Year'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {filters.chartType === 'monthly' ? (
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={(value) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return monthNames[parseInt(value) - 1] || value;
                  }}
                />
                <YAxis tickFormatter={formatCurrencyAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {years.map((year, index) => (
                  <Line 
                    key={year}
                    type="monotone" 
                    dataKey="revenue" 
                    data={monthlyDataByYear[year]}
                    name={`${year}`}
                    stroke={getYearColor(year)}
                    strokeWidth={3}
                    dot={{ fill: getYearColor(year), strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={formatCurrencyAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  fill={getYearColor(chartData[0]?.year || '2024')}
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {filters.chartType === 'monthly' ? (
              <BarChart data={combinedBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={(value) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return monthNames[parseInt(value) - 1] || value;
                  }}
                />
                <YAxis tickFormatter={formatCurrencyAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {years.map((year) => (
                  <Bar 
                    key={year}
                    dataKey={`revenue_${year}`}
                    name={`${year}`}
                    fill={getYearColor(year)}
                    radius={[4, 4, 0, 0]} 
                  />
                ))}
              </BarChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={formatCurrencyAxis} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  fill={getYearColor(chartData[0]?.year || '2024')}
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly Comparison Chart */}
      {filters.chartType === 'yearly' && data.yearlyData.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-over-Year Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={formatCurrencyAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill={getYearColor(data.yearlyData[0]?.year || '2024')}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Breakdown Pie Chart */}
      {filters.chartType === 'monthly' && data.monthlyData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.monthlyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ month, revenue }) => `${formatMonth(month)}: ${formatCurrency(revenue)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {data.monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getYearColor(entry.year)} />
                ))}
              </Pie>
              <Tooltip formatter={formatCurrency} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
} 