'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { format, differenceInYears } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarIcon, Check, ChevronsUpDown, Upload, X, Plus } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';

const formSchema = z.object({
  name: z.string().min(2, { message: '姓名至少需要2个字符' }),
  gender: z.enum(['male', 'female']),
  bib_number: z.string().optional(), // Made optional as it's hidden and generated later
  phone: z.string().min(1, { message: '手机号必填' }), // Changed validation to allow any length for now, will combine with prefix
  phone_prefix: z.string().min(1, { message: '区号必填' }), // Added prefix field
  nationality: z.string().min(2, { message: '请选择国籍/地区' }),
  id_type: z.string().min(2),
  id_number: z.string().optional(),
  birthdate: z.date().optional(), 
  age: z.number().optional(), // Allow undefined
  height: z.string().optional(), 
  weight: z.string().optional(),
  email: z.string().email({ message: '请输入合法的邮箱地址' }).optional().or(z.literal('')), // New optional email field
  registration_channel: z.string().min(1),
});

export default function NewAthletePage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openNationality, setOpenNationality] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '小M',
      gender: 'male',
      bib_number: '',
      phone: '',
      phone_prefix: '+86',
      email: '',
      nationality: '中国',
      id_type: '身份证',
      id_number: '',
      registration_channel: '管理员录入',
      age: undefined,
    },
  });

  const idType = useWatch({ control: form.control, name: 'id_type' });
  const idNumber = useWatch({ control: form.control, name: 'id_number' });
  const birthdate = useWatch({ control: form.control, name: 'birthdate' });
  const nationality = useWatch({ control: form.control, name: 'nationality' });
  
  // Logic to update phone prefix based on nationality
  useEffect(() => {
    const country = COUNTRIES.find(c => c.value === nationality);
    if (country) {
      form.setValue('phone_prefix', country.code);
    }
  }, [nationality, form]);

  // Logic to parse ID card
  useEffect(() => {
    if (idType === '身份证' && idNumber && idNumber.length === 18) {
      const birthString = idNumber.substring(6, 14);
      const year = parseInt(birthString.substring(0, 4));
      const month = parseInt(birthString.substring(4, 6)) - 1;
      const day = parseInt(birthString.substring(6, 8));
      
      const birthDateObj = new Date(year, month, day);
      
      if (!isNaN(birthDateObj.getTime())) {
        form.setValue('birthdate', birthDateObj);
        
        // Auto set gender
        const genderCode = parseInt(idNumber.charAt(16));
        form.setValue('gender', genderCode % 2 === 1 ? 'male' : 'female');
      }
    }
  }, [idNumber, idType, form]);

  // Logic to calculate age
  useEffect(() => {
    if (birthdate) {
      const age = differenceInYears(new Date(), birthdate);
      form.setValue('age', age);
    } else {
      form.setValue('age', undefined);
    }
  }, [birthdate, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Client-side validation for video duration
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      let processedCount = 0;

      files.forEach((file) => {
        if (file.type.startsWith('video/')) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 300) { // 5 minutes in seconds
              invalidFiles.push(file.name);
            } else {
              validFiles.push(file);
            }
            processedCount++;
            if (processedCount === files.length) {
              finalizeFileSelection(validFiles, invalidFiles);
            }
          };
          video.src = URL.createObjectURL(file);
        } else {
          validFiles.push(file);
          processedCount++;
          if (processedCount === files.length) {
            finalizeFileSelection(validFiles, invalidFiles);
          }
        }
      });
    }
  };

  const finalizeFileSelection = (validFiles: File[], invalidFiles: string[]) => {
    if (invalidFiles.length > 0) {
      toast.error(`以下视频超过5分钟限制: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    
    // Revoke URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('media', file);
    });

    try {
      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      return data; // Should be array of file paths
    } catch (error) {
      console.error(error);
      toast.error('媒体文件上传失败');
      return [];
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setUploading(true);
    try {
      // Upload files first
      const mediaUrls = await uploadFiles();

      // Combine prefix and phone
      const fullPhone = `${values.phone_prefix} ${values.phone}`;

      const res = await fetch('http://localhost:4000/api/athletes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          phone: fullPhone, // Send combined phone
          height: values.height ? Number(values.height) : undefined,
          weight: values.weight ? Number(values.weight) : undefined,
          age: values.age || 0,
          media: mediaUrls,
        }),
      });

      if (res.ok) {
        toast.success('选手创建成功');
        router.push('/dashboard/athletes');
      } else {
        const data = await res.json();
        toast.error(data.message || '创建选手失败');
      }
    } catch (error) {
      toast.error('系统错误');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  const isIdCard = idType === '身份证';
  const isIdValid = isIdCard && idNumber && idNumber.length === 18;
  const isChina = nationality === '中国';

  return (
    <div className="max-w-4xl mx-auto bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
      <h1 className="text-3xl font-black tracking-tighter mb-8 uppercase border-b-2 border-black pb-4">
        添加新选手
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">姓名 <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="小M" {...field} className="rounded-none border-black focus-visible:ring-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bib_number"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel className="font-bold">号码牌</FormLabel>
                  <FormControl>
                    <Input placeholder="001" {...field} className="rounded-none border-black focus-visible:ring-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">性别 <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isIdValid} // Disable if valid ID card entered
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-none border-black focus:ring-black">
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel className="font-bold">手机号 <span className="text-red-500">*</span></FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="phone_prefix"
                  render={({ field }) => (
                    <FormItem className="w-24 shrink-0">
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            disabled={isChina} 
                            className={cn(
                              "rounded-none border-black focus-visible:ring-black pl-8", // Add padding for flag
                              isChina && "bg-muted text-muted-foreground"
                            )}
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none pl-1">
                            {(() => {
                              const country = COUNTRIES.find(c => c.value === nationality);
                              return country ? country.flag : '🏳️';
                            })()}
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="13800138000" {...field} className="rounded-none border-black focus-visible:ring-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold">国籍/地区 <span className="text-red-500">*</span></FormLabel>
                  <Popover open={openNationality} onOpenChange={setOpenNationality}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between rounded-none border-black font-normal hover:bg-accent",
                            !field.value && "text-muted-foreground"
                          )}
                          onWheel={(e) => {
                            e.preventDefault();
                            const currentIndex = COUNTRIES.findIndex(c => c.value === field.value);
                            if (currentIndex === -1) return;
                            
                            if (e.deltaY < 0 && currentIndex > 0) {
                              // Scroll up, previous country
                              form.setValue("nationality", COUNTRIES[currentIndex - 1].value);
                            } else if (e.deltaY > 0 && currentIndex < COUNTRIES.length - 1) {
                              // Scroll down, next country
                              form.setValue("nationality", COUNTRIES[currentIndex + 1].value);
                            }
                          }}
                        >
                          {field.value
                            ? (() => {
                                const country = COUNTRIES.find(
                                  (country) => country.value === field.value
                                );
                                return country ? `${country.flag} ${country.label}` : field.value;
                              })()
                            : "选择国籍"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 rounded-none border-black">
                      <Command>
                        <CommandInput placeholder="搜索国家..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>未找到国家。</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {COUNTRIES.map((country) => (
                              <CommandItem
                                value={`${country.label} ${country.en} ${country.py} ${country.code}`} // Enable search by label, English name, Pinyin, and code
                                key={country.value}
                                onSelect={() => {
                                  form.setValue("nationality", country.value);
                                  setOpenNationality(false);
                                }}
                              >
                                <span className="mr-2 text-lg">{country.flag}</span>
                                {country.label}
                                <span className="ml-auto text-muted-foreground text-xs">{country.code}</span>
                                <Check
                                  className={cn(
                                    "ml-2 h-4 w-4",
                                    country.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Split ID Type and Number back to individual fields with custom layout for alignment */}
            <div className="col-span-2 space-y-2">
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="id_type"
                  render={({ field }) => (
                    <FormItem className="w-24 shrink-0">
                      <FormLabel className="font-bold block truncate">证件类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-none border-black focus:ring-black">
                            <SelectValue placeholder="类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="身份证">身份证</SelectItem>
                          <SelectItem value="护照">护照</SelectItem>
                          <SelectItem value="台胞证">台胞证</SelectItem>
                          <SelectItem value="回乡证">回乡证</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="id_number"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="font-bold">证件号码</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="请输入证件号码"
                          className="rounded-none border-black focus-visible:ring-black" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold">出生日期 <span className="text-red-500">*</span></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          disabled={isIdValid} // Disable if valid ID card
                          className={cn(
                            'w-full pl-3 text-left font-normal rounded-none border-black hover:bg-accent',
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
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">年龄 (自动计算) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      value={field.value ?? ''} // Show empty string if undefined/null
                      disabled 
                      className="rounded-none border-black bg-muted text-muted-foreground cursor-not-allowed" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">身高 (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (isNaN(val) || val >= 0) {
                           field.onChange(e.target.value);
                        }
                      }}
                      className="rounded-none border-black focus-visible:ring-black"
                      onWheel={(e) => {
                        e.preventDefault();
                        // Only scroll if input is focused to prevent accidental scrolls
                        if (document.activeElement === e.currentTarget) {
                          // Prevent default page scroll only when focused
                          const currentVal = Number(field.value || 0);
                          if (e.deltaY < 0) {
                            field.onChange((currentVal + 1).toString());
                          } else {
                            field.onChange(Math.max(0, currentVal - 1).toString());
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">体重 (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (isNaN(val) || val >= 0) {
                           field.onChange(e.target.value);
                        }
                      }}
                      className="rounded-none border-black focus-visible:ring-black"
                      onWheel={(e) => {
                        // Only scroll if input is focused
                        if (document.activeElement === e.currentTarget) {
                          e.preventDefault(); // Prevent page scroll only when input is focused
                          const currentVal = Number(field.value || 0);
                          if (e.deltaY < 0) {
                            field.onChange((currentVal + 1).toString());
                          } else {
                            field.onChange(Math.max(0, currentVal - 1).toString());
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                          e.preventDefault();
                          const currentVal = Number(field.value || 0);
                          if (e.key === 'ArrowUp') {
                            field.onChange((currentVal + 1).toString());
                          } else {
                            field.onChange(Math.max(0, currentVal - 1).toString());
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">E-Mail</FormLabel>
                <FormControl>
                  <Input placeholder="example@domain.com" {...field} className="rounded-none border-black focus-visible:ring-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Media Upload Section */}
          <div className="space-y-4 border-t border-black pt-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5" /> 选手照片/战绩视频上传 (可选)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Upload Button */}
              <div className="relative aspect-square bg-muted border-2 border-dashed border-black/20 hover:border-black hover:bg-accent transition-colors flex flex-col items-center justify-center cursor-pointer group">
                <Input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Plus className="h-10 w-10 text-muted-foreground group-hover:text-black transition-colors" />
                <span className="text-xs font-medium text-muted-foreground mt-2 group-hover:text-black">点击上传</span>
              </div>

              {/* Previews */}
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative aspect-square bg-black group border border-black">
                  {file.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={previews[index]} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={previews[index]} 
                      className="w-full h-full object-cover"
                      controls={false}
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2 p-2">
                    <p className="text-white text-xs truncate w-full text-center">{file.name}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 rounded-none"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {file.type.startsWith('video/') && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-1 py-0.5 pointer-events-none">
                      VIDEO
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              支持 jpg, png, mp4 等格式。视频时长建议不超过5分钟。
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-black">
            <Button type="submit" disabled={loading} className="rounded-none bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-bold">
              {loading ? '提交中...' : '创建选手'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
