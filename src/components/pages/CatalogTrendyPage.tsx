import React, { useState, useEffect, useRef } from 'react';
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
  const [touchStart, setTouchStart] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      
      // Load PDF catalog data - STRICT: Use latest/most recent PDF
      const { items: pdfItems } = await BaseCrudService.getAll<WallpaperPDFSamples>('wallpaperpdfsamples');
      // Sort by creation date to get the most recent PDF first
      const sortedPdfItems = pdfItems.sort((a, b) => {
        const dateA = new Date(a._createdDate || 0).getTime();
        const dateB = new Date(b._createdDate || 0).getTime();
        return dateB - dateA; // Most recent first
      });
      
      // Find the latest catalog or use the most recent one
      const catalog = sortedPdfItems.find(item => 
        item.sampleName?.includes('KCC 센스타일 트랜디') || 
        item.category?.includes('KCC 글라스') ||
        item.sampleName?.includes('센스타일 트랜디') ||
        item.sampleName?.includes('센스타일') ||
        item.category?.includes('트랜디')
      ) || sortedPdfItems[0]; // Use most recent if no specific match
      
      setCatalogData(catalog || null);

      // Load catalog slides data - STRICT LOCK: Ensure exactly 14 slides in correct order
      const { items: slideItems } = await BaseCrudService.getAll<TrendyCatalogSlides>('trendycatalogslides');
      
      // STRICT LOCK: Sort by creation date first to get the 14 most recent slides
      const sortedByDate = slideItems.sort((a, b) => {
        const dateA = new Date(a._createdDate || 0).getTime();
        const dateB = new Date(b._createdDate || 0).getTime();
        return dateB - dateA; // Most recent first
      });
      
      // STRICT LOCK: Take exactly the 14 most recent slides
      const latest14Slides = sortedByDate.slice(0, 14);
      
      // STRICT LOCK: Then sort these 14 slides by page number for display order
      const finalSlides = latest14Slides.sort((a, b) => {
        const pageA = a.pageNumber || 0;
        const pageB = b.pageNumber || 0;
        return pageA - pageB;
      });
      
      setCatalogSlides(finalSlides);
      
      console.log(`STRICT LOCK: Loaded ${finalSlides.length} slides (max 14 enforced)`);
      
    } catch (error) {
      console.error('Error loading catalog data:', error);
    } finally {
      setLoading(false);
    }
  };

  // STRICT LOCK: Navigation functions with 14-slide limit enforcement
  const nextSlide = () => {
    if (currentSlide < Math.min(catalogSlides.length, 14) - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    // STRICT LOCK: Ensure index is within 14-slide limit
    if (index >= 0 && index < Math.min(catalogSlides.length, 14)) {
      setCurrentSlide(index);
    }
  };

  // STRICT LOCK: Mouse drag handlers with 14-slide limit
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dragDistance = e.clientX - dragStart;
    const threshold = 50; // STRICT LOCK: Consistent threshold
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        prevSlide(); // STRICT LOCK: Uses limited navigation
      } else {
        nextSlide(); // STRICT LOCK: Uses limited navigation
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // STRICT LOCK: Touch handlers for mobile with 14-slide limit
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const touchDistance = touchStart - touchEnd;
    const threshold = 50; // STRICT LOCK: Consistent threshold
    
    if (Math.abs(touchDistance) > threshold) {
      if (touchDistance > 0) {
        nextSlide(); // STRICT LOCK: Uses limited navigation
      } else {
        prevSlide(); // STRICT LOCK: Uses limited navigation
      }
    }
    
    setTouchStart(0);
  };

  // STRICT LOCK: Keyboard navigation with 14-slide limit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide(); // STRICT LOCK: Uses limited navigation
      } else if (e.key === 'ArrowRight') {
        nextSlide(); // STRICT LOCK: Uses limited navigation
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, catalogSlides.length]);

  // STRICT LOCK: PDF download - absolutely no modifications to original file
  const handleDownload = () => {
    if (catalogData?.pdfUrl) {
      // STRICT LOCK: Direct link to original PDF - absolutely no modifications
      // Open in new tab to preserve original PDF viewing experience
      console.log('STRICT LOCK: Opening original PDF:', catalogData.pdfUrl);
      window.open(catalogData.pdfUrl, '_blank');
    } else {
      // STRICT LOCK: Alert user if no PDF is available
      alert('원본 PDF 파일을 찾을 수 없습니다. 최신 PDF가 업로드되면 자동으로 연결됩니다.');
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

  // STRICT LOCK: Show message if no slides are available (max 14 enforced)
  if (catalogSlides.length === 0) {
    return (
      <div className="min-h-screen bg-white font-['Pretendard']">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-2xl font-bold text-[#2E2E2E] mb-4">
            KCC 센스타일 트랜디 카탈로그
          </h1>
          <p className="text-gray-600 mb-8">
            STRICT LOCK MODE: 14개 PNG 이미지가 업로드되면 자동으로 표시됩니다.
          </p>
          {catalogData?.pdfUrl && (
            <Button
              onClick={() => window.open(catalogData.pdfUrl, '_blank')}
              className="w-[220px] h-[44px] bg-[#1A1A1A] hover:bg-[#333] text-white font-medium transition-colors duration-200"
              style={{ borderRadius: '8px' }}
            >
              <Download className="h-4 w-4 mr-2" />
              최신 원본 PDF 다운로드
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Pretendard']">
      <Header />
      
      {/* Hero Section - Minimal */}
      <section className="bg-white py-8">
        <div className="max-w-[120rem] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2E2E2E] mb-2">
            KCC 센스타일 트랜디 카탈로그
          </h1>
          <p className="text-base text-gray-600">
            STRICT LOCK MODE - 원본 14개 PNG 페이지 + 원본 PDF 다운로드
          </p>
        </div>
      </section>

      {/* STRICT LOCK MODE Catalog Slider - Original PNG Pages Only (Max 14) */}
      <section className="py-8 bg-white">
        <div className="max-w-[120rem] mx-auto px-4">
          {/* STRICT LOCK: Slider Container - No modifications to original images */}
          <div className="relative bg-white overflow-hidden">
            <div 
              ref={sliderRef}
              className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                // STRICT LOCK: Dynamic aspect ratio based on original image dimensions
                aspectRatio: 'auto',
                minHeight: '400px',
                maxHeight: '80vh'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="w-full h-full flex items-center justify-center bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  {catalogSlides[currentSlide]?.slideImage && (
                    <Image
                      src={catalogSlides[currentSlide].slideImage!}
                      alt={`센스타일 트랜디 카탈로그 페이지 ${(catalogSlides[currentSlide].pageNumber || currentSlide + 1)} - 원본 PNG (STRICT LOCK)`}
                      className="max-w-full max-h-full object-contain"
                      style={{
                        // STRICT LOCK: Preserve original aspect ratio, no cropping/scaling/modifications
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain', // STRICT LOCK: Never crop or distort
                        objectPosition: 'center',
                        // STRICT LOCK: Ensure high quality rendering of original PNG
                        imageRendering: 'auto',
                        // STRICT LOCK: No filters, effects, or modifications
                        filter: 'none',
                        transform: 'none',
                        // STRICT LOCK: Prevent any browser optimizations that might alter the image
                        imageOrientation: 'from-image'
                      }}
                      width={1200}
                      loading="eager"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* STRICT LOCK: Navigation Arrows - Limited to 14 slides */}
              <Button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 hover:bg-black text-white border-0 z-20 transition-all duration-200"
                disabled={currentSlide === 0}
                style={{ 
                  opacity: currentSlide === 0 ? 0.3 : 1,
                  cursor: currentSlide === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 hover:bg-black text-white border-0 z-20 transition-all duration-200"
                disabled={currentSlide === Math.min(catalogSlides.length, 14) - 1}
                style={{ 
                  opacity: currentSlide === Math.min(catalogSlides.length, 14) - 1 ? 0.3 : 1,
                  cursor: currentSlide === Math.min(catalogSlides.length, 14) - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* STRICT LOCK: Page Counter - Show exact page numbers (max 14) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium z-20">
                페이지 {catalogSlides[currentSlide]?.pageNumber || currentSlide + 1} / {Math.min(catalogSlides.length, 14)} (STRICT LOCK: 최대 14개)
              </div>
            </div>

            {/* STRICT LOCK: Page Indicators - Show exactly 14 pages maximum */}
            <div className="flex justify-center space-x-2 py-6">
              {catalogSlides.slice(0, 14).map((slide, index) => (
                <button
                  key={slide._id}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-[#1A1A1A] scale-150' 
                      : 'bg-gray-400 hover:bg-gray-600'
                  }`}
                  title={`원본 페이지 ${slide.pageNumber || index + 1} (STRICT LOCK)`}
                />
              ))}
            </div>
          </div>

          {/* STRICT LOCK: Direct PDF Download Button - Original PDF only */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleDownload}
              className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#333] text-white font-medium transition-colors duration-200 rounded-lg"
              disabled={!catalogData?.pdfUrl}
            >
              <Download className="h-5 w-5 mr-2" />
              {catalogData?.pdfUrl ? '최신 원본 PDF 다운로드 (STRICT LOCK)' : 'PDF 준비 중...'}
            </Button>
          </div>
        </div>
      </section>

      {/* STRICT LOCK Footer - No modifications */}
      <footer className="bg-[#1A1A1A] text-white py-12 mt-8">
        <div className="max-w-[120rem] mx-auto px-4 text-center">
          <div className="text-sm text-gray-400">
            <p className="mb-2">동경바닥재 | 데코타일/장판/마루/벽지 시공·자재 전문</p>
            <p>전화: 02-487-9775 | 이메일: dongk3089@naver.com</p>
            <p className="mt-4">ⓒ 2025 DongKyung Flooring. All rights reserved.</p>
            <p className="mt-2 text-xs text-gray-500">STRICT LOCK MODE: 원본 파일만 사용</p>
          </div>
        </div>
      </footer>
    </div>
  );
}