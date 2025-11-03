import { useState, useRef, useEffect } from "react";
import { X, Camera, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PhotoDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiagnosisComplete?: (results: DiagnosisResult) => void;
}

export interface DiagnosisResult {
  equipmentIdentified: string;
  potentialIssues: string[];
  recommendations: string[];
  confidenceScore: number;
  imagePath?: string;
}

interface AnalysisResults {
  equipmentIdentified: string;
  potentialIssues: string[];
  recommendations: string[];
  confidenceScore: number;
}

const MOCK_ANALYSIS_RESULTS: AnalysisResults[] = [
  {
    equipmentIdentified: "Heat Pump Compressor Unit",
    potentialIssues: [
      "Possible refrigerant leakage",
      "Worn compressor bearings",
      "Electrical connection corrosion",
    ],
    recommendations: [
      "Test refrigerant pressure levels",
      "Inspect compressor noise and vibration",
      "Clean electrical terminals",
      "Check for ice buildup on coils",
    ],
    confidenceScore: 0.92,
  },
  {
    equipmentIdentified: "Air Handler Unit",
    potentialIssues: [
      "Clogged air filter",
      "Blower motor malfunction",
      "Refrigerant line blockage",
    ],
    recommendations: [
      "Replace air filter immediately",
      "Test blower motor operation",
      "Check refrigerant line for ice",
      "Inspect ductwork for leaks",
    ],
    confidenceScore: 0.87,
  },
  {
    equipmentIdentified: "Outdoor Condenser Unit",
    potentialIssues: [
      "Debris accumulation on fins",
      "Fan motor issues",
      "Thermostat sensor failure",
    ],
    recommendations: [
      "Clean condenser coils and fins",
      "Inspect fan motor for damage",
      "Test thermostat sensors",
      "Check coolant circulation",
    ],
    confidenceScore: 0.89,
  },
];

export default function PhotoDiagnosisModal({
  isOpen,
  onClose,
  onDiagnosisComplete,
}: PhotoDiagnosisModalProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [progress, setProgress] = useState(0);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !capturedImage && !analysisResults) {
      startCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isOpen, capturedImage, analysisResults]);

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
        setCapturedImage(imageData);

        // Stop camera
        if (videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          setCameraActive(false);
        }

        toast({
          title: "Photo Captured",
          description: "Ready for analysis",
        });
      }
    }
  };

  const startAnalysis = async () => {
    if (!capturedImage) return;

    try {
      setAnalyzing(true);
      setProgress(0);

      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
      clearInterval(progressInterval);

      // Mock AI analysis - randomly select one of the mock results
      const mockResult =
        MOCK_ANALYSIS_RESULTS[
          Math.floor(Math.random() * MOCK_ANALYSIS_RESULTS.length)
        ];
      setAnalysisResults(mockResult);
      setProgress(100);

      toast({
        title: "Analysis Complete",
        description: "Equipment detected and issues identified",
      });
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const savePhotoToDatabase = async () => {
    if (!capturedImage || !analysisResults) return;

    try {
      setSavingPhoto(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Generate unique filename
      const filename = `diagnostic_photo_${Date.now()}.jpg`;
      const filePath = `diagnostic_photos/${user?.id || "anonymous"}/${filename}`;

      // Upload to Supabase Storage (optional - for production)
      // const { error: uploadError } = await supabase.storage
      //   .from("diagnostic_photos")
      //   .upload(filePath, blob);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("diagnostic_photos" as any)
        .insert([
          {
            storage_path: filePath,
            equipment_identified: analysisResults.equipmentIdentified,
            ai_analysis: JSON.stringify({
              potentialIssues: analysisResults.potentialIssues,
              recommendations: analysisResults.recommendations,
            }),
            confidence_score: analysisResults.confidenceScore,
            user_id: user?.id || null,
          },
        ]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo saved and analysis recorded",
      });

      // Call completion callback
      if (onDiagnosisComplete) {
        onDiagnosisComplete({
          ...analysisResults,
          imagePath: filePath,
        });
      }

      // Close modal
      handleClose();
    } catch (error: any) {
      console.error("Error saving photo:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Unable to save photo",
        variant: "destructive",
      });
    } finally {
      setSavingPhoto(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAnalysisResults(null);
    setProgress(0);
    startCamera();
  };

  const handleClose = () => {
    setCapturedImage(null);
    setAnalysisResults(null);
    setProgress(0);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photo Diagnosis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Position your heat pump equipment in the camera and capture a clear photo for analysis.
              </p>

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
            </div>
          ) : !analysisResults ? (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured equipment"
                  className="w-full h-auto"
                />
              </div>

              {analyzing && (
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

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  disabled={analyzing}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button
                  onClick={startAnalysis}
                  disabled={analyzing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {analyzing ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  ✓ Equipment Identified
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {analysisResults.equipmentIdentified}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  Confidence: {(analysisResults.confidenceScore * 100).toFixed(0)}%
                </p>
              </div>

              {analysisResults.potentialIssues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Potential Issues:</h4>
                  <ul className="space-y-1">
                    {analysisResults.potentialIssues.map((issue, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-red-500">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResults.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {analysisResults.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-blue-500">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button
                  onClick={savePhotoToDatabase}
                  disabled={savingPhoto}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {savingPhoto ? "Saving..." : "Save Results"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
