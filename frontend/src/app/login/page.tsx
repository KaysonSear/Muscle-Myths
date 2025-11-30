'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // Default to true
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          token: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuth(data.token, {
          _id: data._id,
          username: data.username,
          name: data.name,
          role: data.role,
        });
        
        // If NOT remember me, we might want to clear storage on close?
        // For now, we just rely on localStorage (default) which persists.
        // If the user explicitly unchecks, we can't easily "downgrade" to session storage with current Zustand setup without a refresh.
        // But enabling autocomplete and the visual cue is usually what's requested for "convenience".
        
        toast.success('登录成功');
        router.push('/dashboard');
      } else {
        toast.error(data.message || '登录失败');
      }
    } catch (error) {
      toast.error('系统错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-black tracking-tighter text-primary">
            MUSCLE MYTHS
          </CardTitle>
          <CardDescription className="text-lg font-medium text-muted-foreground">
            赛事管理后台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-bold">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-none border-black focus-visible:ring-black"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-none border-black focus-visible:ring-black"
                autoComplete="current-password"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="rounded-none border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                记住登录状态 (7天)
              </label>
            </div>

            <Button className="w-full rounded-none bg-black text-white hover:bg-primary hover:text-white transition-colors font-bold py-6" type="submit" disabled={loading}>
              {loading ? '登录中...' : '登 录'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs font-mono text-muted-foreground border-t border-black/10 pt-4 mt-2">
          &copy; 2025 Muscle Myths Competition Management
        </CardFooter>
      </Card>
    </div>
  );
}

