"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Activity,
  Calendar,
  Users,
  Shield,
  Quote,
  MessageCircle,
  CreditCard,
  MapPin,
  Clock,
} from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LandingPage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-up", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-slate-950/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              HealthcareCRM
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link
              href="#features"
              className="hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link href="/auth" className="hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/onboarding"
              className="bg-white text-slate-900 px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main
        ref={heroRef}
        className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative"
      >
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="animate-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          The Ultimate Clinic Management Platform
        </div>

        <h1 className="animate-up text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Run your clinic <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">
            like a masterpiece.
          </span>
        </h1>

        <p className="animate-up text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          From patient records and dynamic departments to smart appointments and
          WhatsApp integration. Everything you need to scale your practice in
          one beautiful dashboard.
        </p>

        <div className="animate-up flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/onboarding"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.4)]"
          >
            Start 30-Day Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-medium transition-all"
          >
            View Pricing
          </Link>
        </div>

        {/* Dashboard Preview Image */}
        <div className="animate-up mt-24 relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10">
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent z-10" />
          <div className="w-full h-full bg-slate-900 flex flex-col">
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 p-8 flex gap-8">
              <div className="w-64 space-y-4 hidden md:block">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-white/5 w-full" />
                ))}
              </div>
              <div className="flex-1 space-y-6">
                <div className="flex gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 rounded-xl bg-white/5 flex-1 border border-white/5"
                    />
                  ))}
                </div>
                <div className="h-64 rounded-xl bg-white/5 w-full border border-white/5" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Social proof strip */}
      <section className="border-t border-white/5 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-slate-500 mb-8">
            Running the front desk for clinics like
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            {[
              "Sunrise Family Practice",
              "Meridian Health Group",
              "Cedar Grove Clinic",
              "Bright Smile Dental",
              "Riverside Medical",
            ].map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-slate-500/70 hover:text-slate-300 transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-24 border-t border-white/5 bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-slate-400">
              Built specifically for modern clinics that demand excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-indigo-400" />}
              title="Multi-Doctor Support"
              desc="Manage multiple doctors, staff, and departments under one single clinic account."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-cyan-400" />}
              title="Smart Appointments"
              desc="Effortlessly schedule, reschedule, and track patient appointments with calendar views."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-emerald-400" />}
              title="Secure & Isolated"
              desc="Enterprise-grade security ensuring your clinic's data is completely isolated."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-24 border-t border-white/5 bg-slate-900/40"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Live in an afternoon
            </h2>
            <p className="text-slate-400 text-lg">
              No implementation team, no lengthy onboarding calls. Most clinics
              are booking patients the same day they sign up.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-white/10" />
            <StepItem
              number="1"
              title="Set up your clinic"
              desc="Add your locations, departments, and services. Import existing patient records in minutes."
            />
            <StepItem
              number="2"
              title="Add your team"
              desc="Invite doctors and staff, assign roles, and set individual schedules and availability."
            />
            <StepItem
              number="3"
              title="Start scheduling"
              desc="Patients book online or through WhatsApp, and appointments land straight on your calendar."
            />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="py-20 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            <StatBlock value="500+" label="Clinics running on the platform" />
            <StatBlock value="2.1M" label="Appointments scheduled to date" />
            <StatBlock value="40%" label="Average drop in admin time" />
            <StatBlock value="99.9%" label="Uptime over the last 12 months" />
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 border-t border-white/5 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Quote className="w-10 h-10 text-indigo-400/60 mx-auto mb-8" />
          <p className="text-2xl md:text-3xl font-medium leading-snug text-slate-100 mb-10">
            We used to lose an hour every morning reconciling three different
            booking sheets. Now our front desk runs off one screen, and no-shows
            have dropped by a third.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-sm font-bold text-slate-950">
              PN
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Dr. Priya Nair</p>
              <p className="text-sm text-slate-400">
                Medical Director, Cedar Grove Clinic
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fits into how your clinic already works
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Reminders go out over WhatsApp and SMS, and appointments sync both
              ways with the third-party calendar your staff already use, so
              nothing gets double-booked.
            </p>
            <Link
              href="/integrations"
              className="inline-flex items-center gap-2 text-indigo-300 font-medium hover:text-indigo-200 transition-colors"
            >
              See all integrations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <IntegrationPill
              icon={<MessageCircle className="w-5 h-5 text-emerald-400" />}
              name="WhatsApp"
            />
            <IntegrationPill
              icon={<Calendar className="w-5 h-5 text-cyan-400" />}
              name="Calendar Sync"
            />
            <IntegrationPill
              icon={<Clock className="w-5 h-5 text-amber-400" />}
              name="SMS Reminders"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 border-t border-white/5 bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to modernize your front desk?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join clinics that switched from spreadsheets and phone tag to one
            dashboard for everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.4)]"
            >
              Start 30-Day Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-medium transition-all"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-10 mb-14">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  HealthcareCRM
                </span>
              </div>
              <p className="text-slate-400 max-w-xs leading-relaxed">
                The clinic management platform for practices that have outgrown
                spreadsheets.
              </p>
            </div>
            <FooterColumn
              title="Product"
              links={["Features", "Pricing", "Integrations", "Security"]}
            />
            <FooterColumn
              title="Company"
              links={["About", "Careers", "Blog", "Contact"]}
            />
            <FooterColumn
              title="Legal"
              links={["Privacy", "Terms", "HIPAA compliance"]}
            />
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <span>
              © {new Date().getFullYear()} Waywedesign. All rights reserved.
            </span>
            <span>Made for clinics that take patient care seriously.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepItem({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative">
      <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-lg font-bold text-indigo-300 mb-6 relative z-10">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-6 text-center first:pl-0 last:pr-0">
      <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 mb-2">
        {value}
      </p>
      <p className="text-sm text-slate-400 leading-snug">{label}</p>
    </div>
  );
}

function IntegrationPill({
  icon,
  name,
}: {
  icon: React.ReactNode;
  name: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/2 border border-white/5">
      {icon}
      <span className="text-sm font-medium text-slate-200">{name}</span>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-white mb-4">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link}>
            <Link
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
