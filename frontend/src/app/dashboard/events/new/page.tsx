'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { zhCN } from 'date-fns/locale';

const formSchema = z.object({
  name: z.string().min(2, { message: '赛事名称必填' }),
  type: z.string().min(1, { message: '赛事类型必填' }),
  date: z.date({ required_error: '日期必填' }),
  location: z.string().min(2, { message: '地点必填' }),
  base_fee: z.string().min(1, { message: '基础报名费必填' }),
  additional_fee: z.string().min(1, { message: '兼项费必填' }),
  description: z.string().optional(),
});

export default function NewEventPage() {
  const { token } = useAuthStore();
  const useRouter1 = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: '新星联赛',
      location: '',
      base_fee: '500',
      additional_fee: '300',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          base_fee: Number(values.base_fee),
          additional_fee: Number(values.additional_fee),
          judges: [], // Empty for now
        }),
      });

      if (res.ok) {
        toast.success('赛事创建成功');
        useRouter1.push('/dashboard/events');
      } else {
        const data = await res.json();
        toast.error(data.message || '创建赛事失败');
      }
    } catch (error) {
      toast.error('系统错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold mb-6">创建新赛事</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>赛事名称</FormLabel>
                <FormControl>
                  <Input placeholder="2026 北京新星联赛" {...field} />
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
                  <FormLabel>赛事类型</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
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
                        disabled={(date) =>
                          date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>地点</FormLabel>
                <FormControl>
                  <Input placeholder="北京市" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="base_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>基础报名费 (元)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                  <FormLabel>兼项费 (元)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? '创建中...' : '创建赛事'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
