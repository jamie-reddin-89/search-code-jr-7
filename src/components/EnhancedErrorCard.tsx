import { useState, useEffect } from "react";
import * as React from "react";
const { useState, useEffect } = React;
import { Star, StarOff, ExternalLink, Video, Clock, Wrench, Edit } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ErrorNotes } from "./ErrorNotes";
import { ErrorPhotos } from "./ErrorPhotos";

interface EnhancedErrorCardProps {
  code: string;
  meaning: string;
  solution: string;
  systemName: string;
  difficulty?: string;
  estimated_time?: string;
  manual_url?: string;
  video_url?: string;
  related_codes?: string[];
  troubleshooting_steps?: Array<{ step: number; description: string }>;
}

export function EnhancedErrorCard({
  code,
  meaning,
  solution,
  systemName,
  difficulty,
  estimated_time,
  manual_url,
  video_url,
  related_codes,
  troubleshooting_steps,
}: EnhancedErrorCardProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { isFavorite, toggleFavorite } = useFavorites(userId);
  const { isAdmin } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const favorite = isFavorite(systemName, code);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500",
  };

  const handleEdit = () => {
    // Navigate to admin page with pre-filled data
    window.location.href = `/admin?edit=${code}&system=${systemName}`;
  };

  return (
    <Card className="w-full hover-scale transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <CardTitle className="text-2xl flex items-center gap-2 mb-2 animate-fade-in">
              <span className="font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {code}
              </span>
              {difficulty && (
                <Badge
                  className={`${
                    difficultyColors[difficulty as keyof typeof difficultyColors]
                  } animate-scale-in`}
                >
                  {difficulty}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2 text-base">{meaning}</CardDescription>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="hover:bg-primary/10 transition-all duration-200"
              >
                <Edit className="h-5 w-5 text-primary" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(systemName, code)}
              className="hover:scale-110 transition-transform duration-200"
            >
              {favorite ? (
                <Star className="h-5 w-5 fill-current text-yellow-500 animate-pulse" />
              ) : (
                <StarOff className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 animate-fade-in">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 transition-all duration-300 hover:bg-primary/10">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Solution:
          </h4>
          <p className="text-sm leading-relaxed">{solution}</p>
        </div>

        {estimated_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 animate-slide-in-right">
            <Clock className="h-4 w-4 text-primary" />
            <span>Estimated time: <strong>{estimated_time}</strong></span>
          </div>
        )}

        {troubleshooting_steps && troubleshooting_steps.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full hover:bg-primary/10 transition-all duration-300">
                <Wrench className="mr-2 h-4 w-4" />
                {isOpen ? "Hide" : "Show"} Troubleshooting Steps
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-3 animate-accordion-down">
              {troubleshooting_steps.map((step, index) => (
                <div 
                  key={step.step} 
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="font-bold text-primary text-lg min-w-[24px]">
                    {step.step}.
                  </span>
                  <p className="text-sm flex-1 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {related_codes && related_codes.length > 0 && (
          <div className="animate-fade-in">
            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
              Related Codes:
            </h4>
            <div className="flex flex-wrap gap-2">
              {related_codes.map((relatedCode, index) => (
                <Badge 
                  key={relatedCode} 
                  variant="outline" 
                  className="hover:bg-primary/10 hover:border-primary transition-all duration-200 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {relatedCode}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {manual_url && (
            <Button variant="outline" size="sm" asChild className="hover-scale hover:bg-primary/10 transition-all duration-200">
              <a href={manual_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manual
              </a>
            </Button>
          )}
          {video_url && (
            <Button variant="outline" size="sm" asChild className="hover-scale hover:bg-primary/10 transition-all duration-200">
              <a href={video_url} target="_blank" rel="noopener noreferrer">
                <Video className="mr-2 h-4 w-4" />
                Video Guide
              </a>
            </Button>
          )}
        </div>

        {userId && (
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="notes">
              <AccordionTrigger>Service Notes & Photos</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <ErrorNotes systemName={systemName} errorCode={code} userId={userId} />
                <ErrorPhotos systemName={systemName} errorCode={code} userId={userId} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
