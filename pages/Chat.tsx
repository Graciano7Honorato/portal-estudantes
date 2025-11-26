import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatApi } from '../services/mockApi';
import { supabase } from '../services/supabase';
import { ChatMessage } from '../types';
import { Send } from 'lucide-react';
import Card from '../components/ui/Card';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadHistory = async () => {
      const history = await chatApi.getHistory();
      setMessages(history);
      scrollToBottom();
    };
    
    loadHistory();

    // Subscribe to Supabase Realtime
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as any;
          const mappedMsg: ChatMessage = {
            id: newMsg.id,
            userId: newMsg.user_id,
            userName: newMsg.user_name,
            userRole: newMsg.user_role,
            text: newMsg.text,
            timestamp: newMsg.created_at
          };
          
          setMessages((prev) => [...prev, mappedMsg]);
          
          // Notify Layout (via Broadcast for red dot)
          const bc = new BroadcastChannel('eduportal_chat_channel');
          bc.postMessage({ type: 'NEW_MESSAGE' });
          bc.close();
          
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msg: ChatMessage = {
      id: '', // DB generates it
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    try {
        await chatApi.saveMessage(msg);
        setNewMessage('');
    } catch (error) {
        console.error("Error sending message", error);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Chat da Turma</h1>
        <p className="text-gray-500 text-sm">Discussão em tempo real com sua turma.</p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              Nenhuma mensagem ainda. Inicie a conversa!
            </div>
          )}
          
          {messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            const isTeacher = msg.userRole === 'TEACHER';
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs
                    ${isTeacher ? 'bg-primary-600' : 'bg-green-500'} ${isMe ? 'ml-2' : 'mr-2'}
                  `}>
                     {isTeacher ? 'P' : 'A'}
                  </div>
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500 mb-1">
                      {msg.userName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                    </span>
                    <div 
                      className={`px-4 py-2 rounded-lg text-sm shadow-sm
                        ${isMe 
                          ? 'bg-primary-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none'
                        }
                      `}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              className="flex-1 appearance-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Chat;