import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Home, Menu, X, ChevronDown, ChevronRight, GitCompare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [products, setProducts] = useState<Products[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['전체']);

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
      const [productsResult, categoriesResult] = await Promise.all([
        BaseCrudService.getAll<Products>('products'),
        BaseCrudService.getAll<ProductCategories>('productcategories')
      ]);

      setProducts(productsResult.items);
      setCategories(categoriesResult.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));

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
      // 데코타일 선택 시 deco-tile 카테고리와 매칭
      const categoryToMatch = selectedCategory === '데코타일' ? 'deco-tile' : selectedCategory;
      filtered = filtered.filter(product => product.category === categoryToMatch);
    }

    // Filter by brand
    if (selectedBrand && selectedBrand !== '전체') {
      filtered = filtered.filter(product => product.brandName === selectedBrand);
    }

    setFilteredProducts(filtered);
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
    if (category !== '전체') {
      setExpandedCategories(prev => 
        prev.includes(category) ? prev : [...prev, category]
      );
    }
  };

  const handleBrandSelect = (brand: string, category: string) => {
    setSelectedBrand(brand);
    setSelectedCategory(category);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    
    navigate(`/search?${params.toString()}`);
    filterProducts();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    navigate('/search');
  };

  // 브랜드 사이드바 컴포넌트
  const BrandSidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-200 ${isMobile ? 'h-full' : 'h-screen sticky top-0'} overflow-y-auto`}>
      <style dangerouslySetInnerHTML={{ __html: brandMenuStyles }} />
      <div className="p-6">
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
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 space-y-1 mt-2">
                      {brands.map((brand) => (
                        <div
                          key={brand}
                          className={`brand-sub-menu-item cursor-pointer`}
                          onClick={() => handleBrandSelect(brand, category)}
                        >
                          <span>{brand}</span>
                        </div>
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
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuoteRequest = (product: Products) => {
    navigate('/quote', { state: { selectedProduct: product } });
  };

  return (
    <div className="min-h-screen bg-white font-['Pretendard']">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-[120rem] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-[#2E2E2E]">
              동경바닥재
            </Link>
            <div className="flex items-center space-x-4">
              {/* 모바일 햄버거 메뉴 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-[#2E2E2E]" />
              </Button>
              
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-[#2E2E2E] hover:text-[#B89C7D] transition-colors">홈</Link>
                <Link to="/search" className="text-[#B89C7D] font-semibold">제품검색</Link>
                <Link to="/quote" className="text-[#2E2E2E] hover:text-[#B89C7D] transition-colors">견적요청</Link>
                <Link to="/admin" className="text-[#2E2E2E] hover:text-[#B89C7D] transition-colors">관리자</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
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
                <BrandSidebar isMobile={true} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-h-screen">
          {/* 상단 고정 카테고리 바 */}
          <div className="sticky top-[73px] z-30 bg-white border-b border-gray-200 py-4">
            <div className="max-w-[120rem] mx-auto px-4">
              <div className="flex items-center gap-4 overflow-x-auto">

                {Object.keys(brandStructure).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#B89C7D] text-white'
                        : 'bg-gray-100 text-[#2E2E2E] hover:bg-[#EAE3D8]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Section */}
          <section className="bg-gray-50 py-12">
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

              {/* 선택된 필터 표시 */}
              {(selectedCategory || selectedBrand) && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  {selectedCategory && (
                    <div className="bg-[#B89C7D] text-white px-4 py-2 rounded-full text-sm">
                      카테고리: {getCategoryDisplayName(selectedCategory)}
                    </div>
                  )}
                  {selectedBrand && (
                    <div className="bg-[#B89C7D] text-white px-4 py-2 rounded-full text-sm">
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
              )}
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

                  {/* 제품 그리드 - LX Z:IN 스타일 (PC 6열, 태블릿 3열, 모바일 2열) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8">
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white group cursor-pointer"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {/* 제품 이미지 - 240x240px 정사각형 */}
                        <div className="w-full aspect-square border border-gray-200 rounded-lg overflow-hidden mb-6">
                          <Image
                            src={product.productImage || 'https://static.wixstatic.com/media/9f8727_1063d6b92f31473b8249f4c10cc74041~mv2.png?originWidth=192&originHeight=192'}
                            alt={product.productName || '제품 이미지'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            width={240}
                          />
                        </div>
                        
                        {/* 제품 정보 */}
                        <div className="space-y-2">
                          {/* 소분류/브랜드 */}
                          <h3 className="text-sm font-bold text-[#2E2E2E] line-clamp-2 leading-tight">
                            {product.productName}
                          </h3>
                          
                          <p className="text-xs text-[#A0A0A0] font-normal">
                            {getCategoryDisplayName(product.category || '')} / {product.brandName}
                          </p>
                          
                          {/* 자재명 */}
                          {/* 자재코드 */}
                          <p className="text-xs text-[#A0A0A0] font-normal">
                            {product.materialCode || 'N/A'}
                          </p>
                          
                          {/* 버튼들 */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                // 비교하기 기능 (향후 구현)
                                console.log('비교하기:', product.productName);
                              }}
                              className="flex-1 h-8 text-xs rounded-[10px] bg-[#EAE3D8] text-[#7A6652] hover:bg-[#7A6652] hover:text-[#EAE3D8] transition-colors duration-200 font-medium"
                            >
                              <GitCompare className="h-3 w-3 mr-1" />
                              비교하기
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuoteRequest(product);
                              }}
                              className="flex-1 h-8 text-xs rounded-[10px] bg-[#EAE3D8] text-[#7A6652] hover:bg-[#7A6652] hover:text-[#EAE3D8] transition-colors duration-200 font-medium"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              견적요청
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
    </div>
  );
}