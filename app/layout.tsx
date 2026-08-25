import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthStoreProvider } from "@/providers/AuthStoreProvider";
import { Toaster } from "react-hot-toast";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hospital Dashboard",
  description: "Hospital Sales Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <GoogleAnalytics />
      <body
        className={`${hankenGrotesk.variable} font-sans antialiased bg-[#F4F7FB]`}
      >
        <AuthStoreProvider>{children}</AuthStoreProvider>
        <Toaster
          position="top-center"
          gutter={10}
          toastOptions={{
            duration: 3500,

            // Base style (neutral)
            style: {
              background: "#ffffff",
              color: "#1f2937", // gray-800
              border: "1px solid #e5e7eb", // gray-200
              borderRadius: "14px",
              padding: "12px 14px",
              fontSize: "14px",
              fontWeight: 500,
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            },

            // ✅ Success style (soft medical green)
            success: {
              iconTheme: {
                primary: "#16a34a", // emerald-600
                secondary: "#ffffff",
              },
              style: {
                borderLeft: "4px solid #16a34a",
                background: "#f0fdf4", // emerald-50
                color: "#065f46", // emerald-900
              },
            },

            // ❌ Error style (soft clinical red)
            error: {
              iconTheme: {
                primary: "#dc2626", // red-600
                secondary: "#ffffff",
              },
              style: {
                borderLeft: "4px solid #dc2626",
                background: "#fef2f2", // red-50
                color: "#7f1d1d", // red-900
              },
            },

            // ℹ️ Loading style
            loading: {
              style: {
                borderLeft: "4px solid #0284c7", // sky-600
                background: "#f0f9ff", // sky-50
                color: "#075985",
              },
            },
          }}
        />
      </body>
    </html>
  );
}


