import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lock, LogOut, Search, Phone, Mail, Building2, Route, Calendar, ArrowLeft, TrendingUp, Users, CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const isRealLead = (sub: any) =>
  sub.email &&
  sub.email !== "" &&
  !sub.email.includes("placeholder") &&
  sub.firstName &&
  sub.firstName !== "Website Visitor" &&
  sub.firstName !== "";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
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
      }
    } catch (e) {
      console.error("Failed to load submissions", e);
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

  const realLeads = submissions.filter(isRealLead);
  const popupLeads = realLeads.filter(s => s.type === "newsletter");
  const onboardingLeads = realLeads.filter(s => s.type === "demo");

  const thisWeek = realLeads.filter(s => {
    const diff = Date.now() - new Date(s.submittedAt).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const funnelMax = realLeads.length || 1;

  const filtered = (list: any[]) =>
    list.filter(s =>
      [s.firstName, s.lastName, s.email, s.phone, s.companyName]
        .some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center text-center">
            <img src={logoImage} alt="PestFlow" className="h-14 w-auto mb-6" style={{ filter: "brightness(0) invert(1)" }} />
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-zinc-400 mt-1 text-sm">Enter your password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
              Access Dashboard
            </Button>
          </form>
          <div className="text-center">
            <Link href="/">
              <a className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-2 justify-center">
                <ArrowLeft className="w-4 h-4" /> Back to Website
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 z-30 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-white text-sm">PestFlow Admin</span>
          <button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem("adminAuth"); }} className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Scoreboard */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
              <TrendingUp className="w-3.5 h-3.5" /> Total Leads
            </div>
            <div className="text-4xl font-bold text-white">{realLeads.length}</div>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
              <Users className="w-3.5 h-3.5" /> This Week
            </div>
            <div className="text-4xl font-bold text-emerald-400">{thisWeek.length}</div>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
              <Mail className="w-3.5 h-3.5" /> Popup Signups
            </div>
            <div className="text-4xl font-bold text-white">{popupLeads.length}</div>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> Onboarding Done
            </div>
            <div className="text-4xl font-bold text-white">{onboardingLeads.length}</div>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <h2 className="font-semibold text-white mb-4">Funnel Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: "Total Leads", count: realLeads.length },
              { label: "Popup Signups", count: popupLeads.length },
              { label: "Completed Onboarding", count: onboardingLeads.length },
            ].map(({ label, count }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-zinc-300">{label}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((count / funnelMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search leads..."
            className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">
              All Leads ({filtered(realLeads).length})
            </TabsTrigger>
            <TabsTrigger value="popup" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">
              Popup ({filtered(popupLeads).length})
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">
              Onboarding ({filtered(onboardingLeads).length})
            </TabsTrigger>
          </TabsList>

          {(["all", "popup", "onboarding"] as const).map(tab => {
            const list = filtered(tab === "all" ? realLeads : tab === "popup" ? popupLeads : onboardingLeads);
            return (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {list.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500 text-sm">No leads yet</div>
                ) : (
                  list.map((sub) => (
                    <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                      {/* Name + tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {sub.firstName} {sub.lastName}
                        </span>
                        {sub.type === "demo" && (
                          <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">Completed form</span>
                        )}
                        {sub.type === "newsletter" && (
                          <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">Popup signup</span>
                        )}
                        {sub.isOwner !== undefined && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sub.isOwner ? "bg-emerald-900/60 text-emerald-400" : "bg-zinc-700 text-zinc-300"}`}>
                            {sub.isOwner ? "Owner" : "Manager"}
                          </span>
                        )}
                      </div>

                      {/* Contact info */}
                      <div className="space-y-1.5">
                        {sub.phone && (
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <a href={`tel:${sub.phone}`} className="hover:text-white">{sub.phone}</a>
                          </div>
                        )}
                        {sub.email && (
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            <a href={`mailto:${sub.email}`} className="hover:text-white">{sub.email}</a>
                          </div>
                        )}
                        {sub.companyName && (
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                            {sub.companyName}
                          </div>
                        )}
                        {sub.routes && (
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Route className="w-3.5 h-3.5 text-zinc-500" />
                            {sub.routes} routes
                          </div>
                        )}
                        {(sub.routeSize) && !sub.routes && (
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Route className="w-3.5 h-3.5 text-zinc-500" />
                            ~{sub.routeSize} routes (self-reported)
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-1 border-t border-zinc-800">
                        <Calendar className="w-3 h-3" />
                        {formatDate(sub.submittedAt)}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
