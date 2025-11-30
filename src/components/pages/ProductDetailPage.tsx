import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Truck, Shield, Award, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ConstructionCaseStudies } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import Header from '@/components/ui/header';
import ChatSupport from '@/components/ui/chat-support';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Products | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
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

  const handleQuoteRequest = () => {
    if (product) {
      navigate('/quote', { 
        state: { 
          selectedProduct: product
        } 
      });
    }
  };

  const handlePhoneOrder = () => {
    const phoneNumber = '02-487-9775';
    
    // 모바일 기기 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 모바일에서는 직접 전화 연결
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // PC에서는 안내 팝업
      alert(`전화주문 문의\n\n전화번호: ${phoneNumber}\n\n위 번호로 전화하시면 친절하게 상담해드립니다.`);
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
                    <h3 className="font-bold text-gray-900">{product.productName}</h3>
                    <p className="text-2xl font-bold text-black">
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

      <Header />

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
            </div>

            {/* Right Info Section - 55% (720px) */}
            <div className="lg:col-span-7">
              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
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
                  <span className="text-gray-600 w-20 text-sm">규격</span>
                  <span className="font-semibold text-gray-900">{product?.specifications}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-black">
                  {product?.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                  <span className="text-lg text-gray-600 ml-2">/ 개</span>
                </p>
                {product?.price && (
                  <p className="text-gray-500 text-sm mt-1">
                    * 부가세 별도, 시공비 별도
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Button
                    onClick={handlePhoneOrder}
                    className="w-fit px-6 h-7 text-base font-semibold rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    전화주문
                  </Button>
                  <Button
                    onClick={handleQuoteRequest}
                    className="w-fit px-6 h-7 text-base font-semibold rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    즉시 견적요청
                  </Button>
                </div>
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {relatedProduct.productName}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{relatedProduct.brandName}</p>
                    <p className="text-sm font-bold text-black">
                      {relatedProduct.price ? `${formatPrice(relatedProduct.price)}원` : '가격 문의'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Catalog Thumbnails Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">카탈로그 미리보기</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div 
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/catalog-trendy')}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    src="https://static.wixstatic.com/media/9f8727_c36878e83e0b40f2a6268dec84d9cf66~mv2.png?originWidth=192&originHeight=256"
                    alt="카탈로그 페이지 1"
                    className="w-full h-full object-contain"
                    width={200}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-500">페이지 1 (비활성화)</h3>
                </div>
              </div>
              <div 
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/catalog-trendy')}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    src="https://static.wixstatic.com/media/9f8727_6e63855fbcad4be5bcfbae0b494e635f~mv2.png?originWidth=192&originHeight=256"
                    alt="카탈로그 페이지 2"
                    className="w-full h-full object-contain"
                    width={200}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-500">페이지 2 (비활성화)</h3>
                </div>
              </div>
              <div 
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/catalog-trendy')}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    src="https://static.wixstatic.com/media/9f8727_53156884348843598cd72a7ddb773d4d~mv2.png?originWidth=192&originHeight=256"
                    alt="카탈로그 페이지 3"
                    className="w-full h-full object-contain"
                    width={200}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-500">페이지 3 (비활성화)</h3>
                </div>
              </div>
              <div 
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/catalog-trendy')}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    src="https://static.wixstatic.com/media/9f8727_df3d8843ce1a4f8cbe849250cbe5c64f~mv2.png?originWidth=192&originHeight=256"
                    alt="카탈로그 페이지 4"
                    className="w-full h-full object-contain"
                    width={200}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-500">페이지 4 (비활성화)</h3>
                </div>
              </div>
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

      {/* 채팅상담 컴포넌트 */}
      <ChatSupport />
    </div>
  );
}