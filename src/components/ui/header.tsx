import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, Menu, X, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// 소셜 로그인 아이콘 컴포넌트들
const NaverIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="3" fill="#03C75A"/>
    <path d="M13.25 5.5H16.5V14.5H13.25L10.75 10.5V14.5H7.5V5.5H10.75L13.25 9.5V5.5Z" fill="white"/>
  </svg>
);

const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="3" fill="#FEE500"/>
    <path d="M10 6C7.24 6 5 7.79 5 10.01C5 11.42 5.78 12.66 7 13.38L6.5 15.5L8.62 14.25C9.06 14.32 9.52 14.36 10 14.36C12.76 14.36 15 12.57 15 10.35C15 8.13 12.76 6.34 10 6.34V6Z" fill="#000000"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.2 10.2C18.2 9.6 18.15 9 18.05 8.4H10V11.8H14.6C14.4 12.8 13.8 13.7 12.9 14.3V16.3H15.7C17.3 14.8 18.2 12.7 18.2 10.2Z" fill="#4285F4"/>
    <path d="M10 18C12.4 18 14.4 17.2 15.7 15.8L12.9 14C12.1 14.5 11.1 14.8 10 14.8C7.7 14.8 5.8 13.3 5.1 11.3H2.2V13.3C3.5 15.9 6.5 18 10 18Z" fill="#34A853"/>
    <path d="M5.1 11.3C4.9 10.8 4.9 10.2 5.1 9.7V7.7H2.2C1.4 9.2 1.4 10.8 2.2 12.3L5.1 11.3Z" fill="#FBBC04"/>
    <path d="M10 5.2C11.2 5.2 12.3 5.6 13.1 6.4L15.6 3.9C14.4 2.8 12.4 2 10 2C6.5 2 3.5 4.1 2.2 6.7L5.1 8.7C5.8 6.7 7.7 5.2 10 5.2Z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="3" fill="#1877F2"/>
    <path d="M13.5 6.5H12C11.4 6.5 11 6.9 11 7.5V9H13.5L13 11H11V17H8.5V11H7V9H8.5V7.5C8.5 5.6 9.6 4.5 11.5 4.5H13.5V6.5Z" fill="white"/>
  </svg>
);

interface HeaderProps {
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export default function Header({ showSearch = false, onSearchChange, searchValue = '' }: HeaderProps) {
  const navigate = useNavigate();
  const { member, isAuthenticated, isLoading, actions } = useMember();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleSocialLogin = (provider: string) => {
    // 실제 소셜 로그인 구현은 Wix Members API를 통해 처리됩니다
    console.log(`${provider} 로그인 시도`);
    actions.login();
    setIsLoginDialogOpen(false);
  };

  const handleLogout = () => {
    actions.logout();
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsMobileMenuOpen(false);
  };

  // 관리자 권한 확인 (dongk3089@naver.com만 관리자)
  const isAdmin = isAuthenticated && member?.loginEmail === 'dongk3089@naver.com';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">동경바닥재</span>
            </Link>
          </div>

          {/* 검색바 (옵션) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="제품명, 브랜드명으로 검색하세요"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/search" className="text-gray-700 hover:text-black transition-colors">
              제품검색
            </Link>
            <Link to="/quote" className="text-gray-700 hover:text-black transition-colors">
              견적요청
            </Link>
            
            {/* 샘플북 버튼 */}
            <Button
              onClick={() => navigate('/catalog-trendy')}
              className="bg-black text-white hover:bg-gray-800"
              size="sm"
            >
              샘플북
            </Button>
            
            {/* 관리자 버튼 - dongk3089@naver.com만 표시 */}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-black transition-colors">
                관리자
              </Link>
            )}
            
            {isLoading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-black"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleProfileClick}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>{member?.profile?.nickname || '프로필'}</span>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  로그아웃
                </Button>
              </div>
            ) : (
              <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-gray-800">
                    <LogIn className="h-4 w-4 mr-2" />
                    로그인
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">로그인</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* 소셜 로그인 버튼들 */}
                    <Button
                      onClick={() => handleSocialLogin('naver')}
                      className="w-full h-12 bg-[#03C75A] hover:bg-[#02B050] text-white font-medium"
                    >
                      <NaverIcon />
                      <span className="ml-3">네이버로 로그인</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleSocialLogin('kakao')}
                      className="w-full h-12 bg-[#FEE500] hover:bg-[#E6CE00] text-black font-medium"
                    >
                      <KakaoIcon />
                      <span className="ml-3">카카오톡으로 로그인</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleSocialLogin('google')}
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium"
                    >
                      <GoogleIcon />
                      <span className="ml-3">Google로 로그인</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleSocialLogin('facebook')}
                      className="w-full h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium"
                    >
                      <FacebookIcon />
                      <span className="ml-3">Facebook으로 로그인</span>
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">또는</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleSocialLogin('email')}
                      variant="outline"
                      className="w-full h-12 font-medium"
                    >
                      이메일로 로그인
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* 모바일 검색바 */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <input
              type="text"
              placeholder="제품명, 브랜드명으로 검색하세요"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/search"
                className="block py-2 text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                제품검색
              </Link>
              <Link
                to="/quote"
                className="block py-2 text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                견적요청
              </Link>
              
              {/* 모바일 샘플북 버튼 */}
              <button
                onClick={() => {
                  navigate('/catalog-trendy');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-gray-700 hover:text-black transition-colors"
              >
                샘플북
              </button>
              
              {/* 모바일 관리자 버튼 - dongk3089@naver.com만 표시 */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block py-2 text-gray-700 hover:text-black transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  관리자
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <Button
                    onClick={handleProfileClick}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {member?.profile?.nickname || '프로필'}
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full"
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      setIsLoginDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    로그인
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}