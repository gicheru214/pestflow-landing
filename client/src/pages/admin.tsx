import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, LogOut, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadSubmissions();
    }
  }, []);

  const loadSubmissions = () => {
    try {
      const data = JSON.parse(localStorage.getItem("submissions") || "[]");
      // Sort by newest first
      setSubmissions(data.reverse());
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" /> Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white"
                />
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Onboarding Submissions</h1>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email / Phone</TableHead>
                    <TableHead>Technicians</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No submissions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((sub) => (
                      <TableRow key={sub.id || Math.random()}>
                        <TableCell className="font-medium">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}
                          <div className="text-xs text-muted-foreground">
                             {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{sub.firstName} {sub.lastName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{sub.companyName}</div>
                          {sub.website && (
                            <a href={`https://${sub.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                              {sub.website}
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{sub.email}</div>
                          <div className="text-muted-foreground text-sm">{sub.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <span className="font-medium">{sub.technicians} Techs</span>
                             {sub.routes && <span className="text-xs text-muted-foreground">({sub.routes} Routes)</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                           {sub.city && sub.state ? (
                              <span>{sub.city}, {sub.state}</span>
                           ) : (
                              <span className="text-muted-foreground italic">Not provided</span>
                           )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
