import React, { useState } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '안녕하세요! 동경바닥재 상담센터입니다. 무엇을 도와드릴까요?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    inquiry: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // 자동 응답 시뮬레이션
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '메시지를 확인했습니다. 담당자가 곧 답변드리겠습니다. 급하신 경우 02-487-9775로 전화 주세요.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const handleContactSubmit = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.inquiry) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const contactMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `상담 요청이 접수되었습니다.\n성함: ${customerInfo.name}\n연락처: ${customerInfo.phone}\n문의내용: ${customerInfo.inquiry}`,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, contactMessage]);
    setCustomerInfo({ name: '', phone: '', inquiry: '' });
    setShowContactForm(false);

    setTimeout(() => {
      const confirmMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '상담 요청이 정상적으로 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
    }, 500);
  };

  return (
    <>
      {/* 채팅 버튼 - 고정 위치 */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#B89C7D] hover:bg-[#A98D6A] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center relative"
        >
          <MessageCircle className="h-6 w-6" />
          {/* 알림 점 */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </Button>
      </motion.div>

      {/* 채팅창 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.3 : 1, 
              y: isMinimized ? 100 : 0 
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 ${
              isMinimized 
                ? 'bottom-6 right-6 w-80 h-16' 
                : 'bottom-6 right-6 w-80 sm:w-96 h-[500px]'
            }`}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#B89C7D] text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-paragraph font-semibold text-sm">채팅상담</h3>
                  <p className="text-xs text-white/80">동경바닥재 고객센터</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-white hover:bg-white/20"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-white hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 채팅 내용 - 최소화되지 않았을 때만 표시 */}
            {!isMinimized && (
              <>
                {/* 메시지 영역 */}
                <div className="flex-1 p-4 overflow-y-auto max-h-80">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            message.isUser
                              ? 'bg-[#B89C7D] text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm font-paragraph whitespace-pre-line">
                            {message.text}
                          </p>
                          <p className={`text-xs mt-1 ${
                            message.isUser ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 상담 요청 폼 */}
                {showContactForm && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-3">
                      <Input
                        placeholder="성함"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="text-sm"
                      />
                      <Input
                        placeholder="연락처"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="text-sm"
                      />
                      <Textarea
                        placeholder="문의내용"
                        value={customerInfo.inquiry}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, inquiry: e.target.value }))}
                        className="text-sm min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowContactForm(false)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleContactSubmit}
                          size="sm"
                          className="flex-1 text-xs bg-[#B89C7D] hover:bg-[#A98D6A]"
                        >
                          상담요청
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 입력 영역 */}
                {!showContactForm && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2 mb-3">
                      <Button
                        onClick={() => setShowContactForm(true)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-[#B89C7D] text-[#B89C7D] hover:bg-[#B89C7D] hover:text-white"
                      >
                        상담요청
                      </Button>
                      <Button
                        onClick={() => window.open('tel:02-487-9775')}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-[#B89C7D] text-[#B89C7D] hover:bg-[#B89C7D] hover:text-white"
                      >
                        전화상담
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="메시지를 입력하세요..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        size="sm"
                        className="px-3 bg-[#B89C7D] hover:bg-[#A98D6A]"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}