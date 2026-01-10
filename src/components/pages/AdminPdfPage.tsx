import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, Trash2, Edit, Eye, EyeOff, ArrowUp, ArrowDown, FileText, Image as ImageIcon, Settings, Lock } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { BrandSamplePDFs } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// 관리자 인증 상태
interface AdminAuth {
  isAuthenticated: boolean;
  password: string;
}

// PDF 샘플 폼 데이터
interface PDFSampleForm {
  brandName: string;
  category: string;
  thumbnailImage: string;
  pdfUrl: string;
  sampleBookDescription: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminPdfPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 인증 상태
  const [auth, setAuth] = useState<AdminAuth>({
    isAuthenticated: false,
    password: ''
  });
  
  // 통합 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  
  // 데이터 상태
  const [pdfSamples, setPdfSamples] = useState<BrandSamplePDFs[]>([]);
  const [saving, setSaving] = useState(false);
  
  // 편집 상태
  const [editingItem, setEditingItem] = useState<BrandSamplePDFs | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // 이미지 미리보기
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  // 폼 데이터
  const [formData, setFormData] = useState<PDFSampleForm>({
    brandName: '',
    category: '',
    thumbnailImage: '',
    pdfUrl: '',
    sampleBookDescription: '',
    isActive: true,
    displayOrder: 1
  });

  // 관리자 인증 및 자동 데이터 로드
  const handleLogin = async () => {
    if (auth.password === 'pwj110800*') {
      setAuth({ ...auth, isAuthenticated: true });
      // 로그인 성공 후 자동으로 데이터 로드
      await loadData();
      toast({
        title: "로그인 성공",
        description: "PDF 샘플북 관리 시스템에 접속했습니다.",
      });
    } else {
      toast({
        title: "로그인 실패",
        description: "비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
    }
  };

  // 데이터 로딩
  const loadData = async () => {
    try {
      setIsLoading(true);
      const { items } = await BaseCrudService.getAll<BrandSamplePDFs>('brandsamplepdfs');
      const sortedItems = items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setPdfSamples(sortedItems);
    } catch (error) {
      console.error('PDF 샘플 로딩 실패:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 업로드 핸들러 - 보완된 로직
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 파일 크기 검증
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "파일 크기 오류",
        description: "파일 크기는 10MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    // 파일 형식 검증
    if (!file.type.startsWith('image/')) {
      toast({
        title: "파일 형식 오류",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }
    
    // FileReader를 사용하여 이미지 읽기
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (result) {
          setThumbnailPreview(result);
          setFormData(prev => ({ ...prev, thumbnailImage: result }));
        }
      } catch (error) {
        console.error('이미지 읽기 실패:', error);
        toast({
          title: "오류",
          description: "이미지를 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "오류",
        description: "이미지 파일을 읽을 수 없습니다.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brandName?.trim()) {
      toast({
        title: "입력 오류",
        description: "브랜드명을 입력해 주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.pdfUrl?.trim()) {
      toast({
        title: "입력 오류",
        description: "PDF URL을 입력해 주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const sampleData = {
        _id: editingItem?._id || crypto.randomUUID(),
        brandName: formData.brandName.trim(),
        category: formData.category?.trim() || '',
        thumbnailImage: formData.thumbnailImage || '',
        pdfUrl: formData.pdfUrl.trim(),
        sampleBookDescription: formData.sampleBookDescription?.trim() || '',
        isActive: formData.isActive,
        displayOrder: formData.displayOrder
      };

      if (editingItem) {
        await BaseCrudService.update('brandsamplepdfs', sampleData);
        toast({
          title: "성공",
          description: "PDF 샘플이 성공적으로 수정되었습니다.",
        });
      } else {
        await BaseCrudService.create('brandsamplepdfs', sampleData);
        toast({
          title: "성공",
          description: "PDF 샘플이 성공적으로 등록되었습니다.",
        });
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('PDF 샘플 저장 실패:', error);
      toast({
        title: "오류",
        description: "PDF 샘플 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      brandName: '',
      category: '',
      thumbnailImage: '',
      pdfUrl: '',
      sampleBookDescription: '',
      isActive: true,
      displayOrder: pdfSamples.length + 1
    });
    setThumbnailPreview('');
    setEditingItem(null);
    setShowAddForm(false);
  };

  // 편집 시작
  const handleEdit = (item: BrandSamplePDFs) => {
    setEditingItem(item);
    setFormData({
      brandName: item.brandName || '',
      category: item.category || '',
      thumbnailImage: item.thumbnailImage || '',
      pdfUrl: item.pdfUrl || '',
      sampleBookDescription: item.sampleBookDescription || '',
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder || 1
    });
    setThumbnailPreview(item.thumbnailImage || '');
    setShowAddForm(true);
  };

  // 삭제
  const handleDelete = async (itemId: string) => {
    if (!confirm('정말로 이 PDF 샘플을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await BaseCrudService.delete('brandsamplepdfs', itemId);
      toast({
        title: "성공",
        description: "PDF 샘플이 성공적으로 삭제되었습니다.",
      });
      await loadData();
    } catch (error) {
      console.error('PDF 샘플 삭제 실패:', error);
      toast({
        title: "오류",
        description: "PDF 샘플 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 사용 여부 토글
  const toggleActive = async (item: BrandSamplePDFs) => {
    try {
      const updatedItem = {
        ...item,
        isActive: !item.isActive
      };
      await BaseCrudService.update('brandsamplepdfs', updatedItem);
      toast({
        title: "성공",
        description: `${item.brandName}이(가) ${!item.isActive ? '활성화' : '비활성화'}되었습니다.`,
      });
      await loadData();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: "오류",
        description: "상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 순서 변경 - 안정화된 로직
  const moveItem = async (item: BrandSamplePDFs, direction: 'up' | 'down') => {
    const currentIndex = pdfSamples.findIndex(p => p._id === item._id);
    
    // 범위 검증
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === pdfSamples.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetItem = pdfSamples[newIndex];

    try {
      setSaving(true);
      
      // 순서 교체 - 안정화된 로직
      const currentOrder = item.displayOrder || currentIndex;
      const targetOrder = targetItem.displayOrder || newIndex;
      
      await Promise.all([
        BaseCrudService.update('brandsamplepdfs', {
          ...item,
          displayOrder: targetOrder
        }),
        BaseCrudService.update('brandsamplepdfs', {
          ...targetItem,
          displayOrder: currentOrder
        })
      ]);

      toast({
        title: "성공",
        description: "순서가 변경되었습니다.",
      });
      
      // 데이터 새로고침
      await loadData();
    } catch (error) {
      console.error('순서 변경 실패:', error);
      toast({
        title: "오류",
        description: "순서 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 로그인 화면
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-gray-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              PDF 샘플북 관리 시스템
            </CardTitle>
            <p className="text-sm text-gray-600">관리자 인증이 필요합니다</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={auth.password}
                  onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  placeholder="비밀번호를 입력하세요"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                로그인
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                메인으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[120rem] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-gray-700" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PDF 샘플북 관리</h1>
                <p className="text-sm text-gray-600">브랜드 PDF 샘플 관리 시스템</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  setShowAddForm(true);
                  setFormData(prev => ({ ...prev, displayOrder: pdfSamples.length + 1 }));
                }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                새 샘플 추가
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex items-center gap-2"
              >
                사이트로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 샘플 등록/수정 폼 */}
          {showAddForm && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {editingItem ? 'PDF 샘플 수정' : '새 PDF 샘플 등록'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 썸네일 이미지 업로드 */}
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-upload">썸네일 이미지</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {thumbnailPreview ? (
                        <div className="space-y-2">
                          <div className="aspect-video max-w-xs mx-auto rounded-lg overflow-hidden">
                            <Image 
                              src={thumbnailPreview} 
                              alt="썸네일 미리보기" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setThumbnailPreview('');
                              setFormData(prev => ({ ...prev, thumbnailImage: '' }));
                            }}
                          >
                            이미지 제거
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">썸네일 이미지 업로드</p>
                        </div>
                      )}
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                      >
                        이미지 선택
                      </Button>
                    </div>
                  </div>

                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">브랜드명 *</Label>
                      <Input
                        id="brandName"
                        value={formData.brandName}
                        onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                        placeholder="브랜드명 입력"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="카테고리 입력"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pdfUrl">PDF URL *</Label>
                      <Input
                        id="pdfUrl"
                        type="url"
                        value={formData.pdfUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                        placeholder="https://..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayOrder">표시 순서</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      value={formData.sampleBookDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, sampleBookDescription: e.target.value }))}
                      placeholder="샘플북 설명"
                      rows={3}
                    />
                  </div>

                  {/* 사용 여부 */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">사용 여부</Label>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? '저장 중...' : editingItem ? '수정하기' : '등록하기'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      취소
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* PDF 샘플 목록 */}
          <Card className={showAddForm ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                등록된 PDF 샘플 ({pdfSamples.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                </div>
              ) : pdfSamples.length > 0 ? (
                <div className="space-y-4">
                  {pdfSamples.map((sample, index) => (
                    <div
                      key={sample._id}
                      className={`border rounded-lg p-4 transition-all ${
                        sample.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {sample.thumbnailImage ? (
                            <Image 
                              src={sample.thumbnailImage} 
                              alt={sample.brandName} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {sample.brandName}
                            </h3>
                            <span className="text-sm text-gray-500">
                              #{sample.displayOrder}
                            </span>
                            {sample.isActive ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {sample.category}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {sample.sampleBookDescription}
                          </p>
                          <p className="text-xs text-blue-600 mt-1 truncate">
                            {sample.pdfUrl}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* 순서 변경 */}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveItem(sample, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moveItem(sample, 'down')}
                              disabled={index === pdfSamples.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* 액션 버튼 */}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleActive(sample)}
                              className={sample.isActive ? "text-orange-600" : "text-green-600"}
                            >
                              {sample.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(sample)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(sample._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">등록된 PDF 샘플이 없습니다.</p>
                  <p className="text-sm text-gray-500">새 샘플을 추가해보세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}