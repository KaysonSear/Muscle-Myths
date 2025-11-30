'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, FileText, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const quickActions = [
    {
      title: '添加选手',
      description: '录入新的参赛选手信息',
      icon: Users,
      href: '/dashboard/athletes/new',
      color: 'text-primary',
    },
    {
      title: '创建赛事',
      description: '发布新的健美比赛',
      icon: Trophy,
      href: '/dashboard/events/new',
      color: 'text-secondary', // Using brand blue
    },
    {
      title: '赛事报名',
      description: '为选手报名参加比赛',
      icon: FileText,
      href: '/dashboard/registrations/new', // Need to check if this path exists or link to event list
      color: 'text-black',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
          你好, {user.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          欢迎回到肌肉神话赛事管理系统。请选择下方操作开始管理您的赛事数据。
        </p>
      </section>

      {/* Quick Actions Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-black transition-all duration-300 h-full bg-accent hover:bg-white">
              <CardHeader className="pb-4">
                <div className={`mb-4 p-3 w-fit rounded-none bg-white border border-black/5 ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{action.description}</p>
                <div className="flex items-center text-sm font-medium group-hover:underline decoration-2 underline-offset-4">
                  立即开始 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Recent Activity / Stats Placeholder */}
      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-none bg-muted/50 p-6">
          <h3 className="text-lg font-bold mb-2">系统状态</h3>
          <p className="text-sm text-muted-foreground">所有服务运行正常</p>
        </Card>
        <Card className="border-none shadow-none bg-muted/50 p-6">
          <h3 className="text-lg font-bold mb-2">数据概览</h3>
          <p className="text-sm text-muted-foreground">暂无最新数据统计</p>
        </Card>
      </section>
    </div>
  );
}
