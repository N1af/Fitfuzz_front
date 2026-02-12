import { useEffect, useState } from "react";
import api from "@/api";
import { useAuth } from "@/context/AuthContext";
import { Send, X } from "lucide-react";

interface ChatBoxProps {
  sellerId: number | string;
  onClose: () => void;
}

interface Message {
  id: number;
  message: string;
  sender_role: "user" | "seller";
  created_at: string;
}

const ChatBox = ({ sellerId, onClose }: ChatBoxProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  if (!user) return null;

  /* ================= FETCH CHAT ================= */
  useEffect(() => {
    api
      .get(`/api/seller-messages/${sellerId}/${user.id}`)
      .then((res) => setMessages(res.data.messages))
      .catch(console.error);
  }, [sellerId, user.id]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await api.post("/api/seller-messages", {
      user_id: user.id,
      seller_id: sellerId,
      message: text,
      sender_role: "user",
    });

    setMessages((prev) => [...prev, res.data.message]);
    setText("");
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[480px] bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <h3 className="font-semibold text-sm">Chat with Seller</h3>
        <button onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
              m.sender_role === "user"
                ? "ml-auto bg-blue-600 text-white rounded-br-none"
                : "mr-auto bg-white border rounded-bl-none"
            }`}
          >
            {m.message}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
