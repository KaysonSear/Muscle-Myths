'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar, MapPin, Trophy, Users, Play, ListOrdered } from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API_URL}/events/${id}`);
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      toast.error('获取赛事详情失败');
    } finally {
      setLoading(false);
    }
  };

  const generateLineup = async () => {
    try {
      const res = await fetch(`${API_URL}/lineups/${id}/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('秩序表已生成！');
      } else {
        const data = await res.json();
        toast.error(data.message || '生成失败');
      }
    } catch (error) {
      toast.error('生成秩序表时出错');
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!event) return <div className="text-center py-12 text-destructive font-bold">赛事未找到</div>;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-black pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
              {event.status === 'upcoming' ? '即将开始' : event.status === 'ongoing' ? '进行中' : '已结束'}
            </span>
            <span className="text-sm font-mono text-muted-foreground">ID: {event._id.slice(-6)}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">{event.name}</h1>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link href={`/dashboard/registrations/new?eventId=${event._id}`}>
             <Button variant="outline" className="rounded-none border-black hover:bg-black hover:text-white">
               <Users className="mr-2 h-4 w-4" /> 添加报名
             </Button>
          </Link>
          <Button onClick={generateLineup} className="rounded-none bg-secondary hover:bg-secondary/90">
            生成秩序表
          </Button>
          <Link href={`/dashboard/events/${event._id}/lineup`}>
            <Button variant="outline" className="rounded-none border-black hover:bg-black hover:text-white">
              <ListOrdered className="mr-2 h-4 w-4" /> 编辑秩序表
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event._id}/scoring`}>
            <Button className="rounded-none bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-4 w-4" /> 开始计分
            </Button>
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="md:col-span-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <CardHeader className="border-b border-black/10">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" /> 基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">赛事类型</label>
                <p className="text-lg font-medium">{event.type}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">举办日期</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="text-lg font-medium">{format(new Date(event.date), 'yyyy年MM月dd日', { locale: zhCN })}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">举办地点</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <p className="text-lg font-medium">{event.location}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">报名费用</label>
                <p className="text-lg font-mono">
                  基础: ¥{event.base_fee} / 兼项: ¥{event.additional_fee}
                </p>
              </div>
            </div>
            
            {event.description && (
              <div className="pt-4 border-t border-dashed border-black/20">
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">赛事描述</label>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card (Placeholder) */}
        <Card className="border-2 border-black rounded-none">
          <CardHeader className="bg-muted/20 border-b border-black/10">
            <CardTitle>赛事统计</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">报名人数</span>
                <span className="text-3xl font-black">0</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">总人次</span>
                <span className="text-3xl font-black">0</span>
              </div>
              <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-0" />
              </div>
              <p className="text-xs text-muted-foreground text-center pt-2">暂无报名数据</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
