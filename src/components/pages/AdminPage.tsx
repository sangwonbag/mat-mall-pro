import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Plus, Save, Trash2, Edit, Eye, Home, FileText, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories, ConstructionCaseStudies } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ProductForm {
  productName: string;
  brandName: string;
  specifications: string;
  price: string;
  category: string;
  productImage: string;
}

interface CaseStudyForm {
  productName: string;
  caseStudyTitle: string;
  detailedDescription: string;
  descriptionImage: string;
  projectExampleImage: string;
  productFeatures: string;
  completionDate: string;
}

// 기본 규격 옵션들
const DEFAULT_SPECIFICATIONS = [
  '450*450*3',
  '600*600*3',
  '300*300*2',
  '300*300*3'
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [caseStudies, setCaseStudies] = useState<ConstructionCaseStudies[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const [editingCaseStudy, setEditingCaseStudy] = useState<ConstructionCaseStudies | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [descImagePreview, setDescImagePreview] = useState<string>('');
  const [projectImagePreview, setProjectImagePreview] = useState<string>('');
  
  // 규격 관련 상태
  const [customSpecifications, setCustomSpecifications] = useState<string[]>([]);
  const [newSpecification, setNewSpecification] = useState<string>('');
  const [showAddSpecification, setShowAddSpecification] = useState(false);
  
  const [formData, setFormData] = useState<ProductForm>({
    productName: '',
    brandName: '',
    specifications: '',
    price: '',
    category: '',
    productImage: ''
  });

  const [caseStudyFormData, setCaseStudyFormData] = useState<CaseStudyForm>({
    productName: '',
    caseStudyTitle: '',
    detailedDescription: '',
    descriptionImage: '',
    projectExampleImage: '',
    productFeatures: '',
    completionDate: ''
  });

  // 카테고리 표시명 매핑 함수
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
    
    return categoryMap[categorySlug] || categorySlug;
  };

  // 규격 추가 함수
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

  // 규격 삭제 함수
  const removeCustomSpecification = (spec: string) => {
    setCustomSpecifications(prev => prev.filter(s => s !== spec));
    toast({
      title: "성공",
      description: "규격이 삭제되었습니다.",
    });
  };

  // 전체 규격 목록 가져오기 (기본 + 커스텀)
  const getAllSpecifications = () => {
    return [...DEFAULT_SPECIFICATIONS, ...customSpecifications];
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, categoriesResult, caseStudiesResult] = await Promise.all([
        BaseCrudService.getAll<Products>('products'),
        BaseCrudService.getAll<ProductCategories>('productcategories'),
        BaseCrudService.getAll<ConstructionCaseStudies>('constructioncasestudies')
      ]);

      setProducts(productsResult.items);
      setCategories(categoriesResult.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setCaseStudies(caseStudiesResult.items);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'description' | 'project' = 'product') => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        if (type === 'product') {
          setImagePreview(result);
          setFormData(prev => ({ ...prev, productImage: result }));
        } else if (type === 'description') {
          setDescImagePreview(result);
          setCaseStudyFormData(prev => ({ ...prev, descriptionImage: result }));
        } else if (type === 'project') {
          setProjectImagePreview(result);
          setCaseStudyFormData(prev => ({ ...prev, projectExampleImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCaseStudyInputChange = (field: keyof CaseStudyForm, value: string) => {
    setCaseStudyFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      brandName: '',
      specifications: '',
      price: '',
      category: '',
      productImage: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingProduct(null);
  };

  const resetCaseStudyForm = () => {
    setCaseStudyFormData({
      productName: '',
      caseStudyTitle: '',
      detailedDescription: '',
      descriptionImage: '',
      projectExampleImage: '',
      productFeatures: '',
      completionDate: ''
    });
    setDescImagePreview('');
    setProjectImagePreview('');
    setEditingCaseStudy(null);
  };

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
        productImage: formData.productImage
      };

      if (editingProduct) {
        // 수정
        await BaseCrudService.update('products', productData);
        toast({
          title: "성공",
          description: "제품이 성공적으로 수정되었습니다.",
        });
      } else {
        // 새로 추가
        await BaseCrudService.create('products', productData);
        toast({
          title: "성공",
          description: "제품이 성공적으로 등록되었습니다.",
        });
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "오류",
        description: "제품 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCaseStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseStudyFormData.productName || !caseStudyFormData.caseStudyTitle) {
      toast({
        title: "입력 오류",
        description: "제품명과 케이스 스터디 제목은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const caseStudyData = {
        _id: editingCaseStudy?._id || crypto.randomUUID(),
        productName: caseStudyFormData.productName,
        caseStudyTitle: caseStudyFormData.caseStudyTitle,
        detailedDescription: caseStudyFormData.detailedDescription,
        descriptionImage: caseStudyFormData.descriptionImage,
        projectExampleImage: caseStudyFormData.projectExampleImage,
        productFeatures: caseStudyFormData.productFeatures,
        completionDate: caseStudyFormData.completionDate
      };

      if (editingCaseStudy) {
        // 수정
        await BaseCrudService.update('constructioncasestudies', caseStudyData);
        toast({
          title: "성공",
          description: "케이스 스터디가 성공적으로 수정되었습니다.",
        });
      } else {
        // 새로 추가
        await BaseCrudService.create('constructioncasestudies', caseStudyData);
        toast({
          title: "성공",
          description: "케이스 스터디가 성공적으로 등록되었습니다.",
        });
      }

      resetCaseStudyForm();
      loadData();
    } catch (error) {
      console.error('Error saving case study:', error);
      toast({
        title: "오류",
        description: "케이스 스터디 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Products) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName || '',
      brandName: product.brandName || '',
      specifications: product.specifications || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      productImage: product.productImage || ''
    });
    setImagePreview(product.productImage || '');
  };

  const handleEditCaseStudy = (caseStudy: ConstructionCaseStudies) => {
    setEditingCaseStudy(caseStudy);
    setCaseStudyFormData({
      productName: caseStudy.productName || '',
      caseStudyTitle: caseStudy.caseStudyTitle || '',
      detailedDescription: caseStudy.detailedDescription || '',
      descriptionImage: caseStudy.descriptionImage || '',
      projectExampleImage: caseStudy.projectExampleImage || '',
      productFeatures: caseStudy.productFeatures || '',
      completionDate: caseStudy.completionDate?.toString().split('T')[0] || ''
    });
    setDescImagePreview(caseStudy.descriptionImage || '');
    setProjectImagePreview(caseStudy.projectExampleImage || '');
  };

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
      console.error('Error deleting product:', error);
      toast({
        title: "오류",
        description: "제품 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCaseStudy = async (caseStudyId: string) => {
    if (!confirm('정말로 이 케이스 스터디를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await BaseCrudService.delete('constructioncasestudies', caseStudyId);
      toast({
        title: "성공",
        description: "케이스 스터디가 성공적으로 삭제되었습니다.",
      });
      loadData();
    } catch (error) {
      console.error('Error deleting case study:', error);
      toast({
        title: "오류",
        description: "케이스 스터디 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-[120rem] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              동경바닥재 관리자
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                <Home className="h-4 w-4 inline mr-2" />
                홈으로
              </Link>
              <Link to="/search" className="text-foreground hover:text-primary transition-colors">제품검색</Link>
              <Link to="/quote" className="text-foreground hover:text-primary transition-colors">견적요청</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-[120rem] mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              제품 관리
            </TabsTrigger>
            <TabsTrigger value="casestudies" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              상세설명 & 시공사례 관리
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 제품 등록/수정 폼 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-primary">
                    {editingProduct ? '제품 수정' : '새 제품 등록'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 이미지 업로드 */}
                    <div className="space-y-2">
                      <Label htmlFor="image-upload" className="text-sm font-medium">
                        제품 이미지
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden">
                              <Image src={imagePreview} alt="미리보기" className="w-full h-full object-cover" style={{ 
                                  imageRendering: 'crisp-edges',
                                  filter: 'none',
                                  transform: 'none'
                                }} />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setImagePreview('');
                                setImageFile(null);
                                setFormData(prev => ({ ...prev, productImage: '' }));
                              }}
                            >
                              이미지 제거
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm text-gray-600">
                                클릭하여 이미지를 업로드하세요
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, JPEG 파일 지원
                              </p>
                            </div>
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
                          className="mt-4"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          이미지 선택
                        </Button>
                      </div>
                    </div>

                    {/* ... keep existing code (제품 정보 입력 폼) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">제품명 *</Label>
                        <Input
                          id="productName"
                          value={formData.productName}
                          onChange={(e) => handleInputChange('productName', e.target.value)}
                          placeholder="제품명을 입력하세요"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brandName">브랜드명 *</Label>
                        <Input
                          id="brandName"
                          value={formData.brandName}
                          onChange={(e) => handleInputChange('brandName', e.target.value)}
                          placeholder="브랜드명을 입력하세요"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">가격 (원)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="가격을 입력하세요"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">카테고리 *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리를 선택하세요" />
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

                    {/* 규격 선택 섹션 */}
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
                          <SelectValue placeholder="규격을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllSpecifications().map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* 커스텀 규격 추가 폼 */}
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

                      {/* 커스텀 규격 목록 */}
                      {customSpecifications.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-600">추가된 규격:</Label>
                          <div className="flex flex-wrap gap-2">
                            {customSpecifications.map((spec) => (
                              <div
                                key={spec}
                                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                              >
                                <span>{spec}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-blue-200"
                                  onClick={() => removeCustomSpecification(spec)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
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

              {/* 등록된 제품 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-primary">
                    등록된 제품 ({products.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {products.map((product) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {product.productImage ? (
                                product.category === '데코타일' ? (
                                  <Image src={product.productImage} alt={product.productName} className="w-full h-full object-cover" style={{ 
                                      imageRendering: 'crisp-edges',
                                      filter: 'none',
                                      transform: 'none'
                                    }} />
                                ) : (
                                  <Image
                                    src={product.productImage}
                                    alt={product.productName}
                                    className="w-full h-full object-cover"
                                    width={64}
                                  />
                                )
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">이미지 없음</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-primary truncate">
                                {product.productName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.brandName} • {getCategoryDisplayName(product.category || '')}
                              </p>
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
                                onClick={() => navigate(`/product/${product._id}`)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
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
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 제품이 없습니다.</p>
                      <p className="text-sm text-gray-500">왼쪽 폼을 사용해 새 제품을 등록해보세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="casestudies" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 케이스 스터디 등록/수정 폼 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-primary">
                    {editingCaseStudy ? '상세설명 수정' : '새 상세설명 & 시공사례 등록'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCaseStudySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="caseStudyProductName">제품명 *</Label>
                        <Select value={caseStudyFormData.productName} onValueChange={(value) => handleCaseStudyInputChange('productName', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="제품을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product._id} value={product.productName || ''}>
                                {product.productName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="caseStudyTitle">케이스 스터디 제목 *</Label>
                        <Input
                          id="caseStudyTitle"
                          value={caseStudyFormData.caseStudyTitle}
                          onChange={(e) => handleCaseStudyInputChange('caseStudyTitle', e.target.value)}
                          placeholder="케이스 스터디 제목을 입력하세요"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="detailedDescription">상세 설명</Label>
                      <Textarea
                        id="detailedDescription"
                        value={caseStudyFormData.detailedDescription}
                        onChange={(e) => handleCaseStudyInputChange('detailedDescription', e.target.value)}
                        placeholder="제품의 상세한 설명을 입력하세요"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productFeatures">제품 특징 (줄바꿈으로 구분)</Label>
                      <Textarea
                        id="productFeatures"
                        value={caseStudyFormData.productFeatures}
                        onChange={(e) => handleCaseStudyInputChange('productFeatures', e.target.value)}
                        placeholder="뛰어난 내구성과 품질&#10;친환경 소재 사용&#10;간편한 설치 및 유지보수&#10;다양한 디자인 옵션"
                        rows={4}
                      />
                    </div>

                    {/* 설명 이미지 업로드 */}
                    <div className="space-y-2">
                      <Label htmlFor="description-image-upload" className="text-sm font-medium">
                        설명 이미지
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                        {descImagePreview ? (
                          <div className="space-y-4">
                            <div className="aspect-video max-w-sm mx-auto rounded-lg overflow-hidden">
                              <Image src={descImagePreview} alt="설명 이미지 미리보기" className="w-full h-full object-cover" />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDescImagePreview('');
                                setCaseStudyFormData(prev => ({ ...prev, descriptionImage: '' }));
                              }}
                            >
                              이미지 제거
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-600">설명 이미지 업로드</p>
                          </div>
                        )}
                        <input
                          id="description-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'description')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => document.getElementById('description-image-upload')?.click()}
                        >
                          이미지 선택
                        </Button>
                      </div>
                    </div>

                    {/* 프로젝트 예시 이미지 업로드 */}
                    <div className="space-y-2">
                      <Label htmlFor="project-image-upload" className="text-sm font-medium">
                        시공사례 이미지
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                        {projectImagePreview ? (
                          <div className="space-y-4">
                            <div className="aspect-video max-w-sm mx-auto rounded-lg overflow-hidden">
                              <Image src={projectImagePreview} alt="시공사례 이미지 미리보기" className="w-full h-full object-cover" />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProjectImagePreview('');
                                setCaseStudyFormData(prev => ({ ...prev, projectExampleImage: '' }));
                              }}
                            >
                              이미지 제거
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-600">시공사례 이미지 업로드</p>
                          </div>
                        )}
                        <input
                          id="project-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'project')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => document.getElementById('project-image-upload')?.click()}
                        >
                          이미지 선택
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="completionDate">완료일</Label>
                      <Input
                        id="completionDate"
                        type="date"
                        value={caseStudyFormData.completionDate}
                        onChange={(e) => handleCaseStudyInputChange('completionDate', e.target.value)}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? '저장 중...' : editingCaseStudy ? '수정하기' : '등록하기'}
                      </Button>
                      {editingCaseStudy && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetCaseStudyForm}
                        >
                          취소
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* 등록된 케이스 스터디 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-heading text-primary">
                    등록된 상세설명 & 시공사례 ({caseStudies.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
                    </div>
                  ) : caseStudies.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {caseStudies.map((caseStudy) => (
                        <motion.div
                          key={caseStudy._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              {caseStudy.descriptionImage ? (
                                <Image
                                  src={caseStudy.descriptionImage}
                                  alt={caseStudy.caseStudyTitle}
                                  className="w-full h-full object-cover"
                                  width={64}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-primary truncate">
                                {caseStudy.caseStudyTitle}
                              </h3>
                              <p className="text-sm text-gray-600">
                                제품: {caseStudy.productName}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {caseStudy.detailedDescription}
                              </p>
                              {caseStudy.completionDate && (
                                <p className="text-xs text-gray-400 mt-1">
                                  완료일: {new Date(caseStudy.completionDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCaseStudy(caseStudy)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCaseStudy(caseStudy._id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">등록된 상세설명이 없습니다.</p>
                      <p className="text-sm text-gray-500">왼쪽 폼을 사용해 새 상세설명을 등록해보세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}