import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { WallpaperPDFSamples } from '@/entities';
import { Button } from '@/components/ui/button';
import Header from '@/components/ui/header';

export default function CatalogTrendyPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [catalogData, setCatalogData] = useState<WallpaperPDFSamples | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // Mock catalog images - in real implementation, these would be extracted from PDF
  const catalogImages = [
    'https://static.wixstatic.com/media/9f8727_1048bc3ee0d5424bb3539e1db95d0b50~mv2.png?originWidth=1152&originHeight=896',
    'https://static.wixstatic.com/media/9f8727_04bd2bcccfe6487787da809e171f91c7~mv2.png?originWidth=1152&originHeight=896',
    'https://static.wixstatic.com/media/9f8727_bd48fbce48b04a02b5e393928da4a691~mv2.png?originWidth=1152&originHeight=896',
    'https://static.wixstatic.com/media/9f8727_4bbfc2efa6304ac693143d7540cb5bdd~mv2.png?originWidth=1152&originHeight=896',
    'https://static.wixstatic.com/media/9f8727_16925650d28443a39a2e9aad0c56a782~mv2.png?originWidth=1152&originHeight=896',
    'https://static.wixstatic.com/media/9f8727_8a7d0bd9061c4b62ad579ea8985085e3~mv2.png?originWidth=1152&originHeight=896',
    'https://static.wixstatic.com/media/9f8727_ff821bc761124373a371252b879892a3~mv2.png?originWidth=1152&originHeight=896',
    'https://static.wixstatic.com/media/9f8727_133bd4c29f634864882bca5b8c6735b8~mv2.png?originWidth=1152&originHeight=896'
  ];

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      const { items } = await BaseCrudService.getAll<WallpaperPDFSamples>('wallpaperpdfsamples');
      const catalog = items.find(item => 
        item.sampleName?.includes('KCC 센스타일 트랜디') || 
        item.category?.includes('KCC 글라스')
      );
      setCatalogData(catalog || null);
    } catch (error) {
      console.error('Error loading catalog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % catalogImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + catalogImages.length) % catalogImages.length);
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
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A]"></div>
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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            KCC 글라스의 프리미엄 센스타일 트랜디 제품군을 한눈에 확인하세요
          </p>
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
                <motion.img
                  key={currentSlide}
                  src={catalogImages[currentSlide]}
                  alt={`카탈로그 페이지 ${currentSlide + 1}`}
                  className="w-full h-full object-contain bg-white"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  draggable={false}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
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
                disabled={currentSlide === catalogImages.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Slide Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentSlide + 1} / {catalogImages.length}
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 py-6 bg-gray-50">
              {catalogImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-[#1A1A1A] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
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

          {/* Additional Info */}
          {catalogData && (
            <div className="mt-12 text-center">
              <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-8">
                <h3 className="text-xl font-bold text-[#2E2E2E] mb-4">
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