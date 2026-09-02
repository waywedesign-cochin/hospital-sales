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

      {/* Master Guide Info - Adapted to dark theme */}
      <div className="space-y-6">
        
        {/* Part 1 */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-4 mb-6">🏗 Part 1: What is this project and how is it built?</h2>
          <p className="mb-4 text-slate-400">Think of this project like a massive apartment building (The SaaS Platform) where every clinic gets their own private, locked apartment.</p>
          
          <h3 className="text-lg font-semibold text-slate-300 mb-3">The Core Technologies (The Tools We Used)</h3>
          <ul className="space-y-3 list-disc pl-5 text-slate-400">
            <li><strong className="text-indigo-300">Next.js (The Engine):</strong> This is the main framework that runs the website. It handles both the frontend (what you see) and the backend (the hidden logic and APIs).</li>
            <li><strong className="text-indigo-300">MongoDB & Mongoose (The Filing Cabinet):</strong> This is where we save all the data (users, patients, appointments). Mongoose is just a tool that helps Next.js talk to MongoDB easily.</li>
            <li><strong className="text-indigo-300">Tailwind CSS & Shadcn (The Paint & Furniture):</strong> Tailwind lets us style the website quickly by adding classes to HTML. Shadcn gives us beautiful, ready-made buttons, dropdowns, and tables.</li>
            <li><strong className="text-indigo-300">Zustand (The Brain&apos;s Memory):</strong> When a user logs in, we need the website to <em>remember</em> who they are without asking the database every single time they click a button. Zustand holds this information in the browser&apos;s memory.</li>
            <li><strong className="text-indigo-300">JWT - JSON Web Tokens (The VIP Pass):</strong> When someone logs in, they get a secret digital badge (a JWT cookie). Every time they try to view a page or save data, the system checks this badge to make sure they are allowed.</li>
          </ul>
        </div>

        {/* Part 2 */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-4 mb-6">🔒 Part 2: How Do We Keep Clinics Separate? (Multi-Tenancy)</h2>
          <p className="mb-4 text-slate-400">Since this is a platform where hundreds of different clinics will sign up, the biggest challenge is making sure <strong className="text-slate-200">Clinic A never sees Clinic B&apos;s data</strong>.</p>
          <p className="mb-4 text-slate-400">We don&apos;t create a new database for every clinic. Instead, we use one big database and put a special label on every single piece of data.</p>
          
          <h3 className="text-lg font-semibold text-slate-300 mb-3">The Secret Ingredient: <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 text-sm">organizationId</code></h3>
          <ol className="space-y-3 list-decimal pl-5 text-slate-400">
            <li>When a new clinic registers, the database creates a master record for them called the <strong className="text-slate-300">Clinic Model</strong>. It gives them a unique ID (e.g., <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">12345</code>).</li>
            <li>When that clinic adds a new Patient, the system doesn&apos;t just save the patient&apos;s name. It saves the patient&apos;s name AND adds <code className="bg-slate-800 px-1 py-0.5 rounded text-sm text-emerald-400">organizationId: 12345</code> to the patient&apos;s file.</li>
            <li>When they add an Appointment, it also saves <code className="bg-slate-800 px-1 py-0.5 rounded text-sm text-emerald-400">organizationId: 12345</code>.</li>
            <li><strong className="text-slate-300">The Security Check:</strong> Whenever the clinic asks to see their patients, our backend system says, <em className="text-slate-300">&quot;Only give me patients who have the label <code className="bg-slate-800 not-italic px-1 py-0.5 rounded text-sm">organizationId: 12345</code>.&quot;</em> Because of this, it is physically impossible for Clinic A to see Clinic B&apos;s patients.</li>
          </ol>
        </div>

        {/* Part 3 */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-4 mb-6">🚦 Part 3: The Security Guard (<code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 text-lg">withAuth</code>)</h2>
          <p className="mb-4 text-slate-400">If you look in the code, you will see a file called <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">withAuth.ts</code>. This is the security guard of our backend.</p>
          <p className="mb-4 text-slate-400">Normally, if someone tries to run a backend command (like deleting a patient), we would have to write 20 lines of code checking if they are logged in, checking if they are an admin, and checking their <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">organizationId</code>.</p>
          <p className="mb-4 text-slate-400">Instead, we wrapped all our backend commands in <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">withAuth</code>. When the frontend asks the backend to do something, <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">withAuth</code> intercepts the request and does this:</p>
          <ul className="space-y-3 list-disc pl-5 text-slate-400">
            <li className="italic">&quot;Show me your VIP badge (JWT cookie).&quot;</li>
            <li className="italic">&quot;Are you an ADMIN or just STAFF? Are you allowed to do this?&quot;</li>
            <li className="italic">&quot;Okay, you are verified. Your <code className="bg-slate-800 not-italic px-1 py-0.5 rounded text-sm">organizationId</code> is 12345. I will now pass this <code className="bg-slate-800 not-italic px-1 py-0.5 rounded text-sm">organizationId</code> to the database so you can only edit your own stuff.&quot;</li>
          </ul>
        </div>

        {/* Part 4 */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-4 mb-6">🔄 Part 4: Step-by-Step Workflows</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Flow 1: A New Clinic Signs Up (Onboarding)</h3>
              <ol className="space-y-2 list-decimal pl-5 text-slate-400">
                <li>A doctor visits your main public website.</li>
                <li>They click &quot;Get Started&quot; and see the 3-step onboarding form.</li>
                <li>They type in their Clinic Name, choose their specific Departments, and create an Admin account with their email and password.</li>
                <li>When they click Submit, the frontend sends this data to <code className="bg-slate-800 px-1 py-0.5 rounded text-sm text-emerald-400">POST /api/auth/register-clinic</code>.</li>
                <li>The backend saves the Clinic data, saves the Admin User data, creates the VIP badge (JWT), and puts it in the user&apos;s browser.</li>
                <li>The user is instantly redirected to the dashboard.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Flow 2: The Dashboard Loads (Dynamic Departments)</h3>
              <ol className="space-y-2 list-decimal pl-5 text-slate-400">
                <li>When the user reaches the dashboard, the website&apos;s top navigation bar (<code className="bg-slate-800 px-1 py-0.5 rounded text-sm">Header.tsx</code>) wakes up.</li>
                <li>The Header silently whispers to the backend: <em className="text-slate-300">&quot;Hey, who is logged in right now?&quot;</em></li>
                <li>The backend looks at the user&apos;s VIP badge, finds their clinic, and replies with their specific departments.</li>
                <li>Zustand (The Memory) saves this information.</li>
                <li>Now, whenever the user opens a form, the dropdown menus automatically look at Zustand&apos;s memory and display their specific departments.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Flow 3: Inviting a Staff Member</h3>
              <ol className="space-y-2 list-decimal pl-5 text-slate-400">
                <li>The Clinic Admin goes to the <strong className="text-slate-300">Users</strong> page and clicks <strong className="text-slate-300">Invite Staff</strong>.</li>
                <li>The frontend sends the details to <code className="bg-slate-800 px-1 py-0.5 rounded text-sm text-emerald-400">POST /api/auth/invite</code>.</li>
                <li>The backend verifies the Admin, and creates a new User file for the Receptionist with a scrambled password and an <strong className="text-slate-300">Invite Token</strong>.</li>
                <li>The backend generates a special link: <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">https://your-website.com/setup-password?token=ABCDEFG</code>.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Flow 4: The Staff Member Joins</h3>
              <ol className="space-y-2 list-decimal pl-5 text-slate-400">
                <li>The Receptionist clicks the link and goes to the <code className="bg-slate-800 px-1 py-0.5 rounded text-sm">/setup-password</code> page.</li>
                <li>The Receptionist types in their desired password and clicks Submit.</li>
                <li>The backend searches the database for the invite token, saves the new password securely, and deletes the token.</li>
                <li>It gives the Receptionist their own VIP badge (JWT) and drops them right into their Clinic&apos;s dashboard.</li>
              </ol>
            </div>
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
