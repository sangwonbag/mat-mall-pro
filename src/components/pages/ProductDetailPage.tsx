import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Heart, Share2, Star, ChevronDown, ChevronUp, Info, Truck, Shield, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ConstructionCaseStudies } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Products | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [area, setArea] = useState(10);
  const [showDetailDescription, setShowDetailDescription] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Products[]>([]);
  const [caseStudy, setCaseStudy] = useState<ConstructionCaseStudies | null>(null);

  // 썸네일 이미지들 (실제로는 같은 이미지를 여러 각도로 보여주는 것처럼 구성)
  const thumbnailImages = [
    product?.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576',
    product?.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576',
    product?.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576',
    product?.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576',
    product?.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576'
  ];

  useEffect(() => {
    if (id) {
      loadProduct();
      loadRelatedProducts();
      loadCaseStudy();
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await BaseCrudService.getById<Products>('products', id!);
      setProduct(productData);
      // 제품 로드 후 케이스 스터디 다시 로드
      setTimeout(() => {
        loadCaseStudy();
      }, 100);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseStudy = async () => {
    try {
      const { items } = await BaseCrudService.getAll<ConstructionCaseStudies>('constructioncasestudies');
      // 현재 제품과 일치하는 케이스 스터디 찾기
      const matchingCaseStudy = items.find(cs => cs.productName === product?.productName);
      setCaseStudy(matchingCaseStudy || null);
    } catch (error) {
      console.error('Error loading case study:', error);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const { items } = await BaseCrudService.getAll<Products>('products');
      // 현재 제품과 같은 카테고리의 다른 제품들 4-6개 선택
      const related = items
        .filter(p => p._id !== id && p.category === product?.category)
        .slice(0, 6);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const calculateEstimate = () => {
    if (!product?.price) return 0;
    const materialCost = product.price * quantity;
    const laborCost = area * 12000; // 평당 시공비 12,000원
    return materialCost + laborCost;
  };

  const handleQuoteRequest = () => {
    if (product) {
      navigate('/quote', { 
        state: { 
          selectedProduct: {
            ...product,
            quantity,
            area
          }
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f6fff]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            제품을 찾을 수 없습니다
          </h2>
          <Button onClick={() => navigate('/')} className="rounded-xl">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Pretendard']">
      {/* Sticky Mini Bar */}
      <AnimatePresence>
        {isScrolled && product && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b z-50"
          >
            <div className="max-w-[1360px] mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={product.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576'}
                      alt={product.productName || ''}
                      className="w-full h-full object-cover"
                      width={48}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 price-font">{product.productName}</h3>
                    <p className="text-2xl font-bold text-[#1f6fff] price-font">
                      {product.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleQuoteRequest}
                  className="bg-black text-white hover:bg-gray-800 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  즉시 견적요청
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1360px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-black">
              동경바닥재
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-black transition-colors">홈</Link>
              <Link to="/search" className="text-gray-700 hover:text-black transition-colors">제품검색</Link>
              <Link to="/quote" className="text-gray-700 hover:text-black transition-colors">견적요청</Link>
              <Link to="/admin" className="text-gray-700 hover:text-black transition-colors">관리자</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3">
        <div className="max-w-[1360px] mx-auto px-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-8">
        <div className="max-w-[1360px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Image Section - 45% (640px) */}
            <div className="lg:col-span-5">
              {/* Main Image */}
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg mb-4">
                <Image
                  src={thumbnailImages[selectedImageIndex]}
                  alt={product?.productName || '제품 이미지'}
                  className="w-full h-full object-cover"
                  width={640}
                />
              </div>
              
              {/* Thumbnail Images - Desktop */}
              <div className="hidden lg:flex space-x-2">
                {thumbnailImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-[#1f6fff] shadow-lg' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`썸네일 ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={64}
                    />
                  </button>
                ))}
              </div>

              {/* Mobile Thumbnail Slider */}
              <div className="lg:hidden">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {thumbnailImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'ring-2 ring-[#1f6fff] shadow-lg' 
                          : 'hover:shadow-lg'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`썸네일 ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={64}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Info Section - 55% (720px) */}
            <div className="lg:col-span-7">
              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 price-font">
                {product?.productName}
              </h1>

              {/* Product Info - 4 Lines */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="text-gray-600 w-20 text-sm">브랜드</span>
                  <span className="font-semibold text-gray-900">{product?.brandName}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 w-20 text-sm">분류</span>
                  <span className="font-semibold text-gray-900">
                    {product?.category === 'deco-tile' ? '데코타일' : product?.category}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 w-20 text-sm">코드</span>
                  <span className="font-semibold text-gray-900">{product?.materialCode}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 w-20 text-sm">규격</span>
                  <span className="font-semibold text-gray-900">{product?.specifications}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-[#1f6fff] price-font">
                  {product?.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                  <span className="text-lg text-gray-600 ml-2">/ 개</span>
                </p>
                {product?.price && (
                  <p className="text-gray-500 text-sm mt-1">
                    * 부가세 별도, 시공비 별도
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">수량</label>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => handleQuantityChange(-1)}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 rounded-lg border-gray-300"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold text-gray-900 w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    onClick={() => handleQuantityChange(1)}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 rounded-lg border-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Options */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">옵션 선택</label>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger className="w-full h-12 rounded-lg">
                    <SelectValue placeholder="옵션을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">표준형</SelectItem>
                    <SelectItem value="premium">프리미엄</SelectItem>
                    <SelectItem value="deluxe">디럭스</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estimate Calculator */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">예상 견적 계산기</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">시공 면적</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setArea(Math.max(1, area - 1))}
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 rounded"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{area}평</span>
                      <Button
                        onClick={() => setArea(area + 1)}
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 rounded"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-sm">
                      <span>자재비 ({quantity}개)</span>
                      <span>{product?.price ? formatPrice(product.price * quantity) : 0}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>시공비 ({area}평)</span>
                      <span>{formatPrice(area * 12000)}원</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>예상 총액</span>
                      <span className="text-[#1f6fff] price-font">{formatPrice(calculateEstimate())}원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleQuoteRequest}
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  즉시 견적요청
                </Button>
                
                <Button
                  onClick={() => setShowDetailDescription(!showDetailDescription)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  상세설명보기
                  {showDetailDescription ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="flex space-x-4 mt-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Heart className="h-4 w-4 mr-1" />
                  찜하기
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Share2 className="h-4 w-4 mr-1" />
                  공유하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Description */}
      <AnimatePresence>
        {showDetailDescription && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50"
          >
            <div className="max-w-[1360px] mx-auto px-4 py-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">제품 상세 설명</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">품질 보증</h3>
                    <p className="text-gray-600 text-sm">엄선된 프리미엄 자재로 최고의 품질을 보장합니다.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">전문 시공</h3>
                    <p className="text-gray-600 text-sm">숙련된 전문가가 직접 시공하여 완벽한 마감을 제공합니다.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Truck className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">빠른 배송</h3>
                    <p className="text-gray-600 text-sm">주문 후 신속한 배송과 설치 서비스를 제공합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Bottom Sections */}
      <section className="py-12 bg-white">
        <div className="max-w-[1360px] mx-auto px-4">
          {/* Tabs */}
          <div className="flex space-x-8 border-b mb-8">
            <button className="pb-4 border-b-2 border-[#1f6fff] text-[#1f6fff] font-semibold">
              이미지형 설명
            </button>
            <button className="pb-4 text-gray-600 hover:text-gray-900">
              시공사례
            </button>
            <button className="pb-4 text-gray-600 hover:text-gray-900">
              리뷰
            </button>
          </div>

          {/* Image Description */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={caseStudy?.descriptionImage || product?.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576'}
                  alt="제품 상세 이미지"
                  className="w-full h-full object-cover"
                  width={400}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {caseStudy?.caseStudyTitle || '제품 특징'}
                </h3>
                {caseStudy?.detailedDescription ? (
                  <p className="text-gray-700 mb-4">{caseStudy.detailedDescription}</p>
                ) : null}
                
                {caseStudy?.productFeatures ? (
                  <ul className="space-y-3 text-gray-700">
                    {caseStudy.productFeatures.split('\n').filter(feature => feature.trim()).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>뛰어난 내구성과 품질</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>친환경 소재 사용</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>간편한 설치 및 유지보수</span>
                    </li>
                    <li className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>다양한 디자인 옵션</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">관련 상품</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct._id}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={relatedProduct.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576'}
                      alt={relatedProduct.productName || ''}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      width={200}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 price-font">
                      {relatedProduct.productName}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{relatedProduct.brandName}</p>
                    <p className="text-sm font-bold text-[#1f6fff] price-font">
                      {relatedProduct.price ? `${formatPrice(relatedProduct.price)}원` : '가격 문의'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fixed Quote Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => navigate('/quote')}
          className="px-6 py-4 rounded-full bg-[#1f6fff] hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
        >
          전문시공 자동견적 바로가기
        </Button>
      </div>
    </div>
  );
}