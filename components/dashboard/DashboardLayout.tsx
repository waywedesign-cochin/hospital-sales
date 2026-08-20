"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
  navigation: {
    name: string;
    href: string;
    icon: ReactNode;
  }[];
}

export function DashboardLayout({
  children,
  user,
  navigation,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500">Welcome back,</p>
            <p className="font-semibold text-slate-900">{user.name}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl">
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all group"
                  >
                    <span className="text-slate-500 group-hover:text-amber-600 transition-colors">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              <div className="pt-6 border-t border-slate-200">
                <form>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-xl">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-bold text-slate-900">Drisya Dermatology</h1>
                <p className="text-xs text-slate-500">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* User Info Card */}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </p>
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all group relative"
              >
                <span className="text-slate-500 group-hover:text-amber-600 transition-colors">
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
                <div className="absolute inset-y-0 left-0 w-1 bg-amber-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate text-sm">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200/50">
            <form>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium group"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:pl-72 flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Content wrapper with subtle card effect */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
