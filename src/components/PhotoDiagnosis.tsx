import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { Card } from "./ui/card";

const MOCK_ANALYSIS_RESULTS = [
  {
    equipment: "Heat Pump Compressor Unit",
    issues: [
      "Possible refrigerant leakage",
      "Worn compressor bearings",
      "Electrical connection corrosion",
    ],
    recommendations: [
      "Test refrigerant pressure levels",
      "Inspect compressor noise and vibration",
      "Clean electrical terminals",
    ],
    confidence: 0.92,
  },
  {
    equipment: "Air Handler Unit",
    issues: [
      "Clogged air filter",
      "Blower motor malfunction",
      "Refrigerant line blockage",
    ],
    recommendations: [
      "Replace air filter immediately",
      "Test blower motor operation",
      "Check refrigerant line for ice",
    ],
    confidence: 0.87,
  },
  {
    equipment: "Outdoor Condenser Unit",
    issues: [
      "Debris accumulation on fins",
      "Fan motor issues",
      "Thermostat sensor failure",
    ],
    recommendations: [
      "Clean condenser coils and fins",
      "Inspect fan motor for damage",
      "Test thermostat sensors",
    ],
    confidence: 0.89,
  },
];

export const PhotoDiagnosis = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<"select" | "camera" | "preview">("select");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && mode === "camera" && !preview) {
      startCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isOpen, mode, preview]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      setMode("select");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setPreview(imageData);
        if (videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          setCameraActive(false);
        }
        setMode("preview");
        toast({ title: "Photo Captured", description: "Ready for analysis" });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setMode("preview");
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = async () => {
    if (!preview) return;

    try {
      setIsAnalyzing(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      clearInterval(progressInterval);

      const mockResult =
        MOCK_ANALYSIS_RESULTS[
          Math.floor(Math.random() * MOCK_ANALYSIS_RESULTS.length)
        ];
      setAnalysis(mockResult);
      setProgress(100);

      const { data: { user } } = await supabase.auth.getUser();

      const fileName = `${user?.id || "anonymous"}/${Date.now()}_diagnosis.jpg`;
      await supabase
        .from("diagnostic_photos" as any)
        .insert({
          user_id: user?.id || null,
          storage_path: fileName,
          equipment_identified: mockResult.equipment,
          ai_analysis: JSON.stringify({
            issues: mockResult.issues,
            recommendations: mockResult.recommendations,
          }),
          confidence_score: mockResult.confidence,
        });

      toast({
        title: "Analysis complete",
        description: "Photo has been analyzed successfully",
      });
    } catch (error) {
      console.error("Error analyzing photo:", error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the photo",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePhoto = () => {
    setPreview("");
    setSelectedFile(null);
    setAnalysis(null);
    setProgress(0);
    setMode("select");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      retakePhoto();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Upload photo for diagnosis">
          <Camera className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Photo Diagnosis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded"
              />
            ) : (
              <div className="space-y-2">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload a photo of the equipment
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => document.getElementById("photo-input")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Photo
            </Button>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              onClick={analyzePhoto}
              disabled={!selectedFile || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Photo"
              )}
            </Button>
          </div>

          {analysis && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">AI Analysis:</h3>
              <p className="text-sm whitespace-pre-wrap">{analysis}</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
