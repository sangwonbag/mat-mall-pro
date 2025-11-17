import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, X, Home, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPhoneNumber } from '@/lib/phone-formatter';

interface QuoteFormData {
  selectedMaterialCode: string;
  selectedMaterialName: string;
  materialQuantity: number;
  area: string;
  address: string;
  name: string;
  phone: string;
  hasElevator: boolean;
  hasCargoElevator: boolean;
  additionalRequests: string;
}

interface ValidationErrors {
  selectedMaterialName?: string;
  materialQuantity?: string;
  area?: string;
  address?: string;
  name?: string;
  phone?: string;
}

export default function QuotePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [products, setProducts] = useState<Products[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<QuoteFormData>({
    selectedMaterialCode: location.state?.selectedProduct?.materialCode || '',
    selectedMaterialName: location.state?.selectedProduct?.productName || '',
    materialQuantity: 1,
    area: '',
    address: '',
    name: '',
    phone: '',
    hasElevator: false,
    hasCargoElevator: false,
    additionalRequests: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      const { items } = await BaseCrudService.getAll<Products>('products');
      setProducts(items);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.productName?.toLowerCase().includes(term) ||
        product.brandName?.toLowerCase().includes(term) ||
        product.specifications?.toLowerCase().includes(term) ||
        product.materialCode?.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.selectedMaterialName.trim()) {
          newErrors.selectedMaterialName = '자재를 선택해주세요.';
        }
        if (!formData.materialQuantity || formData.materialQuantity <= 0) {
          newErrors.materialQuantity = '수량을 입력해주세요.';
        }
        break;
      case 2:
        if (!formData.area) {
          newErrors.area = '시공 면적을 입력해주세요.';
        } else if (parseFloat(formData.area) <= 0) {
          newErrors.area = '올바른 면적을 입력해주세요.';
        }
        break;
      case 3:
        if (!formData.address) {
          newErrors.address = '시공 주소를 입력해주세요.';
        }
        if (!formData.name) {
          newErrors.name = '성명을 입력해주세요.';
        }
        if (!formData.phone) {
          newErrors.phone = '연락처를 입력해주세요.';
        } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
          newErrors.phone = '올바른 연락처를 입력해주세요.';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleQuantityChange = (change: number) => {
    setFormData(prev => ({
      ...prev,
      materialQuantity: Math.max(1, prev.materialQuantity + change)
    }));
  };

  const handleQuantityInputChange = (value: string) => {
    let quantity = parseInt(value) || 1;
    if (quantity < 1) quantity = 1;
    
    setFormData(prev => ({
      ...prev,
      materialQuantity: quantity
    }));
  };

  const handleMaterialSelect = useCallback((product: Products) => {
    setFormData(prev => ({
      ...prev,
      selectedMaterialCode: product.materialCode || '',
      selectedMaterialName: product.productName || ''
    }));
    setIsDialogOpen(false);
    setSearchInputValue('');
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  const executeSearch = useCallback((searchValue: string) => {
    if (isSearching) return;
    
    setIsSearching(true);
    setSearchTerm(searchValue);
    
    // 4자리 숫자 자동 인식
    if (/^\d{4}$/.test(searchValue)) {
      const matchingProducts = products.filter(product => 
        product.materialCode?.includes(searchValue)
      );
      
      if (matchingProducts.length === 1) {
        handleMaterialSelect(matchingProducts[0]);
        setIsSearching(false);
        return;
      } else if (matchingProducts.length > 1) {
        setFilteredProducts(matchingProducts);
        setIsDialogOpen(true);
        setIsSearching(false);
        return;
      }
    }
    
    const filtered = products.filter(product =>
      product.productName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.brandName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.specifications?.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.materialCode?.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    if (filtered.length > 0) {
      setFilteredProducts(filtered);
      setIsDialogOpen(true);
    }
    
    setIsSearching(false);
  }, [products, isSearching, handleMaterialSelect]);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInputValue(value);
  }, []);

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      e.preventDefault();
      executeSearch(searchInputValue);
    }
  }, [searchInputValue, executeSearch, isSearching]);

  const handleSearchIconClick = useCallback(() => {
    if (!isSearching) {
      executeSearch(searchInputValue);
    }
  }, [searchInputValue, executeSearch, isSearching]);

  const handleAreaChange = (area: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, area };
      
      if (area && parseFloat(area) > 0) {
        const areaValue = parseFloat(area);
        const calculatedQuantity = Math.ceil(areaValue);
        newFormData.materialQuantity = calculatedQuantity;
      }
      
      return newFormData;
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    try {
      setIsSubmitted(true);
      
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('견적 요청 중 오류가 발생했습니다.');
    }
  };

  // 견적 완료 화면
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
            견적 완료
          </h2>
          
          <p className="text-gray-600 font-paragraph mb-8 leading-relaxed">
            견적 요청이 성공적으로 접수되었습니다.<br />
            담당자가 확인 후 빠른 시일 내에<br />
            연락드리겠습니다.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-paragraph font-semibold text-gray-900 mb-2">주의사항</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 정확한 견적은 현장 확인 후 제공됩니다</li>
                  <li>• 현장 상황에 따라 견적이 변동될 수 있습니다</li>
                  <li>• 부가세는 별도로 산정됩니다</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            className="w-full h-14 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-paragraph font-semibold text-lg"
          >
            <Home className="h-5 w-5 mr-2" />
            메인으로 돌아가기
          </Button>
        </motion.div>
      </div>
    );
  }

  // 스텝 진행 바 컴포넌트
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
            step <= currentStep 
              ? 'bg-gray-900 border-gray-900 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            <span className="font-semibold">{step}</span>
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
              step < currentStep ? 'bg-gray-900' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // STEP 1: 자재 선택
  const Step1MaterialSelection = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          시공 자재 선택
        </h2>
        <p className="text-gray-600 font-paragraph">
          자재를 검색하거나 목록에서 선택해주세요
        </p>
      </div>

      {/* 선택된 자재 카드 */}
      {formData.selectedMaterialName && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="font-paragraph font-semibold text-lg mb-4 text-gray-900">
            선택된 자재
          </h3>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-paragraph font-semibold text-gray-900">{formData.selectedMaterialName}</h4>
                <p className="text-sm text-gray-600">자재코드: {formData.selectedMaterialCode}</p>
                <p className="text-gray-900 font-paragraph font-bold">가격 문의</p>
              </div>
              <Button
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  selectedMaterialCode: '', 
                  selectedMaterialName: '' 
                }))}
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-full p-0 hover:bg-red-50"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            
            {/* 수량 조절 UI */}
            <div className="flex justify-center">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white" style={{ width: '160px' }}>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  className="w-11 h-11 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formData.materialQuantity <= 1}
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                
                <input
                  type="text"
                  value={formData.materialQuantity}
                  onChange={(e) => handleQuantityInputChange(e.target.value)}
                  className="flex-1 h-11 text-center text-gray-900 bg-white border-0 outline-none font-semibold"
                />
                
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="w-11 h-11 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 자재 검색 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-paragraph font-semibold text-gray-700 mb-2">
              자재 검색
            </label>
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="제품명, 브랜드명 또는 자재번호(예: 5535)를 입력하세요"
                value={searchInputValue}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full h-14 pl-6 pr-12 rounded-xl border-2 border-gray-200 focus:border-gray-900 text-lg"
                disabled={isSearching}
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={handleSearchIconClick}
                disabled={isSearching}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className={`h-5 w-5 ${isSearching ? 'text-gray-300' : 'text-gray-400 hover:text-gray-900'}`} />
              </button>
            </div>
          </div>

          {/* 전체 자재 목록 보기 버튼 */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => {
              setFilteredProducts(products);
              setIsDialogOpen(true);
            }}
          >
            전체 자재 목록 보기
          </Button>
        </div>
      </div>

      {errors.selectedMaterialName && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-paragraph">{errors.selectedMaterialName}</span>
        </div>
      )}

      {/* 자재 목록 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold text-gray-900">
              자재 목록
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleMaterialSelect(product)}
                  className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={product.productImage || 'https://static.wixstatic.com/media/9f8727_89376df88f0947cbadf7a20712511b29~mv2.png?id=placeholder'}
                      alt={product.productName || ''}
                      className="w-16 h-16 object-cover rounded-xl"
                      width={64}
                    />
                    <div className="flex-1">
                      <h4 className="font-paragraph font-semibold text-gray-900">{product.productName}</h4>
                      <p className="text-gray-500 font-paragraph text-sm">{product.brandName}</p>
                      <p className="text-gray-400 font-paragraph text-xs">{product.specifications}</p>
                      <p className="text-gray-900 font-paragraph font-bold text-sm">
                        {product.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">자재코드</p>
                      <p className="font-paragraph font-semibold text-gray-900">{product.materialCode}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="font-paragraph">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );

  // STEP 2: 시공 면적 입력
  const Step2AreaInput = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          시공 면적 입력
        </h2>
        <p className="text-gray-600 font-paragraph">
          시공할 면적을 정확히 입력해주세요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h3 className="text-lg font-paragraph font-semibold text-gray-900 mb-2">
            시공 면적
          </h3>
        </div>

        <div className="relative">
          <Input
            type="number"
            placeholder="25"
            value={formData.area}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full h-16 text-center text-2xl font-paragraph font-bold rounded-xl border-2 border-gray-200 focus:border-gray-900"
            min="1"
            step="0.1"
          />
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-xl font-paragraph font-semibold text-gray-500">
            평
          </div>
        </div>

        {formData.area && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 font-paragraph mb-1">예상 자재 수량</p>
              <p className="text-lg font-paragraph font-bold text-gray-900">
                약 {Math.ceil(parseFloat(formData.area) || 0)}개
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {errors.area && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-paragraph">{errors.area}</span>
        </div>
      )}
    </motion.div>
  );

  // STEP 3: 고객정보
  const Step3CustomerInfo = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          고객정보 입력
        </h2>
        <p className="text-gray-600 font-paragraph">
          견적서 발송을 위한 정보를 입력해주세요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* 시공 주소 */}
        <div>
          <label className="block font-paragraph font-semibold mb-3 text-gray-900">
            시공 주소 *
          </label>
          <Input
            type="text"
            placeholder="서울시 강남구 테헤란로 123"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className={`w-full h-14 rounded-xl border-2 ${errors.address ? 'border-red-300' : 'border-gray-200'} focus:border-gray-900`}
          />
          {errors.address && (
            <div className="flex items-center space-x-2 text-red-500 mt-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-paragraph">{errors.address}</span>
            </div>
          )}
        </div>

        {/* 성명 */}
        <div>
          <label className="block font-paragraph font-semibold mb-3 text-gray-900">
            성명 *
          </label>
          <Input
            type="text"
            placeholder="홍길동"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full h-14 rounded-xl border-2 ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:border-gray-900`}
          />
          {errors.name && (
            <div className="flex items-center space-x-2 text-red-500 mt-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-paragraph">{errors.name}</span>
            </div>
          )}
        </div>

        {/* 연락처 */}
        <div>
          <label className="block font-paragraph font-semibold mb-3 text-gray-900">
            연락처 *
          </label>
          <Input
            type="tel"
            placeholder="010-1234-5678"
            value={formData.phone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setFormData(prev => ({ ...prev, phone: formatted }));
            }}
            className={`w-full h-14 rounded-xl border-2 ${errors.phone ? 'border-red-300' : 'border-gray-200'} focus:border-gray-900`}
          />
          {errors.phone && (
            <div className="flex items-center space-x-2 text-red-500 mt-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-paragraph">{errors.phone}</span>
            </div>
          )}
        </div>

        {/* 엘리베이터/짐 여부 */}
        <div className="space-y-4">
          <h4 className="font-paragraph font-semibold text-gray-900">
            시공 환경 정보
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-paragraph text-gray-900">엘리베이터 이용 가능</span>
              <Switch
                checked={formData.hasElevator}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, hasElevator: checked }))
                }
                className="data-[state=checked]:bg-gray-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-paragraph text-gray-900">화물용 엘리베이터 이용 가능</span>
              <Switch
                checked={formData.hasCargoElevator}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, hasCargoElevator: checked }))
                }
                className="data-[state=checked]:bg-gray-600"
              />
            </div>
          </div>
        </div>

        {/* 추가 요청사항 */}
        <div>
          <label className="block font-paragraph font-semibold mb-3 text-gray-900">
            추가 요청사항
          </label>
          <Textarea
            placeholder="기타 요청사항이나 특이사항을 입력해주세요."
            value={formData.additionalRequests}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalRequests: e.target.value }))}
            className="w-full rounded-xl border-2 border-gray-200 focus:border-gray-900 min-h-[120px] resize-none"
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={() => currentStep > 1 ? handlePrevStep() : navigate(-1)}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading font-bold text-lg text-gray-900">견적 요청</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <StepIndicator />
        
        <AnimatePresence mode="wait">
          {currentStep === 1 && <Step1MaterialSelection key="step1" />}
          {currentStep === 2 && <Step2AreaInput key="step2" />}
          {currentStep === 3 && <Step3CustomerInfo key="step3" />}
        </AnimatePresence>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          {currentStep < 3 ? (
            <Button
              onClick={handleNextStep}
              className="w-full h-14 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-paragraph font-semibold text-lg"
              disabled={
                (currentStep === 1 && (!formData.selectedMaterialName.trim() || !formData.materialQuantity)) ||
                (currentStep === 2 && !formData.area)
              }
            >
              다음 단계
            </Button>
          ) : (
            <div className="space-y-3">
              {/* 견적 요청 내용 표시 */}
              {formData.selectedMaterialName && formData.area && (
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                  <p className="text-sm text-gray-600 font-paragraph mb-1">견적 요청 내용</p>
                  <p className="text-lg font-paragraph font-bold text-gray-900">
                    {formData.selectedMaterialName} × {formData.materialQuantity}개
                  </p>
                  <p className="text-sm text-gray-600 font-paragraph">
                    시공 면적: {formData.area}평
                  </p>
                  <p className="text-xs text-gray-500 font-paragraph mt-1">
                    * 정확한 견적은 현장 확인 후 제공
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleSubmit}
                className="w-full h-14 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-paragraph font-semibold text-lg"
              >
                견적 요청 완료
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-24" />
    </div>
  );
}