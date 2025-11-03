import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, ScrollText, RefreshCw, Trash2, AlertCircle, AlertTriangle, Info, Download } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getLogs,
  searchLogs,
  deleteLog,
  clearAllLogs,
  getLogStats,
  type AppLog,
} from "@/lib/logger";

interface LogStats {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  latestLog: AppLog | null;
}

export default function AdminAppLogs() {
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AppLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await getLogs({ limit: 1000 });
      setLogs(logsData);

      const statsData = await getLogStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading logs:", error);
      toast({
        title: "Error loading logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadLogs();
      return;
    }

    try {
      setFiltering(true);
      const results = await searchLogs(searchQuery);
      setLogs(results);
    } catch (error: any) {
      toast({
        title: "Error searching logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFiltering(false);
    }
  };

  const handleApplyFilters = async () => {
    try {
      setFiltering(true);
      const filters: any = { limit: 1000 };

      if (filterLevel !== "all") {
        filters.level = filterLevel;
      }
      if (filterStartDate) {
        filters.startDate = new Date(filterStartDate).toISOString();
      }
      if (filterEndDate) {
        filters.endDate = new Date(filterEndDate).toISOString();
      }

      const results = await getLogs(filters);
      setLogs(results);
    } catch (error: any) {
      toast({
        title: "Error applying filters",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFiltering(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      setDeleting(true);
      const success = await deleteLog(logId);
      if (success) {
        setLogs(logs.filter((l) => l.id !== logId));
        if (selectedLog?.id === logId) {
          setSelectedLog(null);
        }
        toast({
          title: "Success",
          description: "Log deleted",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error deleting log",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAllLogs = async () => {
    if (!confirm("Are you sure you want to delete ALL logs? This action cannot be undone.")) return;

    try {
      setDeleting(true);
      const success = await clearAllLogs();
      if (success) {
        setLogs([]);
        setSelectedLog(null);
        setStats(
          stats ? { ...stats, totalLogs: 0, errorCount: 0, warnCount: 0, infoCount: 0 } : null
        );
        toast({
          title: "Success",
          description: "All logs cleared",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error clearing logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadLogs = () => {
    const csv = convertLogsToCSV(logs);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertLogsToCSV = (logsData: AppLog[]): string => {
    const headers = ["ID", "Level", "Message", "User ID", "Page Path", "Timestamp", "Stack Trace"];
    const rows = logsData.map((log) => [
      log.id,
      log.level,
      `"${(log.message || "").replace(/"/g, '""')}"`,
      log.user_id || "",
      log.page_path || "",
      log.timestamp,
      log.stack_trace ? `"${JSON.stringify(log.stack_trace).replace(/"/g, '""')}"` : "",
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-destructive";
      case "warn":
        return "text-yellow-600 dark:text-yellow-500";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="page-container">
        <TopRightControls />
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
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
          <ScrollText size={20} /> App Logs
        </h1>
        <div className="w-10" />
      </header>

      {/* Statistics */}
      {stats && (
        <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <div className="text-xs text-muted-foreground">Total Logs</div>
          </div>
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.errorCount}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.warnCount}</div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </div>
          <div className="border rounded p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.infoCount}</div>
            <div className="text-xs text-muted-foreground">Info</div>
          </div>
          <div className="border rounded p-3 text-center">
            <div className="text-xs font-bold truncate">
              {stats.latestLog ? new Date(stats.latestLog.timestamp).toLocaleTimeString() : "-"}
            </div>
            <div className="text-xs text-muted-foreground">Latest</div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Logs List */}
        <div className="md:col-span-2 border rounded p-4 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Logs ({logs.length})</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLogs}
              disabled={loading}
              aria-label="Refresh logs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Quick Search */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={filtering}
              size="sm"
            >
              Search
            </Button>
          </div>

          {/* Logs Table */}
          <div className="overflow-auto flex-1" style={{ scrollbarWidth: "none" }}>
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center">No logs found</div>
              ) : (
                logs.map((log) => (
                  <button
                    key={log.id}
                    className={`w-full text-left home-button p-3 rounded text-sm border ${
                      selectedLog?.id === log.id ? "border-primary border-2" : ""
                    }`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center gap-2">
                      {getLogIcon(log.level)}
                      <span className={`font-semibold uppercase text-xs w-12 ${getLogColor(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="flex-1 truncate">{log.message}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Log Details & Filters */}
        <div className="border rounded p-4 min-h-[70vh] flex flex-col gap-4">
          <div className="flex-1 overflow-auto pr-2" style={{ scrollbarWidth: "none" }}>
            {!selectedLog ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Select a log to view details
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Message</h3>
                  <p className="text-sm break-words bg-muted p-2 rounded">{selectedLog.message}</p>
                </div>

                <div>
                  <span className="font-medium text-sm">Level:</span>
                  <div className={`capitalize font-bold ${getLogColor(selectedLog.level)}`}>
                    {selectedLog.level}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-sm">Timestamp:</span>
                  <div className="text-xs">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </div>
                </div>

                {selectedLog.user_id && (
                  <div>
                    <span className="font-medium text-sm">User ID:</span>
                    <div className="text-xs font-mono break-all">{selectedLog.user_id}</div>
                  </div>
                )}

                {selectedLog.page_path && (
                  <div>
                    <span className="font-medium text-sm">Page Path:</span>
                    <div className="text-xs break-all">{selectedLog.page_path}</div>
                  </div>
                )}

                {selectedLog.stack_trace && (
                  <div>
                    <span className="font-medium text-sm">Stack Trace:</span>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[200px] whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedLog.stack_trace, null, 2)}
                    </pre>
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteLog(selectedLog.id)}
                  disabled={deleting}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Log
                </Button>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Filters */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Filters</h3>

            <div>
              <label className="text-xs font-medium block mb-1">Level:</label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">Start Date:</label>
              <Input
                type="datetime-local"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">End Date:</label>
              <Input
                type="datetime-local"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="text-sm"
              />
            </div>

            <Button
              onClick={handleApplyFilters}
              disabled={filtering}
              className="w-full"
              size="sm"
            >
              Apply Filters
            </Button>

            <Button
              onClick={loadLogs}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Clear Filters
            </Button>

            <Button
              onClick={handleDownloadLogs}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>

            <Button
              onClick={handleClearAllLogs}
              variant="destructive"
              className="w-full"
              size="sm"
              disabled={deleting || logs.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
