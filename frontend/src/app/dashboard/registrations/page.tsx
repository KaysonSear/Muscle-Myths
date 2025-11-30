'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Event {
  _id: string;
  name: string;
}

interface Registration {
  _id: string;
  event_id: {
    _id: string;
    name: string;
    date: string;
  };
  athlete_id: {
    _id: string;
    name: string;
    bib_number: string;
    gender: string;
  };
  categories: {
    level1: string;
    level2: string;
    level3: string;
    display_name: string;
    is_primary: boolean;
  }[];
  total_fee: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export default function RegistrationsPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEventId, token]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      toast.error('加载赛事列表失败');
    }
  };

  const fetchRegistrations = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const url = selectedEventId === 'all' 
        ? 'http://localhost:4000/api/registrations'
        : `http://localhost:4000/api/registrations?event_id=${selectedEventId}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRegistrations(data);
    } catch (error) {
      toast.error('加载报名列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setRegistrationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!registrationToDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/api/registrations/${registrationToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('报名已删除');
        setRegistrations(prev => prev.filter(r => r._id !== registrationToDelete));
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除出错');
    } finally {
      setDeleteDialogOpen(false);
      setRegistrationToDelete(null);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">已支付</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">已退款</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">待支付</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase">报名管理</h1>
        <Link href="/dashboard/registrations/new">
          <Button className="rounded-none bg-black text-white hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" /> 新增报名
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-[300px] rounded-none border-black">
            <SelectValue placeholder="筛选赛事" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部赛事</SelectItem>
            {events.map(e => (
              <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black bg-gray-50">
              <TableHead className="font-bold">选手</TableHead>
              <TableHead className="font-bold">赛事</TableHead>
              <TableHead className="font-bold">报名组别</TableHead>
              <TableHead className="font-bold text-right">费用</TableHead>
              <TableHead className="font-bold">支付状态</TableHead>
              <TableHead className="font-bold">报名时间</TableHead>
              <TableHead className="font-bold text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">加载中...</TableCell>
              </TableRow>
            ) : registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">暂无报名记录</TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{reg.athlete_id?.name || '-'}</div>
                    <div className="text-xs text-gray-500">{reg.athlete_id?.bib_number || '-'}</div>
                  </TableCell>
                  <TableCell>{reg.event_id?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {reg.categories.map((cat, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2 py-1 text-xs rounded ${
                            cat.is_primary 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {cat.display_name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">¥{reg.total_fee}</TableCell>
                  <TableCell>{getPaymentStatusBadge(reg.payment_status)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(reg.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Link href={`/dashboard/registrations/${reg._id}`}>
                        <Button variant="outline" size="sm" className="rounded-none border-black">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-none border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteClick(reg._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        共 {registrations.length} 条报名记录
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-none border-2 border-black">
          <DialogHeader>
            <DialogTitle className="font-bold">确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这条报名记录吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-none border-black"
            >
              取消
            </Button>
            <Button 
              onClick={confirmDelete}
              className="rounded-none bg-red-500 hover:bg-red-600"
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

