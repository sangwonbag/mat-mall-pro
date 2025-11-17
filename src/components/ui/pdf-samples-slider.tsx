import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { BrandSamplePDFs } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';

export function PdfSamplesSlider() {
  const [pdfSamples, setPdfSamples] = useState<BrandSamplePDFs[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPdfSamples();
  }, []);

  const loadPdfSamples = async () => {
    try {
      setLoading(true);
      const { items } = await BaseCrudService.getAll<BrandSamplePDFs>('brandsamplepdfs');
      
      // 활성화된 샘플만 필터링하고 표시 순서대로 정렬
      const activeSamples = items
        .filter(item => item.isActive)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setPdfSamples(activeSamples);
    } catch (error) {
      console.error('PDF 샘플 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < pdfSamples.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setCurrentSlide(0); // 마지막에서 첫 번째로
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    } else {
      setCurrentSlide(pdfSamples.length - 1); // 첫 번째에서 마지막으로
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (pdfSamples.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [currentSlide, pdfSamples.length]);

  // 마우스 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dragDistance = e.clientX - dragStart;
    const threshold = 50;
    
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

  // 터치 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const touchDistance = touchStart - touchEnd;
    const threshold = 50;
    
    if (Math.abs(touchDistance) > threshold) {
      if (touchDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setTouchStart(0);
  };

  // PDF 열기
  const openPdf = (pdfUrl: string, brandName: string) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/60">PDF 샘플을 불러오는 중...</p>
          </div>
        </div>
      </section>
    );
  }

  if (pdfSamples.length === 0) {
    return null; // 활성화된 샘플이 없으면 섹션 숨김
  }

  return (
    <section className="py-16 bg-[#0A0A0A] relative overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]"></div>
      
      <div className="relative max-w-[120rem] mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            브랜드 PDF 샘플북
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            다양한 브랜드의 프리미엄 샘플을 확인하고 최적의 자재를 선택하세요
          </p>
        </div>

        {/* 데스크톱 슬라이더 */}
        <div className="hidden md:block">
          <div className="relative">
            <div 
              ref={sliderRef}
              className="relative overflow-hidden rounded-2xl"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  width: `${pdfSamples.length * 100}%`
                }}
              >
                {pdfSamples.map((sample, index) => (
                  <div 
                    key={sample._id} 
                    className="w-full flex-shrink-0 relative"
                    style={{ width: `${100 / pdfSamples.length}%` }}
                  >
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-8 mx-2 h-[400px] flex items-center justify-between border border-white/10">
                      {/* 왼쪽: 브랜드 정보 */}
                      <div className="flex-1 pr-8">
                        <h3 className="text-4xl font-bold text-white mb-4">
                          {sample.brandName}
                        </h3>
                        {sample.category && (
                          <p className="text-lg text-white/60 mb-6">
                            {sample.category}
                          </p>
                        )}
                        {sample.sampleBookDescription && (
                          <p className="text-white/80 mb-8 leading-relaxed">
                            {sample.sampleBookDescription}
                          </p>
                        )}
                        <Button
                          onClick={() => openPdf(sample.pdfUrl || '', sample.brandName || '')}
                          className="bg-white text-black hover:bg-white/90 px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 flex items-center gap-3"
                        >
                          <FileText className="h-5 w-5" />
                          PDF 샘플 보기
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 오른쪽: 썸네일 */}
                      <div className="flex-shrink-0">
                        <div className="w-64 h-64 rounded-xl overflow-hidden border-2 border-white/20">
                          {sample.thumbnailImage ? (
                            <Image 
                              src={sample.thumbnailImage} 
                              alt={`${sample.brandName} 샘플`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#2A2A2A] to-[#3A3A3A] flex items-center justify-center">
                              <FileText className="h-16 w-16 text-white/40" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 네비게이션 화살표 */}
            {pdfSamples.length > 1 && (
              <>
                <Button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm transition-all duration-200"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm transition-all duration-200"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* 점 네비게이션 */}
          {pdfSamples.length > 1 && (
            <div className="flex justify-center space-x-3 mt-8">
              {pdfSamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 모바일 세로 카드 */}
        <div className="md:hidden space-y-6">
          {pdfSamples.map((sample) => (
            <div 
              key={sample._id}
              className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-6 border border-white/10"
            >
              {/* 썸네일 */}
              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 border border-white/20">
                {sample.thumbnailImage ? (
                  <Image 
                    src={sample.thumbnailImage} 
                    alt={`${sample.brandName} 샘플`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2A2A2A] to-[#3A3A3A] flex items-center justify-center">
                    <FileText className="h-12 w-12 text-white/40" />
                  </div>
                )}
              </div>

              {/* 브랜드 정보 */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {sample.brandName}
                </h3>
                {sample.category && (
                  <p className="text-white/60 mb-4">
                    {sample.category}
                  </p>
                )}
                {sample.sampleBookDescription && (
                  <p className="text-white/80 mb-6 text-sm leading-relaxed">
                    {sample.sampleBookDescription}
                  </p>
                )}
                <Button
                  onClick={() => openPdf(sample.pdfUrl || '', sample.brandName || '')}
                  className="bg-white text-black hover:bg-white/90 px-6 py-3 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <FileText className="h-4 w-4" />
                  PDF 샘플 보기
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}