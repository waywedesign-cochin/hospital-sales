# 🏥 Multi-Tenant Organization Architecture Guide

This document provides a detailed breakdown of the Next.js App Router structure and the purpose of each page in the application.

## 🗂 Directory Structure

```text
/app
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
│       │   └── page.tsx        // 📊 Main Dashboard View. Shows Quick Overview (Daily/Weekly/Monthly stats), Enquiry Analytics (Line Chart), and Doctor Appointment Summaries.
│       │
│       ├── appointments/
│       │   ├── page.tsx        // 📅 Appointments List. Displays all scheduled, completed, and cancelled appointments with filtering by doctor, date, and status.
│       │   ├── create-appointment/
│       │   │   └── page.tsx    // Form to create a new appointment for an existing patient.
│       │   └── edit-appointment/
│       │       └── page.tsx    // Form to edit an existing appointment, reschedule time slots, or mark as No-Show.
│       │
│       ├── patients/
│       │   ├── page.tsx        // 👥 Patient Directory. Searchable list of all patients registered in the clinic.
│       │   └── [id]/
│       │       └── page.tsx    // Patient Profile. Detailed view of a patient including demographics, medical history, past appointments, and clinical notes.
│       │
│       ├── doctors/
│       │   ├── page.tsx        // 🩺 Doctors Directory. Manage clinic doctors, their specialties, and basic info.
│       │   └── [id]/
│       │       └── page.tsx    // Doctor Profile. Detailed view for a doctor to manage their schedule, time slots, and view their specific appointments.
│       │
│       ├── enquiries/
│       │   └── page.tsx        // 💬 CRM / Enquiries. Manage inbound leads and patient requests. Track status from "New" to "Contacted" to "Appointment Booked".
│       │
│       ├── activity-logs/
│       │   └── page.tsx        // 📜 Audit Trail. System logs displaying who performed what action (e.g., "Rahul updated appointment status"). Features server-side pagination and relational searching.
│       │
│       ├── settings/           
│       │   ├── page.tsx        // ⚙️ Clinic Settings. Manage general clinic info.
│       │   └── treatment-category/
│       │       └── page.tsx    // Manage dynamic departments/services offered by the clinic (e.g., Cardiology, Dental).
│       │
│       ├── users/
│       │   └── page.tsx        // 🔐 Staff Management. Admins can invite new staff members and assign roles (Doctor, Receptionist, Admin).
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
    └── sms.ts                  // Twilio SMS integration
```

## 🔄 Core Workflows

### 1. Patient Journey
1. Lead comes in via phone/website and is entered into **Enquiries** (`/enquiries`).
2. Staff contacts the lead and marks status as `CONTACTED`.
3. Patient agrees to a visit. Staff creates a profile in **Patients** (`/patients`) and books a slot in **Appointments** (`/appointments/create-appointment`).
4. Enquiry status is updated to `APPOINTMENT_BOOKED`.
5. Patient arrives, Doctor views their history in **Patient Profile** (`/patients/[id]`) and adds medical notes.
6. Appointment is marked as `COMPLETED`.

### 2. Multi-Tenant Organization Data Isolation
- Every database schema (`User`, `Patient`, `Appointment`, `Enquiry`, `ActivityLog`) is strictly bound to an `organizationId`.
- The `[slug]` in the URL is used to verify the user is accessing the correct clinic's dashboard. 
- API calls and Server Actions automatically enforce data isolation using the `requireAuth()` helper, which automatically injects the logged-in user's `organizationId` into database queries.
