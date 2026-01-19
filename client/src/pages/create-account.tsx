import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import logoImage from "@assets/Screenshot_2026-01-13_at_7.27.30_PM-removebg-preview_1768354175011.png";

export default function CreateAccount() {
  const [, setLocation] = useLocation();

  const handleCreateAccount = () => {
    // Mock login flow
    setTimeout(() => {
      setLocation("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] bg-emerald-400/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <img src={logoImage} alt="PestFlow" className="h-16 w-auto object-contain mb-8" />
          
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Welcome to PestFlow
          </h1>
          <p className="text-slate-500 text-lg">
            Let's get your account set up so you can start growing your business.
          </p>
        </div>

        <Card className="border-slate-200 shadow-xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-blue-500" />
          <CardHeader className="pb-2">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Use your existing Google account or create a password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium relative hover:bg-slate-50 transition-colors border-slate-300"
              onClick={handleCreateAccount}
            >
              {/* Fake Google Icon */}
              <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Work Email</label>
                <Input defaultValue="user@example.com" className="bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-1">
                 <label className="text-sm font-medium text-slate-700">Create Password</label>
                <Input type="password" placeholder="••••••••" className="bg-white border-slate-200" />
              </div>
            </div>

            <Button className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" onClick={handleCreateAccount}>
              Create Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t p-4 text-center justify-center">
            <p className="text-xs text-slate-500">
              By clicking continue, you agree to our <a href="#" className="underline hover:text-slate-900">Terms of Service</a> and <a href="#" className="underline hover:text-slate-900">Privacy Policy</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
