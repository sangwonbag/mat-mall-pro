import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { WallpaperPDFSamples, TrendyCatalogSlides } from '@/entities';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import Header from '@/components/ui/header';

export default function CatalogTrendyPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [catalogData, setCatalogData] = useState<WallpaperPDFSamples | null>(null);
  const [catalogSlides, setCatalogSlides] = useState<TrendyCatalogSlides[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      
      // Load PDF catalog data
      const { items: pdfItems } = await BaseCrudService.getAll<WallpaperPDFSamples>('wallpaperpdfsamples');
      const catalog = pdfItems.find(item => 
        item.sampleName?.includes('KCC 센스타일 트랜디') || 
        item.category?.includes('KCC 글라스') ||
        item.sampleName?.includes('센스타일 트랜디')
      );
      setCatalogData(catalog || null);

      // Load catalog slides data
      const { items: slideItems } = await BaseCrudService.getAll<TrendyCatalogSlides>('trendycatalogslides');
      const sortedSlides = slideItems.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
      setCatalogSlides(sortedSlides);
      
    } catch (error) {
      console.error('Error loading catalog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % catalogSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + catalogSlides.length) % catalogSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dragDistance = e.clientX - dragStart;
    const threshold = 100;
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (catalogData?.pdfUrl) {
      const link = document.createElement('a');
      link.href = catalogData.pdfUrl;
      link.download = 'KCC_센스타일_트랜디_카탈로그.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Pretendard']">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-[#1A1A1A] mb-4" />
          <p className="text-gray-600">카탈로그를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Show message if no slides are available
  if (catalogSlides.length === 0) {
    return (
      <div className="min-h-screen bg-white font-['Pretendard']">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-2xl font-bold text-[#2E2E2E] mb-4">
            KCC 센스타일 트랜디 카탈로그
          </h1>
          <p className="text-gray-600 mb-8">
            카탈로그 데이터를 준비 중입니다. 잠시 후 다시 확인해 주세요.
          </p>
          {catalogData?.pdfUrl && (
            <Button
              onClick={() => window.open(catalogData.pdfUrl, '_blank')}
              className="w-[220px] h-[44px] bg-[#1A1A1A] hover:bg-[#333] text-white font-medium transition-colors duration-200"
              style={{ borderRadius: '8px' }}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF 다운로드
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Pretendard']">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-[120rem] mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2E2E2E] mb-4">
            KCC 센스타일 트랜디 카탈로그
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            KCC 글라스의 프리미엄 센스타일 트랜디 제품군을 한눈에 확인하세요
          </p>
          {catalogSlides.length > 0 && (
            <p className="text-sm text-gray-500">
              총 {catalogSlides.length}페이지의 카탈로그를 확인할 수 있습니다
            </p>
          )}
        </div>
      </section>

      {/* Catalog Slider Section */}
      <section className="py-12 bg-white">
        <div className="max-w-[120rem] mx-auto px-4">
          {/* Slider Container */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
            <div 
              className="relative w-full aspect-[4/3] overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="w-full h-full flex flex-col bg-white"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  {catalogSlides[currentSlide]?.slideImage && (
                    <Image
                      src={catalogSlides[currentSlide].slideImage!}
                      alt={catalogSlides[currentSlide].pageTitle || `카탈로그 페이지 ${currentSlide + 1}`}
                      className="w-full h-full object-contain"
                      width={1200}
                    />
                  )}
                  
                  {/* Page Title Overlay */}
                  {catalogSlides[currentSlide]?.pageTitle && (
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg max-w-md">
                      <h3 className="text-sm font-medium">
                        {catalogSlides[currentSlide].pageTitle}
                      </h3>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <Button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white border-0 z-10"
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white border-0 z-10"
                disabled={currentSlide === catalogSlides.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Slide Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentSlide + 1} / {catalogSlides.length}
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 py-6 bg-gray-50">
              {catalogSlides.map((slide, index) => (
                <button
                  key={slide._id}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-[#1A1A1A] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  title={slide.pageTitle || `페이지 ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleDownload}
              className="w-[220px] h-[44px] bg-[#1A1A1A] hover:bg-[#333] text-white font-medium transition-colors duration-200"
              style={{ borderRadius: '8px' }}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF 다운로드
            </Button>
          </div>

          {/* Current Slide Info */}
          {catalogSlides[currentSlide] && (
            <div className="mt-8 text-center">
              <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-2">
                      {catalogSlides[currentSlide].pageTitle || `페이지 ${currentSlide + 1}`}
                    </h3>
                    {catalogSlides[currentSlide].pageContentSummary && (
                      <p className="text-gray-600 text-left">
                        {catalogSlides[currentSlide].pageContentSummary}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    페이지 {catalogSlides[currentSlide].pageNumber || currentSlide + 1}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {catalogData && (
            <div className="mt-8 text-center">
              <div className="max-w-2xl mx-auto bg-white border rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#2E2E2E] mb-4">
                  {catalogData.sampleName}
                </h3>
                {catalogData.description && (
                  <p className="text-gray-600 mb-4">
                    {catalogData.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  카테고리: {catalogData.category}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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