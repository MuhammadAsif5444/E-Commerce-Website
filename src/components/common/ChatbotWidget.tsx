import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Package,
  Tag,
  ArrowRight,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  products?: Product[];
  actionLink?: {
    text: string;
    url: string;
  };
}

const SMART_REPLIES = [
  'Where is my order?',
  'Recommend gifts under $50',
  'What coupon codes are active?',
  'How do returns work?',
  'Top rated electronics',
];

export const ChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const { products, coupons } = useProducts();
  const { orders, currentUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Hello ${currentUser ? currentUser.name.split(' ')[0] : 'there'}! I'm NestBot, your AI shopping assistant. How can I help you discover great products or track your orders today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isTyping]);

  const addBotResponse = (query: string) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();
      let botReplyText = '';
      let botProducts: Product[] | undefined;
      let actionLink: { text: string; url: string } | undefined;

      if (lower.includes('order') || lower.includes('track')) {
        const latest = orders[0];
        if (latest) {
          botReplyText = `Your latest order #${latest.id} is currently ${latest.status.replace(/_/g, ' ').toUpperCase()}. Expected delivery: ${latest.deliveryMethod.estimatedDelivery}.`;
          actionLink = { text: 'View Order Tracking', url: '/account?tab=orders' };
        } else {
          botReplyText = "You don't have any active orders yet. Explore our curated collections to get started!";
          actionLink = { text: 'Browse Deals', url: '/products?deal=true' };
        }
      } else if (lower.includes('coupon') || lower.includes('discount') || lower.includes('promo')) {
        const activeCodes = coupons.filter(c => c.isActive).map(c => c.code).join(', ');
        botReplyText = `You can use the promo code SAVE10 for 10% off orders over $40! Active codes: ${activeCodes}.`;
        actionLink = { text: 'Go to Cart', url: '/cart' };
      } else if (lower.includes('gift') || lower.includes('under 50') || lower.includes('50')) {
        botReplyText = 'Here are our most popular gifts under $50 with exceptional customer reviews:';
        botProducts = products.filter(p => p.price <= 50 && p.rating >= 4.7).slice(0, 3);
      } else if (lower.includes('return') || lower.includes('refund')) {
        botReplyText = 'ShopNest offers a 30-Day Hassle-Free Return policy on all eligible purchases with free return shipping and instant refunds.';
        actionLink = { text: 'Customer Support Portal', url: '/account' };
      } else if (lower.includes('electronic') || lower.includes('audio') || lower.includes('tech')) {
        botReplyText = 'Check out these top-rated tech items loved by our community:';
        botProducts = products.filter(p => p.category === 'electronics').slice(0, 3);
      } else {
        // Keyword product search
        const matched = products.filter(p =>
          p.title.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.tags.some(t => t.toLowerCase().includes(lower))
        ).slice(0, 3);

        if (matched.length > 0) {
          botReplyText = `I found ${matched.length} great products matching "${query}":`;
          botProducts = matched;
        } else {
          botReplyText = `I'd love to help you find that! You can browse our full catalog of over 45 categories or ask me for top deals.`;
          actionLink = { text: 'Search Catalog', url: `/products?q=${encodeURIComponent(query)}` };
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: botReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          products: botProducts,
          actionLink,
        },
      ]);
    }, 700);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    addBotResponse(text);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <Sparkles className="w-2.5 h-2.5 text-yellow-200 absolute -top-1 -right-1 animate-ping" />
          </div>
          <span className="text-xs font-bold font-heading hidden sm:inline">
            ShopNest Assistant
          </span>
          {hasUnread && (
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-96 h-[520px] max-h-[82vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold font-heading leading-tight">NestBot AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400">ShopNest Concierge & Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Render inline product suggestions */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {msg.products.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/products/${p.id}`);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 cursor-pointer transition-colors text-left"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-[11px]">
                              {p.title}
                            </p>
                            <p className="font-bold text-orange-500 text-xs">
                              {formatCurrency(p.price)}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Link button */}
                  {msg.actionLink && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate(msg.actionLink!.url);
                      }}
                      className="mt-2 inline-flex items-center gap-1 font-bold text-orange-500 hover:underline cursor-pointer"
                    >
                      {msg.actionLink.text} →
                    </button>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 ${
                      msg.sender === 'user'
                        ? 'text-orange-100 text-right'
                        : 'text-slate-400 dark:text-slate-500 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Smart Replies Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none flex gap-1.5">
            {SMART_REPLIES.map(chip => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-orange-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask anything or search items..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-9 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
