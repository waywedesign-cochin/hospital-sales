import Breadcrumb from "@/components/shared/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Settings2, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", current: true },
        ]}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-linear-to-br from-white to-slate-50 p-6 rounded-3xl shadow-sm border border-slate-100/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="bg-linear-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Settings2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-md sm:text-2xl font-bold text-slate-800 tracking-tight">
              Settings
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Configure treatment settings
            </p>
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <Link href={"/settings/treatment-category"} className="block group">
        <Card className="p-6 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 border border-slate-100 hover:border-indigo-200 bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-md sm:text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                Treatment Category
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage and organize treatment categories
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default page;