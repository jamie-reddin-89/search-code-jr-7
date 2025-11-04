import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Plus, Trash2 } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { subscribeToMetadata } from "@/lib/deviceManager";
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
import { supabase } from "@/integrations/supabase/client";

interface DeviceItem {
  id: string;
  type: "brand" | "model" | "category" | "tag" | "media" | "url";
  name: string;
  value?: string;
  description?: string;
  created_at?: string;
}

export default function AdminAddDevice() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"brand" | "model" | "category" | "tag" | "media" | "url" | null>(null);
  const [items, setItems] = useState<DeviceItem[]>({} as any);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAllItems();
    loadBrands();
    const unsubscribe = subscribeToMetadata(() => {
      // Refresh lists when metadata changes elsewhere
      loadAllItems();
      loadBrands();
    });
    return () => unsubscribe();
  }, []);

  const loadAllItems = async () => {
    try {
      setLoading(true);
      const [brandsData, modelsData, categoriesData, tagsData, mediaData, urlsData] = await Promise.all([
        supabase.from("public.brands" as any).select("*"),
        supabase.from("public.models" as any).select("*"),
        supabase.from("public.categories" as any).select("*"),
        supabase.from("public.tags" as any).select("*"),
        supabase.from("public.media" as any).select("*"),
        supabase.from("public.urls" as any).select("*"),
      ]);

      setItems({
        brand: (brandsData.data || []).map((item: any) => ({
          id: item.id,
          type: "brand",
          name: item.name,
          description: item.description,
          value: item.logo_url,
          created_at: item.created_at,
        })),
        model: (modelsData.data || []).map((item: any) => ({
          id: item.id,
          type: "model",
          name: item.name,
          description: item.description,
          value: item.specs,
          created_at: item.created_at,
        })),
        category: (categoriesData.data || []).map((item: any) => ({
          id: item.id,
          type: "category",
          name: item.name,
          description: item.description,
          created_at: item.created_at,
        })),
        tag: (tagsData.data || []).map((item: any) => ({
          id: item.id,
          type: "tag",
          name: item.name,
          description: item.description,
          created_at: item.created_at,
        })),
        media: (mediaData.data || []).map((item: any) => ({
          id: item.id,
          type: "media",
          name: item.name,
          value: item.url,
          description: item.description,
          created_at: item.created_at,
        })),
        url: (urlsData.data || []).map((item: any) => ({
          id: item.id,
          type: "url",
          name: item.name,
          value: item.url,
          description: item.description,
          created_at: item.created_at,
        })),
      });
    } catch (error: any) {
      console.error("Error loading items:", error);
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const { data } = await supabase.from("public.brands" as any).select("*");
      setBrands(data || []);
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  const handleOpenDialog = (type: "brand" | "model" | "category" | "tag" | "media" | "url") => {
    setDialogMode(type);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }

      const dataToInsert: any = {
        name: formData.name,
        description: formData.description || null,
      };

      switch (dialogMode) {
        case "brand":
          dataToInsert.logo_url = formData.value || null;
          await supabase.from("public.brands" as any).insert([dataToInsert]);
          break;
        case "model":
          dataToInsert.brand_id = formData.brand_id;
          dataToInsert.specs = formData.value || null;
          await supabase.from("public.models" as any).insert([dataToInsert]);
          break;
        case "category":
          await supabase.from("public.categories" as any).insert([dataToInsert]);
          break;
        case "tag":
          await supabase.from("public.tags" as any).insert([dataToInsert]);
          break;
        case "media":
          dataToInsert.url = formData.value;
          dataToInsert.type = formData.media_type || "image";
          await supabase.from("public.media" as any).insert([dataToInsert]);
          break;
        case "url":
          dataToInsert.url = formData.value;
          dataToInsert.category = formData.category || null;
          await supabase.from("public.urls" as any).insert([dataToInsert]);
          break;
      }

      setIsDialogOpen(false);
      setDialogMode(null);

      toast({
        title: "Success",
        description: `${dialogMode} added successfully`,
      });

      loadAllItems();
      loadBrands();
    } catch (error: any) {
      toast({
        title: "Error saving item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const tableMap: Record<string, string> = {
        brand: "public.brands",
        model: "public.models",
        category: "public.categories",
        tag: "public.tags",
        media: "public.media",
        url: "public.urls",
      };

      await supabase.from(tableMap[type] as any).delete().eq("id", id);

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      loadAllItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading && !Object.keys(items).length) {
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
      <header className="flex items-center justify-between mb-8 w-full max-w-4xl">
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
        <h1 className="text-2xl font-bold">Add Device</h1>
        <div className="w-10" />
      </header>

      <div className="button-container max-w-4xl">
        {["brand", "model", "category", "tag", "media", "url"].map((type) => (
          <Dialog key={type} open={isDialogOpen && dialogMode === type} onOpenChange={(open) => {
            if (!open) {
              setIsDialogOpen(false);
              setDialogMode(null);
            }
          }}>
            <DialogTrigger asChild>
              <button
                className="nav-button flex items-center justify-center gap-2"
                onClick={() => handleOpenDialog(type as any)}
              >
                <Plus size={20} />
                {getTypeLabel(type)}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add {getTypeLabel(type)}</DialogTitle>
              </DialogHeader>
              <DeviceItemForm
                type={type as any}
                onSave={handleSave}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setDialogMode(null);
                }}
                brands={brands}
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>

      <div className="w-full max-w-4xl mt-8 grid gap-4">
        {["brand", "model", "category", "tag", "media", "url"].map((type) => {
          const typeItems = (items as any)[type] || [];
          if (typeItems.length === 0) return null;

          return (
            <div key={type} className="border rounded-lg p-4">
              <h2 className="font-bold text-lg mb-4">{getTypeLabel(type)}s ({typeItems.length})</h2>
              <div className="space-y-2">
                {typeItems.map((item: DeviceItem) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded flex justify-between items-start bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.value && <div className="text-sm text-muted-foreground truncate">{item.value}</div>}
                      {item.description && <div className="text-sm mt-1">{item.description}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id, type)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(items).every((key) => (items as any)[key].length === 0) && !loading && (
        <div className="w-full max-w-4xl mt-8 text-center text-muted-foreground">
          <p>Add items by clicking the buttons above</p>
        </div>
      )}
    </div>
  );
}

function DeviceItemForm({
  type,
  onSave,
  onCancel,
  brands,
}: {
  type: "brand" | "model" | "category" | "tag" | "media" | "url";
  onSave: (data: any) => void;
  onCancel: () => void;
  brands: any[];
}) {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    brand_id: "",
    media_type: "image",
    category: "",
    description: "",
  });

  const getFieldLabels = () => {
    switch (type) {
      case "brand":
        return { name: "Brand Name", value: "Logo URL", description: "Description" };
      case "model":
        return { name: "Model Name", value: "Specs (JSON)", description: "Description" };
      case "category":
        return { name: "Category Name", value: undefined, description: "Description" };
      case "tag":
        return { name: "Tag Name", value: undefined, description: "Description" };
      case "media":
        return { name: "Media Name", value: "Media URL", description: "Description" };
      case "url":
        return { name: "URL Name", value: "URL Link", description: "Description" };
      default:
        return { name: "Name", value: "Value", description: "Description" };
    }
  };

  const labels = getFieldLabels();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
        setFormData({ name: "", value: "", brand_id: "", media_type: "image", category: "", description: "" });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">{labels.name}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder={`Enter ${labels.name.toLowerCase()}`}
        />
      </div>

      {type === "model" && (
        <div>
          <Label htmlFor="brand_id">Brand</Label>
          <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand: any) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "media" && (
        <div>
          <Label htmlFor="media_type">Media Type</Label>
          <Select value={formData.media_type} onValueChange={(value) => setFormData({ ...formData, media_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "url" && (
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., documentation, support"
          />
        </div>
      )}

      {labels.value && (
        <div>
          <Label htmlFor="value">{labels.value}</Label>
          <Input
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder={`Enter ${labels.value.toLowerCase()}`}
          />
        </div>
      )}

      <div>
        <Label htmlFor="description">{labels.description}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description (optional)"
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
