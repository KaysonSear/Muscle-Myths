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
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AthletesPage() {
  const { token } = useAuthStore();
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/athletes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAthletes(data);
      } else {
        toast.error('获取选手列表失败');
      }
    } catch (error) {
      toast.error('系统错误');
    } finally {
      setLoading(false);
    }
  };

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.bib_number.includes(search) ||
    a.phone.includes(search)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">选手管理</h1>
          <p className="text-muted-foreground mt-1">管理所有注册参赛选手信息</p>
        </div>
        <Link href="/dashboard/athletes/new">
          <Button size="lg" className="rounded-none">
            <Plus className="mr-2 h-4 w-4" />
            添加选手
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 bg-white border border-input px-3 py-2 max-w-md focus-within:ring-1 focus-within:ring-ring">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input 
          className="flex-1 border-none bg-transparent p-0 text-sm placeholder:text-muted-foreground focus:outline-none"
          placeholder="搜索姓名、号码牌或手机号..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-none bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-bold text-black">号码牌</TableHead>
              <TableHead className="font-bold text-black">姓名</TableHead>
              <TableHead className="font-bold text-black">性别</TableHead>
              <TableHead className="font-bold text-black">手机号</TableHead>
              <TableHead className="font-bold text-black">国籍</TableHead>
              <TableHead className="font-bold text-black text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredAthletes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  暂无选手数据
                </TableCell>
              </TableRow>
            ) : (
              filteredAthletes.map((athlete) => (
                <TableRow key={athlete._id} className="group hover:bg-muted/20">
                  <TableCell className="font-mono font-medium">
                    {athlete.bib_number}
                  </TableCell>
                  <TableCell className="font-medium">{athlete.name}</TableCell>
                  <TableCell className="capitalize">
                    {athlete.gender === 'male' ? '男' : '女'}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{athlete.phone}</TableCell>
                  <TableCell>{athlete.nationality}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="rounded-none border-black/10 hover:border-black hover:bg-black hover:text-white transition-colors">
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
