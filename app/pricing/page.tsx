"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 py-20 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-400">
            Start with a 30-day free trial. No credit card required. Upgrade when you're ready to scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="p-8 rounded-3xl bg-white/2 border border-white/5 flex flex-col hover:border-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Basic</h3>
            <p className="text-slate-400 text-sm mb-6">Perfect for solo practitioners.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">₹999</span>
              <span className="text-slate-500">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Up to 2 Doctors" />
              <FeatureItem text="Up to 5 Staff Members" />
              <FeatureItem text="Patient Management (CRM)" />
              <FeatureItem text="Basic Appointment Scheduling" />
            </ul>

            <Link 
              href="/onboarding" 
              className="w-full py-3 rounded-full border border-white/10 text-center hover:bg-white/5 transition-colors font-medium"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-3xl bg-linear-to-b from-indigo-500/10 to-transparent border border-indigo-500/30 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-indigo-500/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold mb-2 text-indigo-300">Pro</h3>
            <p className="text-slate-400 text-sm mb-6">For growing clinics and teams.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">₹2,999</span>
              <span className="text-slate-400">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Unlimited Doctors" />
              <FeatureItem text="Unlimited Staff Members" />
              <FeatureItem text="Advanced Patient Records" />
              <FeatureItem text="Custom Departments" />
              <FeatureItem text="WhatsApp & SMS Reminders" />
              <FeatureItem text="Detailed Analytics" />
            </ul>

            <Link 
              href="/onboarding" 
              className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-center transition-colors font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              Start 30-Day Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 rounded-3xl bg-white/2 border border-white/5 flex flex-col hover:border-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <p className="text-slate-400 text-sm mb-6">For large multi-location hospital chains.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">Custom</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <FeatureItem text="Everything in Pro" />
              <FeatureItem text="Multiple Clinic Locations" />
              <FeatureItem text="Dedicated Account Manager" />
              <FeatureItem text="Custom Integrations" />
              <FeatureItem text="White-labeling Options" />
            </ul>

            <Link 
              href="/onboarding" 
              className="w-full py-3 rounded-full border border-white/10 text-center hover:bg-white/5 transition-colors font-medium"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
      <span className="text-slate-300">{text}</span>
    </li>
  );
}
