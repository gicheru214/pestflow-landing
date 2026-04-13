import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Lock, 
  LogOut, 
  ArrowLeft, 
  Search, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Route, 
  Calendar,
  Eye,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

// Helper to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadSubmissions();
    }
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.reverse());
      } else {
        console.error("Failed to load submissions");
        setSubmissions([]);
      }
    } catch (e) {
      console.error("Failed to load submissions", e);
      setSubmissions([]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Cowboys214") {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      setError("");
      loadSubmissions();
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setPassword("");
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const demoRequests = filteredSubmissions.filter(sub => sub.type !== "newsletter");
  const newsletterRequests = filteredSubmissions.filter(sub => sub.type === "newsletter");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <img src={logoImage} alt="PestFlow" className="h-12 w-auto mix-blend-multiply mb-6" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Access</h1>
            <p className="text-muted-foreground mt-2">Enter your password to view submissions</p>
          </div>
          
          <Card className="border-slate-200 shadow-xl">
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-slate-50 border-slate-200"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-10">
                  Access Dashboard
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center border-t bg-slate-50/50 py-4">
              <Link href="/">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Website
                </a>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src={logoImage} alt="PestFlow" className="h-8 w-auto mix-blend-multiply hidden sm:block" />
             <span className="font-bold text-lg text-slate-900">Admin Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Submissions</div>
              <div className="text-2xl font-bold mt-2">{submissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">This Week</div>
              <div className="text-2xl font-bold mt-2 text-primary">
                {submissions.filter(s => {
                  const date = new Date(s.submittedAt);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - date.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                  return diffDays <= 7;
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Demo Requests</div>
              <div className="text-2xl font-bold mt-2 text-blue-600">{demoRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Newsletter Signups</div>
              <div className="text-2xl font-bold mt-2 text-emerald-600">{newsletterRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, company, email..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="mb-8 bg-white border">
            <TabsTrigger value="demo" className="px-6">Demo Requests</TabsTrigger>
            <TabsTrigger value="newsletter" className="px-6">Newsletter Signups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo">
            {/* Submissions List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {demoRequests.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No demo requests found</h3>
                  <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms</p>
                </div>
              ) : (
                demoRequests.map((sub) => (
                  <Card key={sub.id || Math.random()} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedSubmission(sub)}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {sub.firstName?.[0]}{sub.lastName?.[0]}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                            {sub.firstName} {sub.lastName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatDate(sub.submittedAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {sub.activated ? (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 font-normal">
                            Activated
                          </Badge>
                        ) : sub.customersImported > 0 ? (
                          <Badge variant="outline" className="font-normal text-amber-600 border-amber-300">
                            {sub.customersImported} Customers
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-normal">
                            New
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm pt-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span className="truncate font-medium">{sub.companyName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{sub.email}</span>
                      </div>
                       <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>{sub.technicians} Technicians</span>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-slate-50/50 p-3">
                      <div className="w-full flex items-center justify-between text-xs font-medium text-primary">
                        View Details
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="newsletter">
            {/* Newsletter List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {newsletterRequests.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No newsletter signups found</h3>
                  <p className="text-slate-500 text-sm mt-1">They will appear here when people download the guide</p>
                </div>
              ) : (
                newsletterRequests.map((sub) => (
                  <Card key={sub.id || Math.random()} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                          {sub.firstName?.[0]}{sub.lastName?.[0]}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold group-hover:text-emerald-600 transition-colors">
                            {sub.firstName} {sub.lastName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatDate(sub.submittedAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-normal border-emerald-200 text-emerald-700 bg-emerald-50">
                        Guide Sent
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm pt-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{sub.email}</span>
                      </div>
                       <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span>Downloaded Guide</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Received on {selectedSubmission && formatDate(selectedSubmission.submittedAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* Profile Section */}
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="h-16 w-16 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-2xl font-bold text-slate-300 shadow-sm shrink-0 overflow-hidden">
                   {/* Mockup: In a real app we would display the image URL here */}
                   <User className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{selectedSubmission.firstName} {selectedSubmission.lastName}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-3 h-3" /> {selectedSubmission.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-3 h-3" /> {selectedSubmission.email}
                  </div>
                </div>
              </div>

              {/* Company Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">Company Information</h4>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Company Name</span>
                      <div className="font-medium">{selectedSubmission.companyName}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Website</span>
                      <div className="font-medium truncate text-blue-600">
                        {selectedSubmission.website ? (
                          <a href={`https://${selectedSubmission.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">
                            {selectedSubmission.website}
                          </a>
                        ) : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Team Size</span>
                      <div className="font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        {selectedSubmission.technicians} Technicians
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Routes</span>
                      <div className="font-medium flex items-center gap-2">
                        <Route className="w-4 h-4 text-slate-400" />
                        {selectedSubmission.routes || "N/A"} Routes
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Address</span>
                    <div className="font-medium flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <div>{selectedSubmission.address || "No address provided"}</div>
                        {(selectedSubmission.city || selectedSubmission.state || selectedSubmission.zipCode) && (
                          <div className="text-sm text-slate-500">
                            {[selectedSubmission.city, selectedSubmission.state, selectedSubmission.zipCode].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               {/* Attachments Section */}
               <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-2">Attachments</h4>
                <div className="flex gap-4">
                  {selectedSubmission.profilePicture?.name && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border rounded text-xs">
                      <User className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{selectedSubmission.profilePicture.name}</span>
                    </div>
                  )}
                  {selectedSubmission.logo?.name && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border rounded text-xs">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{selectedSubmission.logo.name}</span>
                    </div>
                  )}
                  {!selectedSubmission.profilePicture?.name && !selectedSubmission.logo?.name && (
                    <span className="text-sm text-slate-400 italic">No files uploaded</span>
                  )}
                </div>
               </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
