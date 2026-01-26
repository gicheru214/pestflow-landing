import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Sparkles } from "lucide-react";

interface TooltipStep {
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface GuidedTourContextType {
  activeTour: string | null;
  setActiveTour: (tour: string | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completeTour: () => void;
}

const GuidedTourContext = createContext<GuidedTourContextType | null>(null);

export const useGuidedTour = () => {
  const context = useContext(GuidedTourContext);
  if (!context) throw new Error("useGuidedTour must be used within GuidedTourProvider");
  return context;
};

const featureTours: Record<string, TooltipStep[]> = {
  routes: [
    {
      target: "[data-testid='button-add-demo-jobs']",
      title: "Add Jobs First",
      content: "Click here to add demo jobs so you can see route optimization in action.",
      position: "bottom"
    },
    {
      target: "[data-testid='checkbox-job']",
      title: "Select Jobs",
      content: "Check the boxes next to jobs you want to include in today's route.",
      position: "right"
    },
    {
      target: "[data-testid='button-optimize-route']",
      title: "Optimize Route",
      content: "Click to automatically arrange jobs in the most efficient driving order. Saves 2+ hours daily!",
      position: "top"
    }
  ],
  materials: [
    {
      target: "[data-testid='input-add-material']",
      title: "Add Materials",
      content: "Enter your pest control products with their EPA registration numbers for compliance tracking.",
      position: "bottom"
    },
    {
      target: "[data-testid='list-materials']",
      title: "Material List",
      content: "Your materials appear here. Click the X to remove any item.",
      position: "left"
    }
  ],
  dashboard: [
    {
      target: "[data-testid='button-routes']",
      title: "Route Optimization",
      content: "Click here to optimize your daily routes and save hours of driving time.",
      position: "bottom"
    },
    {
      target: "[data-testid='button-materials']",
      title: "Materials Tracking",
      content: "Track your pest control products, locations, and target pests for compliance.",
      position: "bottom"
    }
  ]
};

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();

  const completeTour = async () => {
    if (activeTour) {
      await fetch(`/api/feature-usage/${activeTour}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "default" })
      });
    }
    setActiveTour(null);
    setCurrentStep(0);
  };

  return (
    <GuidedTourContext.Provider value={{ activeTour, setActiveTour, currentStep, setCurrentStep, completeTour }}>
      {children}
      <GuidedTooltipOverlay />
    </GuidedTourContext.Provider>
  );
}

function GuidedTooltipOverlay() {
  const { activeTour, currentStep, setCurrentStep, completeTour } = useGuidedTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const tour = activeTour ? featureTours[activeTour] : null;
  const step = tour?.[currentStep];

  useEffect(() => {
    if (!step) return;

    const updatePosition = () => {
      const target = document.querySelector(step.target);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [step]);

  if (!tour || !step || !targetRect) return null;

  const isLastStep = currentStep === tour.length - 1;

  const getTooltipPosition = () => {
    const padding = 12;
    switch (step.position) {
      case "top":
        return {
          top: targetRect.top - padding - 120,
          left: targetRect.left + targetRect.width / 2 - 150
        };
      case "bottom":
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - 150
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2 - 60,
          left: targetRect.left - padding - 300
        };
      case "right":
      default:
        return {
          top: targetRect.top + targetRect.height / 2 - 60,
          left: targetRect.right + padding
        };
    }
  };

  const position = getTooltipPosition();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Spotlight overlay */}
        <div 
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={() => completeTour()}
        >
          {/* Cutout for target element */}
          <div
            className="absolute bg-transparent"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
              borderRadius: 8
            }}
          />
        </div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bg-white rounded-lg shadow-xl border p-4 w-80 pointer-events-auto"
          style={{ top: position.top, left: position.left }}
        >
          <button
            onClick={() => completeTour()}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500 uppercase tracking-wide">
              Step {currentStep + 1} of {tour.length}
            </span>
          </div>

          <h3 className="font-semibold text-slate-800 mb-1">{step.title}</h3>
          <p className="text-sm text-slate-600 mb-4">{step.content}</p>

          <div className="flex justify-between items-center">
            <button
              onClick={() => completeTour()}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Skip tour
            </button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                if (isLastStep) {
                  completeTour();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              {isLastStep ? "Got it!" : "Next"}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </motion.div>

        {/* Highlight ring around target */}
        <div
          className="absolute border-2 border-emerald-500 rounded-lg pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            animation: "pulse 2s infinite"
          }}
        />
      </div>
    </AnimatePresence>
  );
}

// Hook to check if a feature should show guided tour
export function useFeatureGuide(featureName: string) {
  const { setActiveTour } = useGuidedTour();
  
  const { data: usage } = useQuery({
    queryKey: ["/api/feature-usage", featureName],
    queryFn: async () => {
      const res = await fetch(`/api/feature-usage/${featureName}?userId=default`);
      return res.json();
    }
  });

  const shouldShowGuide = !usage || usage.useCount < 3;

  const startGuide = () => {
    if (shouldShowGuide && featureTours[featureName]) {
      setActiveTour(featureName);
    }
  };

  return { shouldShowGuide, startGuide };
}
