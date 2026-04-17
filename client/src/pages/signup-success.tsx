import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { analytics, EVENTS } from "@/lib/analytics";

declare global {
  interface Window {
    fbq: any;
  }
}

export default function SignupSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get session_id from URL for tracking
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const sessionId = urlParams.get('session_id') || hashParams.get('session_id') || 'unknown_session';

    // Get UTM parameters
    const utmSource = urlParams.get('utm_source') || hashParams.get('utm_source') || sessionStorage.getItem('utm_source') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || hashParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || undefined;
    const utmContent = urlParams.get('utm_content') || hashParams.get('utm_content') || sessionStorage.getItem('utm_content') || undefined;

    // Track Signup event with UTM parameters
    analytics.track(EVENTS.SIGNUP.COMPLETE, { 
      utm_source: utmSource,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
    });

    // Track checkout success with Mixpanel
    analytics.track(EVENTS.CHECKOUT.SUCCESS, { 
      sessionId,
      value: 1.00,
      currency: 'USD'
    });
    analytics.track(EVENTS.ACCOUNT.SIGNUP_COMPLETE);

    // Identify user with anonymous ID (no PII)
    const anonId = sessionStorage.getItem('pestflow_user_id') || `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('pestflow_user_id', anonId);
    analytics.identify(anonId, {
      signupDate: new Date().toISOString(),
      plan: 'trial',
      utm_source: utmSource,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
    });

    // Fire Meta Pixel Purchase Event
    if (window.fbq) {
      window.fbq('track', 'Purchase', { 
        value: 1.00, 
        currency: 'USD',
        content_name: 'PestFlow Subscription', 
        content_ids: ['pestflow-monthly'],
        event_id: sessionId
      });
    }

    const timer = setTimeout(() => {
      window.location.href = "https://pestflow-smart-pricing.lovable.app";
    }, 4000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] bg-emerald-400/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center space-y-6"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">You're In!</h1>
          <p className="text-lg text-slate-500 max-w-sm mx-auto">
            Redirecting you to choose your plan in a moment...
          </p>
        </div>

        <motion.div 
          className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden mt-8"
        >
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
