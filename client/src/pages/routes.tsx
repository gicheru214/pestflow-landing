import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronDown,
  MapPin,
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";
import { analytics, EVENTS } from "@/lib/analytics";

interface Job {
  id: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceType: string;
  duration: number;
  status: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export default function Routes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  useEffect(() => {
    analytics.track(EVENTS.DASHBOARD.ROUTES_VIEW);
    analytics.track(EVENTS.ROUTE.LIST_VIEW);
  }, []);
  
  // Filter states
  const [schedule, setSchedule] = useState("Blake");
  const [dateFrom, setDateFrom] = useState("08/28/2023");
  const [dateTo, setDateTo] = useState("08/28/2023");
  const [statusFilters, setStatusFilters] = useState({ unconfirmed: true, confirmed: true });
  const [includeRecurring, setIncludeRecurring] = useState(false);
  const [workTimeFrom, setWorkTimeFrom] = useState("07:00 AM");
  const [workTimeTo, setWorkTimeTo] = useState("06:00 PM");
  const [driveBuffer, setDriveBuffer] = useState("None");
  const [jobsPerDay, setJobsPerDay] = useState("Auto Fill");
  const [optimizeToDate, setOptimizeToDate] = useState("08/28/2023");
  const [startFrom, setStartFrom] = useState("Closest Job");
  const [excludeDays, setExcludeDays] = useState("Saturday,Sunday");
  const [startAddress, setStartAddress] = useState("10756 NE 4th Ave, Miami, FL 33161");
  const [endAddress, setEndAddress] = useState("10756 NE 4th Ave, Miami, FL 33161");
  const [distanceType, setDistanceType] = useState("Miles");
  const [driveMatrix, setDriveMatrix] = useState(false);
  
  // Selected jobs for optimization
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  // Fetch jobs
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    }
  });

  // Seed demo jobs mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/seed-demo-jobs", { method: "POST" });
      if (!res.ok) throw new Error("Failed to seed jobs");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Demo jobs created!" });
    }
  });

  // Optimize route mutation
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      analytics.track(EVENTS.ROUTE.OPTIMIZE_START, { jobCount: selectedJobs.length });
      const res = await fetch("/api/routes/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobs: selectedJobs,
          startAddress,
          endAddress,
          date: optimizeToDate.replace(/\//g, "-")
        })
      });
      if (!res.ok) throw new Error("Failed to optimize route");
      return res.json();
    },
    onSuccess: (data) => {
      analytics.track(EVENTS.ROUTE.OPTIMIZE_COMPLETE, { jobCount: data.optimizedJobs.length });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ 
        title: "Route Optimized!", 
        description: `${data.optimizedJobs.length} jobs scheduled. ${data.estimatedDuration}`
      });
    },
    onError: () => {
      analytics.track(EVENTS.ROUTE.OPTIMIZE_ERROR);
    }
  });

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectAllJobs = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(j => j.id));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr.replace(/-/g, "/"));
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Filters */}
      <aside className="w-64 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-slate-700">Drive Matrix</span>
          </div>
          <Switch checked={driveMatrix} onCheckedChange={setDriveMatrix} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
          {/* Schedule */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule</label>
            <Select value={schedule} onValueChange={setSchedule}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Blake">Blake</SelectItem>
                <SelectItem value="Trevor">Trevor</SelectItem>
                <SelectItem value="All">All Technicians</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs Within */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jobs Within</label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs" />
              <span className="text-slate-400">to</span>
              <Input value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          {/* Statuses */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Statuses</label>
            <div className="flex gap-2 mt-1">
              <Button 
                variant={statusFilters.unconfirmed ? "default" : "outline"} 
                size="sm" 
                className={`h-7 text-xs ${statusFilters.unconfirmed ? 'bg-slate-200 text-slate-700' : ''}`}
                onClick={() => setStatusFilters(s => ({ ...s, unconfirmed: !s.unconfirmed }))}
              >
                Unconfirmed
              </Button>
              <Button 
                variant={statusFilters.confirmed ? "default" : "outline"} 
                size="sm" 
                className={`h-7 text-xs ${statusFilters.confirmed ? 'bg-emerald-500 text-white' : ''}`}
                onClick={() => setStatusFilters(s => ({ ...s, confirmed: !s.confirmed }))}
              >
                Confirmed
              </Button>
            </div>
          </div>

          {/* Include Recurring */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500">Include Recurring Jobs</label>
            <Switch checked={includeRecurring} onCheckedChange={setIncludeRecurring} />
          </div>

          {/* Work Time */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Work Time</label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={workTimeFrom} onChange={(e) => setWorkTimeFrom(e.target.value)} className="h-8 text-xs" />
              <span className="text-slate-400">to</span>
              <Input value={workTimeTo} onChange={(e) => setWorkTimeTo(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          {/* Drive Buffer */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Drive Buffer</label>
            <Select value={driveBuffer} onValueChange={setDriveBuffer}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="15min">15 minutes</SelectItem>
                <SelectItem value="30min">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs Per Day */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jobs Per Day</label>
            <Select value={jobsPerDay} onValueChange={setJobsPerDay}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Auto Fill">Auto Fill</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optimize To */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Optimize To</label>
            <Input value={optimizeToDate} onChange={(e) => setOptimizeToDate(e.target.value)} className="mt-1 h-8 text-xs" />
          </div>

          {/* Start From */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Start From</label>
            <Select value={startFrom} onValueChange={setStartFrom}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Closest Job">Closest Job</SelectItem>
                <SelectItem value="Start Address">Start Address</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exclude */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Exclude</label>
            <Select value={excludeDays} onValueChange={setExcludeDays}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Saturday,Sunday">Saturday, Sunday</SelectItem>
                <SelectItem value="Sunday">Sunday Only</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Starting Address */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Starting Address</label>
            <Input value={startAddress} onChange={(e) => setStartAddress(e.target.value)} className="mt-1 h-8 text-xs" />
          </div>

          {/* Ending Address */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ending Address</label>
            <Input value={endAddress} onChange={(e) => setEndAddress(e.target.value)} className="mt-1 h-8 text-xs" />
          </div>

          {/* Distance Type */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Distance Type</label>
            <Select value={distanceType} onValueChange={setDistanceType}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Miles">Miles</SelectItem>
                <SelectItem value="Kilometers">Kilometers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optimize Button */}
        <div className="p-4 border-t">
          <Button 
            data-testid="button-optimize-route"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            onClick={() => optimizeMutation.mutate()}
            disabled={selectedJobs.length === 0 || optimizeMutation.isPending}
          >
            {optimizeMutation.isPending ? "Optimizing..." : "Optimize Route"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <img src={logoImage} alt="PestFlow" className="h-8 w-auto object-contain" />
          </div>

          <div className="flex-1 max-w-xl mx-8 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search..." className="pl-10 bg-slate-50 border-slate-200" />
          </div>

          <div className="flex items-center gap-3">
            <Button 
              data-testid="button-add-demo-jobs"
              variant="outline" 
              size="sm"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              {seedMutation.isPending ? "Loading..." : "Add Demo Jobs"}
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
              className="p-0"
              onClick={() => analytics.track(EVENTS.NAVIGATION.PROFILE_CLICK)}
            >
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>TR</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </header>

        {/* Jobs List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border shadow-sm">
            {/* Date Header */}
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-800">
                {formatDate(optimizeToDate)}
              </h2>
            </div>

            {/* Starting Address */}
            <div className="px-6 py-3 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full border-2 border-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 uppercase">Starting Address</div>
                  <div className="text-sm text-slate-700">{startAddress}</div>
                </div>
              </div>
              <span className="text-sm text-slate-500">07:00 AM</span>
            </div>

            {/* Jobs */}
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No jobs found. Click "Add Demo Jobs" to create sample data.</p>
              </div>
            ) : (
              jobs.map((job, index) => (
                <div 
                  key={job.id} 
                  className="px-6 py-4 border-b flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <Checkbox 
                    data-testid={`checkbox-job-${job.id}`}
                    checked={selectedJobs.includes(job.id)}
                    onCheckedChange={() => toggleJobSelection(job.id)}
                  />
                  
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="font-medium text-slate-800">{job.customerName}</span>
                    </div>
                    
                    <div className="col-span-4 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{job.address}, {job.city}, {job.state} {job.zipCode}</span>
                    </div>
                    
                    <div className="col-span-2 text-sm text-slate-600">
                      {job.serviceType}
                    </div>
                    
                    <div className="col-span-1 text-sm text-slate-500">
                      00:{job.duration}
                    </div>
                    
                    <div className="col-span-2">
                      <Badge data-testid={`status-job-${job.id}`} className={`${job.status === 'confirmed' ? 'bg-emerald-500' : 'bg-slate-400'} text-white`}>
                        {job.status === 'confirmed' ? 'Confirmed' : 'Unconfirmed'}
                      </Badge>
                    </div>
                    
                    <div className="col-span-1 text-right text-sm">
                      {job.scheduledTime && (
                        <div>
                          <div className="text-slate-500">{job.scheduledDate}</div>
                          <div className="font-medium text-slate-700">{job.scheduledTime}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Ending Address */}
            <div className="px-6 py-3 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full border-2 border-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 uppercase">Ending Address</div>
                  <div className="text-sm text-slate-700">{endAddress}</div>
                </div>
              </div>
              <span className="text-sm text-slate-500">06:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
