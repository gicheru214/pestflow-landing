import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";

export function DemoVideoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-slate-800">
        <div className="relative aspect-video w-full bg-black">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/TB4__rmaNpE?autoplay=1&mute=1" 
            title="PestFlow Demo" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>
        <div className="p-6 bg-slate-900 text-center">
          <Button 
            size="lg" 
            className="w-full md:w-auto px-8 py-6 text-xl font-bold bg-[#635BFF] hover:bg-[#5851E1] text-white shadow-lg shadow-indigo-500/20"
            onClick={() => window.location.href = "/#/onboarding"}
          >
            Start Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-slate-400">
            No credit card required for demo. Start your 14-day free trial today.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AutoPopup() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"qualification" | "route_size" | "offer" | "demo">("qualification");
  const [routeCount, setRouteCount] = useState(5);

  useEffect(() => {
    const visited = localStorage.getItem("pestflow_popup_visited");
    if (visited) {
      return;
    }

    // Show popup immediately on page load
    setOpen(true);
    analytics.track(EVENTS.LANDING.POPUP_SHOWN);
  }, []);

  const handleClose = () => {
    analytics.track(EVENTS.LANDING.POPUP_DISMISSED);
    setOpen(false);
    localStorage.setItem("pestflow_popup_visited", "true");
  };

  const handleQualification = (isOwner: boolean) => {
    const currentData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
    localStorage.setItem("pestflow_popup_data", JSON.stringify({ ...currentData, isOwner }));

    if (isOwner) {
      setStep("route_size");
    } else {
      setStep("offer"); 
    }
  };

  const handleRouteSize = () => {
    const currentData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
    localStorage.setItem("pestflow_popup_data", JSON.stringify({ ...currentData, routeSize: `${routeCount} routes` }));
    
    setStep("offer");
  };

  const handleAcceptOffer = async () => {
    const popupData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
    
    try {
      // Save inquiry to database via API
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "popup_inquiry",
          firstName: "Website Visitor",
          lastName: "(Inquiry)",
          companyName: popupData.isOwner ? "Owner/Manager" : "Visitor",
          email: "Pending...",
          technicians: popupData.routeSize || "N/A",
          routes: popupData.routeSize
        })
      });
    analytics.track(EVENTS.LANDING.POPUP_SUBMIT);
    } catch (e) {
      console.error("Failed to save popup inquiry", e);
    }

    setStep("demo");
  };

  if (step === "demo") {
    return (
      <DemoVideoModal 
        open={open} 
        onOpenChange={(val) => {
           if (!val) handleClose();
        }} 
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[500px] p-0 overflow-hidden bg-white" 
        hideCloseButton
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {step === "qualification" && (
              <motion.div
                key="qualification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Building2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Quick Question
                </h2>
                <p className="text-lg text-slate-600">
                  Are you a pest control business owner or manager?
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button variant="outline" size="lg" className="text-lg h-14" onClick={() => handleQualification(false)}>
                    No
                  </Button>
                  <Button size="lg" className="text-lg h-14 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleQualification(true)}>
                    Yes
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "route_size" && (
              <motion.div
                key="route_size"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <h2 className="text-2xl font-bold text-slate-900">
                  How many routes do you manage?
                </h2>
                <p className="text-slate-600">
                  We'll customize your trial experience.
                </p>
                
                <div className="pt-6 pb-4 space-y-8">
                  <div className="text-center">
                    <span className="text-5xl font-bold text-emerald-600">{routeCount}</span>
                    <span className="text-2xl text-slate-500 ml-2">routes</span>
                  </div>
                  
                  <div className="px-4">
                    <Slider
                      value={[routeCount]}
                      onValueChange={(value) => setRouteCount(value[0])}
                      min={1}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-400 mt-2">
                      <span>1</span>
                      <span>25</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleRouteSize}
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === "offer" && (
              <motion.div
                key="offer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                   <span className="text-3xl">🎁</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Special Offer Unlocked!
                </h2>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                  <p className="text-xl font-bold text-emerald-800 mb-1">
                    98% OFF your first month
                  </p>
                  <p className="text-sm text-emerald-600">
                    (You save $48)
                  </p>
                </div>
                <Button size="lg" className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" onClick={handleAcceptOffer}>
                  Continue
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
