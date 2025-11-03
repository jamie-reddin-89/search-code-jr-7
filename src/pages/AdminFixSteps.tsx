import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Wrench, Plus, Trash2 } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { supabase } from "@/integrations/supabase/client";

interface FixStep {
  id: string;
  brand_id?: string;
  model_id?: string;
  error_code?: string;
  title?: string;
  content?: string;
  tags?: string[];
  media_urls?: string[];
  created_at?: string;
  updated_at?: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  brand_id: string;
}

export default function AdminFixSteps() {
  const [steps, setSteps] = useState<FixStep[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<FixStep>({
    id: crypto.randomUUID(),
    tags: [],
    media_urls: []
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (draft.brand_id) {
      const filtered = models.filter(m => m.brand_id === draft.brand_id);
      setFilteredModels(filtered);
      if (!draft.model_id || !filtered.find(m => m.id === draft.model_id)) {
        setDraft({ ...draft, model_id: "" });
      }
    } else {
      setFilteredModels([]);
    }
  }, [draft.brand_id, models]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stepsResult, brandsResult, modelsResult] = await Promise.all([
        supabase.from("fix_steps").select("*").order("created_at", { ascending: false }),
        supabase.from("brands").select("*").order("name"),
        supabase.from("models").select("*").order("name"),
      ]);

      if (stepsResult.data) setSteps(stepsResult.data);
      if (brandsResult.data) setBrands(brandsResult.data);
      if (modelsResult.data) setModels(modelsResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!draft.title || !draft.brand_id || !draft.model_id || !draft.content) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const newStep = {
        id: draft.id,
        brand_id: draft.brand_id,
        model_id: draft.model_id,
        error_code: draft.error_code || null,
        title: draft.title,
        content: draft.content,
        tags: draft.tags || [],
        media_urls: draft.media_urls || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("fix_steps")
        .insert([newStep]);

      if (error) throw error;

      setSteps([newStep, ...steps]);
      setDraft({
        id: crypto.randomUUID(),
        tags: [],
        media_urls: []
      });
    } catch (error) {
      console.error("Error saving fix step:", error);
      alert("Failed to save fix step");
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fix_steps")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSteps(steps.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting fix step:", error);
      alert("Failed to delete fix step");
    }
  };

  const getBrandName = (brandId?: string) => {
    if (!brandId) return "";
    return brands.find(b => b.id === brandId)?.name || "";
  };

  const getModelName = (modelId?: string) => {
    if (!modelId) return "";
    return models.find(m => m.id === modelId)?.name || "";
  };

  return (
    <div className="page-container">
      <TopRightControls />
      <header className="flex items-center justify-between mb-8 w-full max-w-2xl">
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <button className="home-button" aria-label="Back to Admin">
              <ArrowLeft className="inline mr-2" /> Back
            </button>
          </Link>
          <Link to="/">
            <button className="home-button" aria-label="Go Home">
              <Home className="inline mr-2" /> Home
            </button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wrench size={20}/> Fix Steps</h1>
        <div className="w-10" />
      </header>

      <div className="w-full max-w-2xl grid gap-4">
        <div className="border rounded p-4 space-y-3 dark:bg-slate-900">
          <h2 className="font-semibold text-lg">New Fix Step</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Brand</label>
              <select
                value={draft.brand_id || ""}
                onChange={e => setDraft({...draft, brand_id: e.target.value})}
                className="w-full px-3 py-2 border rounded bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
              >
                <option value="">Select Brand...</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Model</label>
              <select
                value={draft.model_id || ""}
                onChange={e => setDraft({...draft, model_id: e.target.value})}
                disabled={!draft.brand_id}
                className="w-full px-3 py-2 border rounded bg-background text-foreground dark:bg-slate-800 dark:border-slate-700 disabled:opacity-50"
              >
                <option value="">Select Model...</option>
                {filteredModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Error Code (Optional)</label>
            <input
              className="w-full px-3 py-2 border rounded bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
              placeholder="E.g., E01, F02"
              value={draft.error_code || ""}
              onChange={e => setDraft({...draft, error_code: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Title</label>
            <input
              className="w-full px-3 py-2 border rounded bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
              placeholder="Fix step title"
              value={draft.title || ""}
              onChange={e => setDraft({...draft, title: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Step-by-Step Guide</label>
            <textarea
              className="w-full h-32 p-3 border rounded bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
              placeholder="Detailed instructions..."
              value={draft.content || ""}
              onChange={e => setDraft({...draft, content: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Tags (comma separated)</label>
            <input
              className="w-full px-3 py-2 border rounded bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
              placeholder="safety, electrical, refrigerant"
              value={(draft.tags || []).join(", ")}
              onChange={e => setDraft({...draft, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Media URLs (comma separated)</label>
            <input
              className="w-full px-3 py-2 border rounded bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
              placeholder="https://example.com/video1, https://example.com/image1"
              value={(draft.media_urls || []).join(", ")}
              onChange={e => setDraft({...draft, media_urls: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
            />
          </div>

          <button
            className="home-button w-full"
            onClick={saveDraft}
            aria-label="Save fix step"
            disabled={loading}
          >
            <Plus className="inline mr-2" size={16} /> Save Fix Step
          </button>
        </div>

        <div className="border rounded p-4 dark:bg-slate-900">
          <h2 className="font-semibold text-lg mb-4">Existing Fix Steps ({steps.length})</h2>
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {!loading && steps.length === 0 && <div className="text-sm text-muted-foreground">No fix steps yet.</div>}
          <div className="space-y-3">
            {steps.map(s => (
              <div key={s.id} className="border rounded p-3 dark:border-slate-700">
                <div className="font-semibold text-foreground">{s.title || "Untitled"}</div>
                <div className="text-xs text-muted-foreground">
                  {[getBrandName(s.brand_id), getModelName(s.model_id), s.error_code].filter(Boolean).join(" • ")}
                </div>
                {s.tags && s.tags.length > 0 && (
                  <div className="text-xs mt-1 text-muted-foreground">Tags: {s.tags.join(", ")}</div>
                )}
                <div className="mt-2 text-sm text-foreground whitespace-pre-wrap">{s.content}</div>
                {s.media_urls && s.media_urls.length > 0 && (
                  <ul className="list-disc ml-5 mt-2 text-sm">
                    {s.media_urls.map(u => (
                      <li key={u}>
                        <a
                          className="text-primary underline hover:opacity-80"
                          href={u}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {u}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3">
                  <button
                    className="home-button"
                    onClick={() => remove(s.id)}
                    aria-label="Delete fix step"
                  >
                    <Trash2 className="inline mr-2" size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
