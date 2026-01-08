import React from 'react';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import Header from '@/components/ui/header';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ProfilePage() {
  const { member, actions } = useMember();

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '정보 없음';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy년 MM월 dd일', { locale: ko });
  };

  const getInitials = (nickname?: string, firstName?: string, lastName?: string) => {
    if (nickname) return nickname.charAt(0).toUpperCase();
    if (firstName && lastName) return `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase();
    if (firstName) return firstName.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필</h1>
          <p className="text-gray-600">계정 정보를 확인하고 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 카드 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={member?.profile?.photo?.url} 
                      alt={member?.profile?.nickname || '프로필 이미지'} 
                    />
                    <AvatarFallback className="text-2xl bg-gray-200">
                      {getInitials(
                        member?.profile?.nickname,
                        member?.contact?.firstName,
                        member?.contact?.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {member?.profile?.nickname || 
                   `${member?.contact?.lastName || ''}${member?.contact?.firstName || ''}` ||
                   '사용자'}
                </CardTitle>
                {member?.profile?.title && (
                  <p className="text-gray-600 mt-1">{member.profile.title}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {member?.loginEmail || '이메일 정보 없음'}
                  </span>
                </div>
                {member?.loginEmailVerified && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">이메일 인증 완료</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    가입일: {formatDate(member?._createdDate)}
                  </span>
                </div>
                {member?.lastLoginDate && (
                  <div className="flex items-center space-x-3 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      최근 로그인: {formatDate(member.lastLoginDate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 계정 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>계정 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">닉네임</label>
                    <p className="mt-1 text-gray-900">
                      {member?.profile?.nickname || '설정되지 않음'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">이메일</label>
                    <p className="mt-1 text-gray-900">
                      {member?.loginEmail || '정보 없음'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">성</label>
                    <p className="mt-1 text-gray-900">
                      {member?.contact?.lastName || '설정되지 않음'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">이름</label>
                    <p className="mt-1 text-gray-900">
                      {member?.contact?.firstName || '설정되지 않음'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">계정 상태</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        member?.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member?.status === 'APPROVED' ? '승인됨' : member?.status || '알 수 없음'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">전화번호</label>
                    <p className="mt-1 text-gray-900">
                      {member?.contact?.phones && member.contact.phones.length > 0 
                        ? member.contact.phones[0] 
                        : '설정되지 않음'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>계정 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    계정 정보 수정이나 기타 설정 변경이 필요하시면 고객센터로 문의해 주세요.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={actions.logout}
                      variant="destructive"
                      className="flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>로그아웃</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}