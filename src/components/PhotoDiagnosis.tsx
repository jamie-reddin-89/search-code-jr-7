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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Upload photo for diagnosis">
          <Camera className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Photo Diagnosis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "select" && (
            <>
              <p className="text-sm text-muted-foreground">
                Position your heat pump equipment in the camera and capture a clear photo for analysis.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setMode("camera")}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <Camera className="h-6 w-6" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("photo-input")?.click()}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <Upload className="h-6 w-6" />
                  <span>Upload Photo</span>
                </Button>
              </div>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}

          {mode === "camera" && (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-600" />
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <Button
                onClick={capturePhoto}
                disabled={!cameraActive}
                className="w-full"
                size="lg"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (videoRef.current?.srcObject) {
                    const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                    tracks.forEach((track) => track.stop());
                  }
                  setMode("select");
                }}
              >
                Back
              </Button>
            </>
          )}

          {mode === "preview" && (
            <>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Captured equipment"
                  className="w-full h-auto"
                />
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing image...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {analysis ? (
                <Card className="p-4 space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      ✓ {analysis.equipment}
                    </h3>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Confidence: {(analysis.confidence * 100).toFixed(0)}%
                    </p>
                  </div>

                  {analysis.issues?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Potential Issues:</h4>
                      <ul className="space-y-1">
                        {analysis.issues.map((issue: string, i: number) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-red-500">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {analysis.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-blue-500">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    disabled={isAnalyzing}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button
                    onClick={analyzePhoto}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              )}

              {analysis && (
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Photo
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
