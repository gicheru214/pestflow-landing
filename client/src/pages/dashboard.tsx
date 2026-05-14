import { useState, useEffect } from "react";
import { analytics, EVENTS } from "@/lib/analytics";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Map as MapIcon,
  FileText,
  Settings,
  Search,
  Plus,
  Bell,
  MessageSquare,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Menu,
  CheckCircle2,
  X,
  Zap
} from "lucide-react";
import { OnboardingFlow, OnboardingBanner } from "@/components/onboarding/OnboardingFlow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";
import mapImage from "@assets/generated_images/google_maps_style_street_view_of_residential_neighborhood.png";

// Mock Data for Calendar
const HOURS = Array.from({ length: 13 }, (_, i) => i + 6); // 6 AM to 6 PM
const DAYS = ["Sun 11", "Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17"];
const TECHNICIANS = ["Trevor", "Trevor", "Trevor", "Trevor", "Trevor", "Trevor", "Trevor"];

export default function Dashboard() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem("pestflow_banner_dismissed") === "true");
  const queryClient = useQueryClient();

  // Check onboarding status
  const { data: onboardingProgress, refetch: refetchOnboarding } = useQuery({
    queryKey: ["/api/onboarding"],
    queryFn: async () => {
      const res = await fetch("/api/onboarding");
      return res.json();
    }
  });

  useEffect(() => {
    analytics.track(EVENTS.DASHBOARD.PAGE_VIEW);
  }, []);

  // Show onboarding if not completed
  useEffect(() => {
    if (onboardingProgress) {
      // No onboarding record exists - show onboarding for first-time users
      if (!onboardingProgress.id && !onboardingProgress.completed) {
        setShowOnboarding(true);
        setOnboardingSkipped(false);
      }
      // Onboarding was skipped - show banner
      else if (onboardingProgress.skippedAt && !onboardingProgress.completed) {
        setShowOnboarding(false);
        setOnboardingSkipped(true);
      }
      // Onboarding is in progress but not completed - resume
      else if (onboardingProgress.id && !onboardingProgress.completed && !onboardingProgress.skippedAt) {
        setShowOnboarding(true);
        setOnboardingSkipped(false);
      }
      // Onboarding is completed
      else if (onboardingProgress.completed) {
        setShowOnboarding(false);
        setOnboardingSkipped(false);
      }
    }
  }, [onboardingProgress]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    setOnboardingSkipped(false);
    // Invalidate query to refresh onboarding status
    await queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
  };

  // Show onboarding flow
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-16" : "w-0"} flex flex-col items-center py-4 bg-white border-r transition-all duration-300 overflow-hidden shrink-0 z-20`}>
        <div className="flex flex-col gap-6 w-full items-center">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
            <Menu className="h-6 w-6" onClick={() => setSidebarOpen(!sidebarOpen)} />
          </Button>
          
          <nav className="flex flex-col gap-4 w-full items-center">
            <Link href="/dashboard"><NavIcon icon={LayoutDashboard} label="Dashboard" /></Link>
            <Link href="/dashboard"><NavIcon icon={CalendarIcon} label="Calendar" active /></Link>
            <NavIcon icon={Users} label="Customers" />
            <NavIcon icon={MapIcon} label="Map" />
            <NavIcon icon={FileText} label="Reports" />
            <Link href="/automations"><NavIcon icon={Zap} label="Automations" /></Link>
            <NavIcon icon={MessageSquare} label="Messages" />
          </nav>
        </div>
        
        <div className="mt-auto flex flex-col gap-4 mb-4">
          <Link href="/dashboard"><NavIcon icon={Settings} label="Settings" /></Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Loss aversion banner */}
        {!bannerDismissed && (
          <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 text-sm shrink-0">
            <p className="font-medium">
              ⏳ Your trial data will be deleted in 48 hours —{" "}
              <a
                href="https://testflow.org"
                className="underline underline-offset-2 font-semibold hover:text-amber-900"
              >
                confirm a plan to keep it
              </a>
            </p>
            <button
              onClick={() => { setBannerDismissed(true); localStorage.setItem("pestflow_banner_dismissed", "true"); }}
              className="flex-shrink-0 text-amber-500 hover:text-amber-800 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2 shrink-0">
            <img src={logoImage} alt="PestFlow" className="h-9 w-auto object-contain" />
            <div className="h-5 w-px bg-slate-200" />
            <nav className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-sm font-medium text-emerald-600 bg-emerald-50"
                onClick={() => analytics.track(EVENTS.NAVIGATION.TAB_CLICK, { tab: 'calendar' })}
              >
                <CalendarIcon className="h-4 w-4 mr-1.5" />
                Calendar
              </Button>
              <Link href="/invoices">
                <Button 
                  data-testid="button-invoices" 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  onClick={() => analytics.track(EVENTS.NAVIGATION.TAB_CLICK, { tab: 'invoices' })}
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  Invoices
                </Button>
              </Link>
              <Link href="/materials">
                <Button 
                  data-testid="button-materials" 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  onClick={() => analytics.track(EVENTS.NAVIGATION.TAB_CLICK, { tab: 'materials' })}
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  Materials
                </Button>
              </Link>
              <Link href="/routes">
                <Button
                  data-testid="button-routes"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  onClick={() => analytics.track(EVENTS.NAVIGATION.TAB_CLICK, { tab: 'routes' })}
                >
                  <MapIcon className="h-4 w-4 mr-1.5" />
                  Routes
                </Button>
              </Link>
              <Link href="/automations">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  onClick={() => analytics.track(EVENTS.NAVIGATION.TAB_CLICK, { tab: 'automations' })}
                >
                  <Zap className="h-4 w-4 mr-1.5" />
                  Automations
                </Button>
              </Link>
            </nav>
          </div>

          <div className="hidden md:block flex-1 max-w-xl mx-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              onFocus={() => analytics.track(EVENTS.NAVIGATION.SEARCH_FOCUS)}
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                if (query.includes('invoice')) {
                  window.location.href = '/invoices';
                } else if (query.includes('route')) {
                  window.location.href = '/routes';
                } else if (query.includes('material')) {
                  window.location.href = '/materials';
                }
              }}
            />
            <div className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium hidden lg:block">OPTION+S</div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-9 w-9 p-0 shadow-sm"
              onClick={() => analytics.track(EVENTS.DASHBOARD.QUICK_ACTION_CLICK, { action: 'add_new' })}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500"
              onClick={() => analytics.track(EVENTS.NAVIGATION.NOTIFICATIONS_OPEN)}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500"
              onClick={() => analytics.track(EVENTS.NAVIGATION.MENU_OPEN, { menu: 'messages' })}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-500"
              onClick={() => analytics.track(EVENTS.NAVIGATION.HELP_CLICK)}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 pl-1 pr-2"
              onClick={() => analytics.track(EVENTS.NAVIGATION.PROFILE_CLICK)}
            >
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">Trevor</span>
            </Button>
          </div>
        </header>

        {/* Calendar Toolbar */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-slate-100 rounded-lg p-1">
               <Button variant="ghost" size="sm" className="h-7 px-3 bg-white shadow-sm text-slate-900 text-xs font-medium rounded-md">Map</Button>
               <Button variant="ghost" size="sm" className="h-7 px-3 text-slate-500 text-xs font-medium hover:text-slate-900">List</Button>
             </div>
             <div className="h-4 w-px bg-slate-200" />
             <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 h-8 gap-2">
               Week <ChevronLeft className="h-3 w-3 rotate-90" />
             </Button>
             <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Users className="h-4 w-4 text-slate-500" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Filter className="h-4 w-4 text-slate-500" /></Button>
             </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 px-4 font-medium text-slate-700 border-slate-200">Today</Button>
            <span className="font-semibold text-slate-700 text-sm px-2">Jan 11 - 17, 2026</span>
            <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200"><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-slate-500" /></Button>
          </div>
        </div>

        {/* Content Area (Split View) */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Map Panel (Left) */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={50} className="bg-slate-100 relative">
            <div className="absolute inset-2 bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
               {/* Search overlay on map */}
               <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
                 <div className="flex-1 bg-white rounded-md shadow-md border border-slate-200 flex items-center px-3 h-10">
                   <img src={logoImage} className="h-6 w-6 object-contain opacity-80 mr-2" />
                   <input className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-400" placeholder="Search PestFlow Map" />
                   <Filter className="h-4 w-4 text-slate-400" />
                 </div>
               </div>
               
               {/* Map Image */}
               <img src={mapImage} className="w-full h-full object-cover" alt="Map View" />
               
               {/* Map Controls */}
               <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                 <Button className="h-8 w-8 rounded bg-white shadow-md text-slate-700 p-0 hover:bg-slate-50">+</Button>
                 <Button className="h-8 w-8 rounded bg-white shadow-md text-slate-700 p-0 hover:bg-slate-50">-</Button>
               </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />

          {/* Calendar Panel (Right) */}
          <ResizablePanel defaultSize={65}>
             <div className="flex flex-col h-full bg-white">
               {/* Calendar Header Row */}
               <div className="grid grid-cols-8 border-b bg-slate-50 h-16 shrink-0">
                 <div className="col-span-1 border-r p-2 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                   Time
                 </div>
                 {DAYS.map((day, i) => (
                   <div key={day} className="col-span-1 border-r flex flex-col items-center justify-center p-2 relative">
                     <span className="text-xs font-bold text-slate-700 mb-1">{day}</span>
                     <div className="w-full h-1 bg-emerald-500 absolute bottom-0 left-0 right-0 opacity-20" />
                     <span className="text-[10px] text-slate-500 truncate w-full text-center bg-white px-1 rounded border border-slate-100 shadow-sm">{TECHNICIANS[i]}</span>
                   </div>
                 ))}
               </div>

               {/* Calendar Grid */}
               <ScrollArea className="flex-1">
                 <div className="grid grid-cols-8 min-w-[800px]">
                   {HOURS.map((hour) => (
                     <>
                       {/* Time Column */}
                       <div key={`time-${hour}`} className="col-span-1 border-b border-r h-20 text-xs text-slate-400 p-2 text-right font-medium relative bg-slate-50/30">
                         {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                       </div>
                       
                       {/* Day Columns */}
                       {DAYS.map((_, dayIndex) => (
                         <div key={`cell-${hour}-${dayIndex}`} className="col-span-1 border-b border-r h-20 relative hover:bg-slate-50 transition-colors group">
                           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                             <Plus className="h-4 w-4 text-slate-300" />
                           </div>
                           
                           {/* Mock Appointment */}
                           {dayIndex === 2 && hour === 9 && (
                             <div className="absolute top-1 left-1 right-1 bottom-1 bg-blue-100 border-l-4 border-blue-500 rounded p-1 text-[10px] leading-tight shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                               <div className="font-bold text-blue-800">Termite Inspection</div>
                               <div className="text-blue-600 truncate">Smith Residence</div>
                             </div>
                           )}
                           
                           {dayIndex === 4 && hour === 14 && (
                             <div className="absolute top-1 left-1 right-1 bottom-1 bg-emerald-100 border-l-4 border-emerald-500 rounded p-1 text-[10px] leading-tight shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                               <div className="font-bold text-emerald-800">Quarterly Spray</div>
                               <div className="text-emerald-600 truncate">Johnson Commercial</div>
                             </div>
                           )}
                         </div>
                       ))}
                     </>
                   ))}
                 </div>
               </ScrollArea>
             </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Right Widget Sidebar (Collapsed) */}
      <div className="w-12 bg-white border-l flex flex-col items-center py-4 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 mb-4"><ChevronLeft className="h-4 w-4" /></Button>
      </div>

      {/* Onboarding Banner if skipped */}
      {onboardingSkipped && (
        <OnboardingBanner onResume={() => setShowOnboarding(true)} />
      )}
    </div>
  );
}

function NavIcon({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className="relative group flex items-center justify-center w-full">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-10 w-10 rounded-xl transition-all duration-200 ${active ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
      >
        <Icon className="h-5 w-5" />
      </Button>
      {/* Tooltip */}
      <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
