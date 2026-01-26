import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import logoImage from "@assets/Screenshot_2026-01-13_at_7.27.30_PM-removebg-preview_1768354175011.png";
import mapImage from "@assets/generated_images/google_maps_style_street_view_of_residential_neighborhood.png";

// Mock Data for Calendar
const HOURS = Array.from({ length: 13 }, (_, i) => i + 6); // 6 AM to 6 PM
const DAYS = ["Sun 11", "Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17"];
const TECHNICIANS = ["Trevor", "Trevor", "Trevor", "Trevor", "Trevor", "Trevor", "Trevor"];

export default function Dashboard() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-16" : "w-0"} flex flex-col items-center py-4 bg-white border-r transition-all duration-300 overflow-hidden shrink-0 z-20`}>
        <div className="flex flex-col gap-6 w-full items-center">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
            <Menu className="h-6 w-6" onClick={() => setSidebarOpen(!sidebarOpen)} />
          </Button>
          
          <nav className="flex flex-col gap-4 w-full items-center">
            <NavIcon icon={LayoutDashboard} label="Dashboard" />
            <NavIcon icon={CalendarIcon} label="Calendar" active />
            <NavIcon icon={Users} label="Customers" />
            <NavIcon icon={MapIcon} label="Map" />
            <NavIcon icon={FileText} label="Reports" />
            <NavIcon icon={MessageSquare} label="Messages" />
          </nav>
        </div>
        
        <div className="mt-auto flex flex-col gap-4 mb-4">
          <NavIcon icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="PestFlow" className="h-8 w-auto object-contain" />
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <Button variant="outline" className="flex items-center gap-2 font-semibold text-slate-700 border-slate-300">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Link href="/materials">
              <Button variant="outline" className="flex items-center gap-2 font-semibold text-slate-700 border-slate-300">
                <FileText className="h-4 w-4" />
                Materials
              </Button>
            </Link>
            <Link href="/routes">
              <Button variant="outline" className="flex items-center gap-2 font-semibold text-slate-700 border-slate-300">
                <MapIcon className="h-4 w-4" />
                Routes
              </Button>
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-8 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search..." className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
            <div className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">OPTION+S</div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-9 w-9 p-0 shadow-sm">
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <Button variant="ghost" className="flex items-center gap-2 pl-1 pr-2">
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
                   <img src={logoImage} className="h-5 w-5 object-contain opacity-80 mr-2" />
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
