import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Plus, Edit, Trash2, Users, BarChart3, Wrench, ScrollText, FilePlus2, Package, Mail } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllDevices, subscribeToDevices, generateRouteSlug, type DeviceWithBrand } from "@/lib/deviceManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


interface ErrorCode {
  id: string;
  code: string;
  system_name: string;
  meaning: string;
  solution: string;
  difficulty?: string | null;
  estimated_time?: string | null;
  manual_url?: string | null;
  video_url?: string | null;
  related_codes?: string[] | null;
  troubleshooting_steps?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}

export default function Admin() {
  const { isAdmin, loading } = useUserRole();
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);
  const [editingCode, setEditingCode] = useState<ErrorCode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [devices, setDevices] = useState<DeviceWithBrand[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      loadErrorCodes();
      loadDevices();
    }
  }, [isAdmin]);

  useEffect(() => {
    const unsubscribe = subscribeToDevices((newDevices) => {
      setDevices(newDevices);
    });
    return unsubscribe;
  }, []);

  async function loadDevices() {
    try {
      setDevicesLoading(true);
      const allDevices = await getAllDevices();
      setDevices(allDevices);
    } catch (error: any) {
      console.error("Error loading devices:", error?.message ?? JSON.stringify(error, Object.getOwnPropertyNames(error)), error);
      toast({ title: "Error loading devices", description: error?.message ?? "An unexpected error occurred", variant: "destructive" });
    } finally {
      setDevicesLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editCode = params.get('edit');
    const systemName = params.get('system');
    
    if (editCode && systemName && errorCodes.length > 0) {
      const codeToEdit = errorCodes.find(
        c => c.code === editCode && c.system_name === systemName
      );
      if (codeToEdit) {
        setEditingCode(codeToEdit);
        setIsDialogOpen(true);
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [errorCodes]);

  async function loadErrorCodes() {
    const { data, error } = await (supabase as any)
      .from("error_codes_db" as any)
      .select("*")
      .order("system_name", { ascending: true })
      .order("code", { ascending: true });

    if (error) {
      toast({
        title: "Error loading codes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setErrorCodes(data || []);
    }
  }

  async function handleSave(formData: any) {
    try {
      const dataToSave = {
        code: formData.code,
        system_name: formData.system_name,
        meaning: formData.meaning,
        solution: formData.solution,
        difficulty: formData.difficulty || null,
        estimated_time: formData.estimated_time || null,
        manual_url: formData.manual_url || null,
        video_url: formData.video_url || null,
        related_codes: formData.related_codes || null,
        troubleshooting_steps: formData.troubleshooting_steps || null,
      };

      if (editingCode?.id) {
        const { error } = await (supabase as any)
          .from("error_codes_db" as any)
          .update(dataToSave)
          .eq("id", editingCode.id);

        if (error) throw error;
        toast({ title: "Error code updated successfully" });
      } else {
        const { error } = await (supabase as any)
          .from("error_codes_db" as any)
          .insert([dataToSave]);

        if (error) throw error;
        toast({ title: "Error code created successfully" });
      }

      setIsDialogOpen(false);
      setEditingCode(null);
      loadErrorCodes();
    } catch (error: any) {
      toast({
        title: "Error saving code",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this error code?")) return;

    const { error } = await (supabase as any)
      .from("error_codes_db" as any)
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting code",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Error code deleted successfully" });
      loadErrorCodes();
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopRightControls />
      <header className="flex items-center justify-between mb-8 w-full max-w-xl">
        <Link to="/">
          <Button variant="ghost" size="icon" aria-label="Go home">
            <Home size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="w-10" />
      </header>

      <div className="button-container">
        <Link to="/admin/users" className="nav-button flex items-center justify-center gap-2">
          <Users size={20} />
          Users
        </Link>
        <Link to="/admin/messages" className="nav-button flex items-center justify-center gap-2">
          <Mail size={20} />
          Messages
        </Link>
        <Link to="/admin/analytics" className="nav-button flex items-center justify-center gap-2">
          <BarChart3 size={20} />
          Analytics
        </Link>
        <Link to="/admin/fix-steps" className="nav-button flex items-center justify-center gap-2">
          <Wrench size={20} />
          Fix Steps
        </Link>
        <Link to="/admin/app-logs" className="nav-button flex items-center justify-center gap-2">
          <ScrollText size={20} />
          App Logs
        </Link>
        <Link to="/admin/add-device" className="nav-button flex items-center justify-center gap-2">
          <Package size={20} />
          Add Device
        </Link>
        <Link to="/admin/add-error-info" className="nav-button flex items-center justify-center gap-2">
          <FilePlus2 size={20} />
          Add Error Info
        </Link>
        {/* Device quick-links removed from Admin dashboard — these belong on the public main UI to avoid cluttering admin controls */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="nav-button flex items-center justify-center gap-2" onClick={() => setEditingCode(null)}>
              <Plus size={20} />
              Add Error Code
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? "Edit Error Code" : "Add Error Code"}
              </DialogTitle>
            </DialogHeader>
            <ErrorCodeForm
              errorCode={editingCode}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
              devices={devices}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full max-w-xl mt-8 grid gap-4">
        {errorCodes.map((code) => (
          <div
            key={code.id}
            className="p-4 border rounded-lg flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{code.code}</h3>
                <span className="text-sm text-muted-foreground">
                  {code.system_name}
                </span>
              </div>
              <p className="text-sm mb-1">
                <strong>Meaning:</strong> {code.meaning}
              </p>
              <p className="text-sm">
                <strong>Solution:</strong> {code.solution}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingCode(code);
                  setIsDialogOpen(true);
                }}
                aria-label="Edit error code"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(code.id)}
                aria-label="Delete error code"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorCodeForm({
  errorCode,
  onSave,
  onCancel,
}: {
  errorCode: ErrorCode | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  devices: DeviceWithBrand[];
}) {
  const [formData, setFormData] = useState<any>(
    errorCode || {
      code: "",
      system_name: "",
      meaning: "",
      solution: "",
      difficulty: "",
      estimated_time: "",
      manual_url: "",
      video_url: "",
      related_codes: [],
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="system_name">System Name</Label>
        <Select
          value={formData.system_name}
          onValueChange={(value) =>
            setFormData({ ...formData, system_name: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select system" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((d) => {
              const value = generateRouteSlug(d.brand?.name || "", d.name);
              const label = `${d.brand?.name || "Unknown Brand"} — ${d.name}`;
              return (
                <SelectItem key={d.id} value={value}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="code">Error Code</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="meaning">Meaning</Label>
        <Textarea
          id="meaning"
          value={formData.meaning}
          onChange={(e) =>
            setFormData({ ...formData, meaning: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="solution">Solution</Label>
        <Textarea
          id="solution"
          value={formData.solution}
          onChange={(e) =>
            setFormData({ ...formData, solution: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={formData.difficulty}
          onValueChange={(value) =>
            setFormData({ ...formData, difficulty: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="estimated_time">Estimated Time</Label>
        <Input
          id="estimated_time"
          value={formData.estimated_time}
          onChange={(e) =>
            setFormData({ ...formData, estimated_time: e.target.value })
          }
          placeholder="e.g., 30 minutes"
        />
      </div>

      <div>
        <Label htmlFor="manual_url">Manual URL</Label>
        <Input
          id="manual_url"
          type="url"
          value={formData.manual_url}
          onChange={(e) =>
            setFormData({ ...formData, manual_url: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="video_url">Video URL</Label>
        <Input
          id="video_url"
          type="url"
          value={formData.video_url}
          onChange={(e) =>
            setFormData({ ...formData, video_url: e.target.value })
          }
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
