import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Plus, Save, Trash2, Edit, Eye, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProductForm {
  productName: string;
  brandName: string;
  specifications: string;
  price: string;
  materialCode: string;
  category: string;
  productImage: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState<ProductForm>({
    productName: '',
    brandName: '',
    specifications: '',
    price: '',
    materialCode: '',
    category: '',
    productImage: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, categoriesResult] = await Promise.all([
        BaseCrudService.getAll<Products>('products'),
        BaseCrudService.getAll<ProductCategories>('productcategories')
      ]);

      setProducts(productsResult.items);
      setCategories(categoriesResult.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, productImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      brandName: '',
      specifications: '',
      price: '',
      materialCode: '',
      category: '',
      productImage: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingProduct(null);
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
        materialCode: formData.materialCode,
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

  const handleEdit = (product: Products) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName || '',
      brandName: product.brandName || '',
      specifications: product.specifications || '',
      price: product.price?.toString() || '',
      materialCode: product.materialCode || '',
      category: product.category || '',
      productImage: product.productImage || ''
    });
    setImagePreview(product.productImage || '');
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
                      onChange={handleImageUpload}
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

                {/* 제품 정보 입력 */}
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
                    <Label htmlFor="materialCode">자재코드</Label>
                    <Input
                      id="materialCode"
                      value={formData.materialCode}
                      onChange={(e) => handleInputChange('materialCode', e.target.value)}
                      placeholder="자재코드를 입력하세요"
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
                          {category.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specifications">제품 설명</Label>
                  <Textarea
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) => handleInputChange('specifications', e.target.value)}
                    placeholder="제품 설명을 입력하세요"
                    rows={4}
                  />
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
                            {product.brandName} • {product.category}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.materialCode}
                          </p>
                          {product.price && (
                            <p className="text-sm font-medium text-primary">
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
      </div>
    </div>
  );
}