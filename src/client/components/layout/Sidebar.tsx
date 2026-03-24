'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Wrench,
  Activity,
  Fuel,
  BarChart3,
  ClipboardCheck,
  ShieldAlert,
  TrendingUp,
  MapPin,
  Settings,
  HardHat,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.DASHBOARD },
  { label: 'Equipment', icon: Truck, href: ROUTES.EQUIPMENT },
  { label: 'Maintenance', icon: Wrench, href: ROUTES.MAINTENANCE },
  { label: 'Telemetry', icon: Activity, href: ROUTES.TELEMETRY },
  { label: 'Fuel', icon: Fuel, href: ROUTES.FUEL },
  { label: 'Production', icon: BarChart3, href: ROUTES.PRODUCTION },
  { label: 'Inspections', icon: ClipboardCheck, href: ROUTES.INSPECTIONS },
  { label: 'Safety', icon: ShieldAlert, href: ROUTES.SAFETY },
  { label: 'Analytics', icon: TrendingUp, href: ROUTES.ANALYTICS },
  { label: 'Sites', icon: MapPin, href: ROUTES.SITES },
  { label: 'Settings', icon: Settings, href: ROUTES.SETTINGS },
  { label: 'Billing', icon: CreditCard, href: ROUTES.BILLING },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out shrink-0 shadow-xl',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 shrink-0 border-b border-slate-700/50',
          sidebarOpen ? 'justify-between' : 'justify-center'
        )}
      >
        {sidebarOpen && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide truncate">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase">
                Operations
              </span>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <HardHat className="w-5 h-5 text-white" />
          </div>
        )}
        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all duration-200"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive =
            href === ROUTES.DASHBOARD
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
                !sidebarOpen && 'justify-center px-0'
              )}
              title={!sidebarOpen ? label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
              )}
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-slate-800/50 group-hover:bg-slate-700/60'
              )}>
                <Icon className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                )} />
              </div>
              {sidebarOpen && (
                <span className="truncate">{label}</span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (when collapsed) */}
      {!sidebarOpen && (
        <div className="border-t border-slate-700/50 p-3 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all duration-200"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User info */}
      {sidebarOpen && user && (
        <div className="border-t border-slate-700/50 p-4 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-semibold shrink-0 shadow-lg shadow-blue-500/20">
              {user.firstName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName
                  ? `${user.firstName} ${user.lastName ?? ''}`.trim()
                  : user.email}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {user.role?.toLowerCase().replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version info */}
      {sidebarOpen && (
        <div className="px-4 pb-4">
          <p className="text-[10px] text-slate-500 text-center">
            v1.0.0 • Mining OPS
          </p>
        </div>
      )}
    </aside>
  );
}
