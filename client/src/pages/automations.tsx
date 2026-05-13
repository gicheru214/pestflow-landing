import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Mail,
  Star,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  ExternalLink,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Map as MapIcon,
  Settings,
  MessageSquare,
  Users,
  ChevronRight,
  Plug,
  RefreshCw,
  DollarSign,
  PhoneCall,
  ClipboardList,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

// ─── Types ───────────────────────────────────────────────────────────────────

type AutomationStatus = "active" | "paused" | "cta";

interface EmailFlow {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  trigger: string;
  action: string;
  description: string;
  endpoint: string;
  status: AutomationStatus;
}

interface ZapCard {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  trigger: string;
  action: string;
  description: string;
  zapTemplate?: string;
  comingSoon?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const EMAIL_FLOWS: EmailFlow[] = [
  {
    id: "welcome",
    icon: UserPlus,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "New Customer Welcome",
    trigger: "Customer created",
    action: "Send welcome email",
    description: "Automatically emails new customers introducing your company and setting expectations.",
    endpoint: "/api/automations/welcome",
    status: "active",
  },
  {
    id: "review-request",
    icon: Star,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "Job Complete → Review Request",
    trigger: "Job marked complete",
    action: "Send review request (2hr delay)",
    description: "Sends a Google review request after each completed job. Reviews = free leads.",
    endpoint: "/api/automations/review-request",
    status: "active",
  },
  {
    id: "send-invoice",
    icon: FileText,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "Invoice Email",
    trigger: "Invoice created",
    action: "Email invoice to customer",
    description: "Delivers the invoice with a pay-now link the moment it's created in PestFlow.",
    endpoint: "/api/automations/send-invoice",
    status: "active",
  },
  {
    id: "quote-followup",
    icon: Clock,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    title: "Quote Follow-Up",
    trigger: "Quote sent, no response in 48hrs",
    action: "Send follow-up email",
    description: "30–40% of quotes close on the follow-up. This one runs while you're on a route.",
    endpoint: "/api/automations/quote-followup",
    status: "paused",
  },
  {
    id: "overdue-reminder",
    icon: AlertCircle,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
    title: "Overdue Invoice Reminder",
    trigger: "Invoice 14 days unpaid",
    action: "Send payment reminder",
    description: "Politely nudges customers on overdue invoices so you're not chasing checks.",
    endpoint: "/api/automations/overdue-reminder",
    status: "active",
  },
  {
    id: "job-summary",
    icon: ClipboardList,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    title: "Post-Service Summary",
    trigger: "Job marked complete",
    action: "Email treatment summary to customer",
    description: "Tells the customer what was done, reducing 'did anyone even show up?' calls.",
    endpoint: "/api/automations/job-summary",
    status: "paused",
  },
];

const ZAP_CARDS: ZapCard[] = [
  {
    id: "angi-lead",
    icon: Zap,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
    title: "Angi / HomeAdvisor Lead → PestFlow",
    trigger: "New Angi lead",
    action: "Auto-create customer in PestFlow",
    description: "New lead drops from Angi? It's already in PestFlow before you're off the roof.",
    zapTemplate: "https://zapier.com/apps/angi/integrations",
  },
  {
    id: "google-lsa",
    icon: PhoneCall,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "Google LSA Lead → PestFlow",
    trigger: "New Google Local Services lead",
    action: "Create customer + notify owner via text",
    description: "Close the loop from ad spend to CRM instantly. No sticky notes.",
    zapTemplate: "https://zapier.com/apps/google-lead-form-extensions/integrations",
  },
  {
    id: "quickbooks-invoice",
    icon: DollarSign,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
    title: "Invoice Paid → QuickBooks",
    trigger: "Invoice marked paid in PestFlow",
    action: "Create record in QuickBooks Online",
    description: "Kills the manual double-entry that every owner hates. Your books stay clean.",
    zapTemplate: "https://zapier.com/apps/quickbooks/integrations",
  },
  {
    id: "review-facebook",
    icon: Star,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "5-Star Review → Facebook Post",
    trigger: "New 5-star Google review",
    action: "Auto-post to Facebook Page",
    description: "Turn your best reviews into social proof without lifting a finger.",
    zapTemplate: "https://zapier.com/apps/google-business-profile/integrations",
  },
  {
    id: "missed-call",
    icon: PhoneCall,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
    title: "Missed Call → Auto-Text",
    trigger: "Missed call in CallRail",
    action: "Send text: 'We missed you, book here →'",
    description: "Recover missed calls automatically. Most prospects hire the first company that responds.",
    zapTemplate: "https://zapier.com/apps/callrail/integrations",
  },
  {
    id: "recurring-sms",
    icon: RefreshCw,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    title: "Recurring Service Due → SMS",
    trigger: "Service due date approaching",
    action: "Text customer reminder",
    description: "Reduces no-shows and cancellations on recurring accounts.",
    comingSoon: true,
  },
  {
    id: "win-back",
    icon: Users,
    iconColor: "text-pink-600",
    iconBg: "bg-pink-50",
    title: "Inactive 90 Days → Win-Back Email",
    trigger: "Customer last service > 90 days ago",
    action: "Trigger re-engagement sequence",
    description: "Your lapsed customer list is money sitting on the table. This gets it.",
    comingSoon: true,
  },
  {
    id: "docusign",
    icon: FileText,
    iconColor: "text-slate-600",
    iconBg: "bg-slate-50",
    title: "Service Agreement → DocuSign",
    trigger: "New service agreement created",
    action: "Send for signature via DocuSign",
    description: "Gets recurring agreements signed digitally and filed automatically.",
    zapTemplate: "https://zapier.com/apps/docusign/integrations",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function NavIcon({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <div className="relative group flex items-center justify-center w-full">
      <Button
        variant="ghost"
        size="icon"
        className={`h-10 w-10 rounded-xl transition-all duration-200 ${
          active
            ? "bg-emerald-50 text-emerald-600 shadow-sm"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon className="h-5 w-5" />
      </Button>
      <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmailFlowCard({ flow }: { flow: EmailFlow }) {
  const [enabled, setEnabled] = useState(flow.status === "active");
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(flow.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "test@pestflow.org",
          customerName: "John Smith",
          companyName: "Green Shield Pest Control",
          amount: "149.00",
          paymentLink: "https://pestflow.org/pay",
          invoiceId: "INV-042",
          serviceType: "Quarterly Spray",
          daysOverdue: 14,
          notes: "Treated kitchen, bathrooms, garage, and perimeter. Applied granular bait stations along foundation.",
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Test email sent!", description: "Check test@pestflow.org for the preview." });
    },
    onError: () => {
      toast({ title: "Send failed", description: "Check your RESEND_API_KEY env var.", variant: "destructive" });
    },
  });

  return (
    <div className={`bg-white border rounded-xl p-5 transition-all ${enabled ? "border-slate-200 shadow-sm" : "border-slate-100 opacity-60"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${flow.iconBg}`}>
            <flow.icon className={`h-5 w-5 ${flow.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm">{flow.title}</h3>
              {enabled ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Active</Badge>
              ) : (
                <Badge variant="outline" className="text-slate-400 text-xs">Paused</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded">{flow.trigger}</span>
              <ArrowRight className="h-3 w-3 flex-shrink-0" />
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{flow.action}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{flow.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-emerald-500"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-400 hover:text-emerald-600 h-7 px-2"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
          >
            <Send className="h-3 w-3 mr-1" />
            {testMutation.isPending ? "Sending…" : "Test"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ZapFlowCard({ card }: { card: ZapCard }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
          <card.icon className={`h-5 w-5 ${card.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-sm">{card.title}</h3>
            {card.comingSoon && (
              <Badge variant="outline" className="text-slate-400 border-slate-200 text-xs">Coming soon</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded">{card.trigger}</span>
            <ArrowRight className="h-3 w-3 flex-shrink-0" />
            <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{card.action}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{card.description}</p>
          {!card.comingSoon && card.zapTemplate && (
            <a
              href={card.zapTemplate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-orange-600 hover:text-orange-700"
            >
              <img
                src="https://cdn.zapier.com/storage/photos/ced2e4f04af2c2a5e6e7c7b4c0d1e8f6.png"
                alt="Zapier"
                className="h-3.5 w-3.5 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              Connect on Zapier
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Automations() {
  const activeCount = EMAIL_FLOWS.filter((f) => f.status === "active").length;

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-4 bg-white border-r shrink-0 z-20">
        <div className="flex flex-col gap-6 w-full items-center">
          <div className="h-10 w-10 flex items-center justify-center">
            <img src={logoImage} alt="PestFlow" className="h-7 w-7 object-contain" />
          </div>
          <nav className="flex flex-col gap-4 w-full items-center">
            <Link href="/dashboard"><NavIcon icon={LayoutDashboard} label="Dashboard" /></Link>
            <Link href="/dashboard"><NavIcon icon={CalendarIcon} label="Calendar" /></Link>
            <Link href="/invoices"><NavIcon icon={FileText} label="Invoices" /></Link>
            <NavIcon icon={Zap} label="Automations" active />
            <Link href="/routes"><NavIcon icon={MapIcon} label="Routes" /></Link>
            <NavIcon icon={MessageSquare} label="Messages" />
          </nav>
        </div>
        <div className="mt-auto flex flex-col gap-4 mb-4">
          <NavIcon icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="PestFlow" className="h-9 w-auto object-contain" />
            <div className="h-5 w-px bg-slate-200" />
            <nav className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />Calendar
                </Button>
              </Link>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <FileText className="h-4 w-4 mr-1.5" />Invoices
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-emerald-600 bg-emerald-50">
                <Zap className="h-4 w-4 mr-1.5" />Automations
              </Button>
              <Link href="/routes">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <MapIcon className="h-4 w-4 mr-1.5" />Routes
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-500"><Settings className="h-5 w-5" /></Button>
            <div className="h-6 w-px bg-slate-200" />
            <Button variant="ghost" className="flex items-center gap-2 pl-1 pr-2">
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">Trevor</span>
            </Button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">

            {/* Page title */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Automations</h1>
              </div>
              <p className="text-slate-500 text-sm ml-12">
                Set your business on autopilot — every hour saved here is another stop on the route.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Email flows active</p>
                <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Running via Resend
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Zapier connections</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <Plug className="h-3 w-3" /> Connect below
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Estimated hrs saved / mo</p>
                <p className="text-2xl font-bold text-slate-900">~12</p>
                <p className="text-xs text-slate-400 mt-1">Based on active flows</p>
              </div>
            </div>

            {/* Email Flows Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    Email Flows
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs ml-1">Powered by Resend</Badge>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Pre-built and ready — toggle on to activate.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {EMAIL_FLOWS.map((flow) => (
                  <EmailFlowCard key={flow.id} flow={flow} />
                ))}
              </div>
            </div>

            <Separator className="mb-10" />

            {/* Zapier Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Connect More Apps
                    <Badge variant="outline" className="text-slate-400 border-slate-200 text-xs ml-1">via Zapier</Badge>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Link PestFlow to the tools you already use. Each one kills more admin time.</p>
                </div>
                <a
                  href="https://zapier.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50">
                    Browse Zapier
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ZAP_CARDS.map((card) => (
                  <ZapFlowCard key={card.id} card={card} />
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Want a custom flow built?</h3>
                  <p className="text-sm text-slate-600">
                    Tell us the trigger and action — if it saves your team time, we'll build it into PestFlow natively.
                  </p>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 gap-2">
                  Request a flow
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
