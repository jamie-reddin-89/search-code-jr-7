import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  device_id: string | null;
  event_type: string;
  path: string | null;
  meta: any | null;
  timestamp: string;
}

export interface AnalyticsStats {
  totalPageViews: number;
  totalSearches: number;
  pageViews: { path: string; count: number }[];
  topSearchedCodes: { code: string; count: number }[];
  topBrands: { brand: string; count: number }[];
  topUsers: { userId: string; count: number }[];
  errorCodeFrequency: { code: string; count: number }[];
  activityByHour: { hour: string; count: number }[];
}

/**
 * Track an analytics event to Supabase
 */
export async function trackEvent(
  eventType: string,
  path?: string,
  meta?: Record<string, any>
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const deviceId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("device_id") || generateDeviceId()
        : null;

    await supabase.from("app_analytics" as any).insert([
      {
        user_id: user?.id || null,
        device_id: deviceId,
        event_type: eventType,
        path: path || window.location.pathname,
        meta: meta || null,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  let deviceId = window.localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    window.localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

/**
 * Fetch analytics statistics
 */
export async function getAnalyticsStats(filters?: {
  startDate?: string;
  endDate?: string;
  eventType?: string;
}): Promise<AnalyticsStats> {
  try {
    let query = supabase
      .from("app_analytics" as any)
      .select("*")
      .order("timestamp", { ascending: false });

    if (filters?.startDate) {
      query = query.gte("timestamp", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("timestamp", filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const events = (data as AnalyticsEvent[]) || [];

    // Page views
    const pageViewMap = new Map<string, number>();
    events.forEach((e) => {
      if (e.path) {
        pageViewMap.set(e.path, (pageViewMap.get(e.path) || 0) + 1);
      }
    });
    const pageViews = Array.from(pageViewMap.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Searches (from activity meta)
    const searchMap = new Map<string, number>();
    events.forEach((e) => {
      if (e.event_type === "search" && e.meta?.code) {
        searchMap.set(e.meta.code, (searchMap.get(e.meta.code) || 0) + 1);
      }
    });
    const topSearchedCodes = Array.from(searchMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Brands (from activity meta)
    const brandMap = new Map<string, number>();
    events.forEach((e) => {
      if (e.meta?.brand) {
        brandMap.set(e.meta.brand, (brandMap.get(e.meta.brand) || 0) + 1);
      }
    });
    const topBrands = Array.from(brandMap.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Active users
    const userMap = new Map<string, number>();
    events.forEach((e) => {
      if (e.user_id) {
        userMap.set(e.user_id, (userMap.get(e.user_id) || 0) + 1);
      }
    });
    const topUsers = Array.from(userMap.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Error code frequency
    const errorMap = new Map<string, number>();
    events.forEach((e) => {
      if (e.meta?.errorCode) {
        errorMap.set(e.meta.errorCode, (errorMap.get(e.meta.errorCode) || 0) + 1);
      }
    });
    const errorCodeFrequency = Array.from(errorMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Activity by hour
    const hourMap = new Map<string, number>();
    events.forEach((e) => {
      const date = new Date(e.timestamp);
      const hour = `${date.getHours()}:00`;
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    const activityByHour = Array.from(hourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return {
      totalPageViews: events.length,
      totalSearches: topSearchedCodes.reduce((sum, c) => sum + c.count, 0),
      pageViews,
      topSearchedCodes,
      topBrands,
      topUsers,
      errorCodeFrequency,
      activityByHour,
    };
  } catch (error) {
    console.error("Failed to fetch analytics stats:", error);
    return {
      totalPageViews: 0,
      totalSearches: 0,
      pageViews: [],
      topSearchedCodes: [],
      topBrands: [],
      topUsers: [],
      errorCodeFrequency: [],
      activityByHour: [],
    };
  }
}

/**
 * Get analytics for a specific date range
 */
export async function getAnalyticsForDateRange(
  startDate: string,
  endDate: string
): Promise<AnalyticsStats> {
  return getAnalyticsStats({ startDate, endDate });
}

/**
 * Track a page view
 */
export async function trackPageView(path: string): Promise<void> {
  return trackEvent("page_view", path);
}

/**
 * Track a search event
 */
export async function trackSearch(code: string, brand?: string): Promise<void> {
  return trackEvent("search", undefined, { code, brand });
}

/**
 * Track a button click
 */
export async function trackClick(label: string, meta?: Record<string, any>): Promise<void> {
  return trackEvent("click", undefined, { label, ...meta });
}

/**
 * Track an error code view
 */
export async function trackErrorCodeView(
  code: string,
  systemName: string
): Promise<void> {
  return trackEvent("error_code_view", undefined, { errorCode: code, systemName });
}
