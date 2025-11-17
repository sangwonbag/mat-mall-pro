import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface SampleBookSliderProps {
  title: string;
  pageImages: string[];
  pdfUrl?: string;
  className?: string;
}

export function SampleBookSlider({ title, pageImages, pdfUrl, className = '' }: SampleBookSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  if (!pageImages || pageImages.length === 0) {
    return null; // 이미지가 없으면 컴포넌트를 렌더링하지 않음
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? pageImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === pageImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {pdfUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              PDF 다운로드
            </Button>
          )}
        </div>
      </div>

      {/* Image Slider */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <div className="relative w-full h-full cursor-pointer group">
                    <Image
                      src={pageImages[currentIndex]}
                      alt={`${title} - 페이지 ${currentIndex + 1}`}
                      className="w-full h-full object-contain"
                      width={400}
                    />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                  <div className="relative">
                    <Image
                      src={pageImages[currentIndex]}
                      alt={`${title} - 페이지 ${currentIndex + 1}`}
                      className="w-full h-auto max-h-[85vh] object-contain"
                      width={800}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {pageImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                aria-label="이전 페이지"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
                aria-label="다음 페이지"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Page Counter */}
          {pageImages.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
              {currentIndex + 1} / {pageImages.length}
            </div>
          )}
        </div>

        {/* Dots Navigation */}
        {pageImages.length > 1 && (
          <div className="flex justify-center py-4 space-x-2">
            {pageImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`페이지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}