import { useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GuidedTourProvider } from "@/components/onboarding/GuidedTooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Admin from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import SignupSuccess from "@/pages/signup-success";
import CreateAccount from "@/pages/create-account";
import Payment from "@/pages/payment";
import Materials from "@/pages/materials";
import Routes from "@/pages/routes";
import Invoices from "@/pages/invoices";
import { useHashLocation } from "wouter/use-hash-location";
import { analytics, EVENTS } from "@/lib/analytics";

function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/admin" component={Admin} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/signup-success" component={SignupSuccess} />
        <Route path="/create-account" component={CreateAccount} />
        <Route path="/payment" component={Payment} />
        <Route path="/materials" component={Materials} />
        <Route path="/routes" component={Routes} />
        <Route path="/invoices" component={Invoices} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  useEffect(() => {
    // Track session start when app loads
    analytics.trackSessionStart();
    analytics.track(EVENTS.SESSION.APP_OPENED);
    
    // Track when user leaves/backgrounds app
    const handleVisibilityChange = () => {
      if (document.hidden) {
        analytics.track(EVENTS.SESSION.APP_BACKGROUNDED);
      } else {
        analytics.track(EVENTS.SESSION.APP_OPENED);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GuidedTourProvider>
          <Toaster />
          <AppRouter />
        </GuidedTourProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
