import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { Button } from "@/components/ui/button";
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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAnalyticsStats, type AnalyticsStats } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const filters: any = {};
      if (startDate) {
        filters.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        filters.endDate = new Date(endDate).toISOString();
      }

      const analyticsData = await getAnalyticsStats(filters);
      setStats(analyticsData);
    } catch (error: any) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    await loadAnalytics();
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    loadAnalytics();
  };

  if (loading && !stats) {
    return (
      <div className="page-container">
        <TopRightControls />
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopRightControls />
      <header className="flex items-center justify-between mb-8 w-full max-w-6xl">
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="icon" aria-label="Back to Admin">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Go home">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={20} /> Analytics
        </h1>
        <div className="w-10" />
      </header>

      {/* Filters */}
      <div className="w-full max-w-6xl mb-6 p-4 border rounded">
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium block mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="home-button w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium block mb-1">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="home-button w-full"
            />
          </div>
          <Button onClick={handleApplyFilters} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Apply
          </Button>
          <Button onClick={handleClearFilters} variant="outline">
            Clear
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded p-4 text-center">
              <div className="text-3xl font-bold">{stats.totalPageViews}</div>
              <div className="text-sm text-muted-foreground">Total Page Views</div>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="text-3xl font-bold">{stats.totalSearches}</div>
              <div className="text-sm text-muted-foreground">Total Searches</div>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="text-3xl font-bold">{stats.topUsers.length}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="text-3xl font-bold">{stats.topBrands.length}</div>
              <div className="text-sm text-muted-foreground">Brands Viewed</div>
            </div>
          </div>

          {/* Charts */}
          <div className="w-full max-w-6xl space-y-6">
            {/* Activity by Hour - Line Chart */}
            {stats.activityByHour.length > 0 && (
              <div className="border rounded p-4">
                <h2 className="font-semibold text-lg mb-4">Activity Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.activityByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      name="Events"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Pages - Bar Chart */}
              {stats.pageViews.length > 0 && (
                <div className="border rounded p-4">
                  <h2 className="font-semibold text-lg mb-4">Top Pages</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.pageViews}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="path" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Brand Popularity - Pie Chart */}
              {stats.topBrands.length > 0 && (
                <div className="border rounded p-4">
                  <h2 className="font-semibold text-lg mb-4">Brand Popularity</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.topBrands}
                        dataKey="count"
                        nameKey="brand"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {stats.topBrands.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Searched Error Codes */}
            {stats.topSearchedCodes.length > 0 && (
              <div className="border rounded p-4">
                <h2 className="font-semibold text-lg mb-4">Most Searched Error Codes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.topSearchedCodes.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 border rounded bg-muted/50 flex justify-between items-center"
                    >
                      <span className="font-semibold">{item.code}</span>
                      <span className="text-sm text-muted-foreground">{item.count} searches</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Code Frequency */}
            {stats.errorCodeFrequency.length > 0 && (
              <div className="border rounded p-4">
                <h2 className="font-semibold text-lg mb-4">Error Code Frequency</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={stats.errorCodeFrequency}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="code" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Most Active Users */}
            {stats.topUsers.length > 0 && (
              <div className="border rounded p-4">
                <h2 className="font-semibold text-lg mb-4">Most Active Users</h2>
                <div className="space-y-2">
                  {stats.topUsers.slice(0, 10).map((user, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm font-mono">{user.userId.slice(0, 8)}...</span>
                      <span className="text-sm text-muted-foreground">{user.count} events</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
