import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { useHashLocation } from "wouter/use-hash-location";

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
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
