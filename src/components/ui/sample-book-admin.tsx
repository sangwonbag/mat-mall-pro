import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Upload, Download, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { BaseCrudService } from '@/integrations';
import { SampleBooksandCatalogs } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import { SampleBookSlider } from '@/components/ui/sample-book-slider';

interface SampleBookFormData {
  title: string;
  type: string;
  brand: string;
  materialCategory: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  pageImageUrls: string[];
  pdfFileUrl: string;
}

const initialFormData: SampleBookFormData = {
  title: '',
  type: 'sample-book',
  brand: '',
  materialCategory: '',
  description: '',
  isActive: true,
  sortOrder: 0,
  pageImageUrls: [],
  pdfFileUrl: '',
};

export function SampleBookAdmin() {
  const [sampleBooks, setSampleBooks] = useState<SampleBooksandCatalogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<SampleBookFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState<SampleBooksandCatalogs | null>(null);

  useEffect(() => {
    loadSampleBooks();
  }, []);

  const loadSampleBooks = async () => {
    try {
      setLoading(true);
      const { items } = await BaseCrudService.getAll<SampleBooksandCatalogs>('samplebooksandcatalogs');
      const sortedItems = items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setSampleBooks(sortedItems);
    } catch (error) {
      console.error('Error loading sample books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data: Partial<SampleBooksandCatalogs> = {
        title: formData.title,
        type: formData.type,
        brand: formData.brand,
        materialCategory: formData.materialCategory,
        description: formData.description,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        pageImageUrls: JSON.stringify(formData.pageImageUrls),
        pdfFileUrl: formData.pdfFileUrl || undefined,
      };

      if (editingId) {
        await BaseCrudService.update('samplebooksandcatalogs', { _id: editingId, ...data });
      } else {
        await BaseCrudService.create('samplebooksandcatalogs', { _id: crypto.randomUUID(), ...data });
      }

      setFormData(initialFormData);
      setEditingId(null);
      setIsDialogOpen(false);
      loadSampleBooks();
    } catch (error) {
      console.error('Error saving sample book:', error);
    }
  };

  const handleEdit = (book: SampleBooksandCatalogs) => {
    setFormData({
      title: book.title || '',
      type: book.type || 'sample-book',
      brand: book.brand || '',
      materialCategory: book.materialCategory || '',
      description: book.description || '',
      isActive: book.isActive ?? true,
      sortOrder: book.sortOrder || 0,
      pageImageUrls: book.pageImageUrls ? JSON.parse(book.pageImageUrls) : [],
      pdfFileUrl: book.pdfFileUrl || '',
    });
    setEditingId(book._id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 샘플북을 삭제하시겠습니까?')) {
      try {
        await BaseCrudService.delete('samplebooksandcatalogs', id);
        loadSampleBooks();
      } catch (error) {
        console.error('Error deleting sample book:', error);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // 실제 구현에서는 파일을 업로드하고 URL을 받아와야 합니다
      // 여기서는 예시 URL을 사용합니다
      const newImageUrls = Array.from(files).map((file, index) => 
        `https://static.wixstatic.com/media/sample_${Date.now()}_${index}.jpg`
      );
      setFormData(prev => ({
        ...prev,
        pageImageUrls: [...prev.pageImageUrls, ...newImageUrls]
      }));
    }
  };

  const handleImageReorder = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formData.pageImageUrls);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      pageImageUrls: items
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pageImageUrls: prev.pageImageUrls.filter((_, i) => i !== index)
    }));
  };

  const openPreview = (book: SampleBooksandCatalogs) => {
    setPreviewBook(book);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">샘플북 & 카탈로그 관리</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setFormData(initialFormData); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              새 샘플북 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? '샘플북 수정' : '새 샘플북 추가'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">타입</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sample-book">샘플북</SelectItem>
                      <SelectItem value="catalog">카탈로그</SelectItem>
                      <SelectItem value="brochure">브로셔</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="brand">브랜드</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="materialCategory">자재분류</Label>
                  <Input
                    id="materialCategory"
                    value={formData.materialCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, materialCategory: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="sortOrder">정렬순서</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>사용여부</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="pdfFileUrl">PDF 파일 URL (선택사항)</Label>
                <Input
                  id="pdfFileUrl"
                  value={formData.pdfFileUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, pdfFileUrl: e.target.value }))}
                  placeholder="https://example.com/sample.pdf"
                />
              </div>
              
              {/* 이미지 업로드 섹션 */}
              <div>
                <Label>페이지 이미지들</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    이미지 업로드
                  </label>
                </div>
                
                {/* 이미지 드래그 앤 드롭 리스트 */}
                {formData.pageImageUrls.length > 0 && (
                  <DragDropContext onDragEnd={handleImageReorder}>
                    <Droppable droppableId="images">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="mt-4 space-y-2"
                        >
                          {formData.pageImageUrls.map((imageUrl, index) => (
                            <Draggable key={`${imageUrl}-${index}`} draggableId={`${imageUrl}-${index}`} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <div className="w-16 h-16 rounded overflow-hidden">
                                    <Image
                                      src={imageUrl}
                                      alt={`페이지 ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      width={64}
                                    />
                                  </div>
                                  <span className="flex-1 text-sm text-gray-600">페이지 {index + 1}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingId ? '수정' : '추가'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 샘플북 목록 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBooks.map((book) => {
            const pageImages = book.pageImageUrls ? JSON.parse(book.pageImageUrls) : [];
            return (
              <Card key={book._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{book.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {book.brand} • {book.materialCategory}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {book.isActive ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {pageImages.length > 0 && (
                    <div className="aspect-[3/4] mb-3 rounded overflow-hidden">
                      <Image
                        src={pageImages[0]}
                        alt={book.title || ''}
                        className="w-full h-full object-cover"
                        width={200}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span>{book.type}</span>
                    <span>{pageImages.length}개 페이지</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPreview(book)}
                      className="flex-1"
                    >
                      미리보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(book)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(book._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 미리보기 다이얼로그 */}
      <Dialog open={!!previewBook} onOpenChange={() => setPreviewBook(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>샘플북 미리보기</DialogTitle>
          </DialogHeader>
          {previewBook && (
            <SampleBookSlider
              title={previewBook.title || ''}
              pageImages={previewBook.pageImageUrls ? JSON.parse(previewBook.pageImageUrls) : []}
              pdfUrl={previewBook.pdfFileUrl}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}