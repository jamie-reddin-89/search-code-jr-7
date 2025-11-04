# Implementation Plan (Admin + App-wide Enhancements)

Owner: Admin (jayjay.r@outlook.com)
Current version (Settings > About): 1.9.0
Target version after implementation: 1.9.0

Legend: [ ] pending • [x] complete • [~] partial

Phase 0 — Prerequisites and Access
- [x] Verify Supabase env vars configured (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- [x] Confirm RLS policies for app_logs, app_analytics, contact_messages (admin read; authenticated insert where needed)
- [~] Ensure Edge Function secrets set (SENDGRID_API_KEY, SENDGRID_FROM, CONTACT_TO, SUPABASE_SERVICE_ROLE_KEY) — Changed to direct table insert
- [x] Create/confirm tables and indexes via SQL:
  - [x] contact_messages table (DDL below)
  - [ ] error_codes_db brand_id/model_id columns + index (optional but recommended)

Phase 1 — Admin insert flows + app-wide propagation
- [ ] AdminAddDevice inserts into brands/models/categories/tags/media/urls (src/pages/AdminAddDevice.tsx)
- [ ] Add realtime subscriptions for categories/tags/media/urls (deviceManager.subscribe pattern)
- [ ] Replace hardcoded systemNames in Admin error-code form with dynamic model list from Supabase (src/pages/Admin.tsx)
- [ ] Use generateRouteSlug(brand, model) or model.id as value; label “Brand — Model”
- [ ] Make home buttons dynamic from brands/models (src/pages/Index.tsx), remove buttonNames array
- [ ] Verify new items appear app-wide in real time without refresh

Phase 2 — Users list shows all signed-up users
- [ ] Create Edge Function admin-users to fetch Auth users via Admin API with admin check
- [ ] Update getAllUsers() to call admin-users, fallback to current user_roles join (src/lib/userTracking.ts)
- [ ] AdminUsers page renders email, created_at, last_sign_in_at, roles, ban/state (src/pages/AdminUsers.tsx)
- [ ] Add refresh and error states using toast; confirm new signups appear

Phase 3 — App-wide logging with live updates
- [ ] Logger utilities (logInfo/logWarn/logError/getLogs/etc.) exist (src/lib/logger.ts)
- [ ] Admin logs page exists (src/pages/AdminAppLogs.tsx)
- [ ] Add Supabase realtime subscription on app_logs; append new entries live and update stats
- [ ] Wire global handlers: window.onerror/unhandledrejection -> logError (src/components/AnalyticsListener.tsx)
- [ ] Optional: Add React ErrorBoundary to capture render errors and logError

Phase 4 — Analytics capture + Admin analytics
- [ ] app_analytics + search_analytics tables available (types present)
- [ ] Switch AnalyticsListener to lib/analytics.trackEvent/trackPageView/trackClick (src/components/AnalyticsListener.tsx)
- [ ] Search tracking writes to search_analytics (present) and should also call lib/analytics.trackEvent("search") (src/hooks/useAnalytics.ts) — verify
- [ ] Ensure AdminAnalytics uses getAnalyticsStats (already) and events flow end-to-end
- [ ] Optional: record user_sessions/user_activity on login/logout/page views

Phase 5 — UI consistency, themes, scrollbars
- [ ] Shared classes exist (.nav-button, .home-button, .page-container) (src/index.css)
- [ ] Audit pages to ensure consistent usage of bg-background/text-foreground/border
- [ ] Extend global CSS to hide visual scrollbars while allowing scroll for body and scroll regions
- [ ] Verify light: light background + dark text; dark: dark background + light text; fix outliers

Phase 6 — Dynamic device subpages and per-model codes
- [ ] Add route /device/:slug in src/App.tsx
- [ ] Create src/pages/DevicePage.tsx that loads by slug via getDeviceBySlug() and lists codes
- [ ] Index links: brand+model buttons -> /device/:slug and subscribe to realtime updates
- [ ] Optional: extend error_codes_db with brand_id/model_id; DevicePage filters by model_id

Phase 7 — Settings improvements
General tab (src/components/Settings.tsx)
- [ ] Wrap in bordered, rounded container
- [ ] Add Save button to persist the group (offlineMode, notifications, tooltips, slimLineMode) at once
- [ ] Add suggested settings: default landing model, units (°C/°F, currency), language, data saver, confirm-on-delete

Account tab
- [ ] Improve layout with sections (Profile, Security, Data); responsive 1–2 cols; align buttons

About tab
- [ ] Remove “Contact: {email}” line
- [ ] Show “Created by: Jamie Reddin, Version: 1.8.5” on one row
- [ ] Move Contact button to top row actions near title

Phase 8 — Messages admin page
- [ ] Edge function contact-send sends email; can store to contact_messages with service role
- [ ] Create src/pages/AdminMessages.tsx to list contact_messages with filters and details
- [ ] Add route /admin/messages and nav button in Admin dashboard (src/pages/Admin.tsx)
- [ ] Add realtime subscription on contact_messages to live-update list

Phase 9 — Integrations (optional but recommended)
- [ ] Connect Supabase MCP for DB/auth management and RLS reviews
- [ ] Connect Sentry for prod error monitoring (complements app_logs)
- [ ] Connect Netlify for CI/CD deploys and previews
- [ ] Connect Zapier to route contact_messages to Slack/Email

Phase 10 — Performance and quality
- [ ] Code-split heavy charts/pages; lazy-load
- [ ] Add retry/backoff for logging/analytics writes
- [ ] Add PWA SW for offline caching of codes and background sync
- [ ] Fuzzy search in error_codes_db; CSV import/export of error codes
- [ ] Granular RBAC (moderator scope)
- [ ] Add correlation ID to logs/analytics; include device info in analytics meta

Release Tasks
- [ ] Update Settings > About version text to 1.9.0
- [ ] Smoke test all admin pages and public views (light/dark)
- [ ] Verify RLS and permissions with a non-admin account

SQL (DDL)
contact_messages
```
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
Optional error_codes_db evolution
```
ALTER TABLE public.error_codes_db
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id),
  ADD COLUMN IF NOT EXISTS model_id uuid REFERENCES public.models(id);
CREATE INDEX IF NOT EXISTS idx_error_codes_model_id ON public.error_codes_db(model_id);
```

Notes
- Use Edge Functions for privileged operations (auth users listing, emailing, server-side inserts with service role).
- Keep accessibility: preserve focus outlines while hiding scrollbars visually.
