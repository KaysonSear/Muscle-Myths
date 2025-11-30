'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { LogOut, User, LayoutDashboard, Users, Trophy } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { href: '/dashboard/athletes', label: '选手管理', icon: Users },
    { href: '/dashboard/events', label: '赛事管理', icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tighter text-primary">
                MUSCLE MYTHS
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                        isActive ? 'text-primary border-b-2 border-primary pb-1 mt-1' : 'text-muted-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                logout();
                router.push('/login');
              }}
              title="退出登录"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-8">
        {/* Swiss Grid Layout Effect (optional background grid or just structure) */}
        <div className="grid grid-cols-1 gap-8">
          {children}
        </div>
      </main>

      {/* Optional Footer for Swiss completeness */}
      <footer className="border-t py-6 md:py-0">
        <div className="container max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-8">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            &copy; 2025 Muscle Myths Competition Management
          </p>
        </div>
      </footer>
    </div>
  );
}
