import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Products | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await BaseCrudService.getById<Products>('products', id!);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
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

  const handleQuoteRequest = () => {
    if (product) {
      navigate('/quote', { 
        state: { 
          selectedProduct: {
            ...product,
            quantity
          }
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">
            제품을 찾을 수 없습니다
          </h2>
          <Button onClick={() => navigate('/')} className="rounded-full">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

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
            </nav>
          </div>
        </div>
      </header>

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

      {/* Product Detail */}
      <section className="py-12">
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="aspect-square rounded-2xl overflow-hidden shadow-lg"
            >
              <Image
                src={product.productImage || 'https://static.wixstatic.com/media/9f8727_5f2c3af5bb144d5db69a59fc5899a306~mv2.png?originWidth=576&originHeight=576'}
                alt={product.productName || '제품 이미지'}
                className="w-full h-full object-cover"
                width={600}
              />
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-4xl font-heading font-bold text-primary mb-4">
                {product.productName}
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-secondary font-paragraph w-24">브랜드:</span>
                  <span className="font-paragraph font-semibold text-foreground">
                    {product.brandName}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-secondary font-paragraph w-24">자재코드:</span>
                  <span className="font-paragraph font-semibold text-foreground">
                    {product.materialCode}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-secondary font-paragraph w-24">규격:</span>
                  <span className="font-paragraph text-foreground">
                    {product.specifications}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-secondary font-paragraph w-24">카테고리:</span>
                  <span className="font-paragraph text-foreground">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-4xl font-paragraph font-bold text-primary">
                  {product.price ? `${formatPrice(product.price)}원` : '가격 문의'}
                </p>
                {product.price && (
                  <p className="text-secondary font-paragraph mt-2">
                    * 부가세 별도, 시공비 별도
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-lg font-paragraph font-semibold text-foreground mb-4">
                  수량
                </label>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => handleQuantityChange(-1)}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 rounded-full border-2 border-primary"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-paragraph font-bold text-primary w-16 text-center">
                    {quantity}
                  </span>
                  <Button
                    onClick={() => handleQuantityChange(1)}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 rounded-full border-2 border-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleQuoteRequest}
                  className="w-full h-14 text-lg font-paragraph font-semibold rounded-full bg-gold-accent hover:bg-primary transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  견적 요청하기
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate('/search')}
                    variant="outline"
                    className="h-12 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    다른 제품 보기
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="h-12 rounded-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                  >
                    홈으로 가기
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 bg-light-gray">
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">
              제품 상세 정보
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <h3 className="text-xl font-paragraph font-semibold text-primary mb-4">
                품질 보증
              </h3>
              <p className="text-secondary font-paragraph">
                엄선된 프리미엄 자재로 최고의 품질을 보장합니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <h3 className="text-xl font-paragraph font-semibold text-primary mb-4">
                전문 시공
              </h3>
              <p className="text-secondary font-paragraph">
                숙련된 전문가가 직접 시공하여 완벽한 마감을 제공합니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <h3 className="text-xl font-paragraph font-semibold text-primary mb-4">
                A/S 지원
              </h3>
              <p className="text-secondary font-paragraph">
                시공 후에도 지속적인 관리와 A/S를 제공합니다.
              </p>
            </div>
          </div>
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