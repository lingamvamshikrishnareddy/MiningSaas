import { APP_NAME } from '@/lib/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          &copy; {year} {APP_NAME}. All rights reserved.
        </span>
        <span>Mining Operations Management Platform</span>
      </div>
    </footer>
  );
}
