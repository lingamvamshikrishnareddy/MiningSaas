import { APP_NAME } from '@/lib/constants';
import { HardHat } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFYwaDQydjQySDE4QzI3Ljk0IDQyIDM2IDMzLjk0IDM2IDI0VjE4eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=')] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / App name header */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/50">
            <HardHat className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {APP_NAME}
            </h1>
            <p className="text-sm text-blue-300 mt-1">
              Mining Operations Management
            </p>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-8">
          {children}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-blue-400/70 mt-6">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
