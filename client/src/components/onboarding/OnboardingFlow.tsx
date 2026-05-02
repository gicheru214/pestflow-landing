import { useState, useEffect, createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Wrench, 
  Calendar, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  X
} from "lucide-react";

interface OnboardingData {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  serviceId?: string;
  serviceName?: string;
  servicePrice?: string;
  jobId?: string;
  jobDate?: string;
  jobTime?: string;
  invoiceId?: string;
  invoiceAmount?: string;
  recurringDays?: number;
}

interface OnboardingContextType {
  step: number;
  setStep: (step: number) => void;
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  completed: boolean;
  setCompleted: (completed: boolean) => void;
  skipped: boolean;
  setSkipped: (skipped: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};

const TOTAL_STEPS = 5;

const stepInfo = [
  { icon: User, title: "Add Customer", description: "Add your first customer" },
  { icon: Wrench, title: "Choose Service", description: "Pick a service" },
  { icon: Calendar, title: "Schedule Job", description: "Set the date" },
  { icon: FileText, title: "Create Invoice", description: "Bill your customer" },
  { icon: CreditCard, title: "Get Paid", description: "Send payment link" },
];

// Step 1: Add Customer
function Step1AddCustomer({ onNext }: { onNext: (customerId: string) => void }) {
  const { data, setData } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    name: data.customerName || "",
    phone: data.customerPhone || "",
    address: data.customerAddress || "",
    city: data.customerCity || "Miami",
    state: data.customerState || "FL",
    zipCode: data.customerZip || ""
  });

  const createCustomer = useMutation({
    mutationFn: async (customer: typeof form) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      });
      if (!res.ok) throw new Error("Failed to create customer");
      return res.json();
    },
    onSuccess: (customer) => {
      setData({
        ...data,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerCity: customer.city,
        customerState: customer.state,
        customerZip: customer.zipCode
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onNext(customer.id);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add customer", variant: "destructive" });
    }
  });

  const isValid = form.name && form.phone && form.address && form.zipCode;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <User className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Add Your First Customer</h2>
        <p className="text-slate-500 mt-2">Every dollar starts with a customer. Let's add one now.</p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Customer Name *</Label>
          <Input
            data-testid="input-customer-name"
            id="name"
            placeholder="John Smith"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
          <Input
            data-testid="input-customer-phone"
            id="phone"
            placeholder="(305) 555-0123"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address" className="text-sm font-medium">Service Address *</Label>
          <Input
            data-testid="input-customer-address"
            id="address"
            placeholder="123 Main Street"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="city" className="text-sm font-medium">City</Label>
            <Input
              data-testid="input-customer-city"
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state" className="text-sm font-medium">State</Label>
            <Input
              data-testid="input-customer-state"
              id="state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="zip" className="text-sm font-medium">ZIP *</Label>
            <Input
              data-testid="input-customer-zip"
              id="zip"
              placeholder="33101"
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          data-testid="button-add-customer"
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
          disabled={!isValid || createCustomer.isPending}
          onClick={() => createCustomer.mutate(form)}
        >
          {createCustomer.isPending ? "Adding..." : "Add Customer & Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Step 2: Choose Service
function Step2ChooseService({ onNext }: { onNext: (serviceId: string) => void }) {
  const { data, setData } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState("");

  const presetServices = [
    { id: "preset-1", name: "General Pest Control", description: "Monthly interior/exterior spray", price: "99", duration: 30 },
    { id: "preset-2", name: "Bi-Monthly Service", description: "Every 2 months comprehensive treatment", price: "149", duration: 45 },
    { id: "preset-3", name: "One-Time Treatment", description: "Single deep treatment for immediate issues", price: "199", duration: 60 },
  ];

  const createService = useMutation({
    mutationFn: async () => {
      const service = presetServices.find(s => s.id === selected);
      if (!service) throw new Error("No service selected");
      
      const price = customPrice || service.price;
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...service, price, isPreset: false })
      });
      if (!res.ok) throw new Error("Failed to create service");
      return res.json();
    },
    onSuccess: (service) => {
      setData({
        ...data,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      onNext(service.id);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add service", variant: "destructive" });
    }
  });

  const selectedService = presetServices.find(s => s.id === selected);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <Wrench className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Pick a Service</h2>
        <p className="text-slate-500 mt-2">Choose a preset or customize the price. Takes 5 seconds.</p>
      </div>

      <div className="grid gap-4 max-w-lg mx-auto">
        {presetServices.map((service) => (
          <Card
            key={service.id}
            data-testid={`card-service-${service.id}`}
            className={`p-4 cursor-pointer transition-all border-2 ${
              selected === service.id 
                ? "border-emerald-500 bg-emerald-50" 
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setSelected(service.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{service.name}</h3>
                <p className="text-sm text-slate-500">{service.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{service.duration} min</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">${service.price}</div>
                <div className="text-xs text-slate-400">per visit</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="max-w-lg mx-auto">
          <Label className="text-sm font-medium text-slate-600">Custom Price (optional)</Label>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <Input
              data-testid="input-custom-price"
              placeholder={selectedService?.price}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-32"
            />
          </div>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button
          data-testid="button-select-service"
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
          disabled={!selected || createService.isPending}
          onClick={() => createService.mutate()}
        >
          {createService.isPending ? "Saving..." : "Select Service & Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Step 3: Schedule Job
function Step3ScheduleJob({ onNext }: { onNext: (jobId: string) => void }) {
  const { data, setData } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];
  
  const [form, setForm] = useState({
    date: defaultDate,
    time: "09:00",
    technician: "self"
  });

  const createJob = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.customerName,
          address: data.customerAddress,
          city: data.customerCity,
          state: data.customerState,
          zipCode: data.customerZip,
          serviceType: data.serviceName,
          duration: 30,
          status: "confirmed",
          scheduledDate: form.date,
          scheduledTime: form.time,
          technicianId: form.technician === "self" ? null : form.technician
        })
      });
      if (!res.ok) throw new Error("Failed to create job");
      return res.json();
    },
    onSuccess: (job) => {
      setData({
        ...data,
        jobId: job.id,
        jobDate: form.date,
        jobTime: form.time
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onNext(job.id);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to schedule job", variant: "destructive" });
    }
  });

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Calendar className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Schedule the Job</h2>
        <p className="text-slate-500 mt-2">When should you service {data.customerName}?</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <Label className="text-sm font-medium">Date</Label>
          <Input
            data-testid="input-job-date"
            type="date"
            value={form.date}
            min={defaultDate}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Time</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                data-testid={`button-time-${time}`}
                variant={form.time === time ? "default" : "outline"}
                size="sm"
                className={form.time === time ? "bg-emerald-500" : ""}
                onClick={() => setForm({ ...form, time })}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Assigned To</Label>
          <div className="flex gap-3 mt-2">
            <Button
              data-testid="button-assign-self"
              variant={form.technician === "self" ? "default" : "outline"}
              className={form.technician === "self" ? "bg-emerald-500 flex-1" : "flex-1"}
              onClick={() => setForm({ ...form, technician: "self" })}
            >
              Myself
            </Button>
            <Button
              data-testid="button-assign-tech"
              variant={form.technician === "tech" ? "default" : "outline"}
              className={form.technician === "tech" ? "bg-emerald-500 flex-1" : "flex-1"}
              onClick={() => setForm({ ...form, technician: "tech" })}
            >
              A Technician
            </Button>
          </div>
        </div>

        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="text-sm text-slate-600">
            <strong>Summary:</strong> {data.serviceName} for {data.customerName}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {new Date(form.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {form.time}
          </div>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          data-testid="button-schedule-job"
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
          disabled={createJob.isPending}
          onClick={() => createJob.mutate()}
        >
          {createJob.isPending ? "Scheduling..." : "Schedule Job & Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Step 4: Create Invoice
function Step4CreateInvoice({ onNext }: { onNext: (invoiceId: string) => void }) {
  const { data, setData } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createInvoice = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: data.customerId,
          jobId: data.jobId,
          amount: data.servicePrice,
          status: "pending"
        })
      });
      if (!res.ok) throw new Error("Failed to create invoice");
      return res.json();
    },
    onSuccess: (invoice) => {
      setData({
        ...data,
        invoiceId: invoice.id,
        invoiceAmount: invoice.amount
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      onNext(invoice.id);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create invoice", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <FileText className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Generate Invoice</h2>
        <p className="text-slate-500 mt-2">One click. That's all it takes to bill your customer.</p>
      </div>

      <Card className="max-w-md mx-auto p-6 border-2 border-dashed border-slate-300">
        <div className="text-center space-y-4">
          <div className="text-sm text-slate-500 uppercase tracking-wide">Invoice Preview</div>
          
          <div className="py-4 border-y border-slate-200">
            <div className="text-lg font-semibold text-slate-800">{data.customerName}</div>
            <div className="text-sm text-slate-500">{data.customerAddress}</div>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-slate-600">{data.serviceName}</span>
            <span className="font-bold text-lg">${data.servicePrice}</span>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">Total Due</span>
              <span className="text-2xl font-bold text-emerald-600">${data.servicePrice}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button
          data-testid="button-create-invoice"
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
          disabled={createInvoice.isPending}
          onClick={() => createInvoice.mutate()}
        >
          {createInvoice.isPending ? "Creating..." : "Create Invoice & Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Step 5: Send Payment Link + Recurring
function Step5SendPayment({ onComplete }: { onComplete: () => void }) {
  const { data, setData } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [recurring, setRecurring] = useState<number>(30);

  const sendPaymentLink = useMutation({
    mutationFn: async () => {
      // Update invoice with payment link
      const paymentLink = `https://pay.pestflow.com/inv/${data.invoiceId}`;
      const res = await fetch(`/api/invoices/${data.invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentLink,
          sentAt: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error("Failed to send payment link");
      
      // Update job for recurring
      if (data.jobId) {
        await fetch(`/api/jobs/${data.jobId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRecurring: recurring > 0 })
        });
      }
      
      return res.json();
    },
    onSuccess: () => {
      setData({ ...data, recurringDays: recurring });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onComplete();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send payment link", variant: "destructive" });
    }
  });

  const recurringOptions = [
    { days: 30, label: "Monthly", desc: "Every 30 days" },
    { days: 60, label: "Bi-Monthly", desc: "Every 60 days" },
    { days: 90, label: "Quarterly", desc: "Every 90 days" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CreditCard className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Send Payment Link</h2>
        <p className="text-slate-500 mt-2">Send ${data.servicePrice} invoice to {data.customerName}. Set recurring to autopilot revenue.</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-emerald-800">Invoice #{data.invoiceId?.slice(0, 8)}</div>
              <div className="text-sm text-emerald-600">Ready to send via SMS/Email</div>
            </div>
            <div className="ml-auto text-2xl font-bold text-emerald-700">${data.servicePrice}</div>
          </div>
        </Card>

        <div>
          <Label className="text-sm font-medium mb-3 block">Set Recurring Service</Label>
          <div className="grid grid-cols-3 gap-3">
            {recurringOptions.map((opt) => (
              <Card
                key={opt.days}
                data-testid={`card-recurring-${opt.days}`}
                className={`p-3 cursor-pointer text-center transition-all border-2 ${
                  recurring === opt.days 
                    ? "border-emerald-500 bg-emerald-50" 
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setRecurring(opt.days)}
              >
                <div className="font-semibold text-slate-800">{opt.label}</div>
                <div className="text-xs text-slate-500">{opt.desc}</div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800">Projected Annual Revenue</div>
              <div className="text-2xl font-bold text-blue-600">
                ${((Number(data.servicePrice) * 365) / recurring).toFixed(0)}
              </div>
              <div className="text-xs text-blue-500">Based on {recurring}-day recurring service</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          data-testid="button-send-payment"
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
          disabled={sendPaymentLink.isPending}
          onClick={() => sendPaymentLink.mutate()}
        >
          {sendPaymentLink.isPending ? "Sending..." : "Send Payment Link & Finish"}
          <CheckCircle2 className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Success Screen
function SuccessScreen({ onClose }: { onClose: () => void }) {
  const { data } = useOnboarding();

  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100"
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-slate-800">You're All Set!</h2>
        <p className="text-slate-500 mt-2">You just completed your first end-to-end workflow in under 3 minutes.</p>
      </div>

      <Card className="max-w-md mx-auto p-6 bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-slate-700">Added customer: <strong>{data.customerName}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-slate-700">Created service: <strong>{data.serviceName}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-slate-700">Scheduled job for <strong>{data.jobDate}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-slate-700">Invoice sent: <strong>${data.servicePrice}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-slate-700">Recurring set: <strong>Every {data.recurringDays} days</strong></span>
          </div>
        </div>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
        <div className="font-semibold text-amber-800">Next Best Action</div>
        <p className="text-sm text-amber-700 mt-1">
          Import your existing customers to unlock Route Optimization and save 2+ hours per day on driving.
        </p>
      </div>

      {/* Loss aversion */}
      <p className="text-sm font-medium text-amber-600 max-w-md mx-auto">
        ⚠️ Your customer, job, and invoice data will be cleared in 48 hours — confirm a plan to keep everything you just built.
      </p>

      <Button
        data-testid="button-go-to-dashboard"
        size="lg"
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
        onClick={onClose}
      >
        Go to Dashboard
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

// Main Onboarding Flow Component
export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [completed, setCompleted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progressId, setProgressId] = useState<string | null>(null);

  const progress = ((step - 1) / TOTAL_STEPS) * 100;
  const estimatedTime = Math.max(1, 4 - step);

  // Save progress after each step
  const saveProgress = async (newStep: number, updates: Partial<OnboardingData>) => {
    try {
      if (progressId) {
        await fetch(`/api/onboarding/${progressId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: newStep,
            customerId: updates.customerId || data.customerId,
            serviceId: updates.serviceId || data.serviceId,
            jobId: updates.jobId || data.jobId,
            invoiceId: updates.invoiceId || data.invoiceId
          })
        });
      } else {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: newStep,
            customerId: updates.customerId,
            serviceId: updates.serviceId,
            jobId: updates.jobId,
            invoiceId: updates.invoiceId
          })
        });
        const progress = await res.json();
        setProgressId(progress.id);
      }
    } catch (e) {
      console.error("Failed to save progress");
    }
  };

  const handleStepComplete = (newStep: number, updates: Partial<OnboardingData> = {}) => {
    setData({ ...data, ...updates });
    saveProgress(newStep, updates);
    setStep(newStep);
  };

  const handleComplete = async () => {
    setShowSuccess(true);
    setCompleted(true);
    if (progressId) {
      await fetch(`/api/onboarding/${progressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, completedAt: new Date().toISOString() })
      });
    }
  };

  const handleSkip = async () => {
    try {
      if (progressId) {
        await fetch(`/api/onboarding/${progressId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skippedAt: new Date().toISOString() })
        });
      } else {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step, skippedAt: new Date().toISOString() })
        });
      }
      onComplete();
    } catch (e) {
      onComplete();
    }
  };

  const handleClose = () => {
    onComplete();
  };

  return (
    <OnboardingContext.Provider value={{ step, setStep, data, setData, completed, setCompleted, skipped, setSkipped }}>
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Header with Progress */}
        <div className="border-b bg-slate-50 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500">
                  {showSuccess ? "Complete!" : `~${estimatedTime} min to first payment request`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {stepInfo.map((s, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      i + 1 === step 
                        ? "bg-emerald-100 text-emerald-700" 
                        : i + 1 < step 
                          ? "text-emerald-500" 
                          : "text-slate-400"
                    }`}
                  >
                    <s.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <Progress value={showSuccess ? 100 : progress} className="h-2" />
          </div>
        </div>

        {/* Skip Option */}
        {!showSuccess && (
          <div className="absolute top-4 right-4">
            <Button
              data-testid="button-skip-onboarding"
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-600"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto py-8 px-6">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={showSuccess ? "success" : step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {showSuccess ? (
                  <SuccessScreen onClose={handleClose} />
                ) : (
                  <>
                    {step === 1 && <Step1AddCustomer onNext={(customerId) => {
                      saveProgress(2, { customerId });
                      setStep(2);
                    }} />}
                    {step === 2 && <Step2ChooseService onNext={(serviceId) => {
                      saveProgress(3, { serviceId });
                      setStep(3);
                    }} />}
                    {step === 3 && <Step3ScheduleJob onNext={(jobId) => {
                      saveProgress(4, { jobId });
                      setStep(4);
                    }} />}
                    {step === 4 && <Step4CreateInvoice onNext={(invoiceId) => {
                      saveProgress(5, { invoiceId });
                      setStep(5);
                    }} />}
                    {step === 5 && <Step5SendPayment onComplete={handleComplete} />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </OnboardingContext.Provider>
  );
}

// Sticky Banner for incomplete onboarding
export function OnboardingBanner({ onResume }: { onResume: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-amber-500 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Finish setup to unlock Routes, Reminders, and more features</span>
        </div>
        <Button
          data-testid="button-resume-onboarding"
          variant="secondary"
          size="sm"
          onClick={onResume}
          className="bg-white text-amber-600 hover:bg-amber-50"
        >
          Resume Setup
        </Button>
      </div>
    </div>
  );
}
