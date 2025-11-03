import { supabase } from "@/integrations/supabase/client";

export interface AppLog {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  stack_trace: any | null;
  user_id: string | null;
  page_path: string | null;
  timestamp: string;
}

/**
 * Log an info message to Supabase
 */
export async function logInfo(
  message: string,
  meta?: Record<string, any>
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("app_logs" as any).insert([
      {
        level: "info",
        message,
        stack_trace: meta || null,
        user_id: user?.id || null,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Failed to log info:", error);
  }
}

/**
 * Log a warning message to Supabase
 */
export async function logWarn(
  message: string,
  meta?: Record<string, any>
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("app_logs" as any).insert([
      {
        level: "warn",
        message,
        stack_trace: meta || null,
        user_id: user?.id || null,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Failed to log warn:", error);
  }
}

/**
 * Log an error message to Supabase
 */
export async function logError(
  message: string,
  error?: Error | unknown,
  meta?: Record<string, any>
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stackTrace = error instanceof Error ? error.stack : String(error);

    await supabase.from("app_logs" as any).insert([
      {
        level: "error",
        message,
        stack_trace: {
          error: stackTrace,
          ...meta,
        },
        user_id: user?.id || null,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (logError) {
    console.error("Failed to log error:", logError);
  }
}

/**
 * Fetch logs from Supabase with optional filtering
 */
export async function getLogs(filters?: {
  level?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  pagePath?: string;
  limit?: number;
}): Promise<AppLog[]> {
  try {
    let query = supabase
      .from("app_logs" as any)
      .select("*")
      .order("timestamp", { ascending: false });

    if (filters?.level) {
      query = query.eq("level", filters.level);
    }
    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.pagePath) {
      query = query.eq("page_path", filters.pagePath);
    }
    if (filters?.startDate) {
      query = query.gte("timestamp", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("timestamp", filters.endDate);
    }

    const limit = filters?.limit || 500;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return [];
  }
}

/**
 * Search logs by message content
 */
export async function searchLogs(searchQuery: string): Promise<AppLog[]> {
  try {
    const { data, error } = await supabase
      .from("app_logs" as any)
      .select("*")
      .ilike("message", `%${searchQuery}%`)
      .order("timestamp", { ascending: false })
      .limit(500);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to search logs:", error);
    return [];
  }
}

/**
 * Delete a log entry
 */
export async function deleteLog(logId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("app_logs" as any)
      .delete()
      .eq("id", logId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to delete log:", error);
    return false;
  }
}

/**
 * Clear all logs (admin only)
 */
export async function clearAllLogs(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("app_logs" as any)
      .delete()
      .gte("timestamp", "1970-01-01");

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to clear logs:", error);
    return false;
  }
}

/**
 * Get log statistics
 */
export async function getLogStats(): Promise<{
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  latestLog: AppLog | null;
}> {
  try {
    const { data: allLogs, error } = await supabase
      .from("app_logs" as any)
      .select("level");

    if (error) throw error;

    const logs = allLogs || [];
    const errorCount = logs.filter((l: any) => l.level === "error").length;
    const warnCount = logs.filter((l: any) => l.level === "warn").length;
    const infoCount = logs.filter((l: any) => l.level === "info").length;

    const { data: latest } = await supabase
      .from("app_logs" as any)
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1);

    return {
      totalLogs: logs.length,
      errorCount,
      warnCount,
      infoCount,
      latestLog: latest?.[0] || null,
    };
  } catch (error) {
    console.error("Failed to get log stats:", error);
    return {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      infoCount: 0,
      latestLog: null,
    };
  }
}
