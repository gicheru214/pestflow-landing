import { useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GuidedTourProvider } from "@/components/onboarding/GuidedTooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Support from "@/pages/support";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Onboarding from "@/pages/onboarding";
import Admin from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import SignupSuccess from "@/pages/signup-success";
import CreateAccount from "@/pages/create-account";
import Payment from "@/pages/payment";
import Materials from "@/pages/materials";
import Routes from "@/pages/routes";
import Invoices from "@/pages/invoices";
import Watch from "@/pages/watch";
import TechLanding from "@/pages/tech";
import Login from "@/pages/login";
import Automations from "@/pages/automations";
import AiTutorPage from "@/pages/ai-tutor";
import CompetitorsPage from "@/pages/competitors";
import CompetitorsFieldRoutes from "@/pages/competitors-fieldroutes";
import CompetitorsGorillaDesk from "@/pages/competitors-gorilladesk";
import BlogIndex from "@/pages/blog/index";
import PestControlCostPost from "@/pages/blog/pest-control-cost";
import PricingChartPost from "@/pages/blog/pricing-chart";
import StartBusinessPost from "@/pages/blog/start-business";
import MarketingIdeasPost from "@/pages/blog/marketing-ideas";
import EstimateTemplatePost from "@/pages/blog/estimate-template";
import InvoiceTemplatePost from "@/pages/blog/invoice-template";
import { analytics, EVENTS } from "@/lib/analytics";

function AppRouter() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/support" component={Support} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/admin" component={Admin} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/signup-success" component={SignupSuccess} />
        <Route path="/create-account" component={CreateAccount} />
        <Route path="/payment" component={Payment} />
        <Route path="/materials" component={Materials} />
        <Route path="/routes" component={Routes} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/watch" component={Watch} />
        <Route path="/tech" component={TechLanding} />
        <Route path="/login" component={Login} />
        <Route path="/automations" component={Automations} />
        <Route path="/ai-tutor" component={AiTutorPage} />
        <Route path="/competitors" component={CompetitorsPage} />
        <Route path="/competitors/fieldroutes" component={CompetitorsFieldRoutes} />
        <Route path="/competitors/gorilladesk" component={CompetitorsGorillaDesk} />
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/how-much-does-pest-control-cost" component={PestControlCostPost} />
        <Route path="/blog/pest-control-pricing-chart" component={PricingChartPost} />
        <Route path="/blog/how-to-start-a-pest-control-business" component={StartBusinessPost} />
        <Route path="/blog/pest-control-marketing-ideas" component={MarketingIdeasPost} />
        <Route path="/blog/pest-control-estimate-template" component={EstimateTemplatePost} />
        <Route path="/blog/pest-control-invoice-template" component={InvoiceTemplatePost} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  useEffect(() => {
    // Track session start / login when app loads
    analytics.trackSessionStart();
    analytics.track(EVENTS.SESSION.LOGIN);
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
