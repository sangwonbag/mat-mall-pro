import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, FileText, Send, Plus, Minus, Check, Search, X, ChevronRight, Home, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/ui/header';
import { ChatWidget } from '@/components/ui/chat-widget';
import { formatPhoneNumber } from '@/lib/phone-formatter';

interface QuoteFormData {
  materialName: string;
  quantity: number;
  area: string;
  address: string;
  name: string;
  phone: string;
  hasElevator: boolean;
  hasCargoElevator: boolean;
  additionalRequests: string;
}

interface ValidationErrors {
  materialName?: string;
  quantity?: string;
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
  
  const [formData, setFormData] = useState<QuoteFormData>({
    materialName: location.state?.selectedProduct?.productName || '',
    quantity: 1,
    area: '',
    address: '',
    name: '',
    phone: '',
    hasElevator: false,
    hasCargoElevator: false,
    additionalRequests: ''
  });

  // 더 이상 필요하지 않은 useEffect들과 함수들 제거

  const calculateTotalPrice = () => {
    if (!formData.materialName || !formData.area || !formData.quantity) return 0;
    
    const area = parseFloat(formData.area);
    // 기본 가격을 설정하거나 가격 문의로 표시
    // 실제 구현에서는 자재명에 따른 가격 로직을 추가할 수 있습니다
    return 0; // 가격 문의로 처리
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.materialName.trim()) {
          newErrors.materialName = '자재명을 입력해주세요.';
        }
        if (!formData.quantity || formData.quantity <= 0) {
          newErrors.quantity = '수량을 입력해주세요.';
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
      quantity: Math.max(1, prev.quantity + change)
    }));
  };

  const handleQuantityInputChange = (value: string) => {
    // 숫자가 아닌 값이나 0 이하의 값 자동 보정
    let quantity = parseInt(value) || 1;
    if (quantity < 1) quantity = 1;
    
    setFormData(prev => ({
      ...prev,
      quantity
    }));
  };

  // 평수 변경 시 자재 갯수 자동 계산
  const handleAreaChange = (area: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, area };
      
      // 평수가 있을 때 자재 갯수 자동 계산
      if (area && parseFloat(area) > 0) {
        const areaValue = parseFloat(area);
        // 1평당 1개 기준으로 계산 (필요에 따라 조정 가능)
        const calculatedQuantity = Math.ceil(areaValue);
        
        newFormData.quantity = calculatedQuantity;
      }
      
      return newFormData;
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    try {
      // Here you would typically save the quote request to a database
      setIsSubmitted(true);
      
      // Auto redirect after 5 seconds
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <CheckCircle2 className="h-12 w-12 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-heading font-bold text-gray-900 mb-4"
          >
            견적 완료
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 font-paragraph mb-8 leading-relaxed"
          >
            견적 요청이 성공적으로 접수되었습니다.<br />
            담당자가 확인 후 빠른 시일 내에<br />
            연락드리겠습니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100"
          >
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={() => navigate('/')}
              className="w-full h-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-paragraph font-semibold text-lg shadow-lg"
            >
              <Home className="h-5 w-5 mr-2" />
              메인으로 돌아가기
            </Button>
          </motion.div>
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
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 border-teal-500 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {step < currentStep ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="font-semibold">{step}</span>
            )}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
              step < currentStep ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // STEP 1: 자재명 직접 입력
  const Step1MaterialInput = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          시공 자재 입력
        </h2>
        <p className="text-gray-600 font-paragraph">
          시공할 자재명과 수량을 입력해주세요
        </p>
      </div>

      {/* 자재명 입력 */}
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-paragraph font-semibold text-gray-700 mb-2">
                자재명
              </label>
              <Input
                type="text"
                placeholder="예: 강화마루, 타일, 벽지 등"
                value={formData.materialName}
                onChange={(e) => setFormData(prev => ({ ...prev, materialName: e.target.value }))}
                className="w-full h-14 rounded-2xl border-2 border-gray-200 focus:border-teal-500 text-lg"
              />
              {errors.materialName && (
                <div className="flex items-center space-x-2 text-red-500 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-paragraph">{errors.materialName}</span>
                </div>
              )}
            </div>

            {/* 수량 입력 */}
            <div>
              <label className="block text-sm font-paragraph font-semibold text-gray-700 mb-2">
                수량
              </label>
              <div className="flex justify-center">
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden" style={{ width: '165px' }}>
                  <motion.button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-11 h-11 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all duration-160 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl"
                    disabled={formData.quantity <= 1}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </motion.button>
                  
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityInputChange(e.target.value)}
                    className="flex-1 h-11 text-center font-semibold text-gray-900 bg-gray-100 border-0 outline-none"
                    style={{ fontSize: '17px', fontWeight: '600' }}
                  />
                  
                  <motion.button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="w-11 h-11 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all duration-160 rounded-r-xl"
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>
              {errors.quantity && (
                <div className="flex items-center space-x-2 text-red-500 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-paragraph">{errors.quantity}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  // STEP 2: 시공 면적 입력
  const Step2AreaInput = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
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

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Calculator className="h-12 w-12 text-teal-500 mx-auto mb-4" />
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
              className="w-full h-16 text-center text-2xl font-paragraph font-bold rounded-3xl border-2 border-gray-200 focus:border-teal-500"
              min="1"
              step="0.1"
            />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-xl font-paragraph font-semibold text-gray-500">
              평
            </div>
          </div>

          {formData.area && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 font-paragraph mb-1">예상 자재 수량</p>
                <p className="text-lg font-paragraph font-bold text-teal-600">
                  약 {Math.ceil(parseFloat(formData.area) || 0)}개
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {errors.area && (
        <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-paragraph">{errors.area}</span>
        </div>
      )}
    </motion.div>
  );

  // STEP 3: 고객정보 + 엘리베이터/짐 여부
  const Step3CustomerInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
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

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
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
              className={`w-full h-14 rounded-3xl border-2 ${errors.address ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500`}
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
              className={`w-full h-14 rounded-3xl border-2 ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500`}
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
              className={`w-full h-14 rounded-3xl border-2 ${errors.phone ? 'border-red-300' : 'border-gray-200'} focus:border-teal-500`}
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
              <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <Checkbox
                  checked={formData.hasElevator}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasElevator: checked as boolean }))
                  }
                  className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
                <span className="font-paragraph text-gray-900">엘리베이터 이용 가능</span>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <Checkbox
                  checked={formData.hasCargoElevator}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasCargoElevator: checked as boolean }))
                  }
                  className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
                <span className="font-paragraph text-gray-900">화물용 엘리베이터 이용 가능</span>
              </label>
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
              className="w-full rounded-3xl border-2 border-gray-200 focus:border-teal-500 min-h-[120px] resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
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
          <div className="w-9" /> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <StepIndicator />
        
        <AnimatePresence mode="wait">
          {currentStep === 1 && <Step1MaterialInput key="step1" />}
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
              className="w-full h-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-paragraph font-semibold text-lg shadow-lg"
              disabled={
                (currentStep === 1 && (!formData.materialName.trim() || !formData.quantity)) ||
                (currentStep === 2 && !formData.area)
              }
            >
              다음 단계
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <div className="space-y-3">
              {/* 예상 견적 표시 */}
              {formData.materialName && formData.area && (
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-600 font-paragraph mb-1">견적 요청 내용</p>
                  <p className="text-lg font-paragraph font-bold text-teal-600">
                    {formData.materialName} × {formData.quantity}개
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
                className="w-full h-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-paragraph font-semibold text-lg shadow-lg"
              >
                <Send className="h-5 w-5 mr-2" />
                견적 요청 완료
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 하단 여백 (고정 버튼을 위한) */}
      <div className="h-24" />

      {/* 채팅상담 위젯 */}
      <ChatWidget />
    </div>
  );
}