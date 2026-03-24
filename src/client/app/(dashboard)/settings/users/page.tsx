'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  Shield,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import { formatDate, formatRelativeTime, formatEnumLabel } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
}

const ROLES = ['ADMIN', 'MANAGER', 'OPERATOR', 'INSPECTOR', 'VIEWER'];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-purple-100 text-purple-800',
  OPERATOR: 'bg-blue-100 text-blue-800',
  INSPECTOR: 'bg-yellow-100 text-yellow-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

export default function UsersSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [roleDialogUser, setRoleDialogUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => usersApi.getAll().then((r) => r.data?.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserFormData) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateDialogOpen(false);
      reset();
      setCreateError(null);
    },
    onError: (error: any) => {
      setCreateError(
        error?.response?.data?.error?.message ?? 'Failed to create user'
      );
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRoleDialogUser(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.setStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const filtered = (users as any[]).filter((u: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const onCreateSubmit = (data: CreateUserFormData) => {
    setCreateError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage team members, roles, and access
            </p>
          </div>
        </div>

        {/* Create User Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName', { required: 'Required' })}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName', { required: 'Required' })}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Role <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {formatEnumLabel(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Temporary Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {createError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    reset();
                    setCreateError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Change Role Dialog */}
      {roleDialogUser && (
        <Dialog
          open={!!roleDialogUser}
          onOpenChange={(open) => !open && setRoleDialogUser(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Role</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Changing role for{' '}
              <strong>
                {roleDialogUser.firstName} {roleDialogUser.lastName}
              </strong>
            </p>
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select
                value={selectedRole || roleDialogUser.role}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {formatEnumLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setRoleDialogUser(null)}>
                Cancel
              </Button>
              <Button
                disabled={updateRoleMutation.isPending}
                onClick={() => {
                  updateRoleMutation.mutate({
                    id: roleDialogUser.id,
                    role: selectedRole || roleDialogUser.role,
                  });
                }}
              >
                {updateRoleMutation.isPending ? 'Saving...' : 'Save Role'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members{' '}
            <span className="text-base font-normal text-muted-foreground">
              ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" text="Loading users..." />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Add team members to get started."
              action={{
                label: 'Add User',
                onClick: () => setCreateDialogOpen(true),
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 flex-shrink-0">
                            {(u.firstName?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {u.firstName} {u.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {formatEnumLabel(u.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.lastLoginAt
                          ? formatRelativeTime(u.lastLoginAt)
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRole(u.role);
                              setRoleDialogUser(u);
                            }}
                          >
                            <Shield className="h-3.5 w-3.5 mr-1" />
                            Role
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: u.id,
                                isActive: !u.isActive,
                              })
                            }
                            disabled={toggleStatusMutation.isPending}
                          >
                            {u.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
