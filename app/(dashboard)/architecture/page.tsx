import React from "react";
import { BookOpen } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Healthcare CRM SaaS: Master Guide</h1>
          <p className="text-slate-500 mt-1">Complete system architecture and internal workflow documentation.</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600 prose-hr:border-slate-200">
        
        <p className="text-lg text-slate-600">
          This document explains exactly how this entire project is built, how it works behind the scenes, and how all the different pieces talk to each other. Nothing is left out.
        </p>

        {/* Part 1 */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">🏗 Part 1: What is this project and how is it built?</h2>
          <p className="mb-4">Think of this project like a massive apartment building (The SaaS Platform) where every clinic gets their own private, locked apartment.</p>
          
          <h3 className="text-lg font-semibold text-slate-800 mb-3">The Core Technologies (The Tools We Used)</h3>
          <ul className="space-y-3 list-disc pl-5">
            <li><strong>Next.js (The Engine):</strong> This is the main framework that runs the website. It handles both the frontend (what you see) and the backend (the hidden logic and APIs).</li>
            <li><strong>MongoDB & Mongoose (The Filing Cabinet):</strong> This is where we save all the data (users, patients, appointments). Mongoose is just a tool that helps Next.js talk to MongoDB easily.</li>
            <li><strong>Tailwind CSS & Shadcn (The Paint & Furniture):</strong> Tailwind lets us style the website quickly by adding classes to HTML. Shadcn gives us beautiful, ready-made buttons, dropdowns, and tables.</li>
            <li><strong>Zustand (The Brain&apos;s Memory):</strong> When a user logs in, we need the website to <em>remember</em> who they are without asking the database every single time they click a button. Zustand holds this information in the browser&apos;s memory.</li>
            <li><strong>JWT - JSON Web Tokens (The VIP Pass):</strong> When someone logs in, they get a secret digital badge (a JWT cookie). Every time they try to view a page or save data, the system checks this badge to make sure they are allowed.</li>
          </ul>
        </section>

        {/* Part 2 */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">🔒 Part 2: How Do We Keep Clinics Separate? (Multi-Tenancy)</h2>
          <p className="mb-4">Since this is a platform where hundreds of different clinics will sign up, the biggest challenge is making sure <strong>Clinic A never sees Clinic B&apos;s data</strong>.</p>
          <p className="mb-4">We don&apos;t create a new database for every clinic. Instead, we use one big database and put a special label on every single piece of data.</p>
          
          <h3 className="text-lg font-semibold text-slate-800 mb-3">The Secret Ingredient: <code>clinicId</code></h3>
          <ol className="space-y-3 list-decimal pl-5">
            <li>When a new clinic registers, the database creates a master record for them called the <strong>Clinic Model</strong>. It gives them a unique ID (e.g., <code>12345</code>).</li>
            <li>When that clinic adds a new Patient, the system doesn&apos;t just save the patient&apos;s name. It saves the patient&apos;s name AND adds <code>clinicId: 12345</code> to the patient&apos;s file.</li>
            <li>When they add an Appointment, it also saves <code>clinicId: 12345</code>.</li>
            <li><strong>The Security Check:</strong> Whenever the clinic asks to see their patients, our backend system says, <em>&quot;Only give me patients who have the label <code>clinicId: 12345</code>.&quot;</em> Because of this, it is physically impossible for Clinic A to see Clinic B&apos;s patients.</li>
          </ol>
        </section>

        {/* Part 3 */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">🚦 Part 3: The Security Guard (<code>withAuth</code>)</h2>
          <p className="mb-4">If you look in the code, you will see a file called <code>withAuth.ts</code>. This is the security guard of our backend.</p>
          <p className="mb-4">Normally, if someone tries to run a backend command (like deleting a patient), we would have to write 20 lines of code checking if they are logged in, checking if they are an admin, and checking their <code>clinicId</code>.</p>
          <p className="mb-4">Instead, we wrapped all our backend commands in <code>withAuth</code>. When the frontend asks the backend to do something, <code>withAuth</code> intercepts the request and does this:</p>
          <ul className="space-y-3 list-disc pl-5">
            <li><em>&quot;Show me your VIP badge (JWT cookie).&quot;</em></li>
            <li><em>&quot;Are you an ADMIN or just STAFF? Are you allowed to do this?&quot;</em></li>
            <li><em>&quot;Okay, you are verified. Your <code>clinicId</code> is 12345. I will now pass this <code>clinicId</code> to the database so you can only edit your own stuff.&quot;</em></li>
          </ul>
        </section>

        {/* Part 4 */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">🔄 Part 4: Step-by-Step Workflows</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Flow 1: A New Clinic Signs Up (Onboarding)</h3>
              <ol className="space-y-2 list-decimal pl-5">
                <li>A doctor visits your main public website.</li>
                <li>They click &quot;Get Started&quot; and see the 3-step onboarding form.</li>
                <li>They type in their Clinic Name, choose their specific Departments, and create an Admin account with their email and password.</li>
                <li>When they click Submit, the frontend sends this data to <code>POST /api/auth/register-clinic</code>.</li>
                <li>The backend saves the Clinic data, saves the Admin User data, creates the VIP badge (JWT), and puts it in the user&apos;s browser.</li>
                <li>The user is instantly redirected to the dashboard.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Flow 2: The Dashboard Loads (Dynamic Departments)</h3>
              <ol className="space-y-2 list-decimal pl-5">
                <li>When the user reaches the dashboard, the website&apos;s top navigation bar (<code>Header.tsx</code>) wakes up.</li>
                <li>The Header silently whispers to the backend: <em>&quot;Hey, who is logged in right now?&quot;</em></li>
                <li>The backend looks at the user&apos;s VIP badge, finds their clinic, and replies with their specific departments.</li>
                <li>Zustand (The Memory) saves this information.</li>
                <li>Now, whenever the user opens a form, the dropdown menus automatically look at Zustand&apos;s memory and display their specific departments.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Flow 3: Inviting a Staff Member</h3>
              <ol className="space-y-2 list-decimal pl-5">
                <li>The Clinic Admin goes to the <strong>Users</strong> page and clicks <strong>Invite Staff</strong>.</li>
                <li>The frontend sends the details to <code>POST /api/auth/invite</code>.</li>
                <li>The backend verifies the Admin, and creates a new User file for the Receptionist with a scrambled password and an <strong>Invite Token</strong>.</li>
                <li>The backend generates a special link: <code>https://your-website.com/setup-password?token=ABCDEFG</code>.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Flow 4: The Staff Member Joins</h3>
              <ol className="space-y-2 list-decimal pl-5">
                <li>The Receptionist clicks the link and goes to the <code>/setup-password</code> page.</li>
                <li>The Receptionist types in their desired password and clicks Submit.</li>
                <li>The backend searches the database for the invite token, saves the new password securely, and deletes the token.</li>
                <li>It gives the Receptionist their own VIP badge (JWT) and drops them right into their Clinic&apos;s dashboard.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Part 5 */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 border-b pb-4 mb-6">📁 Part 5: Folder Structure Breakdown</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li><code>app/api/...</code>: Contains ALL the backend API code.</li>
            <li><code>app/models/...</code>: Contains the blueprints (Schemas) for the database.</li>
            <li><code>app/(dashboard)/...</code>: Contains all the secure pages you see when logged in.</li>
            <li><code>components/dashboard/...</code>: Holds specific visual pieces like forms, tables, and charts.</li>
            <li><code>components/ui/...</code>: Holds generic Shadcn components (buttons, inputs, etc).</li>
            <li><code>stores/authStore.ts</code>: The Zustand memory file that remembers the logged-in user.</li>
            <li><code>middlewares/withAuth.ts</code>: The security guard wrapper function.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
