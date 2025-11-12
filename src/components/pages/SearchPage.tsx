import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        product.materialCode?.toLowerCase().includes(term) ||
        product.specifications?.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brandName === selectedBrand);
    }

    setFilteredProducts(filtered);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuoteRequest = (product: Products) => {
    navigate('/quote', { state: { selectedProduct: product } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-[120rem] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              동경바닥재
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">홈</Link>
              <Link to="/search" className="text-primary font-semibold">제품검색</Link>
              <Link to="/quote" className="text-foreground hover:text-primary transition-colors">견적요청</Link>
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors">관리자</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-light-gray py-12">
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-heading font-bold text-primary text-center mb-8">
              제품 검색
            </h1>
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="제품명, 브랜드명, 자재코드로 검색하세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full h-14 pl-6 pr-16 text-lg rounded-full border-2 border-gray-200 focus:border-primary"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-2 h-10 w-10 rounded-full bg-primary hover:bg-gold-accent"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.categorySlug || ''}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="브랜드 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 브랜드</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={clearFilters}
                variant="outline"
                className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                필터 초기화
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 bg-white">
        <div className="max-w-[120rem] mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-secondary font-paragraph">검색 중...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-primary">
                  검색 결과 ({filteredProducts.length}개)
                </h2>
              </div>

              {/* 그리드 컨테이너에 중앙 정렬과 더 큰 여백 추가 */}
              <div className="bg-light-gray px-16 py-12 rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[90rem] mx-auto">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      {/* 데코타일 제품은 원본 이미지 그대로 표시 */}
                      {product.category === '데코타일' ? (
                        <Image src={product.productImage || 'https://static.wixstatic.com/media/9f8727_d3600c65e02d403caed35c117b5d44fc~mv2.png?originWidth=384&originHeight=384'} alt={product.productName || '제품 이미지'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" style={{ 
                            imageRendering: 'crisp-edges',
                            filter: 'none',
                            transform: 'none'
                          }} />
                      ) : (
                        <Image
                          src={product.productImage || 'https://static.wixstatic.com/media/9f8727_d3600c65e02d403caed35c117b5d44fc~mv2.png?originWidth=384&originHeight=384'}
                          alt={product.productName || '제품 이미지'}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          width={450}
                        />
                      )}
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-paragraph font-semibold text-primary mb-3">
                        {product.productName}
                      </h3>
                      <p className="text-secondary font-paragraph text-base mb-2">
                        브랜드: {product.brandName}
                      </p>
                      <p className="text-3xl font-paragraph font-bold text-primary mb-6">
                        {product.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => navigate(`/product/${product._id}`)}
                          variant="outline"
                          className="flex-1 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white h-12 text-base"
                        >
                          상세보기
                        </Button>
                        <Button
                          onClick={() => handleQuoteRequest(product)}
                          className="flex-1 rounded-full bg-gold-accent hover:bg-primary h-12 text-base"
                        >
                          견적요청
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-secondary" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-primary mb-4">
                  검색 결과가 없습니다
                </h3>
                <p className="text-secondary font-paragraph mb-8">
                  다른 검색어를 시도하거나 필터를 조정해보세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    필터 초기화
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    className="rounded-full bg-primary hover:bg-gold-accent"
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

      {/* Fixed Quote Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => navigate('/quote')}
          className="px-6 py-4 rounded-full bg-gold-accent hover:bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-paragraph font-semibold"
        >
          전문시공 자동견적 바로가기
        </Button>
      </div>
    </div>
  );
}