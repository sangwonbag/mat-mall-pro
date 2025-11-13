import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BaseCrudService } from '@/integrations';
import { ChatConsultations, ChatMessages } from '@/entities';

interface Message {
  id: string;
  content: string;
  senderType: 'visitor' | 'admin';
  timestamp: Date;
  isRead?: boolean;
}

interface ChatWidgetProps {
  className?: string;
}

export function ChatWidget({ className = '' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [visitorInfo, setVisitorInfo] = useState({
    name: '',
    contact: '',
    inquiry: ''
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing session from localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadExistingSession(savedSessionId);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 3 seconds when chat is active
  useEffect(() => {
    if (!sessionId || !isStarted) return;

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, isStarted]);

  const loadExistingSession = async (sessionId: string) => {
    try {
      const { items: consultations } = await BaseCrudService.getAll<ChatConsultations>('chatconsultations');
      const existingSession = consultations.find(c => c.sessionId === sessionId);
      
      if (existingSession) {
        setVisitorInfo({
          name: existingSession.visitorName || '',
          contact: existingSession.visitorContact || '',
          inquiry: existingSession.initialInquiry || ''
        });
        setIsStarted(true);
        await loadMessages();
      }
    } catch (error) {
      console.error('Error loading existing session:', error);
    }
  };

  const loadMessages = async () => {
    if (!sessionId) return;

    try {
      const { items: messageItems } = await BaseCrudService.getAll<ChatMessages>('chatmessages');
      const sessionMessages = messageItems
        .filter(msg => msg.consultationSessionId === sessionId)
        .sort((a, b) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime())
        .map(msg => ({
          id: msg._id,
          content: msg.messageContent || '',
          senderType: msg.senderType as 'visitor' | 'admin',
          timestamp: new Date(msg.sentAt || Date.now()),
          isRead: msg.isRead
        }));

      setMessages(sessionMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startChat = async () => {
    if (!visitorInfo.name || !visitorInfo.contact || !visitorInfo.inquiry) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const newSessionId = crypto.randomUUID();
      const consultation: ChatConsultations = {
        _id: crypto.randomUUID(),
        visitorName: visitorInfo.name,
        visitorContact: visitorInfo.contact,
        initialInquiry: visitorInfo.inquiry,
        status: 'New',
        sessionId: newSessionId,
        startTime: new Date().toISOString()
      };

      await BaseCrudService.create('chatconsultations', consultation);

      // Save initial message
      const initialMessage: ChatMessages = {
        _id: crypto.randomUUID(),
        consultationSessionId: newSessionId,
        senderType: 'visitor',
        messageContent: visitorInfo.inquiry,
        sentAt: new Date().toISOString(),
        isRead: false
      };

      await BaseCrudService.create('chatmessages', initialMessage);

      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      setIsStarted(true);
      await loadMessages();
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('채팅을 시작하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    setIsLoading(true);
    try {
      const message: ChatMessages = {
        _id: crypto.randomUUID(),
        consultationSessionId: sessionId,
        senderType: 'visitor',
        messageContent: newMessage,
        sentAt: new Date().toISOString(),
        isRead: false
      };

      await BaseCrudService.create('chatmessages', message);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 h-96 shadow-xl border-0 bg-white">
          <CardHeader className="bg-primary text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                상담 문의
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-full flex flex-col">
            {!isStarted ? (
              /* Initial Form */
              <div className="p-4 space-y-4 flex-1">
                <div className="text-sm text-gray-600 mb-4">
                  바닥재 상담을 위해 정보를 입력해주세요.
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">이름</label>
                    <Input
                      placeholder="이름을 입력하세요"
                      value={visitorInfo.name}
                      onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">연락처</label>
                    <Input
                      placeholder="전화번호 또는 이메일"
                      value={visitorInfo.contact}
                      onChange={(e) => setVisitorInfo(prev => ({ ...prev, contact: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">문의내용</label>
                    <Textarea
                      placeholder="문의하실 내용을 간단히 적어주세요"
                      value={visitorInfo.inquiry}
                      onChange={(e) => setVisitorInfo(prev => ({ ...prev, inquiry: e.target.value }))}
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={startChat} 
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? '시작 중...' : '상담 시작'}
                </Button>
              </div>
            ) : (
              /* Chat Interface */
              <>
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-64">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'visitor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderType === 'visitor'
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.senderType === 'visitor' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      상담사가 곧 응답드릴 예정입니다.
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="메시지를 입력하세요..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      size="icon"
                      disabled={isLoading || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}