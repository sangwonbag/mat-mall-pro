import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
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
    if (!sessionId) return;

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const loadExistingSession = async (sessionId: string) => {
    try {
      await loadMessages();
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
    setIsLoading(true);
    try {
      const newSessionId = crypto.randomUUID();
      const consultation: ChatConsultations = {
        _id: crypto.randomUUID(),
        visitorName: '익명 사용자',
        visitorContact: '',
        initialInquiry: '채팅 상담을 시작합니다.',
        status: 'New',
        sessionId: newSessionId,
        startTime: new Date().toISOString()
      };

      await BaseCrudService.create('chatconsultations', consultation);

      // Save welcome message from admin
      const welcomeMessage: ChatMessages = {
        _id: crypto.randomUUID(),
        consultationSessionId: newSessionId,
        senderType: 'admin',
        messageContent: '안녕하세요! 동경바닥재 상담센터입니다. 무엇을 도와드릴까요?',
        sentAt: new Date().toISOString(),
        isRead: false
      };

      await BaseCrudService.create('chatmessages', welcomeMessage);

      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      await loadMessages();
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('채팅을 시작하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // If no session exists, start one first
    if (!sessionId) {
      await startChat();
      // Wait a moment for session to be created
      setTimeout(() => {
        sendMessage();
      }, 500);
      return;
    }

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
    <div className={`fixed bottom-24 right-6 z-50 ${className}`}>
      {/* Chat Button */}
      {!isOpen && (
        <div className="relative group">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            size="icon"
          >
            <Headphones className="h-6 w-6" />
          </Button>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg">
              채팅상담
              {/* Arrow pointing to button */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
            </div>
          </div>
        </div>
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
            {/* Chat Interface */}
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
                    안녕하세요! 바로 메시지를 입력하시면 상담을 시작할 수 있습니다.
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}