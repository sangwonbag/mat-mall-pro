import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { AdminUsers } from '@/entities';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('dongk3089@naver.com');
  const [password, setPassword] = useState('pwj110800*');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Simple password hashing (in production, use proper bcrypt)
  const hashPassword = (password: string) => {
    return btoa(password); // Base64 encoding for demo purposes
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { items: adminUsers } = await BaseCrudService.getAll<AdminUsers>('adminusers');
      const user = adminUsers.find(u => u.email === email && u.isActive);

      if (!user) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      // Check password (in production, use proper password verification)
      const hashedPassword = hashPassword(password);
      if (user.passwordHash !== hashedPassword) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      // Update last login date
      await BaseCrudService.update('adminusers', {
        _id: user._id,
        lastLoginDate: new Date().toISOString()
      });

      // Store admin session
      localStorage.setItem('adminUser', JSON.stringify({
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }));

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-heading">관리자 로그인</CardTitle>
          <p className="text-gray-600 font-paragraph">상담 관리 시스템에 로그인하세요</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="dongk3089@naver.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                  readOnly
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>동경바닥재 상담 관리 시스템</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}