import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Plus, 
  Search, 
  X,
  Download,
  ChevronDown,
  Calendar,
  RefreshCw,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Map as MapIcon,
  Users,
  Bell,
  MessageSquare,
  HelpCircle,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/Screenshot_2026-01-13_at_7.27.30_PM-removebg-preview_1768354175011.png";

interface InvoiceItem {
  id: string;
  name: string;
  cost: number;
  tax: number;
  qty: number;
  price: number;
  description: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
}

function NavIcon({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`h-10 w-10 ${active ? "text-emerald-600 bg-emerald-50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"}`}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}

export default function Invoices() {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      return res.json();
    }
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const res = await fetch("/api/customers");
      return res.json();
    }
  });

  const filteredInvoices = invoices.filter((inv: any) => 
    inv.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-4 bg-white border-r shrink-0 z-20">
        <div className="flex flex-col gap-6 w-full items-center">
          <nav className="flex flex-col gap-4 w-full items-center">
            <Link href="/dashboard">
              <NavIcon icon={LayoutDashboard} label="Dashboard" />
            </Link>
            <Link href="/dashboard">
              <NavIcon icon={CalendarIcon} label="Calendar" />
            </Link>
            <NavIcon icon={Users} label="Customers" />
            <Link href="/routes">
              <NavIcon icon={MapIcon} label="Map" />
            </Link>
            <NavIcon icon={FileText} label="Invoices" active />
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
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="PestFlow" className="h-7 w-auto object-contain" />
            <div className="h-5 w-px bg-slate-200" />
            <nav className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  Calendar
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-emerald-600 bg-emerald-50">
                <FileText className="h-4 w-4 mr-1.5" />
                Invoices
              </Button>
              <Link href="/materials">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Materials
                </Button>
              </Link>
              <Link href="/routes">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <MapIcon className="h-4 w-4 mr-1.5" />
                  Routes
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex-1 max-w-md mx-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search invoices..." 
              className="pl-10 bg-slate-50 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
              onClick={() => setShowNewInvoice(true)}
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500">
              <Bell className="h-5 w-5" />
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Total Invoices</div>
                <div className="text-2xl font-bold">{invoices.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Pending</div>
                <div className="text-2xl font-bold text-amber-600">
                  {invoices.filter((i: any) => i.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Paid</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {invoices.filter((i: any) => i.status === "paid").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-slate-500">Total Revenue</div>
                <div className="text-2xl font-bold">
                  ${invoices.reduce((sum: number, i: any) => sum + parseFloat(i.amount || 0), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No invoices yet</h3>
                  <p className="text-slate-500 mb-4">Create your first invoice to start billing customers</p>
                  <Button onClick={() => setShowNewInvoice(true)} className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id.slice(0, 8)}</TableCell>
                        <TableCell>{invoice.customerId?.slice(0, 8) || "—"}</TableCell>
                        <TableCell>${parseFloat(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === "paid" ? "default" : "secondary"} 
                            className={invoice.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Invoice Modal */}
      <NewInvoiceModal 
        open={showNewInvoice} 
        onOpenChange={setShowNewInvoice}
        customers={customers}
      />
    </div>
  );
}

function NewInvoiceModal({ 
  open, 
  onOpenChange,
  customers 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("5000");
  const [poNumber, setPoNumber] = useState("");
  const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", name: "", cost: 0, tax: 0, qty: 1, price: 0, description: "" }
  ]);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal - (subtotal * discount / 100);

  const addItem = () => {
    setItems([...items, { 
      id: String(items.length + 1), 
      name: "", 
      cost: 0, 
      tax: 0, 
      qty: 1, 
      price: 0, 
      description: "" 
    }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "cost" || field === "qty" || field === "tax") {
      const cost = field === "cost" ? value : newItems[index].cost;
      const qty = field === "qty" ? value : newItems[index].qty;
      const tax = field === "tax" ? value : newItems[index].tax;
      newItems[index].price = (cost * qty) * (1 + tax / 100);
    }
    setItems(newItems);
  };

  const createInvoice = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer,
          amount: String(total.toFixed(2)),
          status: "pending"
        })
      });
      return res.json();
    },
    onSuccess: (invoice) => {
      toast({ title: "Invoice created!", description: `Invoice #${invoice.id.slice(0,8)} has been created.` });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      onOpenChange(false);
      // Generate PDF download
      generatePDF(invoice);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
    }
  });

  const generatePDF = (invoice: any) => {
    const customer = customers.find(c => c.id === selectedCustomer);
    const content = `
INVOICE #${invoiceNumber}
Date: ${dateIssued}
${poNumber ? `PO: ${poNumber}` : ""}

Bill To:
${customer?.name || "Customer"}
${customer?.email || ""}
${customer?.phone || ""}

Items:
${items.map(item => `${item.name || "Service"} - Qty: ${item.qty} - $${item.price.toFixed(2)}`).join("\n")}

Subtotal: $${subtotal.toFixed(2)}
Discount: ${discount}%
Total: $${total.toFixed(2)}

Thank you for your business!
PestFlow - Pest Control Software
    `;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>New Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
          This invoice is not attached to a job. It is a stand-alone invoice. Use this to create invoices unrelated to a job.
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium text-slate-700">Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer: Customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-medium">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-slate-500">{customer.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700">Invoice #</Label>
            <Input 
              value={invoiceNumber} 
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium text-slate-700">PO</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={poNumber} 
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Optional"
              />
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700">Date Issued</Label>
            <Input 
              type="date"
              value={dateIssued} 
              onChange={(e) => setDateIssued(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="border rounded-lg overflow-hidden mb-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-medium">ITEM</TableHead>
                <TableHead className="text-xs font-medium w-20">COST</TableHead>
                <TableHead className="text-xs font-medium w-16">TAX</TableHead>
                <TableHead className="text-xs font-medium w-16">QTY</TableHead>
                <TableHead className="text-xs font-medium w-24">PRICE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="p-2">
                    <Select value={item.name} onValueChange={(v) => updateItem(index, "name", v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general_pest">General Pest Control</SelectItem>
                        <SelectItem value="bimonthly">Bi-Monthly Service</SelectItem>
                        <SelectItem value="one_time">One-Time Treatment</SelectItem>
                        <SelectItem value="rodent">Rodent Control</SelectItem>
                        <SelectItem value="termite">Termite Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="mt-2 min-h-[60px] text-sm"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input 
                      type="number" 
                      value={item.cost}
                      onChange={(e) => updateItem(index, "cost", parseFloat(e.target.value) || 0)}
                      className="h-9 w-20"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input 
                      type="number" 
                      value={item.tax}
                      onChange={(e) => updateItem(index, "tax", parseFloat(e.target.value) || 0)}
                      className="h-9 w-16"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input 
                      type="number" 
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", parseInt(e.target.value) || 1)}
                      className="h-9 w-16"
                    />
                  </TableCell>
                  <TableCell className="p-2 font-medium">
                    ${item.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 gap-2 mb-4" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-600">Discount</span>
              <div className="flex items-center gap-1">
                <Input 
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="h-8 w-16 text-right"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Balance Due</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={() => createInvoice.mutate()}
            disabled={!selectedCustomer || createInvoice.isPending}
          >
            {createInvoice.isPending ? "Creating..." : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
