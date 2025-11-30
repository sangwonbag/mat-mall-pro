import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  User, 
  Clock, 
  CheckCircle, 
  Send, 
  LogOut, 
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { ChatConsultations, ChatMessages } from '@/entities';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface ConsultationWithMessages extends ChatConsultations {
  messageCount: number;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [consultations, setConsultations] = useState<ConsultationWithMessages[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithMessages | null>(null);
  const [messages, setMessages] = useState<ChatMessages[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const adminData = localStorage.getItem('adminUser');
    if (!adminData) {
      navigate('/admin');
      return;
    }

    setAdminUser(JSON.parse(adminData));
    loadConsultations();

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadConsultations, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (selectedConsultation) {
      loadMessages(selectedConsultation.sessionId!);
      
      // Auto-refresh messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConsultation.sessionId!);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedConsultation]);

  const loadConsultations = async () => {
    try {
      const { items: consultationItems } = await BaseCrudService.getAll<ChatConsultations>('chatconsultations');
      const { items: messageItems } = await BaseCrudService.getAll<ChatMessages>('chatmessages');

      const consultationsWithMessages: ConsultationWithMessages[] = consultationItems.map(consultation => {
        const sessionMessages = messageItems.filter(msg => msg.consultationSessionId === consultation.sessionId);
        const unreadMessages = sessionMessages.filter(msg => msg.senderType === 'visitor' && !msg.isRead);
        const lastMessage = sessionMessages
          .sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())[0];

        return {
          ...consultation,
          messageCount: sessionMessages.length,
          lastMessage: lastMessage?.messageContent,
          lastMessageTime: lastMessage ? new Date(lastMessage.sentAt || Date.now()) : undefined,
          unreadCount: unreadMessages.length
        };
      });

      // Sort by last message time (newest first)
      consultationsWithMessages.sort((a, b) => {
        const timeA = a.lastMessageTime || new Date(a.startTime || 0);
        const timeB = b.lastMessageTime || new Date(b.startTime || 0);
        return timeB.getTime() - timeA.getTime();
      });

      setConsultations(consultationsWithMessages);
    } catch (error) {
      console.error('Error loading consultations:', error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { items: messageItems } = await BaseCrudService.getAll<ChatMessages>('chatmessages');
      const sessionMessages = messageItems
        .filter(msg => msg.consultationSessionId === sessionId)
        .sort((a, b) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime());

      setMessages(sessionMessages);

      // Mark visitor messages as read
      const unreadVisitorMessages = sessionMessages.filter(msg => 
        msg.senderType === 'visitor' && !msg.isRead
      );

      for (const message of unreadVisitorMessages) {
        await BaseCrudService.update('chatmessages', {
          _id: message._id,
          isRead: true
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConsultation) return;

    setIsLoading(true);
    try {
      const message: ChatMessages = {
        _id: crypto.randomUUID(),
        consultationSessionId: selectedConsultation.sessionId!,
        senderType: 'admin',
        messageContent: newMessage,
        sentAt: new Date().toISOString(),
        isRead: true
      };

      await BaseCrudService.create('chatmessages', message);
      setNewMessage('');
      await loadMessages(selectedConsultation.sessionId!);
      await loadConsultations(); // Refresh consultation list
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsultationStatus = async (consultationId: string, status: string) => {
    try {
      await BaseCrudService.update('chatconsultations', {
        _id: consultationId,
        status
      });
      await loadConsultations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.visitorContact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.initialInquiry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeConsultations = filteredConsultations.filter(c => c.status !== 'Completed');
  const completedConsultations = filteredConsultations.filter(c => c.status === 'Completed');
  const totalUnread = consultations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-heading font-semibold text-gray-900">상담 관리 시스템</h1>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {totalUnread}개 미읽음
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {adminUser.displayName} ({adminUser.email})
            </span>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Consultation List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="상담 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="New">신규</SelectItem>
                  <SelectItem value="In Progress">진행중</SelectItem>
                  <SelectItem value="Completed">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="active" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="active">
                진행중 ({activeConsultations.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                완료 ({completedConsultations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="flex-1 overflow-y-auto p-4 pt-2">
              <div className="space-y-2">
                {activeConsultations.map((consultation) => (
                  <Card
                    key={consultation._id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedConsultation?._id === consultation._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedConsultation(consultation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{consultation.visitorName}</span>
                          {consultation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {consultation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusColor(consultation.status || '')}>
                          {consultation.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {consultation.visitorContact}
                      </p>
                      
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {consultation.lastMessage || consultation.initialInquiry}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {consultation.messageCount}개 메시지
                        </span>
                        {consultation.lastMessageTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(consultation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="flex-1 overflow-y-auto p-4 pt-2">
              <div className="space-y-2">
                {completedConsultations.map((consultation) => (
                  <Card
                    key={consultation._id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedConsultation?._id === consultation._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedConsultation(consultation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{consultation.visitorName}</span>
                        </div>
                        <Badge className={getStatusColor(consultation.status || '')}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          완료
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {consultation.visitorContact}
                      </p>
                      
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {consultation.lastMessage || consultation.initialInquiry}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {consultation.messageCount}개 메시지
                        </span>
                        {consultation.lastMessageTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(consultation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Detail */}
        <div className="flex-1 flex flex-col">
          {selectedConsultation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedConsultation.visitorName}</h2>
                    <p className="text-sm text-gray-600">{selectedConsultation.visitorContact}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedConsultation.status}
                      onValueChange={(status) => updateConsultationStatus(selectedConsultation._id, status)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">신규</SelectItem>
                        <SelectItem value="In Progress">진행중</SelectItem>
                        <SelectItem value="Completed">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderType === 'admin'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <div className="text-sm">{message.messageContent}</div>
                      <div className={`text-xs mt-1 ${
                        message.senderType === 'admin' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {formatTime(new Date(message.sentAt || Date.now()))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !newMessage.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>상담을 선택하여 대화를 시작하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}