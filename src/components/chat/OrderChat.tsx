import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Pusher from "pusher-js";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  sender_type: "customer" | "business";
  created_at: string;
}

interface OrderChatProps {
  orderId: string;
  userType: "customer" | "business";
}

export const OrderChat = ({ orderId, userType }: OrderChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let pusher: Pusher | null = null;
    let channel: any = null;

    const setup = async () => {
      // Load existing messages
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      setMessages(data as Message[] || []);

      // Set up Pusher
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No session found");
        return;
      }

      pusher = new Pusher("f7ca062b8f895c3f2497", {
        cluster: "ap1",
        authEndpoint: "https://ridfupvpqeanqffiqykm.supabase.co/functions/v1/pusher-auth",
        auth: {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      });

      channel = pusher.subscribe(`private-order-${orderId}`);
      
      channel.bind("new-message", (data: Message) => {
        setMessages((prev) => [...prev, data]);
      });
    };

    setup();

    return () => {
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [orderId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("send-message", {
        body: {
          order_id: orderId,
          message: newMessage,
          sender_type: userType,
        },
      });

      if (response.error) {
        throw response.error;
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_type === userType ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender_type === userType
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
          />
          <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
