import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatBox = ({ onClose }: { onClose: () => void }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, message]);
    setMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white border rounded-2xl shadow-xl flex flex-col overflow-hidden z-50">
      <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="font-semibold">Chat with Seller</h3>
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-6">
            Start the conversation with seller.
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="bg-gray-100 p-2 rounded-lg text-sm">
              {msg}
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-1 text-sm"
        />
        <Button onClick={handleSend} className="bg-blue-600 text-white px-3">
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
