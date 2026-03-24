'use client';

import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  Users,
  ArrowRight,
  Settings,
  Shield,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SETTINGS_SECTIONS = [
  {
    title: 'Profile',
    description: 'Update your personal information and change your password',
    icon: User,
    href: '/settings/profile',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Organization',
    description: 'Manage your organization details and contact information',
    icon: Building2,
    href: '/settings/organization',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Users',
    description: 'Invite and manage team members, roles, and permissions',
    icon: Users,
    href: '/settings/users',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Billing',
    description: 'Manage your subscription plan, invoices, and payment details',
    icon: CreditCard,
    href: '/settings/billing',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-gray-100 p-2">
          <Settings className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, organization, and team settings
          </p>
        </div>
      </div>

      {/* Current User Info */}
      {user && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">
                {(user.firstName?.[0] ?? user.name?.[0] ?? 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.name ?? 'User'}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Role: {user.role ?? 'Member'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => router.push('/settings/profile')}
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Categories */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Settings Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SETTINGS_SECTIONS.map((section) => (
            <Card
              key={section.title}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(section.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`rounded-full p-2 ${section.bg}`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="mt-3">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(section.href);
                  }}
                >
                  Manage {section.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" />
            Security &amp; Privacy
          </CardTitle>
          <CardDescription>
            Account security and data privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Change Password</p>
                <p className="text-xs text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/settings/profile')}
              >
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
