import { useState } from "react";
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

export const Settings = () => {
  const [offlineMode, setOfflineMode] = useState(
    localStorage.getItem("offlineMode") === "true"
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );
  const { theme, toggleTheme } = useTheme();

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle" className="flex flex-col gap-1">
                <span className="font-medium">Dark Mode</span>
                <span className="text-sm text-muted-foreground">
                  Toggle application theme
                </span>
              </Label>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={(checked) => {
                  const isDark = theme === "dark";
                  if (checked !== isDark) toggleTheme();
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="offline-mode" className="flex flex-col gap-1">
                <span className="font-medium">Offline Mode</span>
                <span className="text-sm text-muted-foreground">
                  Download error codes for field work
                </span>
              </Label>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={handleOfflineModeChange}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span className="font-medium">Notifications</span>
                <span className="text-sm text-muted-foreground">
                  Enable app notifications
                </span>
              </Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="about" className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 text-primary" />
              <div className="space-y-2">
                <h3 className="font-semibold">Heat Pump Error Code Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  A comprehensive diagnostic tool for heat pump technicians. Search
                  and troubleshoot error codes across multiple manufacturers
                  including Joule, Panasonic, Hitachi, LG, Grant, and more.
                </p>
                <p className="text-sm text-muted-foreground">
                  Features include AI-assisted diagnosis, service history tracking,
                  cost estimation, equipment scanning, and offline mode for field
                  work. Access troubleshooting guides, related error codes, and
                  video tutorials all in one place.
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Created by:</span>{" "}
                <a
                  href="https://jayreddin.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Jamie Reddin
                </a>
              </p>
              <p>
                <span className="font-medium">Version:</span> 1.5.6
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
