'use client';

import { usePathname } from 'next/navigation';
import { Bell, Menu, LogOut, User, Settings, ChevronDown, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/equipment': 'Equipment',
  '/maintenance': 'Maintenance',
  '/telemetry': 'Telemetry',
  '/fuel': 'Fuel Management',
  '/production': 'Production',
  '/inspections': 'Inspections',
  '/safety': 'Safety',
  '/analytics': 'Analytics',
  '/sites': 'Sites',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for nested routes
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => key !== '/dashboard' && pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : 'Mining OPS';
}

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggleMobileSidebar } = useUIStore();
  const { unreadCount } = useNotificationStore();

  const pageTitle = getPageTitle(pathname);

  const userInitial = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const userDisplayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email ?? '';

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-xl border-b border-border/50 shrink-0 z-10">
      {/* Left: mobile menu toggle + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-amber-50 border border-amber-100">
            <HardHat className="w-4 h-4 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: notifications + user menu */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-slate-100 transition-all duration-200" 
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center px-1 text-[10px] font-bold rounded-full pointer-events-none shadow-sm"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="flex items-center justify-between py-2">
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  {unreadCount} unread
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.DASHBOARD} className="cursor-pointer justify-center text-sm text-muted-foreground py-3">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-slate-100 transition-all duration-200 rounded-xl"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-md shadow-blue-500/20">
                {userInitial}
              </div>
              <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate text-slate-700">
                {userDisplayName}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5 py-1">
                <span className="font-semibold text-sm">{userDisplayName}</span>
                {user?.email && (
                  <span className="text-xs text-muted-foreground font-normal truncate">
                    {user.email}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.SETTINGS + '/profile'} className="cursor-pointer flex items-center gap-2 py-2 rounded-lg">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.SETTINGS} className="cursor-pointer flex items-center gap-2 py-2 rounded-lg">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer flex items-center gap-2 py-2 rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
