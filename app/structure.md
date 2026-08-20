/app
├── (public)
│ ├── page.tsx // Main website
│ └── book
│ ├── page.tsx // Booking request form
│ └── success/page.tsx // Thank you page
│
├── (auth)
│ ├── login/page.tsx
│ └── register/page.tsx // Admin creates staff/doctors
│
├── (dashboard)
│ ├── layout.tsx // Auth wrapper
│ │
│ ├── staff/ // MAIN WORKFLOW
│ │ ├── layout.tsx // Role check
│ │ ├── page.tsx // Pending bookings dashboard
│ │ │
│ │ ├── bookings/ // Booking management
│ │ │ ├── page.tsx // All bookings list
│ │ │ ├── pending/ // PENDING requests
│ │ │ │ ├── page.tsx // List pending bookings
│ │ │ │ └── [id]/ // Call & confirm patient
│ │ │ │ ├── page.tsx // Booking details + call
│ │ │ │ └── allocate/ // Slot allocation
│ │ │ │ └── page.tsx
│ │ │ └── confirmed/ // CONFIRMED bookings
│ │ │ └── page.tsx
│ │ │
│ │ ├── doctors/ // Doctor management
│ │ │ ├── page.tsx // Doctors list
│ │ │ └── [id]/
│ │ │ └── page.tsx // Doctor details + schedule
│ │ │
│ │ └── patients/ // Patient directory
│ │ ├── page.tsx
│ │ └── [id]/page.tsx
│ │
│ ├── doctor/ // DOCTOR PORTAL
│ │ ├── layout.tsx
│ │ ├── page.tsx // Today's appointments
│ │ ├── schedule/
│ │ │ └── page.tsx // Manage availability
│ │ └── appointments/
│ │ └── page.tsx // All appointments
│ │
│ └── admin/ // ADMIN PORTAL
│ ├── layout.tsx
│ ├── page.tsx
│ ├── users/
│ │ └── page.tsx // Create staff/doctors
│ └── departments/
│ └── page.tsx // Manage departments
│
├── api/
│ ├── bookings/
│ │ ├── route.ts // POST new booking request
│ │ ├── pending/route.ts // GET pending bookings
│ │ └── [id]/
│ │ ├── route.ts // PUT update booking
│ │ └── allocate/route.ts // POST allocate slot
│ │
│ ├── doctors/
│ │ ├── route.ts // GET all doctors
│ │ ├── by-department/route.ts // Filter doctors
│ │ └── [id]/
│ │ ├── route.ts // GET doctor details
│ │ └── schedule/route.ts // Manage doctor schedule
│ │
│ ├── slots/
│ │ ├── route.ts // GET available slots
│ │ └── [id]/route.ts // PUT block/unblock slot
│ │
│ ├── patients/route.ts // GET patients
│ └── departments/route.ts // GET departments
│
└── lib/
├── database.ts // DB connection
├── auth.ts // Authentication
└── sms.ts // SMS notifications
