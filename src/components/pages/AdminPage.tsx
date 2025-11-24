import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, User, Eye, EyeOff, LogIn, Shield, Menu, X, 
  LayoutDashboard, Package, FileText, Image, Wrench, 
  MessageSquare, Settings, Users, Download, BarChart3,
  Home, Search, Calculator, Building, Phone, Globe,
  Database, Key, UserPlus, FileSpreadsheet, History,
  ChevronRight, Bell, Activity
} from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { AdminUsers } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AdminAuth {
  isAuthenticated: boolean;
  adminUser: AdminUsers | null;
}

type MenuSection = 
  | 'dashboard' 
  | 'materials' 
  | 'pdf-management' 
  | 'case-studies' 
  | 'quotes' 
  | 'chat' 
  | 'site-content' 
  | 'menu-routing' 
  | 'system' 
  | 'members';

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [auth, setAuth] = useState<AdminAuth>({
    isAuthenticated: false,
    adminUser: null
  });
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard');

  // 관리자 로그인
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해 주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // 관리자 계정 조회
      const { items } = await BaseCrudService.getAll<AdminUsers>('adminusers');
      const adminUser = items.find(user => 
        user.email === loginForm.email && 
        user.isActive
      );

      if (!adminUser) {
        toast({
          title: "로그인 실패",
          description: "존재하지 않거나 비활성화된 계정입니다.",
          variant: "destructive",
        });
        return;
      }

      // 비밀번호 검증 (실제 환경에서는 해시 비교)
      if (adminUser.passwordHash !== loginForm.password) {
        toast({
          title: "로그인 실패",
          description: "비밀번호가 올바르지 않습니다.",
          variant: "destructive",
        });
        return;
      }

      // 로그인 성공
      setAuth({
        isAuthenticated: true,
        adminUser
      });

      // 마지막 로그인 시간 업데이트
      await BaseCrudService.update('adminusers', {
        ...adminUser,
        lastLoginDate: new Date()
      });

      toast({
        title: "로그인 성공",
        description: `${adminUser.displayName || adminUser.email}님, 환영합니다!`,
      });

    } catch (error) {
      console.error('로그인 오류:', error);
      toast({
        title: "오류",
        description: "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      adminUser: null
    });
    setLoginForm({ email: '', password: '' });
    toast({
      title: "로그아웃",
      description: "성공적으로 로그아웃되었습니다.",
    });
  };

  // 사이드바 메뉴 구성
  const menuItems = [
    {
      id: 'dashboard' as MenuSection,
      label: '대시보드',
      icon: LayoutDashboard,
      description: '전체 현황 및 통계'
    },
    {
      id: 'members' as MenuSection,
      label: '멤버 관리',
      icon: Users,
      description: '관리자 계정 관리'
    },
    {
      id: 'materials' as MenuSection,
      label: '자재 관리',
      icon: Package,
      description: '자재코드, 브랜드, 분류, 가격 관리'
    },
    {
      id: 'pdf-management' as MenuSection,
      label: 'PDF·이미지 변환&슬라이더',
      icon: FileText,
      description: 'PDF 업로드, 이미지 추출, 슬라이더'
    },
    {
      id: 'case-studies' as MenuSection,
      label: '시공사례 관리',
      icon: Building,
      description: '시공사례 등록 및 관리'
    },
    {
      id: 'quotes' as MenuSection,
      label: '자동견적·문의 관리',
      icon: Calculator,
      description: '견적 요청 및 문의 관리'
    },
    {
      id: 'chat' as MenuSection,
      label: '채팅 상담 관리',
      icon: MessageSquare,
      description: '실시간 채팅 상담'
    },
    {
      id: 'site-content' as MenuSection,
      label: '사이트 텍스트·회사정보',
      icon: Globe,
      description: '회사정보, 운영시간, 텍스트'
    },
    {
      id: 'menu-routing' as MenuSection,
      label: '메뉴·링크 라우팅',
      icon: Settings,
      description: '서비스 카드, 빠른 링크'
    },
    {
      id: 'system' as MenuSection,
      label: '시스템 설정/백업',
      icon: Database,
      description: '비밀번호, 백업, 로그'
    }
  ];

  // 권한별 접근 제어
  const hasPermission = (section: MenuSection): boolean => {
    const userRole = auth.adminUser?.role;
    
    switch (userRole) {
      case 'Super Admin':
        return true;
      case 'Staff':
        return !['system', 'members'].includes(section);
      case 'Editor':
        return ['dashboard', 'materials', 'pdf-management', 'case-studies', 'site-content'].includes(section);
      case 'Counselor':
        return ['dashboard', 'quotes', 'chat'].includes(section);
      default:
        return false;
    }
  };

  // 로그인 화면
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              동경바닥재 통합 관리자
            </CardTitle>
            <p className="text-sm text-gray-600">관리자 계정으로 로그인하세요</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="관리자 이메일"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="비밀번호"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    로그인 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    로그인
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                메인 사이트로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 통합 관리자 대시보드
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-16'} flex flex-col`}>
        {/* 사이드바 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">동경바닥재</h2>
                  <p className="text-xs text-gray-600">통합 관리자</p>
                </div>
              </div>
            )}
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* 사용자 정보 */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {auth.adminUser?.displayName || auth.adminUser?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {auth.adminUser?.role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* 메뉴 항목 */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const hasAccess = hasPermission(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => hasAccess && setActiveSection(item.id)}
                disabled={!hasAccess}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : hasAccess
                      ? 'hover:bg-gray-50 text-gray-700'
                      : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-700' : ''}`} />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                )}
                {sidebarOpen && isActive && (
                  <ChevronRight className="h-4 w-4 text-blue-700" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`${sidebarOpen ? 'w-full' : 'w-full px-2'} flex items-center gap-2`}
          >
            <LogIn className="h-4 w-4" />
            {sidebarOpen && '로그아웃'}
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-sm text-gray-600">
                {menuItems.find(item => item.id === activeSection)?.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                메인 사이트
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="h-4 w-4" />
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === 'dashboard' && <DashboardContent />}
          {activeSection === 'members' && <MembersContent />}
          {activeSection === 'materials' && <MaterialsContent />}
          {activeSection === 'pdf-management' && <PdfManagementContent />}
          {activeSection === 'case-studies' && <CaseStudiesContent />}
          {activeSection === 'quotes' && <QuotesContent />}
          {activeSection === 'chat' && <ChatContent />}
          {activeSection === 'site-content' && <SiteContentContent />}
          {activeSection === 'menu-routing' && <MenuRoutingContent />}
          {activeSection === 'system' && <SystemContent />}
        </main>
      </div>
    </div>
  );
}

// 대시보드 콘텐츠
function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 자재</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">견적 요청</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">시공사례</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 채팅</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">새로운 견적 요청이 등록되었습니다.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">PDF 샘플이 업데이트되었습니다.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-gray-600">새로운 채팅 상담이 시작되었습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Package className="h-6 w-6" />
                <span className="text-sm">자재 추가</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">PDF 업로드</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Building className="h-6 w-6" />
                <span className="text-sm">사례 등록</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Download className="h-6 w-6" />
                <span className="text-sm">데이터 백업</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 멤버 관리 콘텐츠
function MembersContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>관리자 계정 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">관리자 계정 추가, 수정, 삭제 및 권한 관리 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 자재 관리 콘텐츠
function MaterialsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>자재 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">자재코드 자동증가, 브랜드/분류/시리즈 관리 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// PDF 관리 콘텐츠
function PdfManagementContent() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF·이미지 변환&슬라이더 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">PDF 업로드, 페이지별 이미지 추출, 슬라이더 관리 기능입니다.</p>
          <Button onClick={() => navigate('/admin-pdf')}>
            PDF 관리 페이지로 이동
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// 시공사례 관리 콘텐츠
function CaseStudiesContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>시공사례 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">시공사례 등록, 수정, 삭제 및 자재 연동 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 견적 관리 콘텐츠
function QuotesContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>자동견적·문의 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">견적 요청 및 문의 관리, 자재 검색 연동 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 채팅 관리 콘텐츠
function ChatContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>채팅 상담 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">실시간 채팅 상담 관리, 상담사 답변 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 사이트 콘텐츠 관리
function SiteContentContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>사이트 텍스트·회사정보 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">회사정보, 운영시간, 사업자정보, 푸터 레이아웃 관리 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 메뉴 라우팅 관리
function MenuRoutingContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>메뉴·링크 라우팅 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">서비스 카드 노출/링크/레이아웃, 빠른 링크 토글 관리 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 시스템 설정 관리
function SystemContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>시스템 설정/백업</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">비밀번호 변경, 관리자 초대, 데이터 백업, 로그 관리 기능이 여기에 구현됩니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}