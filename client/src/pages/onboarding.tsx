import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Upload, Camera, Plus, Building2, User } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/Screenshot_2026-01-13_at_7.27.30_PM-removebg-preview_1768354175011.png";
import { analytics, EVENTS } from "@/lib/analytics";

const step1Schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  profilePicture: z.any().optional(),
});

const step2Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().optional(),
  technicians: z.string().min(1, "Number of technicians is required"),
  routes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  logo: z.any().optional(),
});

// Combine schemas for full form type if needed, but we validate per step
type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const stripeLink = "https://buy.stripe.com/cNi28q7XZ9XB5LRcH6dfG06";

  useEffect(() => {
    analytics.track(step === 1 ? EVENTS.ONBOARDING.STEP_1_VIEW : EVENTS.ONBOARDING.STEP_2_VIEW);
  }, [step]);

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      companyName: "",
      website: "",
      technicians: "",
      routes: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const onStep1Submit = (values: Step1Values) => {
    analytics.track(EVENTS.ONBOARDING.STEP_1_COMPLETE, { email: values.email });
    
    const processedValues = { ...values };
    if (values.profilePicture instanceof File) {
      processedValues.profilePicture = {
        name: values.profilePicture.name,
        size: values.profilePicture.size,
        type: values.profilePicture.type
      };
    }
    setStep1Data(processedValues);
    setStep(2);
  };

  const onStep2Submit = async (values: Step2Values) => {
    if (!step1Data) return;
    
    // Process logo file
    const processedValues = { ...values };
    if (values.logo instanceof File) {
      // @ts-ignore - storing metadata for mockup
      processedValues.logo = {
        name: values.logo.name,
        size: values.logo.size,
        type: values.logo.type
      };
    }

    const submission = { 
      type: "demo",
      firstName: step1Data.firstName,
      lastName: step1Data.lastName,
      email: step1Data.email,
      phone: step1Data.phone,
      companyName: processedValues.companyName,
      website: processedValues.website,
      technicians: processedValues.technicians,
      routes: processedValues.routes,
      address: processedValues.address,
      city: processedValues.city,
      state: processedValues.state,
      zipCode: processedValues.zipCode
    };

    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      
      analytics.track(EVENTS.ONBOARDING.STEP_2_COMPLETE, { 
        companyName: values.companyName,
        technicians: values.technicians 
      });
      analytics.track(EVENTS.CHECKOUT.REDIRECT_TO_STRIPE);
    } catch (e) {
      console.error("Failed to save submission", e);
    }
    
    window.location.href = stripeLink;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Simple Header */}
      <header className="w-full bg-white border-b py-4">
        <div className="container mx-auto px-4 flex justify-center">
           <Link href="/" className="cursor-pointer">
              <img src={logoImage} alt="PestFlow" className="h-8 w-auto mix-blend-multiply" />
           </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Progress Bar */}
          <div className="flex gap-4 mb-12">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-primary" : "bg-slate-100"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-primary" : "bg-slate-100"}`} />
          </div>

          <div className="mb-8">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {step} of 2
            </p>
            <h1 className="text-3xl font-bold text-slate-900 font-heading">
              {step === 1 ? "Personal Information" : "Business Details"}
            </h1>
            <p className="text-slate-500 mt-2">
              {step === 1 
                ? "Enter your details to continue to the next page" 
                : "Tell us about your company structure"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...form1}>
                  <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center mb-8">
                      <FormField
                        control={form1.control}
                        name="profilePicture"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem className="text-center">
                            <FormControl>
                              <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary transition-colors overflow-hidden">
                                  {value ? (
                                     <img src={URL.createObjectURL(value)} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                    <Plus className="w-8 h-8 text-slate-400" />
                                  )}
                                  <Input
                                    {...fieldProps}
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => onChange(e.target.files?.[0])}
                                  />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md">
                                  <Camera className="w-3 h-3" />
                                </div>
                              </div>
                            </FormControl>
                            <FormLabel className="font-normal text-slate-500 mt-2 block">
                              Upload your profile picture
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form1.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" className="bg-slate-50 border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form1.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" className="bg-slate-50 border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form1.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" type="email" className="bg-slate-50 border-slate-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form1.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <div className="flex gap-3">
                            <Select defaultValue="US">
                              <SelectTrigger className="w-[80px] bg-slate-50 border-slate-200">
                                <SelectValue placeholder="US" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">US</SelectItem>
                                <SelectItem value="CA">CA</SelectItem>
                                <SelectItem value="UK">UK</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input placeholder="+1 (555) 000-0000" type="tel" className="bg-slate-50 border-slate-200 flex-1" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between pt-6">
                      <Button type="button" variant="outline" className="text-slate-600" asChild>
                         <Link href="/">Go Back</Link>
                      </Button>
                      <Button type="submit" size="lg" className="px-8 bg-primary hover:bg-primary/90">
                        Continue
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...form2}>
                  <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
                     {/* Logo Upload */}
                    <div className="flex flex-col items-center mb-8">
                      <FormField
                        control={form2.control}
                        name="logo"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem className="text-center">
                            <FormControl>
                              <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary transition-colors overflow-hidden">
                                  {value ? (
                                     <img src={URL.createObjectURL(value)} alt="Logo" className="w-full h-full object-cover" />
                                  ) : (
                                    <Building2 className="w-8 h-8 text-slate-400" />
                                  )}
                                  <Input
                                    {...fieldProps}
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => onChange(e.target.files?.[0])}
                                  />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md">
                                  <Camera className="w-3 h-3" />
                                </div>
                              </div>
                            </FormControl>
                            <FormLabel className="font-normal text-slate-500 mt-2 block">
                              Upload your business logo
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form2.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company name</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" className="bg-slate-50 border-slate-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                     <FormField
                      control={form2.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="www.yourwebsite.com" className="bg-slate-50 border-slate-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form2.control}
                        name="technicians"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Technicians</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 5" className="bg-slate-50 border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form2.control}
                        name="routes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Routes (Optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 3" className="bg-slate-50 border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form2.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Business Rd" className="bg-slate-50 border-slate-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <FormField
                        control={form2.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="City" className="bg-slate-50 border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form2.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State (Optional)</FormLabel>
                            <FormControl>
                               <Input placeholder="State" className="bg-slate-50 border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form2.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip code (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Zip code" className="bg-slate-50 border-slate-200" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-between pt-6">
                      <Button type="button" variant="outline" className="text-slate-600" onClick={() => setStep(1)}>
                         Go Back
                      </Button>
                      <Button type="submit" size="lg" className="px-8 bg-primary hover:bg-primary/90">
                        Finish
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
