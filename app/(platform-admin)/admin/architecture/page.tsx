import React from "react";
import { BookOpen, Map, Server, Workflow } from "lucide-react";

export default function ArchitectureGuidePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl bg-slate-900/50">
        <div className="absolute inset-0" />
        <div className="flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl border border-slate-800/50 relative z-10">
          <div className="bg-indigo-600/20 p-4 rounded-xl shadow-lg shadow-indigo-900/30 border border-indigo-500/30">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Platform Architecture Guide
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-2 max-w-2xl">
              A detailed breakdown of the Next.js App Router structure, page purposes, and core workflows for the Multi-Tenant Organization model.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Directory Structure */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl overflow-hidden min-w-0">
            <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
              <Map className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-slate-200">Directory Structure</h2>
            </div>
            <div className="p-6 min-w-0">
              <pre className="text-sm font-mono text-slate-300 bg-slate-950/80 p-6 rounded-xl border border-slate-800/50 leading-relaxed overflow-x-auto w-full max-w-full whitespace-pre-wrap sm:whitespace-pre">
{`/app
├── (auth)
│   └── login/
│       └── page.tsx            // Staff & Doctor login portal using credentials or Magic Link
│
├── admin-auth/
│   └── login/
│       └── page.tsx            // Platform Admin login portal 
│
├── platform-admin/             // 👑 PLATFORM ADMIN PORTAL
│   ├── layout.tsx              // Layout wrapper for platform admin
│   ├── page.tsx                // Platform overview (Total organizations, active users, revenue stats)
│   ├── organizations/
│   │   ├── page.tsx            // List of all registered clinic organizations
│   │   └── [id]/page.tsx       // Detailed view of a specific organization
│   └── users/
│       └── page.tsx            // List of platform-wide users
│
├── (dashboard)                 // 🏥 CLINIC / ORGANIZATION PORTAL
│   └── [slug]/                 // Dynamic route for the specific clinic (e.g., /apollo-hospital)
│       ├── layout.tsx          // Clinic layout with Sidebar and Header navigation
│       ├── loading.tsx         // Global loading skeleton for the dashboard
│       │
│       ├── dashboard/
│       │   └── page.tsx        // 📊 Main Dashboard View. Shows Quick Overview, Enquiry Analytics, and Appointments.
│       │
│       ├── appointments/
│       │   ├── page.tsx        // 📅 Appointments List. Displays scheduled, completed, and cancelled appointments.
│       │   ├── create-appointment/
│       │   │   └── page.tsx    // Form to create a new appointment for an existing patient.
│       │   └── edit-appointment/
│       │       └── page.tsx    // Form to edit an existing appointment, reschedule time slots, or mark as No-Show.
│       │
│       ├── patients/
│       │   ├── page.tsx        // 👥 Patient Directory. Searchable list of all patients registered in the clinic.
│       │   └── [id]/
│       │       └── page.tsx    // Patient Profile. Detailed view including demographics, medical history, past appointments.
│       │
│       ├── doctors/
│       │   ├── page.tsx        // 🩺 Doctors Directory. Manage clinic doctors, their specialties, and basic info.
│       │   └── [id]/
│       │       └── page.tsx    // Doctor Profile. Detailed view to manage their schedule, time slots, and specific appointments.
│       │
│       ├── enquiries/
│       │   └── page.tsx        // 💬 CRM / Enquiries. Manage inbound leads. Track status from "New" to "Contacted" to "Appointment Booked".
│       │
│       ├── activity-logs/
│       │   └── page.tsx        // 📜 Audit Trail. System logs displaying who performed what action.
│       │
│       ├── settings/           
│       │   ├── page.tsx        // ⚙️ Clinic Settings. Manage general clinic info.
│       │   └── treatment-category/
│       │       └── page.tsx    // Manage dynamic departments/services offered by the clinic (e.g., Cardiology, Dental).
│       │
│       ├── users/
│       │   └── page.tsx        // 🔐 Staff Management. Admins can invite new staff members and assign roles.
│       │
│       └── profile/
│           └── page.tsx        // Personal settings for the currently logged-in user.
│
├── api/                        // 🔌 API ROUTES
│   ├── auth/[...nextauth]/     // NextAuth.js configuration
│   └── ...                     // Other API endpoints
│
└── lib/
    ├── database.ts             // MongoDB connection utilities
    ├── auth.ts                 // Auth helper functions (requireAuth, getCurrentUser)
    └── sms.ts                  // Twilio SMS integration`}
              </pre>
            </div>
          </div>
        </div>

        {/* Workflows & Isolation */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
              <Workflow className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-slate-200">Core Workflows</h2>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Patient Journey</h3>
              <ol className="list-decimal list-inside space-y-3 text-slate-400 text-sm">
                <li><span className="text-slate-300 font-medium">Lead generation:</span> Comes in via phone/website and is entered into <strong className="text-indigo-300">Enquiries</strong> (<code className="text-xs bg-slate-800 px-1 py-0.5 rounded">/enquiries</code>).</li>
                <li><span className="text-slate-300 font-medium">Follow-up:</span> Staff contacts the lead and marks status as <code className="text-xs text-yellow-400">CONTACTED</code>.</li>
                <li><span className="text-slate-300 font-medium">Conversion:</span> Patient agrees to a visit. Staff creates a profile in <strong className="text-indigo-300">Patients</strong> and books a slot in <strong className="text-indigo-300">Appointments</strong>.</li>
                <li><span className="text-slate-300 font-medium">Status Update:</span> Enquiry status is updated to <code className="text-xs text-green-400">APPOINTMENT_BOOKED</code>.</li>
                <li><span className="text-slate-300 font-medium">Consultation:</span> Patient arrives, Doctor views their history in <strong className="text-indigo-300">Patient Profile</strong> and adds medical notes.</li>
                <li><span className="text-slate-300 font-medium">Completion:</span> Appointment is marked as <code className="text-xs text-blue-400">COMPLETED</code>.</li>
              </ol>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
              <Server className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-slate-200">Data Isolation</h2>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-400 leading-relaxed">
              <p>
                Every database schema (<code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-emerald-300">User</code>, <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-emerald-300">Patient</code>, <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-emerald-300">Appointment</code>, <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-emerald-300">Enquiry</code>, <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-emerald-300">ActivityLog</code>) is strictly bound to an <strong className="text-emerald-400">organizationId</strong>.
              </p>
              <p>
                The <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-slate-300">[slug]</code> in the URL is used to verify the user is accessing the correct clinic's dashboard.
              </p>
              <p>
                API calls and Server Actions automatically enforce data isolation using the <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-indigo-300">requireAuth()</code> helper, which automatically injects the logged-in user's <strong className="text-emerald-400">organizationId</strong> into database queries.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
