import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipProvider as TooltipToggleProvider } from "@/contexts/TooltipContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminFixSteps from "./pages/AdminFixSteps";
import AdminAppLogs from "./pages/AdminAppLogs";
import AdminAddErrorInfo from "./pages/AdminAddErrorInfo";
import AdminAddErrorCode from "./pages/AdminAddErrorCode";
import AdminAddDevice from "./pages/AdminAddDevice";
import ButtonPage from "./components/ButtonPage";
import InstallPrompt from "./components/InstallPrompt";
import AIAssistant from "./components/AIAssistant";
import AdminRoute from "./components/AdminRoute";
import AnalyticsListener from "./components/AnalyticsListener";
import SyncBridge from "./components/SyncBridge";

const queryClient = new QueryClient();

const buttonRoutes = [
  "Joule Victorum",
  "Joule Samsung",
  "Joule Modular Air",
  "DeDietrich Strateo",
  "LG Thermia",
  "Hitachi Yutaki",
  "Panasonic Aquarea",
  "Grant Areona",
  "Itec Thermia",
  "Smart Control",
  "System Status",
].map((name) => ({
  path: `/${name.toLowerCase().replace(/\s+/g, "-")}`,
  element: <ButtonPage title={name} />,
}));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <TooltipToggleProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
          <AIAssistant />
          <HashRouter>
            <AnalyticsListener />
            <SyncBridge />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path="/admin/fix-steps" element={<AdminRoute><AdminFixSteps /></AdminRoute>} />
              <Route path="/admin/app-logs" element={<AdminRoute><AdminAppLogs /></AdminRoute>} />
              <Route path="/admin/add-error-info" element={<AdminRoute><AdminAddErrorInfo /></AdminRoute>} />
              <Route path="/admin/add-device" element={<AdminRoute><AdminAddDevice /></AdminRoute>} />
              <Route path="/pdf-files" element={<ButtonPage title="PDF Files" />} />
              {buttonRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </HashRouter>
        </TooltipToggleProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
