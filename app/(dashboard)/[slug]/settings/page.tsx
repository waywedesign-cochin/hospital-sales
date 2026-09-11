"use client";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Settings2, ChevronRight, Tag, CreditCard, Plug } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const page = () => {
  const params = useParams();
  const slug = params.slug as string;
  const baseUrl = slug ? `/${slug}` : "";

  const settingsLinks = [
    {
      href: "/settings/treatment-category",
      icon: Tag,
      title: "Treatment Category",
      description: "Manage and organize treatment categories",
    },
    {
      href: `${baseUrl}/billing`,
      icon: CreditCard,
      title: "Billing & Plans",
      description: "Manage your subscription, invoices, and payment details",
    },
    {
      href: "/settings/integrations",
      icon: Plug,
      title: "Website Integrations",
      description: "Connect your website and manage API keys",
    },
  ];
  return (
    <div className="min-h-screen space-y-6 relative">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", current: true },
        ]}
      />

      {/* Header Section */}
      <div className="relative z-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4 p-6 rounded-2xl">
          <div className="bg-[#0D1117] p-4 rounded-xl">
            <Settings2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Settings
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Configure your clinic and workspace settings
            </p>
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsLinks.map(({ href, icon: Icon, title, description }) => (
          <Link href={href} key={href} className="block group">
            <Card className="p-6 h-full hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-emerald-300 bg-white rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 group-hover:bg-[#0D1117] p-3 rounded-xl transition-colors duration-300">
                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                      {title}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default page;
