'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, Save, Upload, X, Plus, User } from 'lucide-react';
import { toast } from 'sonner';
import { zhCN } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, { message: '赛事名称必填' }),
  type: z.string().min(1, { message: '赛事类型必填' }),
  date: z.date({ required_error: '日期必填' }),
  location: z.string().min(2, { message: '地点必填' }),
  base_fee: z.string().min(1, { message: '基础报名费必填' }),
  additional_fee: z.string().min(1, { message: '兼项费必填' }),
  description: z.string().optional(),
  status: z.string(),
});

interface Judge {
  name: string;
  title: string;
  avatar?: string;
}

export default function EditEventPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [judges, setJudges] = useState<Judge[]>([]);
  
  // New judge form
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeTitle, setNewJudgeTitle] = useState('');
  const [newJudgeAvatar, setNewJudgeAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: '',
      location: '',
      base_fee: '',
      additional_fee: '',
      description: '',
      status: 'upcoming',
    },
  });

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/events/${eventId}`);
      if (!res.ok) {
        toast.error('获取赛事信息失败');
        router.push('/dashboard/events');
        return;
      }
      
      const data = await res.json();
      
      form.reset({
        name: data.name,
        type: data.type,
        date: new Date(data.date),
        location: data.location,
        base_fee: String(data.base_fee),
        additional_fee: String(data.additional_fee),
        description: data.description || '',
        status: data.status || 'upcoming',
      });
      
      setCoverImage(data.cover_image || null);
      setJudges(data.judges || []);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    setCoverUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await fetch('http://localhost:4000/api/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const paths = await res.json();
        setCoverImage(paths[0]);
        toast.success('封面上传成功');
      } else {
        toast.error('上传失败');
      }
    } catch (error) {
      toast.error('上传出错');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('头像大小不能超过2MB');
      return;
    }

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await fetch('http://localhost:4000/api/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const paths = await res.json();
        setNewJudgeAvatar(paths[0]);
        toast.success('头像上传成功');
      } else {
        toast.error('上传失败');
      }
    } catch (error) {
      toast.error('上传出错');
    } finally {
      setAvatarUploading(false);
    }
  };

  const addJudge = () => {
    if (!newJudgeName.trim()) {
      toast.error('请输入裁判姓名');
      return;
    }

    const newJudge: Judge = {
      name: newJudgeName.trim(),
      title: newJudgeTitle.trim() || '裁判',
      avatar: newJudgeAvatar || undefined,
    };

    setJudges([...judges, newJudge]);
    setNewJudgeName('');
    setNewJudgeTitle('');
    setNewJudgeAvatar(null);
    toast.success('裁判已添加');
  };

  const removeJudge = (index: number) => {
    setJudges(judges.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:4000/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          base_fee: Number(values.base_fee),
          additional_fee: Number(values.additional_fee),
          cover_image: coverImage,
          judges,
        }),
      });

      if (res.ok) {
        toast.success('赛事已更新');
        router.push(`/dashboard/events/${eventId}`);
      } else {
        const data = await res.json();
        toast.error(data.message || '更新失败');
      }
    } catch (error) {
      toast.error('系统错误');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="outline" className="rounded-none border-black">
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回
          </Button>
        </Link>
        <h1 className="text-2xl font-black tracking-tighter uppercase">编辑赛事</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">赛事名称</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="2026 北京新星联赛" 
                            {...field} 
                            className="rounded-none border-black"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">赛事类型</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-none border-black">
                                <SelectValue placeholder="选择类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="新星联赛">新星联赛</SelectItem>
                              <SelectItem value="自然赛">自然赛</SelectItem>
                              <SelectItem value="经典赛">经典赛</SelectItem>
                              <SelectItem value="年度总决赛">年度总决赛</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">赛事状态</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-none border-black">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="upcoming">即将开始</SelectItem>
                              <SelectItem value="ongoing">进行中</SelectItem>
                              <SelectItem value="finished">已结束</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="font-bold">日期</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal rounded-none border-black',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: zhCN })
                                  ) : (
                                    <span>选择日期</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">地点</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="北京市" 
                              {...field}
                              className="rounded-none border-black" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="base_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">基础报名费 (元)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              className="rounded-none border-black" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="additional_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">兼项费 (元)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              className="rounded-none border-black" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">赛事描述</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="输入赛事描述..." 
                            {...field}
                            className="rounded-none border-black min-h-[100px]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Link href={`/dashboard/events/${eventId}`}>
                      <Button variant="outline" className="rounded-none border-black">
                        取消
                      </Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="rounded-none bg-black text-white hover:bg-gray-800"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? '保存中...' : '保存修改'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card className="rounded-none border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg">封面图</CardTitle>
              <CardDescription>推荐尺寸: 1200x630</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coverImage ? (
                  <div className="relative aspect-video bg-gray-100 border border-gray-200">
                    <Image
                      src={`http://localhost:4000${coverImage}`}
                      alt="封面图"
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-none"
                      onClick={() => setCoverImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">暂无封面</span>
                  </div>
                )}
                
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={coverUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-none border-black"
                    disabled={coverUploading}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {coverUploading ? '上传中...' : '上传封面'}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Judges */}
          <Card className="rounded-none border-2 border-black">
            <CardHeader>
              <CardTitle className="text-lg">裁判团队</CardTitle>
              <CardDescription>管理本场赛事的裁判信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Judges */}
              {judges.length > 0 && (
                <div className="space-y-2">
                  {judges.map((judge, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-gray-50 border"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {judge.avatar ? (
                          <Image
                            src={`http://localhost:4000${judge.avatar}`}
                            alt={judge.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{judge.name}</div>
                        <div className="text-xs text-gray-500">{judge.title}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJudge(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Judge */}
              <div className="pt-4 border-t space-y-3">
                <div className="text-sm font-medium text-gray-500">添加裁判</div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                    {newJudgeAvatar ? (
                      <Image
                        src={`http://localhost:4000${newJudgeAvatar}`}
                        alt="头像"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <label className="cursor-pointer w-full h-full flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={avatarUploading}
                        />
                        {avatarUploading ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Plus className="h-5 w-5 text-gray-400" />
                        )}
                      </label>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="裁判姓名"
                      value={newJudgeName}
                      onChange={(e) => setNewJudgeName(e.target.value)}
                      className="rounded-none border-black h-8 text-sm"
                    />
                    <Input
                      placeholder="职称 (可选)"
                      value={newJudgeTitle}
                      onChange={(e) => setNewJudgeTitle(e.target.value)}
                      className="rounded-none border-black h-8 text-sm"
                    />
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-none border-black"
                  onClick={addJudge}
                >
                  <Plus className="mr-2 h-4 w-4" /> 添加裁判
                </Button>
              </div>

              {judges.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  暂无裁判信息
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

