import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlayCircle, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DemoVideoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const stripeLink = "https://buy.stripe.com/cNi28q7XZ9XB5LRcH6dfG06";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-slate-800">
        <div className="relative aspect-video w-full bg-black">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/_CsAvmYOAbI?autoplay=1&mute=1" 
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
            onClick={() => window.location.href = stripeLink}
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
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    // Check localStorage
    const visited = localStorage.getItem("pestflow_popup_visited");
    if (visited) {
      setHasVisited(true);
      return;
    }

    const timer = setTimeout(() => {
      setOpen(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("pestflow_popup_visited", "true");
  };

  const handleQualification = (isOwner: boolean) => {
    // Save qualification response
    const currentData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
    localStorage.setItem("pestflow_popup_data", JSON.stringify({ ...currentData, isOwner }));

    if (isOwner) {
      setStep("route_size");
    } else {
      // Even if No, show offer/demo as per requirements
      setStep("offer"); 
    }
  };

  const handleRouteSize = (size: string) => {
    // Save route size response
    const currentData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
    localStorage.setItem("pestflow_popup_data", JSON.stringify({ ...currentData, routeSize: size }));
    
    setStep("offer");
  };

  const handleAcceptOffer = () => {
    // When they accept the offer (finish the flow), we can save it to submissions
    // so it appears in the admin dashboard immediately as an "Inquiry"
    const popupData = JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}");
    
    // Create a partial submission
    const inquiry = {
      id: crypto.randomUUID(),
      type: "popup_inquiry",
      submittedAt: new Date().toISOString(),
      firstName: "Website Visitor",
      lastName: "(Inquiry)",
      companyName: popupData.isOwner ? "Owner/Manager" : "Visitor",
      email: "Pending...",
      technicians: popupData.routeSize || "N/A",
      routes: popupData.routeSize,
      status: "new"
    };

    try {
      const existing = JSON.parse(localStorage.getItem("submissions") || "[]");
      localStorage.setItem("submissions", JSON.stringify([...existing, inquiry]));
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
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white">
        <div className="relative p-6 sm:p-10">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

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
                
                <div className="space-y-3 pt-2">
                   {["1–2 routes", "3–5 routes", "6–10 routes", "10+ routes"].map((option) => (
                     <Button 
                       key={option}
                       variant="outline" 
                       className="w-full text-lg h-12 justify-start px-6 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                       onClick={() => handleRouteSize(option)}
                     >
                       {option}
                     </Button>
                   ))}
                </div>
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

import { Building2 } from "lucide-react";
