import { 
  Bot, 
  FileText, 
  BarChart3, 
  Star, 
  Phone, 
  Users, 
  Receipt, 
  Calendar, 
  MapPin, 
  UserCircle, 
  Smartphone, 
  FileSpreadsheet, 
  DollarSign, 
  Navigation, 
  Package, 
  TrendingUp, 
  Inbox, 
  Mail, 
  Kanban, 
  PieChart 
} from "lucide-react";

export const FEATURES = {
  business: {
    id: "business",
    title: "For Business Owners",
    shortTitle: "Business Owners",
    description: "Power your business with PestFlow and grow your revenue.",
    color: "bg-purple-100 text-purple-700",
    items: [
      {
        icon: Bot,
        title: "AI Agents",
        description: "Reduce staffing needs & speed up your sales process."
      },
      {
        icon: FileText,
        title: "Document Library",
        description: "Utilize our complete doc library & e-signature process."
      },
      {
        icon: BarChart3,
        title: "Reporting",
        description: "Get an overview of your core metrics with the reporting dashboard."
      },
      {
        icon: Star,
        title: "Review Generation",
        description: "Turn customers into business advocates with online reviews."
      },
      {
        icon: Phone,
        title: "VoIP & SMS",
        description: "Finally a completely integrated Phone & Texting solution."
      }
    ]
  },
  admins: {
    id: "admins",
    title: "For Admins",
    shortTitle: "Admins",
    description: "Improve business operations and keep customers happy.",
    color: "bg-cyan-100 text-cyan-700",
    items: [
      {
        icon: Users,
        title: "CRM",
        description: "Manage all your contacts with one tool."
      },
      {
        icon: Receipt,
        title: "Invoicing & Billing",
        description: "Automate your entire billing process in minutes."
      },
      {
        icon: Calendar,
        title: "Scheduling & Dispatching",
        description: "Add customers and book jobs faster."
      },
      {
        icon: MapPin,
        title: "Route Optimization",
        description: "Plan and dispatch optimized routes in seconds."
      },
      {
        icon: UserCircle,
        title: "Customer Portal",
        description: "Allow customers to view estimates and appointments and pay invoices."
      }
    ]
  },
  technicians: {
    id: "technicians",
    title: "For Technicians",
    shortTitle: "Technicians",
    description: "Your on-the-go solution to simplify workflows and impress customers.",
    color: "bg-orange-100 text-orange-700",
    items: [
      {
        icon: Smartphone,
        title: "Mobile App",
        description: "Prepare for and complete jobs easily with the PestFlow mobile app."
      },
      {
        icon: FileSpreadsheet,
        title: "Quotes & Estimates",
        description: "Send customized quotes and estimates."
      },
      {
        icon: DollarSign,
        title: "Invoicing & Payments",
        description: "Send professional invoices and get paid faster."
      },
      {
        icon: Navigation,
        title: "GPS Tracking",
        description: "Watch your team in real time for faster dispatching."
      },
      {
        icon: Package,
        title: "Material Tracking",
        description: "Track your materials and chemicals applied on the job site."
      }
    ]
  },
  sales: {
    id: "sales",
    title: "For Sales",
    shortTitle: "Sales",
    description: "Tools and insights to manage your sales process end-to-end.",
    color: "bg-pink-100 text-pink-700",
    items: [
      {
        icon: TrendingUp,
        title: "Dynamic Estimates",
        description: "Automatically upsell more with dynamic estimate packages."
      },
      {
        icon: Inbox,
        title: "Smart Views",
        description: "Close more deals with customizable inbox filters."
      },
      {
        icon: Mail,
        title: "Enhanced Follow Ups",
        description: "Enhance customer communication with batched emails and VoIP."
      },
      {
        icon: Kanban,
        title: "Opportunity Pipeline",
        description: "Track and organize your leads across your sales stages."
      },
      {
        icon: PieChart,
        title: "Pipeline Reporting",
        description: "Gain visibility into how your sales stages are progressing."
      }
    ]
  }
};
