import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Home, Menu, X, ChevronDown, ChevronRight, Eye, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories, WallpaperPDFSamples } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/ui/header';
import { ChatWidget } from '@/components/ui/chat-widget';

// 브랜드 사이드바 구조 정의
const brandStructure = {
  '전체': [],
  '데코타일': ['KCC', '동신', 'LX', '녹수', '재영', '현대'],
  '장판': ['LX 1.8T', 'LX 2.0T', 'LX 3.0T', 'LX 4.0T', 'LX 5.0T'],
  '마루': ['이건', '동화', '구정'],
  '벽지': ['LX', '개나리', '서울', '제일', '디아이디', '신한(KCC)']
};

// 카테고리 표시명 매핑
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

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '전체');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [products, setProducts] = useState<Products[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [pdfSamples, setPdfSamples] = useState<WallpaperPDFSamples[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['전체']);
  const [expandedTopCategory, setExpandedTopCategory] = useState<string>('');

  // 브랜드 메뉴 스타일 CSS
  const brandMenuStyles = `
    .brand-menu-item {
      color: #222;
      text-decoration: none;
      display: block;
      padding: 12px 0;
    }
    
    .brand-sub-menu-item {
      color: #222;
      text-decoration: none;
      display: block;
      padding: 8px 0;
      font-size: 14px;
    }
  `;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, categoriesResult, pdfSamplesResult] = await Promise.all([
        BaseCrudService.getAll<Products>('products'),
        BaseCrudService.getAll<ProductCategories>('productcategories'),
        BaseCrudService.getAll<WallpaperPDFSamples>('wallpaperpdfsamples')
      ]);

      setProducts(productsResult.items);
      setCategories(categoriesResult.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setPdfSamples(pdfSamplesResult.items);

      // Extract unique brands
      const uniqueBrands = [...new Set(productsResult.items
        .map(p => p.brandName)
        .filter(Boolean))] as string[];
      setBrands(uniqueBrands.sort());

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.productName?.toLowerCase().includes(term) ||
        product.brandName?.toLowerCase().includes(term) ||
        product.specifications?.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== '전체') {
      // 카테고리 매핑 처리
      let categoryToMatch = selectedCategory;
      if (selectedCategory === '데코타일') categoryToMatch = 'deco-tile';
      else if (selectedCategory === '장판') categoryToMatch = 'flooring';
      else if (selectedCategory === '마루') categoryToMatch = 'wood-flooring';
      else if (selectedCategory === '벽지') categoryToMatch = 'wallpaper';
      
      filtered = filtered.filter(product => product.category === categoryToMatch);
    }

    // Filter by brand
    if (selectedBrand && selectedBrand !== '전체') {
      filtered = filtered.filter(product => product.brandName === selectedBrand);
    }

    // Sort by materialCode (numeric ascending order)
    filtered = filtered.sort((a, b) => {
      const codeA = a.materialCode || '';
      const codeB = b.materialCode || '';
      
      // Extract numeric parts from material codes for proper numeric sorting
      const numA = parseInt(codeA.replace(/\D/g, '')) || 0;
      const numB = parseInt(codeB.replace(/\D/g, '')) || 0;
      
      // If numeric parts are different, sort by them
      if (numA !== numB) {
        return numA - numB;
      }
      
      // If numeric parts are same, sort alphabetically
      return codeA.localeCompare(codeB);
    });

    setFilteredProducts(filtered);
  };

  const toggleTopCategory = (category: string) => {
    setExpandedTopCategory(prev => prev === category ? '' : category);
  };

  const handleTopCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedBrand('');
    // 카테고리 선택 시 해당 카테고리 확장
    if (category !== '전체') {
      setExpandedTopCategory(category);
    } else {
      setExpandedTopCategory('');
    }
    filterProducts();
  };

  const handleTopBrandSelect = (brand: string, category: string) => {
    setSelectedBrand(brand);
    setSelectedCategory(category);
    // 브랜드 선택 시에는 카테고리 확장 상태 유지하고 필터링만 수행
    filterProducts();
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedBrand('');
    // 페이지 이동 없이 현재 데이터셋 필터만 업데이트
    if (category !== '전체') {
      setExpandedCategories(prev => 
        prev.includes(category) ? prev : [...prev, category]
      );
    }
    // URL 업데이트 없이 필터링만 수행
    filterProducts();
  };

  const handleBrandSelect = (brand: string, category: string) => {
    setSelectedBrand(brand);
    setSelectedCategory(category);
    // 브랜드 선택 시에는 UI 모션 없이 상품 리스트만 필터링
    filterProducts();
  };

  const handleSearch = () => {
    // URL 업데이트 없이 필터링만 수행
    filterProducts();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setExpandedTopCategory('');
    // URL 업데이트 없이 필터 초기화
    filterProducts();
  };

  // 센스타일 트랜디 카탈로그 PDF 열기 함수
  const openSenstyleCatalog = async () => {
    try {
      // wallpaperpdfsamples에서 센스타일 트랜디 카탈로그 찾기
      const { items } = await BaseCrudService.getAll<WallpaperPDFSamples>('wallpaperpdfsamples');
      const senstyleCatalog = items.find(item => 
        item.sampleName?.includes('센스타일 트랜디') || 
        item.category?.includes('KCC 글라스')
      );
      
      if (senstyleCatalog && senstyleCatalog.pdfUrl) {
        window.open(senstyleCatalog.pdfUrl, '_blank');
      } else {
        // 백업 URL 또는 알림
        console.warn('센스타일 트랜디 카탈로그를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('카탈로그 로딩 중 오류:', error);
    }
  };

  // 브랜드 사이드바 컴포넌트
  const BrandSidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-200 ${isMobile ? 'h-full' : 'h-screen sticky top-0'} overflow-y-auto flex flex-col`}>
      <style dangerouslySetInnerHTML={{ __html: brandMenuStyles }} />
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2E2E2E]">{"브랜드"}</h3>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="p-1"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {Object.entries(brandStructure).map(([category, brands]) => (
            <div key={category}>
              <div
                className={`brand-menu-item cursor-pointer`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  {brands.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category);
                      }}
                      className="p-1 hover:bg-[#B89C7D] hover:text-white transition-colors duration-200"
                    >
                      {expandedCategories.includes(category) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {expandedCategories.includes(category) && brands.length > 0 && (
                  <div className="overflow-hidden">
                    <div className="ml-6 space-y-1 mt-2">
                      {brands.map((brand) => (
                        <div
                          key={brand}
                          className={`brand-sub-menu-item cursor-pointer transition-colors duration-200 ${
                            selectedBrand === brand 
                              ? 'text-[#B89C7D] font-medium' 
                              : 'hover:text-[#B89C7D]'
                          }`}
                          onClick={() => handleBrandSelect(brand, category)}
                        >
                          <span>{brand}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      
      {/* 센스타일 트랜디 카탈로그 고정 버튼 */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={openSenstyleCatalog}
          className="w-full h-12 bg-[#111111] text-white rounded-xl flex flex-col items-center justify-center transition-all duration-180 hover:bg-[#333333] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#333333] focus:ring-offset-2"
        >
          <div className="text-sm font-medium leading-tight">
            센스타일 트랜디 카탈로그 보기
          </div>
          <div className="text-xs text-gray-300 leading-tight">
            KCC 글라스 공식 PDF
          </div>
        </button>
      </div>
    </div>
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuoteRequest = (product: Products) => {
    navigate('/quote', { state: { selectedProduct: product } });
  };

  return (
    <div className="min-h-screen bg-white font-['Pretendard']">
      <Header showSearch={true} onSearchChange={setSearchTerm} searchValue={searchTerm} />
      
      <div className="flex">
        {/* 데스크톱 사이드바 */}
        <div className="hidden md:block">
          <BrandSidebar />
        </div>

        {/* 모바일 사이드바 오버레이 */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-80 h-full bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">카테고리</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <BrandSidebar isMobile={true} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 모바일 햄버거 메뉴 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-20 left-4 z-40 bg-white shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-h-screen">
          {/* 상단 고정 카테고리 바 */}
          <div className="sticky top-[73px] z-30 bg-white border-b border-gray-200 py-4">
            <div className="max-w-[120rem] mx-auto px-4">
              <div className="flex items-center gap-4 overflow-x-auto">
                {Object.entries(brandStructure).map(([category, brands]) => (
                  <div key={category} className="relative">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleTopCategorySelect(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category
                            ? 'bg-[#B89C7D] text-white'
                            : 'bg-gray-100 text-[#2E2E2E] hover:bg-[#EAE3D8]'
                        }`}
                      >
                        {category}
                      </button>
                      {brands.length > 0 && (
                        <button
                          onClick={() => toggleTopCategory(category)}
                          className={`ml-1 p-1 rounded-full transition-colors ${
                            selectedCategory === category
                              ? 'text-white hover:bg-white hover:bg-opacity-20'
                              : 'text-[#2E2E2E] hover:bg-[#EAE3D8]'
                          }`}
                        >
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedTopCategory === category ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                      )}
                    </div>
                    
                    {/* 브랜드 드롭다운 */}
                    <AnimatePresence>
                      {expandedTopCategory === category && brands.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 min-w-[200px]"
                        >
                          <div className="py-2">
                            {brands.map((brand) => (
                              <button
                                key={brand}
                                onClick={() => handleTopBrandSelect(brand, category)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                  selectedBrand === brand
                                    ? 'bg-[#B89C7D] text-white'
                                    : 'text-[#2E2E2E] hover:bg-[#EAE3D8]'
                                }`}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Section */}
          <section className="bg-white py-12">
            <div className="max-w-[120rem] mx-auto px-4">
              <h1 className="text-3xl font-bold text-[#2E2E2E] text-center mb-8">
                제품 검색
              </h1>
              
              {/* Search Bar */}
              <div className="relative mb-6 max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="제품명, 브랜드명으로 검색하세요."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full h-14 pl-6 pr-16 text-lg rounded-full border-2 border-gray-200 focus:border-[#B89C7D]"
                />
                <Button
                  onClick={handleSearch}
                  className="absolute right-2 top-2 h-10 w-10 rounded-full bg-[#2E2E2E] hover:bg-[#B89C7D]"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* 선택된 필터 표시 - 카테고리와 브랜드 */}
              {(selectedCategory && selectedCategory !== '전체') || selectedBrand ? (
                <div className="flex items-center justify-center gap-4 mb-6">
                  {selectedCategory && selectedCategory !== '전체' && (
                    <div className="bg-[#B89C7D] text-white px-4 py-2 rounded-full text-sm">
                      카테고리: {selectedCategory}
                    </div>
                  )}
                  {selectedBrand && (
                    <div className="bg-[#8B7355] text-white px-4 py-2 rounded-full text-sm">
                      브랜드: {selectedBrand}
                    </div>
                  )}
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-2 border-[#2E2E2E] text-[#2E2E2E] hover:bg-[#2E2E2E] hover:text-white"
                  >
                    필터 초기화
                  </Button>
                </div>
              ) : null}
            </div>
          </section>

          {/* Results Section */}
          <section className="py-12 bg-white">
            <div className="max-w-[120rem] mx-auto px-4">
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B89C7D] mx-auto"></div>
                  <p className="mt-4 text-[#A0A0A0]">검색 중...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-[#2E2E2E]">
                      검색 결과 ({filteredProducts.length}개)
                    </h2>
                  </div>

                  {/* 제품 그리드 - 완전히 각진 스타일 (PC 6열, 태블릿 3열, 모바일 2열) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-gray-300 cursor-pointer"
                        style={{ borderRadius: 0 }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {/* 제품 이미지 - 정사각형 */}
                        <div className="w-full aspect-square bg-gray-50 relative">
                          <Image
                            src={product.productImage || 'https://static.wixstatic.com/media/9f8727_1063d6b92f31473b8249f4c10cc74041~mv2.png?originWidth=192&originHeight=192'}
                            alt={product.productName || '제품 이미지'}
                            className="w-full h-full object-cover"
                            style={{ borderRadius: 0 }}
                            width={240}
                          />
                        </div>
                        
                        {/* 제품 정보 */}
                        <div className="p-3">
                          {/* 제품명 */}
                          <h3 className="text-sm font-paragraph font-medium text-gray-900 mb-1 line-clamp-2">
                            {product.productName}
                          </h3>
                          
                          {/* 브랜드 */}
                          <p className="text-xs font-paragraph text-gray-500">
                            {product.brandName}
                          </p>
                          
                          {/* 자재코드 */}
                          {product.materialCode && (
                            <p className="text-xs font-paragraph text-gray-400 mt-1">
                              {product.materialCode}
                            </p>
                          )}
                          
                          {/* 가격 */}
                          {product.price && (
                            <p className="text-sm font-paragraph font-semibold text-gray-900 mt-2">
                              ₩{product.price.toLocaleString()}원
                            </p>
                          )}
                          
                          {/* 버튼들 */}
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${product._id}`);
                              }}
                              size="sm"
                              className="flex-1 h-8 text-xs bg-[#2E2E2E] hover:bg-[#B89C7D] text-white transition-colors duration-200"
                              style={{ borderRadius: 0 }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              상세보기
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuoteRequest(product);
                              }}
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                              style={{ borderRadius: 0 }}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              견적요청
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* PDF 샘플 섹션 - 벽지 카테고리일 때만 표시 */}
                  {(selectedCategory === '벽지' || selectedCategory === 'wallpaper') && pdfSamples.length > 0 && (
                    <div className="mt-16">
                      <div className="border-t border-gray-200 pt-12">
                        <h3 className="text-2xl font-bold text-[#2E2E2E] mb-8 text-center">
                          벽지 샘플 카탈로그
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {pdfSamples
                            .filter(sample => sample.category === '벽지' || sample.category === 'wallpaper')
                            .map((sample) => (
                              <motion.div
                                key={sample._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-[#B89C7D]"
                                style={{ borderRadius: 0 }}
                              >
                                {/* 썸네일 이미지 */}
                                <div className="w-full aspect-[4/3] bg-gray-50 relative">
                                  <Image
                                    src={sample.thumbnailImage || 'https://static.wixstatic.com/media/9f8727_53a3a54e09f14b3ea2e7ac62cd4c2a03~mv2.png?originWidth=256&originHeight=192'}
                                    alt={sample.sampleName || 'PDF 샘플'}
                                    className="w-full h-full object-cover"
                                    style={{ borderRadius: 0 }}
                                    width={300}
                                  />
                                  {/* PDF 아이콘 오버레이 */}
                                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <FileText className="h-12 w-12 text-white" />
                                  </div>
                                </div>
                                
                                {/* 샘플 정보 */}
                                <div className="p-4">
                                  <h4 className="text-lg font-paragraph font-semibold text-gray-900 mb-2">
                                    {sample.sampleName}
                                  </h4>
                                  
                                  {sample.description && (
                                    <p className="text-sm font-paragraph text-gray-600 mb-4 line-clamp-2">
                                      {sample.description}
                                    </p>
                                  )}
                                  
                                  {/* PDF 다운로드 버튼 */}
                                  <Button
                                    onClick={() => {
                                      if (sample.pdfUrl) {
                                        window.open(sample.pdfUrl, '_blank');
                                      }
                                    }}
                                    className="w-full bg-[#2E2E2E] hover:bg-[#B89C7D] text-white transition-colors duration-200"
                                    style={{ borderRadius: 0 }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF 다운로드
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2E2E2E] mb-4">
                      검색 결과가 없습니다
                    </h3>
                    <p className="text-[#A0A0A0] mb-8">
                      다른 검색어를 시도하거나 필터를 조정해보세요.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        className="rounded-full border-2 border-[#2E2E2E] text-[#2E2E2E] hover:bg-[#2E2E2E] hover:text-white"
                      >
                        필터 초기화
                      </Button>
                      <Button
                        onClick={() => navigate('/')}
                        className="rounded-full bg-[#2E2E2E] hover:bg-[#B89C7D]"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        홈으로 돌아가기
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
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

      {/* 채팅상담 위젯 */}
      <ChatWidget />
    </div>
  );
}