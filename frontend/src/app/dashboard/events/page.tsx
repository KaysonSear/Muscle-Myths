'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function EventsPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/events');
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      } else {
        toast.error('获取赛事列表失败');
      }
    } catch (error) {
      toast.error('系统错误');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'finished': return '已结束';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'ongoing': return 'text-green-600 bg-green-50';
      case 'finished': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">赛事管理</h1>
          <p className="text-muted-foreground mt-1">查看并管理所有已发布的比赛</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button size="lg" className="rounded-none bg-secondary hover:bg-secondary/90">
            <Plus className="mr-2 h-4 w-4" />
            创建赛事
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">加载中...</div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">暂无赛事数据</div>
        ) : (
          events.map((event) => (
            <Link key={event._id} href={`/dashboard/events/${event._id}`} className="group">
              <div className="h-full border bg-white p-6 transition-all duration-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {format(new Date(event.date), 'yyyy.MM.dd')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {event.name}
                </h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-4 w-4" />
                    <span>{event.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <span className="text-sm font-bold flex items-center">
                    管理详情 <ArrowIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
