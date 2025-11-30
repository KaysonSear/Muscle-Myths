'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LEVEL_1_CATEGORIES, LEVEL_2_CATEGORIES, LEVEL_3_CATEGORIES } from '@/lib/categories';
import { X, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Registration {
  _id: string;
  event_id: {
    _id: string;
    name: string;
    date: string;
    base_fee?: number;
    additional_fee?: number;
  };
  athlete_id: {
    _id: string;
    name: string;
    bib_number: string;
    gender: 'male' | 'female';
    phone?: string;
    nationality?: string;
  };
  categories: {
    level1: string;
    level2: string;
    level3: string;
    display_name: string;
    is_primary: boolean;
  }[];
  services: {
    service_type: string;
    category?: string;
    price: number;
  }[];
  total_fee: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  notes?: string;
  createdAt: string;
}

interface Event {
  _id: string;
  name: string;
  base_fee: number;
  additional_fee: number;
}

export default function EditRegistrationPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const registrationId = params.id as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable states
  const [categories, setCategories] = useState<Registration['categories']>([]);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [totalFee, setTotalFee] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  
  // Category selection
  const [selectedL1, setSelectedL1] = useState('');
  const [selectedL2, setSelectedL2] = useState('');
  const [selectedL3, setSelectedL3] = useState('');

  useEffect(() => {
    if (registrationId && token) {
      fetchRegistration();
    }
  }, [registrationId, token]);

  const fetchRegistration = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/registrations/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        toast.error('加载报名信息失败');
        router.push('/dashboard/registrations');
        return;
      }
      
      const data = await res.json();
      setRegistration(data);
      setCategories(data.categories || []);
      setPaymentStatus(data.payment_status || 'pending');
      setTotalFee(data.total_fee || 0);
      setNotes(data.notes || '');
      
      // Fetch full event details for fee calculation
      if (data.event_id?._id) {
        const eventRes = await fetch(`http://localhost:4000/api/events/${data.event_id._id}`);
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData);
        }
      }
    } catch (error) {
      toast.error('加载出错');
    } finally {
      setLoading(false);
    }
  };

  const athleteGender = registration?.athlete_id?.gender || 'male';
  
  const availableL1 = LEVEL_1_CATEGORIES[athleteGender] || [];
  const availableL2 = LEVEL_2_CATEGORIES[athleteGender] || [];

  const handleAddCategory = () => {
    if (!selectedL1 || !selectedL2 || !selectedL3) {
      toast.error('请选择完整的组别');
      return;
    }
    
    const displayName = `${selectedL2} ${selectedL1} ${selectedL3}`;
    
    // Check for duplicates
    if (categories.some(c => c.display_name === displayName)) {
      toast.error('该组别已添加');
      return;
    }
    
    const newCat = {
      level1: selectedL1,
      level2: selectedL2,
      level3: selectedL3,
      display_name: displayName,
      is_primary: categories.length === 0,
    };
    
    const newCategories = [...categories, newCat];
    setCategories(newCategories);
    recalculateFee(newCategories);
    
    setSelectedL1('');
    setSelectedL2('');
    setSelectedL3('');
  };

  const removeCategory = (index: number) => {
    const newCats = [...categories];
    newCats.splice(index, 1);
    
    // Reset primary
    if (newCats.length > 0) {
      newCats[0].is_primary = true;
      for (let i = 1; i < newCats.length; i++) {
        newCats[i].is_primary = false;
      }
    }
    
    setCategories(newCats);
    recalculateFee(newCats);
  };

  const recalculateFee = (cats: Registration['categories']) => {
    if (!event) return;
    if (cats.length === 0) {
      setTotalFee(0);
      return;
    }
    
    let fee = event.base_fee || 0;
    if (cats.length > 1) {
      fee += (cats.length - 1) * (event.additional_fee || 0);
    }
    setTotalFee(fee);
  };

  const handleSave = async () => {
    if (categories.length === 0) {
      toast.error('至少需要选择一个组别');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:4000/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categories,
          total_fee: totalFee,
          payment_status: paymentStatus,
          notes,
        }),
      });

      if (res.ok) {
        toast.success('保存成功');
        router.push('/dashboard/registrations');
      } else {
        const error = await res.json();
        toast.error(error.message || '保存失败');
      }
    } catch (error) {
      toast.error('保存出错');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-red-500">未找到报名记录</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/registrations">
          <Button variant="outline" className="rounded-none border-black">
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回
          </Button>
        </Link>
        <h1 className="text-2xl font-black tracking-tighter uppercase">编辑报名</h1>
      </div>

      {/* Athlete & Event Info (Read-only) */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="rounded-none border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">选手信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{registration.athlete_id?.name}</div>
            <div className="text-sm text-gray-600">
              号码布: {registration.athlete_id?.bib_number || '-'}
            </div>
            <div className="text-sm text-gray-600">
              性别: {registration.athlete_id?.gender === 'male' ? '男' : '女'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-none border-2 border-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">赛事信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{registration.event_id?.name}</div>
            <div className="text-sm text-gray-600">
              日期: {registration.event_id?.date 
                ? new Date(registration.event_id.date).toLocaleDateString('zh-CN')
                : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Editor */}
      <Card className="rounded-none border-2 border-black mb-6">
        <CardHeader>
          <CardTitle>报名组别</CardTitle>
          <CardDescription>管理选手的参赛组别</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Categories */}
          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="text-gray-500 text-center py-4">暂无组别，请添加</div>
            ) : (
              categories.map((cat, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cat.display_name}</span>
                    {cat.is_primary && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        首项
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeCategory(idx)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          
          {/* Add New Category */}
          <div className="pt-4 border-t">
            <Label className="text-sm text-gray-500 mb-2 block">添加新组别</Label>
            <div className="grid grid-cols-3 gap-3">
              <Select value={selectedL1} onValueChange={setSelectedL1}>
                <SelectTrigger className="rounded-none border-black">
                  <SelectValue placeholder="一级组别" />
                </SelectTrigger>
                <SelectContent>
                  {availableL1.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedL2} onValueChange={setSelectedL2}>
                <SelectTrigger className="rounded-none border-black">
                  <SelectValue placeholder="二级组别" />
                </SelectTrigger>
                <SelectContent>
                  {availableL2.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedL3} onValueChange={setSelectedL3}>
                <SelectTrigger className="rounded-none border-black">
                  <SelectValue placeholder="三级组别" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_3_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAddCategory} 
              className="w-full mt-3 rounded-none border-2 border-black bg-white text-black hover:bg-gray-100"
              variant="outline"
            >
              添加组别
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Notes */}
      <Card className="rounded-none border-2 border-black mb-6">
        <CardHeader>
          <CardTitle>费用与支付</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">总费用 (¥)</Label>
              <Input
                type="number"
                value={totalFee}
                onChange={(e) => setTotalFee(Number(e.target.value))}
                className="rounded-none border-black"
              />
            </div>
            <div>
              <Label className="mb-2 block">支付状态</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="rounded-none border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待支付</SelectItem>
                  <SelectItem value="paid">已支付</SelectItem>
                  <SelectItem value="refunded">已退款</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-2 block">备注</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="添加备注信息..."
              className="rounded-none border-black min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Link href="/dashboard/registrations">
          <Button variant="outline" className="rounded-none border-black">
            取消
          </Button>
        </Link>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-none bg-black text-white hover:bg-gray-800"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? '保存中...' : '保存修改'}
        </Button>
      </div>
    </div>
  );
}

