'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BarChart3,
  Users,
  Trophy,
  TrendingUp,
  UserCheck,
  Calendar,
  MapPin,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface Event {
  _id: string;
  name: string;
  date: string;
  location: string;
}

interface Athlete {
  _id: string;
  name: string;
  gender: 'male' | 'female';
  nationality: string;
  age?: number;
}

interface Registration {
  _id: string;
  event_id: string;
  athlete_id: Athlete;
  categories: {
    level1: string;
    level2: string;
    level3: string;
    display_name: string;
  }[];
  total_fee: number;
}

// 颜色方案
const COLORS = ['#000000', '#666666', '#999999', '#CCCCCC', '#E5E5E5'];
const GENDER_COLORS = { male: '#3B82F6', female: '#EC4899' };

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取赛事列表
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        toast.error('获取赛事列表失败');
      }
    };
    fetchEvents();
  }, []);

  // 获取报名数据
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        // 获取所有报名数据（需要后端支持）
        const url = selectedEventId === 'all'
          ? `${API_URL}/registrations`
          : `${API_URL}/registrations?event_id=${selectedEventId}`;
        
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data);
        }
      } catch (error) {
        console.error('获取报名数据失败', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [selectedEventId, token]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (registrations.length === 0) {
      return {
        totalRegistrations: 0,
        totalEntries: 0,
        totalRevenue: 0,
        avgEntriesPerAthlete: 0,
        genderDistribution: [],
        nationalityDistribution: [],
        ageDistribution: [],
        categoryDistribution: [],
      };
    }

    // 唯一选手数
    const uniqueAthletes = new Set(registrations.map((r) => r.athlete_id?._id)).size;
    
    // 总人次（所有组别条目）
    const totalEntries = registrations.reduce(
      (sum, r) => sum + (r.categories?.length || 0),
      0
    );

    // 总收入
    const totalRevenue = registrations.reduce(
      (sum, r) => sum + (r.total_fee || 0),
      0
    );

    // 平均兼项数
    const avgEntriesPerAthlete = uniqueAthletes > 0 
      ? (totalEntries / uniqueAthletes).toFixed(1) 
      : '0';

    // 性别分布
    const genderCounts: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.athlete_id?.gender) {
        const gender = r.athlete_id.gender === 'male' ? '男' : '女';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      }
    });
    const genderDistribution = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
      color: name === '男' ? GENDER_COLORS.male : GENDER_COLORS.female,
    }));

    // 国籍分布
    const nationalityCounts: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.athlete_id?.nationality) {
        nationalityCounts[r.athlete_id.nationality] = 
          (nationalityCounts[r.athlete_id.nationality] || 0) + 1;
      }
    });
    const nationalityDistribution = Object.entries(nationalityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // 年龄分布
    const ageBuckets: Record<string, number> = {
      '18岁以下': 0,
      '18-25岁': 0,
      '26-35岁': 0,
      '36-45岁': 0,
      '46岁以上': 0,
    };
    registrations.forEach((r) => {
      const age = r.athlete_id?.age;
      if (age) {
        if (age < 18) ageBuckets['18岁以下']++;
        else if (age <= 25) ageBuckets['18-25岁']++;
        else if (age <= 35) ageBuckets['26-35岁']++;
        else if (age <= 45) ageBuckets['36-45岁']++;
        else ageBuckets['46岁以上']++;
      }
    });
    const ageDistribution = Object.entries(ageBuckets)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);

    // 组别分布（Level 1）
    const categoryCounts: Record<string, number> = {};
    registrations.forEach((r) => {
      r.categories?.forEach((cat) => {
        if (cat.level1) {
          categoryCounts[cat.level1] = (categoryCounts[cat.level1] || 0) + 1;
        }
      });
    });
    const categoryDistribution = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalRegistrations: uniqueAthletes,
      totalEntries,
      totalRevenue,
      avgEntriesPerAthlete,
      genderDistribution,
      nationalityDistribution,
      ageDistribution,
      categoryDistribution,
    };
  }, [registrations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">数据分析</h1>
          <p className="text-muted-foreground">查看赛事报名统计与数据可视化</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">选择赛事:</span>
          <Select
            value={selectedEventId}
            onValueChange={setSelectedEventId}
          >
            <SelectTrigger className="w-[200px] rounded-none border-black">
              <SelectValue placeholder="选择赛事" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部赛事</SelectItem>
              {events.map((event) => (
                <SelectItem key={event._id} value={event._id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">加载数据中...</p>
          </div>
        </div>
      ) : (
        <>
          {/* 核心统计指标 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">报名人数</p>
                    <p className="text-4xl font-black">{stats.totalRegistrations}</p>
                  </div>
                  <div className="w-12 h-12 bg-black text-white rounded-none flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">总人次</p>
                    <p className="text-4xl font-black">{stats.totalEntries}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary text-white rounded-none flex items-center justify-center">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">总收入</p>
                    <p className="text-4xl font-black">¥{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 text-white rounded-none flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">平均兼项</p>
                    <p className="text-4xl font-black">{stats.avgEntriesPerAthlete}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary text-white rounded-none flex items-center justify-center">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 性别分布 */}
            <Card className="border-2 border-black rounded-none">
              <CardHeader className="border-b border-black/10">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5" />
                  性别分布
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {stats.genderDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.genderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {stats.genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 年龄分布 */}
            <Card className="border-2 border-black rounded-none">
              <CardHeader className="border-b border-black/10">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  年龄分布
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {stats.ageDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#000000" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 国籍分布 */}
            <Card className="border-2 border-black rounded-none">
              <CardHeader className="border-b border-black/10">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  国籍分布 (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {stats.nationalityDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={stats.nationalityDistribution}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#666666" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 组别分布 */}
            <Card className="border-2 border-black rounded-none">
              <CardHeader className="border-b border-black/10">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  组别分布
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {stats.categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stats.categoryDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 数据表格 */}
          {stats.categoryDistribution.length > 0 && (
            <Card className="border-2 border-black rounded-none">
              <CardHeader className="border-b border-black/10">
                <CardTitle>组别明细统计</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black bg-muted/30">
                        <th className="text-left p-3 font-bold">组别</th>
                        <th className="text-right p-3 font-bold">人次</th>
                        <th className="text-right p-3 font-bold">占比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.categoryDistribution.map((cat, index) => (
                        <tr
                          key={cat.name}
                          className="border-b border-black/10 hover:bg-muted/10"
                        >
                          <td className="p-3 font-medium">{cat.name}</td>
                          <td className="p-3 text-right font-mono">
                            {cat.value}
                          </td>
                          <td className="p-3 text-right font-mono text-muted-foreground">
                            {((cat.value / stats.totalEntries) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

