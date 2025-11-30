'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Trophy,
  Edit,
  Trash2,
  Plus,
  History,
  Ruler,
  Scale,
  TestTube,
} from 'lucide-react';

interface Athlete {
  _id: string;
  name: string;
  gender: 'male' | 'female';
  bib_number: string;
  phone: string;
  nationality: string;
  id_type: string;
  id_number: string;
  birthdate?: string;
  age?: number;
  height?: number;
  weight?: number;
  drug_test: boolean;
  registration_channel: string;
  notes?: string;
  email?: string;
  createdAt: string;
}

interface Registration {
  _id: string;
  event_id: {
    _id: string;
    name: string;
    date: string;
  };
  categories: {
    level1: string;
    level2: string;
    level3: string;
    display_name: string;
  }[];
  total_fee: number;
  createdAt: string;
}

export default function AthleteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // 获取选手信息
  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        const res = await fetch(`${API_URL}/athletes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAthlete(data);
        } else {
          toast.error('获取选手信息失败');
        }
      } catch (error) {
        toast.error('获取选手信息失败');
      }
    };

    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`${API_URL}/registrations?athlete_id=${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data);
        }
      } catch (error) {
        console.error('获取参赛历史失败', error);
      }
    };

    Promise.all([fetchAthlete(), fetchRegistrations()]).finally(() => {
      setLoading(false);
    });
  }, [id, token]);

  // 删除选手
  const handleDelete = async () => {
    if (!token) {
      toast.error('请先登录');
      return;
    }

    if (!confirm('确定要删除该选手吗？此操作不可撤销。')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/athletes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('选手已删除');
        router.push('/dashboard/athletes');
      } else {
        const data = await res.json();
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      toast.error('删除选手时出错');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/athletes">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> 返回选手列表
          </Button>
        </Link>
        <Card className="border-2 border-destructive/50 rounded-none">
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">选手未找到</h2>
            <p className="text-muted-foreground">该选手可能已被删除或不存在。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/athletes">
            <Button variant="ghost" size="icon" className="rounded-none">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  athlete.gender === 'male'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-pink-100 text-pink-700'
                }`}
              >
                {athlete.gender === 'male' ? '男' : '女'}
              </span>
              {athlete.bib_number && (
                <span className="text-sm font-mono text-muted-foreground">
                  #{athlete.bib_number}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight">{athlete.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/registrations/new?athleteId=${athlete._id}`}>
            <Button variant="outline" className="rounded-none border-black gap-2">
              <Plus className="h-4 w-4" />
              添加报名
            </Button>
          </Link>
          <Link href={`/dashboard/athletes/new?edit=${athlete._id}`}>
            <Button variant="outline" className="rounded-none border-black gap-2">
              <Edit className="h-4 w-4" />
              编辑
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-none border-red-500 text-red-600 hover:bg-red-50 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? '删除中...' : '删除'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b border-black/10">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    手机号码
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono">{athlete.phone}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    国籍
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{athlete.nationality}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    证件类型
                  </label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p>{athlete.id_type}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    证件号码
                  </label>
                  <p className="font-mono">{athlete.id_number}</p>
                </div>

                {athlete.birthdate && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">
                      出生日期
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {format(new Date(athlete.birthdate), 'yyyy年MM月dd日', {
                          locale: zhCN,
                        })}
                        {athlete.age && (
                          <span className="text-muted-foreground ml-2">
                            ({athlete.age} 岁)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    报名渠道
                  </label>
                  <p>{athlete.registration_channel}</p>
                </div>

                {athlete.height && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">
                      身高
                    </label>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <p>{athlete.height} cm</p>
                    </div>
                  </div>
                )}

                {athlete.weight && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">
                      体重
                    </label>
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <p>{athlete.weight} kg</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    药检状态
                  </label>
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded ${
                        athlete.drug_test
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {athlete.drug_test ? '已药检' : '未药检'}
                    </span>
                  </div>
                </div>

                {athlete.email && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">
                      电子邮箱
                    </label>
                    <p>{athlete.email}</p>
                  </div>
                )}
              </div>

              {athlete.notes && (
                <div className="mt-6 pt-4 border-t border-dashed">
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                    备注
                  </label>
                  <p className="text-sm">{athlete.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 参赛历史 */}
          <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b border-black/10">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                参赛历史
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({registrations.length} 次)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {registrations.length > 0 ? (
                <div className="divide-y divide-black/10">
                  {registrations.map((reg) => (
                    <div
                      key={reg._id}
                      className="p-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/dashboard/events/${reg.event_id._id}`}
                            className="font-bold hover:text-primary transition-colors"
                          >
                            {reg.event_id.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(reg.event_id.date), 'yyyy年MM月dd日', {
                              locale: zhCN,
                            })}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {reg.categories.map((cat, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs bg-black/5 rounded"
                              >
                                {cat.display_name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold">
                            ¥{reg.total_fee.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reg.categories.length} 个组别
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>暂无参赛记录</p>
                  <Link href={`/dashboard/registrations/new?athleteId=${athlete._id}`}>
                    <Button
                      variant="outline"
                      className="mt-4 rounded-none border-black"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加报名
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏统计 */}
        <div className="space-y-4">
          <Card className="border border-black/20 rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                参赛统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">参赛次数</span>
                <span className="text-3xl font-black">{registrations.length}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">总报名费</span>
                <span className="text-2xl font-black font-mono">
                  ¥{registrations.reduce((sum, r) => sum + r.total_fee, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">总组别数</span>
                <span className="text-2xl font-black">
                  {registrations.reduce((sum, r) => sum + r.categories.length, 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/20 rounded-none">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-2">注册信息</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span className="font-mono text-xs">
                    {format(new Date(athlete.createdAt), 'yyyy/MM/dd HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">选手ID</span>
                  <span className="font-mono text-xs">{athlete._id.slice(-8)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

