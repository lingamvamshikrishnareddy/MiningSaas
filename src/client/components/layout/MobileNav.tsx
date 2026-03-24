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
  X,
  HardHat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { useUIStore } from '@/stores/uiStore';

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
];

export default function MobileNav() {
  const pathname = usePathname();
  const { mobileSidebarOpen, toggleMobileSidebar } = useUIStore();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300',
          mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleMobileSidebar}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col md:hidden',
          'transform transition-transform duration-300 ease-in-out',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <HardHat className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-sm tracking-wide">{APP_NAME}</span>
          </div>
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
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
                onClick={toggleMobileSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
