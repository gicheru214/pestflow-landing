import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setLocation("/signup-success");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-slate-500">
            Securely pay with Stripe to access your guide and tools.
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
          
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Pro Membership</span>
              <span className="text-2xl font-bold">$49<span className="text-sm font-normal text-slate-500">/mo</span></span>
            </CardTitle>
            <CardDescription>
              Unlock the full potential of PestFlow
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-700">The Ultimate Growth Guide</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-700">Scheduling & Invoicing Tools</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-slate-700">Customer Management Dashboard</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-md p-4 flex items-center justify-between cursor-pointer border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Credit Card</span>
                </div>
                <div className="flex gap-2">
                   {/* Mock card icons */}
                   <div className="w-8 h-5 bg-slate-200 rounded"></div>
                   <div className="w-8 h-5 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full h-12 text-base font-bold bg-[#635BFF] hover:bg-[#5851E1] shadow-lg shadow-indigo-500/20" 
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Pay with Stripe <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </Button>
            <p className="text-xs text-center text-slate-400">
              Payments are secure and encrypted.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
