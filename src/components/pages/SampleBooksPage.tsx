import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Menu, X, ChevronDown, ChevronRight, Eye, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { SampleBooks, Products } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/ui/header';
import { ChatWidget } from '@/components/ui/chat-widget';

// 자재 종류 구조 정의
const materialStructure = {
  '전체': [],
  '데코타일': ['KCC', '동신', 'LX', '녹수', '재영', '현대'],
  '장판': ['LX 1.8T', 'LX 2.0T', 'LX 3.0T', 'LX 4.0T', 'LX 5.0T'],
  '마루': ['이건', '동화', '구정'],
  '벽지': ['LX', '개나리', '서울', '제일', '디아이디', '신한(KCC)']
};

export default function SampleBooksPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('전체');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sampleBooks, setSampleBooks] = useState<SampleBooks[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<SampleBooks[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['전체']);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [sampleBooks, searchTerm, selectedMaterial, selectedBrand]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksResult, productsResult] = await Promise.all([
        BaseCrudService.getAll<SampleBooks>('samplebooks'),
        BaseCrudService.getAll<Products>('products')
      ]);

      // Sort by sortOrder
      const sortedBooks = booksResult.items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setSampleBooks(sortedBooks);
      setRelatedProducts(productsResult.items);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = sampleBooks;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(term) ||
        book.brand?.toLowerCase().includes(term) ||
        book.description?.toLowerCase().includes(term)
      );
    }

    // Filter by material category
    if (selectedMaterial && selectedMaterial !== '전체') {
      filtered = filtered.filter(book => book.materialCategory === selectedMaterial);
    }

    // Filter by brand
    if (selectedBrand && selectedBrand !== '전체') {
      filtered = filtered.filter(book => book.brand === selectedBrand);
    }

    // Filter by active status
    filtered = filtered.filter(book => book.isActive !== false);

    setFilteredBooks(filtered);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleMaterialSelect = (material: string) => {
    setSelectedMaterial(material);
    setSelectedBrand('');
    if (material !== '전체') {
      setExpandedCategories(prev =>
        prev.includes(material) ? prev : [...prev, material]
      );
    }
  };

  const handleBrandSelect = (brand: string, material: string) => {
    setSelectedBrand(brand);
    setSelectedMaterial(material);
  };

  const handleSearch = () => {
    filterBooks();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMaterial('전체');
    setSelectedBrand('');
  };

  // 자재 사이드바 컴포넌트
  const MaterialSidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-white border-r border-gray-200 ${isMobile ? 'h-full' : 'h-screen sticky top-0'} overflow-y-auto flex flex-col`}>
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2E2E2E]">자재 종류</h3>
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
          {Object.entries(materialStructure).map(([category, brands]) => (
            <div key={category}>
              <div
                className="cursor-pointer py-3 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => handleMaterialSelect(category)}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${selectedMaterial === category ? 'text-[#B89C7D]' : 'text-[#2E2E2E]'}`}>
                    {category}
                  </span>
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
                          className={`py-2 px-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                            selectedBrand === brand
                              ? 'text-[#B89C7D] font-medium bg-gray-50'
                              : 'text-[#2E2E2E] hover:bg-gray-50'
                          }`}
                          onClick={() => handleBrandSelect(brand, category)}
                        >
                          <span className="text-sm">{brand}</span>
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
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-['Pretendard']">
      <Header showSearch={true} onSearchChange={setSearchTerm} searchValue={searchTerm} />

      <div className="flex">
        {/* 데스크톱 사이드바 */}
        <div className="hidden md:block">
          <MaterialSidebar />
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
                    <h2 className="text-lg font-bold">자재 종류</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <MaterialSidebar isMobile={true} />
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
          {/* Search Section */}
          <section className="bg-white py-12">
            <div className="max-w-[120rem] mx-auto px-4">
              {/* 제목 */}
              <h1 className="text-3xl font-bold text-[#2E2E2E] text-center mb-8">
                샘플북
              </h1>

              {/* Search Bar */}
              <div className="relative mb-6 max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="샘플북명, 브랜드명으로 검색하세요."
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
              {selectedBrand ? (
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="bg-[#8B7355] text-white px-4 py-2 rounded-full text-sm">
                    {selectedMaterial} - {selectedBrand}
                  </div>
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
                  <p className="mt-4 text-[#A0A0A0]">로딩 중...</p>
                </div>
              ) : filteredBooks.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-[#2E2E2E]">
                      샘플북 ({filteredBooks.length}개)
                    </h2>
                  </div>

                  {/* 샘플북 카드 그리드 - 4열 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
                      <motion.div
                        key={book._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300 cursor-pointer flex flex-col"
                        onClick={() => {
                          // 상세 정보 표시 또는 PDF 다운로드
                          if (book.pdfUrl) {
                            window.open(book.pdfUrl, '_blank');
                          }
                        }}
                      >
                        {/* 썸네일 이미지 */}
                        <div className="w-full aspect-square bg-gray-50 relative overflow-hidden">
                          <Image
                            src={book.thumbnailImage || 'https://static.wixstatic.com/media/9f8727_1063d6b92f31473b8249f4c10cc74041~mv2.png?originWidth=300&originHeight=300'}
                            alt={book.title || '샘플북 이미지'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            width={300}
                          />
                        </div>

                        {/* 샘플북 정보 */}
                        <div className="p-4 flex-1 flex flex-col">
                          {/* 제목 */}
                          <h3 className="text-lg font-paragraph font-semibold text-gray-900 mb-2 line-clamp-2">
                            {book.title}
                          </h3>

                          {/* 브랜드 */}
                          <p className="text-sm font-paragraph text-gray-600 mb-1">
                            {book.brand}
                          </p>

                          {/* 자재 종류 */}
                          <p className="text-xs font-paragraph text-gray-500 mb-3">
                            {book.materialCategory}
                          </p>

                          {/* 설명 */}
                          {book.description && (
                            <p className="text-sm font-paragraph text-gray-600 mb-4 line-clamp-2 flex-1">
                              {book.description}
                            </p>
                          )}

                          {/* 버튼들 */}
                          <div className="flex gap-2 mt-auto">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (book.pdfUrl) {
                                  window.open(book.pdfUrl, '_blank');
                                }
                              }}
                              size="sm"
                              className="flex-1 h-10 text-sm bg-[#2E2E2E] hover:bg-[#B89C7D] text-white transition-colors duration-200 rounded-lg"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              다운로드
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/search', { state: { selectedMaterial: book.materialCategory } });
                              }}
                              size="sm"
                              variant="outline"
                              className="flex-1 h-10 text-sm border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              제품보기
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* 선택된 브랜드의 관련 제품 섹션 */}
                  {selectedBrand && (
                    <div className="mt-16">
                      <div className="border-t border-gray-200 pt-12">
                        <h3 className="text-2xl font-bold text-[#2E2E2E] mb-8 text-center">
                          {selectedBrand} 제품
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {relatedProducts
                            .filter(p => p.brandName === selectedBrand)
                            .slice(0, 8)
                            .map((product) => (
                              <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:border-gray-300 cursor-pointer"
                                onClick={() => navigate(`/product/${product._id}`)}
                              >
                                {/* 제품 이미지 */}
                                <div className="w-full aspect-square bg-gray-50 relative">
                                  <Image
                                    src={product.productImage || 'https://static.wixstatic.com/media/9f8727_1063d6b92f31473b8249f4c10cc74041~mv2.png?originWidth=192&originHeight=192'}
                                    alt={product.productName || '제품 이미지'}
                                    className="w-full h-full object-cover"
                                    width={240}
                                  />
                                </div>

                                {/* 제품 정보 */}
                                <div className="p-3">
                                  <h4 className="text-sm font-paragraph font-medium text-gray-900 mb-1 line-clamp-2">
                                    {product.productName}
                                  </h4>
                                  <p className="text-xs font-paragraph text-gray-500">
                                    {product.brandName}
                                  </p>
                                  {product.materialCode && (
                                    <p className="text-xs font-paragraph text-gray-400 mt-1">
                                      {product.materialCode}
                                    </p>
                                  )}
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
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="rounded-full border-2 border-[#2E2E2E] text-[#2E2E2E] hover:bg-[#2E2E2E] hover:text-white"
                    >
                      필터 초기화
                    </Button>
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
                <li><a href="/search" className="hover:text-white transition-colors">제품검색</a></li>
                <li><a href="/quote" className="hover:text-white transition-colors">견적요청</a></li>
                <li><a href="/sample-books" className="hover:text-white transition-colors">샘플북</a></li>
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
