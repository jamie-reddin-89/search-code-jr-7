import * as React from "react";
const { useEffect, useState } = React;
import { Settings as SettingsIcon, Info } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ContactForm from '@/components/ContactForm';
import { CONTACT_EMAIL } from '@/lib/config';

export const Settings = () => {
  const [offlineMode, setOfflineMode] = useState(
    localStorage.getItem("offlineMode") === "true"
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );
  const [enableTooltips, setEnableTooltips] = useState(
    localStorage.getItem("enableTooltips") === "true"
  );
  const [slimLineMode, setSlimLineMode] = useState(
    localStorage.getItem("slimLineMode") === "true"
  );
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleOfflineModeChange = (checked: boolean) => {
    setOfflineMode(checked);
    localStorage.setItem("offlineMode", String(checked));
    if (checked) {
      window.dispatchEvent(new CustomEvent("downloadOfflineData"));
    }
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("notifications", String(checked));
  };

  const handleEnableTooltipsChange = (checked: boolean) => {
    setEnableTooltips(checked);
    localStorage.setItem("enableTooltips", String(checked));
    window.dispatchEvent(new CustomEvent("tooltipsChanged"));
  };

  const handleSlimLineModeChange = (checked: boolean) => {
    setSlimLineMode(checked);
    localStorage.setItem("slimLineMode", String(checked));
    if (checked) document.body.classList.add("slim-line");
    else document.body.classList.remove("slim-line");
  };

  // Account Tab state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles" as any).select("full_name, email").eq("id", user.id).single();
          setUsername(profile?.full_name || "");
          setEmail(profile?.email || "");
        }
        // apply slim-line mode on open
        if (localStorage.getItem("slimLineMode") === "true") document.body.classList.add("slim-line");
      } catch (err) {
        console.warn("Error loading profile in settings:", err);
      }
    };
    load();
  }, []);

  const handleSaveUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles" as any).upsert({ id: user.id, full_name: username }, { returning: "minimal" });
      if (error) throw error;
      toast({ title: "Username updated" });
    } catch (err: any) {
      toast({ title: "Error updating username", description: err?.message ?? String(err), variant: "destructive" });
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!email) throw new Error("No email available");
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) throw error;
      toast({ title: "Password reset email sent" });
    } catch (err: any) {
      toast({ title: "Error sending reset", description: err?.message ?? String(err), variant: "destructive" });
    }
  };

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const { data: favorites } = await supabase.from("favorites" as any).select("*").eq("user_id", user.id);
      const { data: activity } = await supabase.from("user_activity" as any).select("*").eq("user_id", user.id);

      const payload = { favorites: favorites || [], activity: activity || [] };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export started" });
    } catch (err: any) {
      toast({ title: "Error exporting data", description: err?.message ?? String(err), variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("This will delete your profile and sign you out. Are you sure?")) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      // Delete profile and user_roles; cannot delete auth.user from client safely
      await supabase.from("user_roles" as any).delete().eq("user_id", user.id);
      await supabase.from("profiles" as any).delete().eq("id", user.id);
      await supabase.auth.signOut();
      toast({ title: "Account deleted and signed out" });
    } catch (err: any) {
      toast({ title: "Error deleting account", description: err?.message ?? String(err), variant: "destructive" });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle" className="flex flex-col gap-1">
                <span className="font-medium">Dark Mode</span>
                <span className="text-sm text-muted-foreground">Toggle application theme</span>
              </Label>
              <Switch id="theme-toggle" checked={theme === "dark"} onCheckedChange={(checked) => { const isDark = theme === "dark"; if (checked !== isDark) toggleTheme(); }} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="offline-mode" className="flex flex-col gap-1">
                <span className="font-medium">Offline Mode</span>
                <span className="text-sm text-muted-foreground">Download error codes for field work</span>
              </Label>
              <Switch id="offline-mode" checked={offlineMode} onCheckedChange={handleOfflineModeChange} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span className="font-medium">Notifications</span>
                <span className="text-sm text-muted-foreground">Enable app notifications</span>
              </Label>
              <Switch id="notifications" checked={notifications} onCheckedChange={handleNotificationsChange} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="tooltips" className="flex flex-col gap-1">
                <span className="font-medium">Enable Tooltips</span>
                <span className="text-sm text-muted-foreground">Show tooltips on hover for buttons</span>
              </Label>
              <Switch id="tooltips" checked={enableTooltips} onCheckedChange={handleEnableTooltipsChange} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="slimline" className="flex flex-col gap-1">
                <span className="font-medium">Slim Line Mode</span>
                <span className="text-sm text-muted-foreground">Compact UI with reduced padding</span>
              </Label>
              <Switch id="slimline" checked={slimLineMode} onCheckedChange={handleSlimLineModeChange} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="save-error-to-device" className="flex flex-col gap-1">
                <span className="font-medium">Save Error Codes to Device</span>
                <span className="text-sm text-muted-foreground">Enable offline syncing of error codes</span>
              </Label>
              <Switch id="save-error-to-device" checked={offlineMode} onCheckedChange={handleOfflineModeChange} />
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername((e as any).target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleSaveUsername}>Save</Button>
                <Button variant="ghost" onClick={() => { setUsername(""); }}>Clear</Button>
              </div>

              <Separator />

              <Label>Email</Label>
              <Input value={email} readOnly />
              <div className="flex gap-2">
                <Button onClick={handleResetPassword} disabled={!email}>Send Reset Email</Button>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={handleExportData}>Export My Data</Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 text-primary" />
              <div className="space-y-2">
                <h3 className="font-semibold">Heat Pump Error Code Assistant</h3>
                <p className="text-sm text-muted-foreground">Heat Pump Error Code Assistant: Professional diagnostic tool for HVAC technicians.</p>
                <p className="text-sm text-muted-foreground">Features: AI diagnosis, offline mode, service history, cost estimation, QR scanning, photo analysis.</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Created by:</span>{" "}
                <a href="https://jayreddin.github.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Jamie Reddin</a>
              </p>
              <p>
                <span className="font-medium">Version:</span> 1.5.9
              </p>

              <p>
                <span className="font-medium">Contact:</span> <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>
              </p>

              <div className="flex gap-2">
                <ContactForm />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
