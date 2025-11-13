import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, FileText, Send, Plus, Minus, Check, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/ui/header';
import { ChatWidget } from '@/components/ui/chat-widget';

interface QuoteFormData {
  selectedProducts: (Products & { quantity: number })[];
  area: string;
  address: string;
  name: string;
  phone: string;
  includeSubMaterials: boolean;
  includeElevator: boolean;
  includeParking: boolean;
  additionalRequests: string;
}

export default function QuotePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Products[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showQuotePreview, setShowQuotePreview] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<QuoteFormData>({
    selectedProducts: location.state?.selectedProduct ? [{ ...location.state.selectedProduct, quantity: 1 }] : [],
    area: '',
    address: '',
    name: '',
    phone: '',
    includeSubMaterials: false,
    includeElevator: false,
    includeParking: false,
    additionalRequests: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, productSearchTerm]);

  // 외부 클릭 시 자재 리스트 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowProductList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const { items } = await BaseCrudService.getAll<Products>('products');
      setProducts(items);
      setFilteredProducts(items); // 초기에는 모든 제품 표시
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term (동일한 알고리즘 적용)
    if (productSearchTerm.trim()) {
      const term = productSearchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.productName?.toLowerCase().includes(term) ||
        product.brandName?.toLowerCase().includes(term) ||
        product.specifications?.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const calculateTotalPrice = () => {
    if (!formData.selectedProducts.length || !formData.area) return 0;
    
    const area = parseFloat(formData.area);
    let total = 0;
    
    // 선택된 모든 제품의 가격 합계
    formData.selectedProducts.forEach(product => {
      if (product.price) {
        total += product.price * product.quantity * area;
      }
    });
    
    // Add additional costs
    if (formData.includeSubMaterials) total += area * 5000; // 부자재비
    if (formData.includeElevator) total += 50000; // 엘리베이터 사용료
    if (formData.includeParking) total += 30000; // 주차비
    
    return total;
  };

  const handleProductSelect = (product: Products) => {
    // 이미 선택된 제품인지 확인
    const isAlreadySelected = formData.selectedProducts.some(p => p._id === product._id);
    
    if (!isAlreadySelected) {
      setFormData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, { ...product, quantity: 1 }]
      }));
    }
    
    setShowProductList(false);
    setProductSearchTerm('');
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(p => p._id !== productId)
    }));
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map(p => 
        p._id === productId 
          ? { ...p, quantity: Math.max(1, p.quantity + change) }
          : p
      )
    }));
  };

  // 평수 변경 시 자재 갯수 자동 계산
  const handleAreaChange = (area: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, area };
      
      // 평수가 있고 제품이 선택되어 있을 때 자재 갯수 자동 계산
      if (area && prev.selectedProducts.length > 0 && parseFloat(area) > 0) {
        const areaValue = parseFloat(area);
        // 1평당 1개 기준으로 계산 (필요에 따라 조정 가능)
        const calculatedQuantity = Math.ceil(areaValue);
        
        newFormData.selectedProducts = prev.selectedProducts.map(product => ({
          ...product,
          quantity: calculatedQuantity
        }));
      }
      
      return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.selectedProducts.length || !formData.area || !formData.address || !formData.name || !formData.phone) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      // Here you would typically save the quote request to a database
      // For now, we'll just show the preview
      setShowQuotePreview(true);
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('견적 요청 중 오류가 발생했습니다.');
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Here you would save the final quote and send it to the customer
      setIsSubmitted(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting final quote:', error);
      alert('견적서 전송 중 오류가 발생했습니다.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            견적 요청이 완료되었습니다!
          </h2>
          <p className="text-secondary font-paragraph mb-6">
            담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="rounded-full bg-primary hover:bg-gold-accent"
          >
            홈으로 돌아가기
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-light-gray py-4">
        <div className="max-w-[120rem] mx-auto px-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
        </div>
      </div>
      {showQuotePreview ? (
        /* Quote Preview */
        (<section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-primary mb-2">
                  견적서 미리보기
                </h1>
                <p className="text-secondary font-paragraph">
                  아래 내용을 확인하시고 견적 요청을 완료해주세요.
                </p>
              </div>

              <div className="space-y-8">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">고객 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-secondary font-paragraph">성명:</span>
                        <span className="ml-2 font-paragraph font-semibold">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-secondary font-paragraph">연락처:</span>
                        <span className="ml-2 font-paragraph font-semibold">{formData.phone}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-secondary font-paragraph">시공 주소:</span>
                      <span className="ml-2 font-paragraph font-semibold">{formData.address}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">선택 자재</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.selectedProducts.map((product, index) => (
                      <div key={product._id} className={`flex items-center space-x-4 ${index > 0 ? 'pt-4 border-t border-gray-200' : ''}`}>
                        <Image
                          src={product.productImage || 'https://static.wixstatic.com/media/9f8727_70051f61b73140f8bdfb586f2536153f~mv2.png?originWidth=128&originHeight=128'}
                          alt={product.productName || ''}
                          className="w-20 h-20 object-cover rounded-lg"
                          width={80}
                        />
                        <div className="flex-1">
                          <h3 className="font-paragraph font-semibold text-lg price-font">{product.productName}</h3>
                          <p className="text-secondary font-paragraph">자재코드: {product.materialCode}</p>
                          <p className="text-secondary font-paragraph">수량: {product.quantity}개</p>
                          <p className="text-secondary font-paragraph">시공 면적: {formData.area}평</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-paragraph font-bold text-primary price-font">
                            {product.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">견적 내역</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-paragraph">자재비 (총합)</span>
                      <span className="font-paragraph font-semibold price-font">
                        {formatPrice(formData.selectedProducts.reduce((total, product) => {
                          return total + (product.price || 0) * product.quantity * parseFloat(formData.area || '0');
                        }, 0))}원
                      </span>
                    </div>
                    {formData.includeSubMaterials && (
                      <div className="flex justify-between">
                        <span className="font-paragraph">부자재비</span>
                        <span className="font-paragraph font-semibold price-font">
                          {formatPrice(parseFloat(formData.area || '0') * 5000)}원
                        </span>
                      </div>
                    )}
                    {formData.includeElevator && (
                      <div className="flex justify-between">
                        <span className="font-paragraph">엘리베이터 사용료</span>
                        <span className="font-paragraph font-semibold price-font">50,000원</span>
                      </div>
                    )}
                    {formData.includeParking && (
                      <div className="flex justify-between">
                        <span className="font-paragraph">주차비</span>
                        <span className="font-paragraph font-semibold price-font">30,000원</span>
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg">
                        <span className="font-paragraph font-bold">총 견적 금액</span>
                        <span className="font-paragraph font-bold text-primary price-font">
                          {formatPrice(calculateTotalPrice())}원
                        </span>
                      </div>
                      <p className="text-sm text-secondary font-paragraph mt-2">
                        * 부가세 별도, 최종 금액은 현장 상황에 따라 변동될 수 있습니다.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {formData.additionalRequests && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-heading">추가 요청사항</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-paragraph">{formData.additionalRequests}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4 pt-8">
                  <Button
                    onClick={() => setShowQuotePreview(false)}
                    variant="outline"
                    className="flex-1 h-12 rounded-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                  >
                    수정하기
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    className="flex-1 h-12 rounded-full bg-gold-accent hover:bg-primary"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    견적 요청 완료
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>)
      ) : (
        /* Quote Form */
        (<section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-heading font-bold text-primary mb-4">{"전문시공 견적"}</h1>
              <p className="text-lg font-paragraph text-secondary">
                정확한 견적을 위해 아래 정보를 입력해주세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Product Selection */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      자재 선택
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 선택된 자재 리스트 */}
                    {formData.selectedProducts.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-paragraph font-semibold text-lg">선택된 자재</h4>
                        {formData.selectedProducts.map((product) => (
                          <div key={product._id} className="bg-light-gray rounded-xl p-4">
                            <div className="flex items-center space-x-4 mb-4">
                              <Image
                                src={product.productImage || 'https://static.wixstatic.com/media/9f8727_16e4d2bcda3c4a98a10f7f3b0bf463f3~mv2.png?originWidth=128&originHeight=128'}
                                alt={product.productName || ''}
                                className="w-16 h-16 object-cover rounded-lg"
                                width={64}
                              />
                              <div className="flex-1">
                                <h3 className="font-paragraph font-semibold">{product.productName}</h3>
                                <p className="text-secondary font-paragraph text-sm">{product.materialCode}</p>
                                <p className="text-primary font-paragraph font-bold">
                                  {product.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                                </p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => handleRemoveProduct(product._id)}
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 rounded-full p-0 hover:bg-red-50 hover:border-red-200"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-paragraph font-semibold">수량:</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  onClick={() => handleQuantityChange(product._id, -1)}
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 rounded-full"
                                  disabled={product.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-paragraph font-bold w-8 text-center">
                                  {product.quantity}
                                </span>
                                <Button
                                  type="button"
                                  onClick={() => handleQuantityChange(product._id, 1)}
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 rounded-full"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 자재 추가 섹션 */}
                    <div className="space-y-4">
                      {/* 자재 선택 안내 문구 */}
                      <div className="text-center">
                        <h3 className="font-paragraph font-semibold text-lg mb-4">
                          {formData.selectedProducts.length > 0 ? '추가 자재 선택' : '시공할 자재를 선택해주세요'}
                        </h3>
                      </div>

                      {/* 통합된 검색창과 자재 리스트 */}
                      <div className="relative" ref={searchRef}>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="제품명, 브랜드명으로 검색하거나 아래 목록에서 선택하세요"
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            onFocus={() => setShowProductList(true)}
                            className="w-full pl-6 pr-12 rounded-full border-2 border-gray-200 focus:border-[#B89C7D]"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* 자재 리스트 (검색창 아래에 항상 표시되거나 포커스 시 표시) */}
                        {(showProductList || productSearchTerm.length > 0) && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map((product) => {
                                const isSelected = formData.selectedProducts.some(p => p._id === product._id);
                                return (
                                  <div
                                    key={product._id}
                                    onClick={() => handleProductSelect(product)}
                                    className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3 ${
                                      isSelected 
                                        ? 'bg-green-50 hover:bg-green-100' 
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <Image
                                      src={product.productImage || 'https://static.wixstatic.com/media/9f8727_16e4d2bcda3c4a98a10f7f3b0bf463f3~mv2.png?originWidth=128&originHeight=128'}
                                      alt={product.productName || ''}
                                      className="w-12 h-12 object-cover rounded-lg"
                                      width={48}
                                    />
                                    <div className="flex-1">
                                      <h4 className="font-paragraph font-semibold text-sm">{product.productName}</h4>
                                      <p className="text-secondary font-paragraph text-xs">{product.brandName}</p>
                                      <p className="text-primary font-paragraph font-bold text-sm">
                                        {product.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <div className="text-green-600">
                                        <Check className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                {productSearchTerm ? '검색 결과가 없습니다.' : '자재를 불러오는 중...'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 전체 자재 보기 버튼 */}
                      {!showProductList && productSearchTerm.length === 0 && (
                        <Button
                          type="button"
                          onClick={() => setShowProductList(true)}
                          variant="outline"
                          className="w-full rounded-full"
                        >
                          {formData.selectedProducts.length > 0 ? '추가 자재 선택하기' : '전체 자재 목록 보기'}
                        </Button>
                      )}
                    </div>

                    <div>
                      <label className="block font-paragraph font-semibold mb-2">
                        시공 면적 (평) *
                      </label>
                      <Input
                        type="number"
                        placeholder="예: 25"
                        value={formData.area}
                        onChange={(e) => handleAreaChange(e.target.value)}
                        className="rounded-full"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">추가 옵션</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="subMaterials"
                        checked={formData.includeSubMaterials}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, includeSubMaterials: checked as boolean }))
                        }
                      />
                      <label htmlFor="subMaterials" className="font-paragraph text-sm">
                        부자재 포함
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="elevator"
                        checked={formData.includeElevator}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, includeElevator: checked as boolean }))
                        }
                      />
                      <label htmlFor="elevator" className="font-paragraph text-sm">
                        엘리베이터 사용
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="parking"
                        checked={formData.includeParking}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, includeParking: checked as boolean }))
                        }
                      />
                      <label htmlFor="parking" className="font-paragraph text-sm">
                        주차 공간 필요
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Customer Info */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      고객 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block font-paragraph font-semibold mb-2">
                        시공 주소 *
                      </label>
                      <Input
                        type="text"
                        placeholder="서울시 강남구 테헤란로 123"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="rounded-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-paragraph font-semibold mb-2">
                        성명 *
                      </label>
                      <Input
                        type="text"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="rounded-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-paragraph font-semibold mb-2">
                        연락처 *
                      </label>
                      <Input
                        type="tel"
                        placeholder="010-1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="rounded-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-paragraph font-semibold mb-2">
                        추가 요청사항
                      </label>
                      <Textarea
                        placeholder="기타 요청사항이나 특이사항을 입력해주세요."
                        value={formData.additionalRequests}
                        onChange={(e) => setFormData(prev => ({ ...prev, additionalRequests: e.target.value }))}
                        className="rounded-2xl min-h-[120px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Price Preview */}
                {formData.selectedProducts.length > 0 && formData.area && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-heading">예상 견적</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-3xl font-paragraph font-bold text-primary mb-2">
                          {formatPrice(calculateTotalPrice())}원
                        </p>
                        <p className="text-secondary font-paragraph text-sm">
                          * 부가세 별도, 정확한 견적은 현장 확인 후 제공됩니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-paragraph font-semibold rounded-full bg-gold-accent hover:bg-primary"
                  disabled={!formData.selectedProducts.length || !formData.area || !formData.address || !formData.name || !formData.phone}
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  견적서 생성하기
                </Button>
              </div>
            </form>
          </div>
        </section>)
      )}
      {/* Footer */}
      <footer className="bg-primary text-white py-16">
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-heading font-bold mb-4">동경바닥재</h3>
              <p className="font-paragraph text-gray-300 mb-4 text-sm">
                데코타일/장판/마루/벽지<br />
                시공·자재 전문
              </p>
            </div>
            <div>
              <h4 className="text-lg font-paragraph font-semibold mb-4">주요 서비스</h4>
              <ul className="space-y-2 font-paragraph text-gray-300 text-sm">
                <li><Link to="/search" className="hover:text-white transition-colors">제품검색</Link></li>
                <li><Link to="/quote" className="hover:text-white transition-colors">견적요청</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-paragraph font-semibold mb-4">고객센터</h4>
              <div className="font-paragraph text-gray-300 text-sm space-y-1">
                <p>전화: 02-487-9775</p>
                <p>팩스: 02-487-9787</p>
                <p>이메일: dongk3089@naver.com</p>
                <p className="mt-3">
                  운영시간:<br />
                  평일 07:00~18:00<br />
                  주말 07:00~12:00
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-paragraph font-semibold mb-4">회사 정보</h4>
              <div className="font-paragraph text-gray-300 text-sm space-y-1">
                <p>주소: 경기 하남시 서하남로 37</p>
                <p>사업자등록번호: 890-88-02243</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-12 pt-8 text-center">
            <p className="font-paragraph text-gray-400">
              ⓒ 2025 DongKyung Flooring. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 채팅상담 위젯 */}
      <ChatWidget />
    </div>
  );
}