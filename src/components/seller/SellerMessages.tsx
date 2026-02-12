import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "../../api";
import { Send, MessageSquare, User, Clock, Check, CheckCheck } from "lucide-react";

interface Message {
  id: number;
  user_id: number;
  user_name: string;
  seller_id: number;
  message: string;
  sender_role: "user" | "seller";
  is_read: boolean;
  created_at: string;
}

interface Chat {
  user_id: number;
  user_name: string;
  last_message_time: string;
  unread_count: number;
  last_message_preview?: string;
}

interface SellerMessagesProps {
  sellerId: number | null;
}

const SellerMessages = ({ sellerId }: SellerMessagesProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");

  /* ========================== FETCH CHATS ========================== */
  const fetchChats = async () => {
    if (!sellerId) return;
    setLoadingChats(true);
    try {
      const res = await api.get(`/api/seller-messages/${sellerId}`);
      setChats(res.data.chats || []);
    } catch (err) {
      console.error("❌ Error fetching chats:", err);
    }
    setLoadingChats(false);
  };

  /* ========================== FETCH MESSAGES ========================== */
  const fetchMessages = async (userId: number) => {
    if (!sellerId || !userId) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/seller-messages/${sellerId}/${userId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    }
    setLoadingMessages(false);
  };

  /* ========================== MARK AS READ ========================== */
  const markAsRead = async (messageId: number) => {
    try {
      await api.put(`/api/seller-messages/read/${messageId}`);
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, is_read: true } : msg));
    } catch (err) {
      console.error("❌ Error marking message as read:", err);
    }
  };

  /* ========================== SEND REPLY ========================== */
  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUserId || !sellerId) return;

    try {
      const res = await api.post(`/api/seller-messages`, {
        user_id: selectedUserId,
        seller_id: sellerId,
        message: replyText,
        sender_role: "seller",
      });

      setMessages(prev => [...prev, res.data.message]);
      setReplyText("");
    } catch (err) {
      console.error("❌ Error sending reply:", err);
    }
  };

  /* ========================== USE EFFECT ========================== */
  useEffect(() => {
    fetchChats();
  }, [sellerId]);

  useEffect(() => {
    if (selectedUserId) fetchMessages(selectedUserId);
  }, [selectedUserId]);

  if (!sellerId) return <p>Please login to see messages.</p>;

  return (
    <div className="flex h-[600px] border rounded-lg shadow-sm overflow-hidden bg-white">
      {/* ====== CHATS SIDEBAR ====== */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Messages
          </h2>
          <p className="text-sm text-gray-500 mt-1">Chat with your customers</p>
        </div>
        
        <div className="p-2">
          {loadingChats ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400">Messages from customers will appear here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map(chat => (
                <div
                  key={chat.user_id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${selectedUserId === chat.user_id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedUserId(chat.user_id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{chat.user_name}</h3>
                          {chat.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {chat.unread_count}
                            </span>
                          )}
                        </div>
                        {chat.last_message_preview && (
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">
                            {chat.last_message_preview}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====== MESSAGES MAIN AREA ====== */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {chats.find(c => c.user_id === selectedUserId)?.user_name || "Customer"}
                  </h3>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {loadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3">
                        <div className="bg-gray-200 rounded-full h-8 w-8"></div>
                        <div className="space-y-2">
                          <div className="bg-gray-200 h-4 w-32 rounded"></div>
                          <div className="bg-gray-200 h-12 w-64 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Start the conversation with your customer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_role === "seller" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender_role === "seller" ? "order-2" : "order-1"}`}>
                        <div className={`rounded-2xl px-4 py-3 ${msg.sender_role === "seller" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
                          <p className="whitespace-pre-line">{msg.message}</p>
                          <div className={`flex items-center justify-between mt-2 text-xs ${msg.sender_role === "seller" ? "text-blue-200" : "text-gray-500"}`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <div className="flex items-center gap-1">
                              {msg.sender_role === "seller" && (
                                <>
                                  {msg.is_read ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </>
                              )}
                              {msg.sender_role === "user" && !msg.is_read && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 text-xs"
                                  onClick={() => markAsRead(msg.id)}
                                >
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Form */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleReply} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value)}
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!replyText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </>
        ) : (
          /* No Chat Selected View */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <MessageSquare className="h-20 w-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
            <p className="text-gray-500 text-center max-w-md">
              Choose a customer from the sidebar to view and reply to messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerMessages;