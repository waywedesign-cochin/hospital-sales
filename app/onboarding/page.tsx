"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Hospital, Mail, MapPin, Phone, User as UserIcon, Lock, Loader2, CreditCard, Sparkles, Crown, Zap } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import toast from "react-hot-toast";

const PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price: "₹0",
    period: "30 days",
    description: "Try everything free for 30 days",
    features: ["Up to 2 Doctors", "Up to 5 Staff", "All core features", "No credit card needed"],
    icon: Sparkles,
    color: "emerald",
    popular: false,
  },
  {
    id: "BASIC",
    name: "Basic",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    description: "Perfect for solo practitioners",
    features: ["Up to 2 Doctors", "Up to 5 Staff", "Patient CRM", "Appointment Scheduling"],
    icon: Zap,
    color: "blue",
    popular: false,
  },
  {
    id: "PRO",
    name: "Pro",
    monthlyPrice: 2999,
    yearlyPrice: 29990,
    description: "For growing clinics and teams",
    features: ["Unlimited Doctors", "Unlimited Staff", "Advanced Analytics", "WhatsApp Reminders", "Custom Departments"],
    icon: Crown,
    color: "indigo",
    popular: true,
  },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan") || "";

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan || "free");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    clinicName: "",
    clinicPhone: "",
    clinicAddress: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.email || !formData.password) {
        toast.error("Please fill in required fields.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.clinicName) {
        toast.error("Clinic Name is required.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
          billingCycle: selectedPlan !== "free" ? billingCycle : undefined,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        if (selectedPlan !== "free") {
          toast.success("Payment confirmed! Welcome aboard!");
        } else {
          toast.success("Welcome aboard! Your 30-day trial has started.");
        }
        router.push("/dashboard");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedPlanInfo = () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return null;
    if (plan.id === "free") return { name: "Free Trial (30 days)", price: "₹0" };
    const price = billingCycle === "YEARLY" ? (plan as any).yearlyPrice : (plan as any).monthlyPrice;
    return {
      name: `${plan.name} (${billingCycle === "YEARLY" ? "Yearly" : "Monthly"})`,
      price: `₹${price.toLocaleString("en-IN")}`,
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-50 selection:bg-indigo-500/30">
      
      {/* Left Sidebar - Branding & Progress */}
      <div className="w-full lg:w-[400px] xl:w-[500px] bg-slate-900 border-r border-white/5 p-8 md:p-12 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/2" />
        
        <div className="flex items-center gap-2 mb-16 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">HealthcareCRM</span>
        </div>

        <div className="flex-1 relative z-10">
          <h2 className="text-3xl font-bold mb-8">Let&apos;s get you set up</h2>
          
          <div className="space-y-8">
            <StepIndicator 
              number={1} 
              title="Admin Account" 
              desc="Create your primary login."
              isActive={step === 1}
              isCompleted={step > 1}
            />
            <StepIndicator 
              number={2} 
              title="Clinic Details" 
              desc="Tell us about your practice."
              isActive={step === 2}
              isCompleted={step > 2}
            />
            <StepIndicator 
              number={3} 
              title="Choose Plan" 
              desc="Select a plan that fits you."
              isActive={step === 3}
              isCompleted={step > 3}
            />
            <StepIndicator 
              number={4} 
              title="Ready to go" 
              desc="Review and launch."
              isActive={step === 4}
              isCompleted={step > 4}
            />
          </div>
        </div>
      </div>

      {/* Right Content - Forms */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-slate-950 relative">
        <div className="w-full max-w-lg">
          {/* Step 1: Admin Account */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-bold mb-2">Create Admin Account</h3>
              <p className="text-slate-400 mb-8">This will be your primary login for the dashboard.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">First Name <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="john@clinic.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" name="password" value={formData.password} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Clinic Details */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-bold mb-2">Clinic Details</h3>
              <p className="text-slate-400 mb-8">What should we call your workspace?</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Clinic Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Building2 className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" name="clinicName" value={formData.clinicName} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="e.g. Smile Dental Clinic"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contact Phone</label>
                  <div className="relative">
                    <PhoneInput 
                      name="clinicPhone" 
                      value={formData.clinicPhone} 
                      onChange={(val: string) => setFormData(p => ({ ...p, clinicPhone: val || "" }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-1 px-4 text-white focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Location</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                    <textarea 
                      name="clinicAddress" value={formData.clinicAddress} onChange={handleChange} rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="123 Medical Drive..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={handleBack}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Plan */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
              <p className="text-slate-400 mb-6">Start free or pick a plan to unlock everything from day one.</p>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className={`text-sm font-medium ${billingCycle === "MONTHLY" ? "text-white" : "text-slate-500"}`}>Monthly</span>
                <button
                  onClick={() => setBillingCycle(billingCycle === "MONTHLY" ? "YEARLY" : "MONTHLY")}
                  className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === "YEARLY" ? "bg-indigo-600" : "bg-white/10"}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${billingCycle === "YEARLY" ? "translate-x-7" : ""}`} />
                </button>
                <span className={`text-sm font-medium ${billingCycle === "YEARLY" ? "text-white" : "text-slate-500"}`}>
                  Yearly
                  <span className="ml-1 text-xs text-emerald-400 font-semibold">Save 17%</span>
                </span>
              </div>
              
              <div className="space-y-4">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const price = plan.id === "free" ? "₹0" : `₹${(billingCycle === "YEARLY" ? (plan as any).yearlyPrice : (plan as any).monthlyPrice).toLocaleString("en-IN")}`;
                  const period = plan.id === "free" ? "30 days" : billingCycle === "YEARLY" ? "/year" : "/month";
                  const Icon = plan.icon;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(79,70,229,0.15)]"
                          : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-3 right-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Popular
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${isSelected ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-400"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <h4 className="font-bold text-lg">{plan.name}</h4>
                            <span className="text-2xl font-bold">{price}</span>
                            <span className="text-sm text-slate-500">{period}</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {plan.features.map((f) => (
                              <span key={f} className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-lg">{f}</span>
                            ))}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                          isSelected ? "border-indigo-500 bg-indigo-500" : "border-white/20"
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={handleBack}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                {selectedPlan === "free" ? (
                  <CheckCircle2 className="w-10 h-10 text-indigo-400" />
                ) : (
                  <CreditCard className="w-10 h-10 text-indigo-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {selectedPlan === "free" ? "You're all set!" : "Confirm & Pay"}
              </h3>
              <p className="text-slate-400 mb-8">
                {selectedPlan === "free"
                  ? <>Your 30-day free trial for <strong>{formData.clinicName}</strong> is ready to begin.</>
                  : <>Review your details and confirm payment for <strong>{formData.clinicName}</strong>.</>
                }
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin</span>
                  <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clinic</span>
                  <span className="font-medium">{formData.clinicName}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3">
                  <span className="text-slate-400">Plan</span>
                  <span className="font-medium text-indigo-400">{getSelectedPlanInfo()?.name}</span>
                </div>
                {selectedPlan !== "free" && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount</span>
                    <span className="font-bold text-xl text-white">{getSelectedPlanInfo()?.price}</span>
                  </div>
                )}
              </div>

              {selectedPlan !== "free" && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left">
                  <p className="text-amber-300 text-sm">
                    <strong>🔒 Mock Payment:</strong> This is a simulated payment for development. No real money will be charged. In production, this will use Razorpay.
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <button 
                  onClick={handleBack}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {selectedPlan === "free" ? "Creating..." : "Processing Payment..."}
                    </>
                  ) : (
                    selectedPlan === "free" ? "Launch Dashboard" : `Pay ${getSelectedPlanInfo()?.price} & Launch`
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StepIndicator({ number, title, desc, isActive, isCompleted }: { 
  number: number; title: string; desc: string; isActive: boolean; isCompleted: boolean;
}) {
  return (
    <div className={`flex gap-4 transition-all duration-300 ${isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-30'}`}>
      <div className="relative flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
          isActive ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 
          isCompleted ? 'bg-emerald-500 text-white' : 
          'bg-white/10 text-slate-400'
        }`}>
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : number}
        </div>
        {number !== 4 && (
          <div className={`absolute top-8 w-0.5 h-12 ${isCompleted ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
        )}
      </div>
      <div>
        <h4 className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{title}</h4>
        <p className="text-sm text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}
