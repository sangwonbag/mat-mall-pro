import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories, PopularSearches } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearches[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<{ [key: string]: Products[] }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsResult, categoriesResult, searchesResult] = await Promise.all([
        BaseCrudService.getAll<Products>('products'),
        BaseCrudService.getAll<ProductCategories>('productcategories'),
        BaseCrudService.getAll<PopularSearches>('popularsearches')
      ]);

      setProducts(productsResult.items);
      setCategories(categoriesResult.items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      setPopularSearches(searchesResult.items.filter(item => item.isActive));

      // Group products by category
      const grouped = productsResult.items.reduce((acc, product) => {
        const category = product.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      }, {} as { [key: string]: Products[] });

      setFilteredProducts(grouped);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSearch = (term: string) => {
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchTerm(term);
    setShowDropdown(false);
    handleSearch(term);
  };

  const scrollToCategory = (categorySlug: string) => {
    const element = document.getElementById(`category-${categorySlug}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[120rem] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              동경바닥재
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">홈</Link>
              <Link to="/search" className="text-foreground hover:text-primary transition-colors">제품검색</Link>
              <Link to="/quote" className="text-foreground hover:text-primary transition-colors">견적요청</Link>
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors">관리자</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center bg-light-gray relative">
        <div className="text-center max-w-4xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-heading font-bold text-primary mb-8"
          >
            프리미엄 바닥재를 찾아보세요
          </motion.h1>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-2xl mx-auto"
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="제품명, 브랜드명, 자재코드로 검색하세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                className="w-full h-16 pl-6 pr-20 text-lg rounded-full border-2 border-gray-200 focus:border-primary shadow-lg"
              />
              <Button
                onClick={() => handleSearch(searchTerm)}
                className="absolute right-2 top-2 h-12 w-12 rounded-full bg-primary hover:bg-gold-accent"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setShowDropdown(!showDropdown)}
                className="absolute right-16 top-2 h-12 w-12 rounded-full bg-transparent hover:bg-light-gray text-foreground"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border z-50"
              >
                <div className="p-4">
                  <h3 className="text-sm font-paragraph font-medium text-secondary mb-3">인기 검색어</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <Button
                        key={search._id}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePopularSearchClick(search.searchTerm || '')}
                        className="rounded-full text-sm hover:bg-gold-accent hover:text-white"
                      >
                        {search.searchTerm}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Category Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {categories.map((category) => (
              <Button
                key={category._id}
                onClick={() => scrollToCategory(category.categorySlug || '')}
                className="px-8 py-3 rounded-full bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                {category.categoryName}
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Categories */}
      {categories.map((category) => {
        const categoryProducts = filteredProducts[category.categorySlug || ''] || [];
        
        return (
          <section 
            key={category._id}
            id={`category-${category.categorySlug}`}
            className="py-20 bg-white"
          >
            <div className="max-w-[120rem] mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-heading font-bold text-primary mb-4">
                  {category.categoryName}
                </h2>
                <p className="text-lg font-paragraph text-secondary max-w-2xl mx-auto">
                  {category.categoryDescription}
                </p>
              </div>

              {/* 제품 그리드 - PC 5열, 태블릿 2열, 모바일 2열 */}
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl">
                  {categoryProducts.slice(0, 5).map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-gray-300"
                      style={{ borderRadius: 0 }}
                    >
                      <div className="aspect-square relative bg-gray-50">
                        <Image
                          src={product.productImage || '/placeholder-product.jpg'}
                          alt={product.productName || ''}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: 0 }}
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-paragraph font-medium text-gray-900 mb-1 line-clamp-2">
                          {product.productName}
                        </h3>
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

              {categoryProducts.length > 5 && (
                <div className="text-center mt-12">
                  <Button
                    onClick={() => navigate(`/search?category=${category.categorySlug}`)}
                    variant="outline"
                    className="px-8 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    더 많은 {category.categoryName} 보기
                  </Button>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Fixed Quote Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => navigate('/quote')}
          className="px-6 py-4 rounded-full bg-gold-accent hover:bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-paragraph font-semibold"
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
                <li>시공 견적</li>
                <li>시공사례</li>
                <li>빠른 상담/방문 견적</li>
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
    </div>
  );
}