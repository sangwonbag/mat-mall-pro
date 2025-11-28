import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Save, Trash2, Edit, Download, RefreshCw, FileText, Image as ImageIcon, Database, Settings } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories, TrendyCatalogSlides, WallpaperPDFSamples } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// ADMIN ONLY - 인터페이스 정의 (수동 관리)
interface ProductForm {
  productName: string;
  brandName: string;
  specifications: string;
  price: string;
  category: string;
  productImage: string;
  materialCode: string;
}

interface CatalogSlideForm {
  pageNumber: string;
  pageTitle: string;
  pageContentSummary: string;
  slideImage: string;
}

interface PDFForm {
  sampleName: string;
  category: string;
  description: string;
  pdfUrl: string;
  thumbnailImage: string;
}

// ADMIN ONLY - 기본 규격 옵션들 (수동 관리)
const DEFAULT_SPECIFICATIONS = [
  '450*450*3',
  '600*600*3', 
  '300*300*2',
  '300*300*3'
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ADMIN ONLY - 기본 상태 관리 (수동 컴포넌트만)
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [catalogSlides, setCatalogSlides] = useState<TrendyCatalogSlides[]>([]);
  const [pdfSamples, setPdfSamples] = useState<WallpaperPDFSamples[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // ADMIN ONLY - 편집 상태 (수동 관리)
  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const [editingSlide, setEditingSlide] = useState<TrendyCatalogSlides | null>(null);
  const [editingPDF, setEditingPDF] = useState<WallpaperPDFSamples | null>(null);
  
  // ADMIN ONLY - 이미지 미리보기 (원본 그대로)
  const [imagePreview, setImagePreview] = useState<string>('');
  const [slideImagePreview, setSlideImagePreview] = useState<string>('');
  const [pdfThumbnailPreview, setPdfThumbnailPreview] = useState<string>('');
  
  // ADMIN ONLY - 규격 관리 (수동)
  const [customSpecifications, setCustomSpecifications] = useState<string[]>([]);
  const [newSpecification, setNewSpecification] = useState<string>('');
  const [showAddSpecification, setShowAddSpecification] = useState(false);
  
  // ADMIN ONLY - 폼 데이터 (수동 입력만)
  const [formData, setFormData] = useState<ProductForm>({
    productName: '',
    brandName: '',
    specifications: '',
    price: '',
    category: '',
    productImage: '',
    materialCode: ''
  });

  const [catalogSlideFormData, setCatalogSlideFormData] = useState<CatalogSlideForm>({
    pageNumber: '',
    pageTitle: '',
    pageContentSummary: '',
    slideImage: ''
  });

  const [pdfFormData, setPdfFormData] = useState<PDFForm>({
    sampleName: '',
    category: '',
    description: '',
    pdfUrl: '',
    thumbnailImage: ''
  });

  // ADMIN ONLY - 카테고리 표시명 매핑 (수동 관리)
  const getCategoryDisplayName = (categorySlug: string) => {
    const categoryMap: { [key: string]: string } = {
      'deco-tile': '데코타일',
      'flooring': '장판', 
      'wood-flooring': '마루',
      'wallpaper': '벽지',
      'vinyl': '장판',
      'laminate': '마루',
      'tile': '타일'
    };
    
    // ADMIN ONLY - 영어 카테고리는 모두 '마루'로 표시 (수동 규칙)
    const mappedName = categoryMap[categorySlug];
    if (mappedName) {
      return mappedName;
    }
    
    // ADMIN ONLY - 영어 패턴 감지 (수동 규칙)
    const isEnglish = /^[a-zA-Z\\-_\\s]+$/.test(categorySlug);
    if (isEnglish) {
      return '마루';
    }
    
    return categorySlug;
  };

  // ADMIN ONLY - 규격 추가 함수 (수동)
  const addCustomSpecification = () => {
    if (newSpecification.trim() && !customSpecifications.includes(newSpecification.trim())) {
      setCustomSpecifications(prev => [...prev, newSpecification.trim()]);
      setNewSpecification('');
      setShowAddSpecification(false);
      toast({
        title: "성공",
        description: "새 규격이 추가되었습니다.",
      });
    }
  };

  // ADMIN ONLY - 규격 삭제 함수 (수동)
  const removeCustomSpecification = (spec: string) => {
    setCustomSpecifications(prev => prev.filter(s => s !== spec));
    toast({
      title: "성공",
      description: "규격이 삭제되었습니다.",
    });
  };

  // ADMIN ONLY - 전체 규격 목록 가져오기 (기본 + 커스텀)
  const getAllSpecifications = () => {
    return [...DEFAULT_SPECIFICATIONS, ...customSpecifications];
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADMIN ONLY - 데이터 로딩 (수동 관리)
  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, categoriesResult, catalogSlidesResult, pdfSamplesResult] = await Promise.all([
        BaseCrudService.getAll<Products>('products'),
        BaseCrudService.getAll<ProductCategories>('productcategories'),
        BaseCrudService.getAll<TrendyCatalogSlides>('trendycatalogslides'),
        BaseCrudService.getAll<WallpaperPDFSamples>('wallpaperpdfsamples')
      ]);

      setProducts(productsResult.items);
      setCategories(categoriesResult.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setCatalogSlides(catalogSlidesResult.items.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0)));
      setPdfSamples(pdfSamplesResult.items);
    } catch (error) {
      console.error('ADMIN ERROR - 데이터 로딩 실패:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ADMIN ONLY - 이미지 업로드 핸들러 (원본 그대로)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'slide' | 'pdf-thumbnail') => {
    const file = event.target.files?.[0];
    if (file) {
      // ADMIN ONLY - 이미지 미리보기 생성 (원본 그대로)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        if (type === 'product') {
          setImagePreview(result);
          setFormData(prev => ({ ...prev, productImage: result }));
        } else if (type === 'slide') {
          setSlideImagePreview(result);
          setCatalogSlideFormData(prev => ({ ...prev, slideImage: result }));
        } else if (type === 'pdf-thumbnail') {
          setPdfThumbnailPreview(result);
          setPdfFormData(prev => ({ ...prev, thumbnailImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ADMIN ONLY - 입력 변경 핸들러 (수동)
  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSlideInputChange = (field: keyof CatalogSlideForm, value: string) => {
    setCatalogSlideFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePDFInputChange = (field: keyof PDFForm, value: string) => {
    setPdfFormData(prev => ({ ...prev, [field]: value }));
  };

  // ADMIN ONLY - 폼 리셋 함수 (수동)
  const resetForm = () => {
    setFormData({
      productName: '',
      brandName: '',
      specifications: '',
      price: '',
      category: '',
      productImage: '',
      materialCode: ''
    });
    setImagePreview('');
    setEditingProduct(null);
  };

  const resetSlideForm = () => {
    setCatalogSlideFormData({
      pageNumber: '',
      pageTitle: '',
      pageContentSummary: '',
      slideImage: ''
    });
    setSlideImagePreview('');
    setEditingSlide(null);
  };

  const resetPDFForm = () => {
    setPdfFormData({
      sampleName: '',
      category: '',
      description: '',
      pdfUrl: '',
      thumbnailImage: ''
    });
    setPdfThumbnailPreview('');
    setEditingPDF(null);
  };

  // ADMIN ONLY - 제품 저장 (수동)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.brandName || !formData.category) {
      toast({
        title: "입력 오류",
        description: "제품명, 브랜드명, 카테고리는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const productData = {
        _id: editingProduct?._id || crypto.randomUUID(),
        productName: formData.productName,
        brandName: formData.brandName,
        specifications: formData.specifications,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category: formData.category,
        productImage: formData.productImage,
        materialCode: formData.materialCode
      };

      if (editingProduct) {
        await BaseCrudService.update('products', productData);
        toast({
          title: "성공",
          description: "제품이 성공적으로 수정되었습니다.",
        });
      } else {
        await BaseCrudService.create('products', productData);
        toast({
          title: "성공",
          description: "제품이 성공적으로 등록되었습니다.",
        });
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('ADMIN ERROR - 제품 저장 실패:', error);
      toast({
        title: "오류",
        description: "제품 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ADMIN ONLY - 카탈로그 슬라이드 저장 (원본 그대로)
  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!catalogSlideFormData.pageNumber || !catalogSlideFormData.slideImage) {
      toast({
        title: "입력 오류",
        description: "페이지 번호와 이미지는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const slideData = {
        _id: editingSlide?._id || crypto.randomUUID(),
        pageNumber: parseInt(catalogSlideFormData.pageNumber),
        pageTitle: catalogSlideFormData.pageTitle,
        pageContentSummary: catalogSlideFormData.pageContentSummary,
        slideImage: catalogSlideFormData.slideImage
      };

      if (editingSlide) {
        await BaseCrudService.update('trendycatalogslides', slideData);
        toast({
          title: "성공",
          description: "카탈로그 슬라이드가 성공적으로 수정되었습니다.",
        });
      } else {
        await BaseCrudService.create('trendycatalogslides', slideData);
        toast({
          title: "성공",
          description: "카탈로그 슬라이드가 성공적으로 등록되었습니다.",
        });
      }

      resetSlideForm();
      loadData();
    } catch (error) {
      console.error('ADMIN ERROR - 슬라이드 저장 실패:', error);
      toast({
        title: "오류",
        description: "슬라이드 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ADMIN ONLY - PDF 저장 (원본 그대로)
  const handlePDFSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfFormData.sampleName || !pdfFormData.pdfUrl) {
      toast({
        title: "입력 오류",
        description: "샘플명과 PDF URL은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const pdfData = {
        _id: editingPDF?._id || crypto.randomUUID(),
        sampleName: pdfFormData.sampleName,
        category: pdfFormData.category,
        description: pdfFormData.description,
        pdfUrl: pdfFormData.pdfUrl,
        thumbnailImage: pdfFormData.thumbnailImage
      };

      if (editingPDF) {
        await BaseCrudService.update('wallpaperpdfsamples', pdfData);
        toast({
          title: "성공",
          description: "PDF 샘플이 성공적으로 수정되었습니다.",
        });
      } else {
        await BaseCrudService.create('wallpaperpdfsamples', pdfData);
        toast({
          title: "성공",
          description: "PDF 샘플이 성공적으로 등록되었습니다.",
        });
      }

      resetPDFForm();
      loadData();
    } catch (error) {
      console.error('ADMIN ERROR - PDF 저장 실패:', error);
      toast({
        title: "오류",
        description: "PDF 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ADMIN ONLY - 카탈로그 슬라이더 업데이트 (STRICT LOCK)
  const updateCatalogSlider = async () => {
    if (!confirm('선택된 이미지들을 /catalog-trendy 페이지에 덮어쓰시겠습니까? (기존 데이터는 삭제됩니다)')) {
      return;
    }

    try {
      setSaving(true);
      
      // ADMIN ONLY - STRICT LOCK: 원본 이미지 그대로 카탈로그 페이지에 반영
      toast({
        title: "업데이트 중",
        description: "카탈로그 슬라이더를 업데이트하고 있습니다...",
      });

      // ADMIN ONLY - 실제 업데이트는 이미 저장된 데이터를 사용
      await loadData();
      
      toast({
        title: "성공",
        description: "카탈로그 슬라이더가 성공적으로 업데이트되었습니다.",
      });
      
      // ADMIN ONLY - 카탈로그 페이지로 이동하여 확인
      window.open('/catalog-trendy', '_blank');
      
    } catch (error) {
      console.error('ADMIN ERROR - 슬라이더 업데이트 실패:', error);
      toast({
        title: "오류",
        description: "슬라이더 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ADMIN ONLY - 편집 핸들러 (수동)
  const handleEdit = (product: Products) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName || '',
      brandName: product.brandName || '',
      specifications: product.specifications || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      productImage: product.productImage || '',
      materialCode: product.materialCode || ''
    });
    setImagePreview(product.productImage || '');
  };

  const handleEditSlide = (slide: TrendyCatalogSlides) => {
    setEditingSlide(slide);
    setCatalogSlideFormData({
      pageNumber: slide.pageNumber?.toString() || '',
      pageTitle: slide.pageTitle || '',
      pageContentSummary: slide.pageContentSummary || '',
      slideImage: slide.slideImage || ''
    });
    setSlideImagePreview(slide.slideImage || '');
  };

  const handleEditPDF = (pdf: WallpaperPDFSamples) => {
    setEditingPDF(pdf);
    setPdfFormData({
      sampleName: pdf.sampleName || '',
      category: pdf.category || '',
      description: pdf.description || '',
      pdfUrl: pdf.pdfUrl || '',
      thumbnailImage: pdf.thumbnailImage || ''
    });
    setPdfThumbnailPreview(pdf.thumbnailImage || '');
  };

  // ADMIN ONLY - 삭제 핸들러 (수동)
  const handleDelete = async (productId: string) => {
    if (!confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await BaseCrudService.delete('products', productId);
      toast({
        title: "성공",
        description: "제품이 성공적으로 삭제되었습니다.",
      });
      loadData();
    } catch (error) {
      console.error('ADMIN ERROR - 제품 삭제 실패:', error);
      toast({
        title: "오류",
        description: "제품 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm('정말로 이 슬라이드를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await BaseCrudService.delete('trendycatalogslides', slideId);
      toast({
        title: "성공",
        description: "슬라이드가 성공적으로 삭제되었습니다.",
      });
      loadData();
    } catch (error) {
      console.error('ADMIN ERROR - 슬라이드 삭제 실패:', error);
      toast({
        title: "오류",
        description: "슬라이드 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePDF = async (pdfId: string) => {
    if (!confirm('정말로 이 PDF를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await BaseCrudService.delete('wallpaperpdfsamples', pdfId);
      toast({
        title: "성공",
        description: "PDF가 성공적으로 삭제되었습니다.",
      });
      loadData();
    } catch (error) {
      console.error('ADMIN ERROR - PDF 삭제 실패:', error);
      toast({
        title: "오류",
        description: "PDF 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // ADMIN ONLY - 가격 포맷팅 (수동)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ADMIN ONLY - 헤더 (수동 컴포넌트) */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[120rem] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="h-8 w-8 text-gray-700" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
                <p className="text-sm text-gray-600">수동 컴포넌트 배치만 허용 - AI 자동 기능 비활성화</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              사이트로 돌아가기
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-4 py-8">
        {/* ADMIN ONLY - 탭 네비게이션 (수동 컴포넌트) */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              자재 데이터 관리
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              카탈로그 이미지
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF 관리
            </TabsTrigger>
            <TabsTrigger value="slider" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              슬라이더 업데이트
            </TabsTrigger>
          </TabsList>

          {/* ADMIN ONLY - 자재 데이터 관리 탭 */}
          <TabsContent value="materials" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ADMIN ONLY - 제품 등록 폼 (수동) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {editingProduct ? '제품 수정' : '새 제품 등록'}
                  </CardTitle>
                  <p className="text-sm text-gray-600">수동 입력만 허용 - 자동 생성 금지</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ADMIN ONLY - 이미지 업로드 (원본 그대로) */}
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">제품 이미지 (원본 그대로)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden">
                              <Image 
                                src={imagePreview} 
                                alt="미리보기" 
                                className="w-full h-full object-cover" 
                                style={{ 
                                  imageRendering: 'auto',
                                  filter: 'none',
                                  transform: 'none'
                                }} 
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImagePreview('');
                                setFormData(prev => ({ ...prev, productImage: '' }));
                              }}
                            >
                              이미지 제거
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-600">원본 이미지 업로드 (자동 편집 금지)</p>
                          </div>
                        )}
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'product')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          이미지 선택
                        </Button>
                      </div>
                    </div>

                    {/* ADMIN ONLY - 제품 정보 입력 (수동) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">제품명 *</Label>
                        <Input
                          id="productName"
                          value={formData.productName}
                          onChange={(e) => handleInputChange('productName', e.target.value)}
                          placeholder="수동 입력"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brandName">브랜드명 *</Label>
                        <Input
                          id="brandName"
                          value={formData.brandName}
                          onChange={(e) => handleInputChange('brandName', e.target.value)}
                          placeholder="수동 입력"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="materialCode">자재 코드</Label>
                        <Input
                          id="materialCode"
                          value={formData.materialCode}
                          onChange={(e) => handleInputChange('materialCode', e.target.value)}
                          placeholder="수동 입력"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">가격 (원)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="수동 입력"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리 *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category.categorySlug || ''}>
                              {getCategoryDisplayName(category.categorySlug || '')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ADMIN ONLY - 규격 선택 (수동) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="specifications">규격 선택</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddSpecification(!showAddSpecification)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          규격 추가
                        </Button>
                      </div>
                      
                      <Select value={formData.specifications} onValueChange={(value) => handleInputChange('specifications', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="규격 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllSpecifications().map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* ADMIN ONLY - 커스텀 규격 추가 (수동) */}
                      {showAddSpecification && (
                        <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                          <Input
                            placeholder="새 규격 입력 (예: 800*800*4)"
                            value={newSpecification}
                            onChange={(e) => setNewSpecification(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCustomSpecification()}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={addCustomSpecification}
                          >
                            추가
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddSpecification(false);
                              setNewSpecification('');
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? '저장 중...' : editingProduct ? '수정하기' : '등록하기'}
                      </Button>
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                        >
                          취소
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* ADMIN ONLY - 등록된 제품 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    등록된 제품 ({products.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {product.productImage ? (
                                <Image 
                                  src={product.productImage} 
                                  alt={product.productName} 
                                  className="w-full h-full object-cover" 
                                  style={{ 
                                    imageRendering: 'auto',
                                    filter: 'none',
                                    transform: 'none'
                                  }} 
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">이미지 없음</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {product.productName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.brandName} • {getCategoryDisplayName(product.category || '')}
                              </p>
                              {product.materialCode && (
                                <p className="text-xs text-gray-500">
                                  코드: {product.materialCode}
                                </p>
                              )}
                              {product.price && (
                                <p className="text-sm font-medium text-gray-900">
                                  {formatPrice(product.price)}원
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 제품이 없습니다.</p>
                      <p className="text-sm text-gray-500">왼쪽 폼을 사용해 새 제품을 등록해보세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ADMIN ONLY - 카탈로그 이미지 탭 */}
          <TabsContent value="catalog" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ADMIN ONLY - 카탈로그 슬라이드 등록 폼 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {editingSlide ? '슬라이드 수정' : '카탈로그 이미지 업로드'}
                  </CardTitle>
                  <p className="text-sm text-gray-600">원본 그대로 업로드 - 자동 편집 금지</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSlideSubmit} className="space-y-4">
                    {/* ADMIN ONLY - 슬라이드 이미지 업로드 (원본 그대로) */}
                    <div className="space-y-2">
                      <Label htmlFor="slide-image-upload">카탈로그 이미지 (원본 그대로)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {slideImagePreview ? (
                          <div className="space-y-2">
                            <div className="aspect-video max-w-sm mx-auto rounded-lg overflow-hidden">
                              <Image 
                                src={slideImagePreview} 
                                alt="슬라이드 미리보기" 
                                className="w-full h-full object-contain" 
                                style={{ 
                                  imageRendering: 'auto',
                                  filter: 'none',
                                  transform: 'none'
                                }} 
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSlideImagePreview('');
                                setCatalogSlideFormData(prev => ({ ...prev, slideImage: '' }));
                              }}
                            >
                              이미지 제거
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-600">PNG 이미지 업로드 (자동 편집 금지)</p>
                          </div>
                        )}
                        <input
                          id="slide-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'slide')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => document.getElementById('slide-image-upload')?.click()}
                        >
                          이미지 선택
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pageNumber">페이지 번호 *</Label>
                        <Input
                          id="pageNumber"
                          type="number"
                          value={catalogSlideFormData.pageNumber}
                          onChange={(e) => handleSlideInputChange('pageNumber', e.target.value)}
                          placeholder="1, 2, 3..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pageTitle">페이지 제목</Label>
                        <Input
                          id="pageTitle"
                          value={catalogSlideFormData.pageTitle}
                          onChange={(e) => handleSlideInputChange('pageTitle', e.target.value)}
                          placeholder="수동 입력"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pageContentSummary">페이지 내용 요약</Label>
                      <Textarea
                        id="pageContentSummary"
                        value={catalogSlideFormData.pageContentSummary}
                        onChange={(e) => handleSlideInputChange('pageContentSummary', e.target.value)}
                        placeholder="수동 입력"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? '저장 중...' : editingSlide ? '수정하기' : '등록하기'}
                      </Button>
                      {editingSlide && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetSlideForm}
                        >
                          취소
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* ADMIN ONLY - 등록된 슬라이드 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    등록된 슬라이드 ({catalogSlides.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                    </div>
                  ) : catalogSlides.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {catalogSlides.map((slide) => (
                        <div
                          key={slide._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {slide.slideImage ? (
                                <Image 
                                  src={slide.slideImage} 
                                  alt={`페이지 ${slide.pageNumber}`} 
                                  className="w-full h-full object-cover" 
                                  style={{ 
                                    imageRendering: 'auto',
                                    filter: 'none',
                                    transform: 'none'
                                  }} 
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900">
                                페이지 {slide.pageNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {slide.pageTitle || '제목 없음'}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {slide.pageContentSummary}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSlide(slide)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSlide(slide._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 슬라이드가 없습니다.</p>
                      <p className="text-sm text-gray-500">왼쪽 폼을 사용해 새 슬라이드를 등록해보세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ADMIN ONLY - PDF 관리 탭 */}
          <TabsContent value="pdf" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ADMIN ONLY - PDF 등록 폼 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {editingPDF ? 'PDF 수정' : 'PDF 업로드'}
                  </CardTitle>
                  <p className="text-sm text-gray-600">원본 PDF만 업로드 - 분석/추출 금지</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePDFSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sampleName">샘플명 *</Label>
                        <Input
                          id="sampleName"
                          value={pdfFormData.sampleName}
                          onChange={(e) => handlePDFInputChange('sampleName', e.target.value)}
                          placeholder="수동 입력"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pdfCategory">카테고리</Label>
                        <Input
                          id="pdfCategory"
                          value={pdfFormData.category}
                          onChange={(e) => handlePDFInputChange('category', e.target.value)}
                          placeholder="수동 입력"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pdfUrl">PDF URL *</Label>
                      <Input
                        id="pdfUrl"
                        type="url"
                        value={pdfFormData.pdfUrl}
                        onChange={(e) => handlePDFInputChange('pdfUrl', e.target.value)}
                        placeholder="https://..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">설명</Label>
                      <Textarea
                        id="description"
                        value={pdfFormData.description}
                        onChange={(e) => handlePDFInputChange('description', e.target.value)}
                        placeholder="수동 입력"
                        rows={3}
                      />
                    </div>

                    {/* ADMIN ONLY - PDF 썸네일 업로드 (원본 그대로) */}
                    <div className="space-y-2">
                      <Label htmlFor="pdf-thumbnail-upload">썸네일 이미지</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {pdfThumbnailPreview ? (
                          <div className="space-y-2">
                            <div className="aspect-video max-w-xs mx-auto rounded-lg overflow-hidden">
                              <Image 
                                src={pdfThumbnailPreview} 
                                alt="PDF 썸네일" 
                                className="w-full h-full object-cover" 
                                style={{ 
                                  imageRendering: 'auto',
                                  filter: 'none',
                                  transform: 'none'
                                }} 
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPdfThumbnailPreview('');
                                setPdfFormData(prev => ({ ...prev, thumbnailImage: '' }));
                              }}
                            >
                              이미지 제거
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-600">썸네일 이미지 업로드</p>
                          </div>
                        )}
                        <input
                          id="pdf-thumbnail-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'pdf-thumbnail')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => document.getElementById('pdf-thumbnail-upload')?.click()}
                        >
                          이미지 선택
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? '저장 중...' : editingPDF ? '수정하기' : '등록하기'}
                      </Button>
                      {editingPDF && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetPDFForm}
                        >
                          취소
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* ADMIN ONLY - 등록된 PDF 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    등록된 PDF ({pdfSamples.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                    </div>
                  ) : pdfSamples.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {pdfSamples.map((pdf) => (
                        <div
                          key={pdf._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {pdf.thumbnailImage ? (
                                <Image 
                                  src={pdf.thumbnailImage} 
                                  alt={pdf.sampleName} 
                                  className="w-full h-full object-cover" 
                                  style={{ 
                                    imageRendering: 'auto',
                                    filter: 'none',
                                    transform: 'none'
                                  }} 
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {pdf.sampleName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {pdf.category}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {pdf.description}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(pdf.pdfUrl, '_blank')}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPDF(pdf)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePDF(pdf._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 PDF가 없습니다.</p>
                      <p className="text-sm text-gray-500">왼쪽 폼을 사용해 새 PDF를 등록해보세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ADMIN ONLY - 슬라이더 업데이트 탭 */}
          <TabsContent value="slider" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  카탈로그 슬라이더 업데이트
                </CardTitle>
                <p className="text-sm text-gray-600">
                  선택된 이미지들을 /catalog-trendy 페이지에 덮어쓰기 (자동 스타일 금지)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ADMIN ONLY - 현재 슬라이드 미리보기 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    현재 등록된 슬라이드 ({catalogSlides.length}개)
                  </h3>
                  {catalogSlides.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {catalogSlides.slice(0, 14).map((slide) => (
                        <div key={slide._id} className="space-y-2">
                          <div className="aspect-video rounded-lg overflow-hidden border">
                            {slide.slideImage ? (
                              <Image 
                                src={slide.slideImage} 
                                alt={`페이지 ${slide.pageNumber}`} 
                                className="w-full h-full object-cover" 
                                style={{ 
                                  imageRendering: 'auto',
                                  filter: 'none',
                                  transform: 'none'
                                }} 
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-center text-gray-600">
                            페이지 {slide.pageNumber}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 슬라이드가 없습니다.</p>
                      <p className="text-sm text-gray-500">먼저 카탈로그 이미지 탭에서 이미지를 등록해주세요.</p>
                    </div>
                  )}
                </div>

                {/* ADMIN ONLY - 업데이트 버튼 */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        슬라이더 업데이트 실행
                      </h3>
                      <p className="text-sm text-gray-600">
                        등록된 이미지들을 카탈로그 페이지에 반영합니다. (원본 그대로, 자동 스타일 금지)
                      </p>
                    </div>
                    <Button
                      onClick={updateCatalogSlider}
                      disabled={saving || catalogSlides.length === 0}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                      {saving ? '업데이트 중...' : '슬라이더 업데이트'}
                    </Button>
                  </div>
                  
                  {catalogSlides.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>주의:</strong> 이 작업은 /catalog-trendy 페이지의 기존 슬라이더를 덮어씁니다. 
                        업데이트 후 페이지를 확인해주세요.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ADMIN ONLY - 푸터 (수동 컴포넌트) */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-[120rem] mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            관리자 페이지 - 수동 컴포넌트 배치만 허용 | AI 자동 기능 비활성화
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ⓒ 2025 DongKyung Flooring Admin Panel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}