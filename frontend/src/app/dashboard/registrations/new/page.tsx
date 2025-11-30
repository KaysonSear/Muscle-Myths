'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { toast } from 'sonner';
import { LEVEL_1_CATEGORIES, LEVEL_2_CATEGORIES, LEVEL_3_CATEGORIES } from '@/lib/categories';
import { X } from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  base_fee: number;
  additional_fee: number;
}

interface Athlete {
  _id: string;
  name: string;
  gender: 'male' | 'female';
  bib_number: string;
}

export default function NewRegistrationPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(searchParams.get('eventId') || '');
  const [selectedAthleteId, setSelectedAthleteId] = useState(searchParams.get('athleteId') || '');
  
  const [selectedL1, setSelectedL1] = useState('');
  const [selectedL2, setSelectedL2] = useState('');
  const [selectedL3, setSelectedL3] = useState('');
  
  const [addedCategories, setAddedCategories] = useState<any[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchAthletes();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch('http://localhost:4000/api/events');
    const data = await res.json();
    setEvents(data);
  };

  const fetchAthletes = async () => {
    const res = await fetch('http://localhost:4000/api/athletes', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setAthletes(data);
  };

  const selectedEvent = events.find(e => e._id === selectedEventId);
  const selectedAthlete = athletes.find(a => a._id === selectedAthleteId);

  const availableL1 = selectedAthlete 
    ? LEVEL_1_CATEGORIES[selectedAthlete.gender] 
    : [];
  
  const availableL2 = selectedAthlete 
    ? LEVEL_2_CATEGORIES[selectedAthlete.gender] 
    : [];

  const handleAddCategory = () => {
    if (!selectedL1 || !selectedL2 || !selectedL3) return;
    
    const displayName = `${selectedL2} ${selectedL1} ${selectedL3}`;
    const newCat = {
        level1: selectedL1,
        level2: selectedL2,
        level3: selectedL3,
        display_name: displayName,
        is_primary: addedCategories.length === 0 
    };
    
    setAddedCategories([...addedCategories, newCat]);
    setSelectedL3(''); // Reset last selection
  };

  const removeCategory = (index: number) => {
    const newCats = [...addedCategories];
    newCats.splice(index, 1);
    // Reset primary
    if (newCats.length > 0) {
        newCats[0].is_primary = true;
        for(let i=1; i<newCats.length; i++) newCats[i].is_primary = false;
    }
    setAddedCategories(newCats);
  };

  const calculateTotal = () => {
    if (!selectedEvent) return 0;
    if (addedCategories.length === 0) return 0;
    
    let total = selectedEvent.base_fee;
    if (addedCategories.length > 1) {
        total += (addedCategories.length - 1) * selectedEvent.additional_fee;
    }
    return total;
  };

  const handleSubmit = async () => {
    if (!selectedEventId || !selectedAthleteId || addedCategories.length === 0) {
        toast.error('请完成表单填写');
        return;
    }
    
    setLoading(true);
    try {
        const res = await fetch('http://localhost:4000/api/registrations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                event_id: selectedEventId,
                athlete_id: selectedAthleteId,
                categories: addedCategories,
                services: services.map(s => ({ service_type: s, price: 0 })), // Placeholder services
                total_fee: calculateTotal(),
            }),
        });

        if (res.ok) {
            toast.success('报名成功');
            router.push('/dashboard'); // Or back to event
        } else {
            toast.error('报名失败');
        }
    } catch (error) {
        toast.error('提交错误');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新报名</h1>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
            <Label>选择赛事</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                    <SelectValue placeholder="选择赛事" />
                </SelectTrigger>
                <SelectContent>
                    {events.map(e => (
                        <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        <div>
            <Label>选择选手</Label>
            <Select value={selectedAthleteId} onValueChange={setSelectedAthleteId}>
                <SelectTrigger>
                    <SelectValue placeholder="选择选手" />
                </SelectTrigger>
                <SelectContent>
                     {athletes.map(a => (
                        <SelectItem key={a._id} value={a._id}>{a.name} ({a.bib_number})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {selectedAthlete && selectedEvent && (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>组别选择</CardTitle>
                <CardDescription>为选手 {selectedAthlete.name} 选择参赛组别</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <Select value={selectedL1} onValueChange={setSelectedL1}>
                        <SelectTrigger><SelectValue placeholder="一级组别" /></SelectTrigger>
                        <SelectContent>
                            {availableL1.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedL2} onValueChange={setSelectedL2}>
                        <SelectTrigger><SelectValue placeholder="二级组别" /></SelectTrigger>
                        <SelectContent>
                            {availableL2.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedL3} onValueChange={setSelectedL3}>
                        <SelectTrigger><SelectValue placeholder="三级组别" /></SelectTrigger>
                        <SelectContent>
                            {LEVEL_3_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddCategory} className="w-full" variant="outline">添加组别</Button>
                
                <div className="mt-4 space-y-2">
                    {addedCategories.map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-100 rounded">
                            <span>
                                {cat.display_name} 
                                {cat.is_primary && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">首项</span>}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => removeCategory(idx)}><X className="h-4 w-4"/></Button>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-4">
                <div className="text-lg font-bold">总费用: ¥{calculateTotal()}</div>
                <Button onClick={handleSubmit} disabled={loading || addedCategories.length === 0}>提交报名</Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
