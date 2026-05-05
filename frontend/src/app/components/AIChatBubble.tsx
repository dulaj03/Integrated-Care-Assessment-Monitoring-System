import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial greeting if first time opening
    if (isOpen && messages.length === 0) {
      const userName = sessionStorage.getItem('userName');
      const isLoggedIn = !!sessionStorage.getItem('token');
      
      const greeting = isLoggedIn && userName
        ? `Hello ${userName}! I am Dr. ICAMS - Assistant. How can I help you today? You can ask me about symptoms, hospitals, doctors, or your health history.`
        : 'Hello Guest! I am Dr. ICAMS - Assistant. How can I help you today? You can ask me about symptoms, hospitals, and doctors.';

      setMessages([
        {
          role: 'model',
          content: greeting
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages
            .filter((m, i) => i > 0 || m.role === 'user') // Ensure history doesn't start with model greeting
            .map(m => ({
              role: m.role === 'model' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }))
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else if (response.status === 429) {
        setMessages(prev => [...prev, { role: 'model', content: data.details || '⏳ The AI service is a bit busy right now. Please wait a few seconds and try again!' }]);
      } else {
        const errorMsg = data.details || `I'm sorry, something went wrong on my end (Error ${response.status}). Please try again in a moment.`;
        setMessages(prev => [...prev, { role: 'model', content: errorMsg }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: '⚠️ Unable to reach the AI service. Please check your connection and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px',
              width: '380px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-4 transition-all duration-300 ease-in-out"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-none">Dr. ICAMS - Assistant</h3>
                  {!isMinimized && <span className="text-[10px] text-blue-100 flex items-center gap-1 mt-1">
                    <Sparkles size={8} /> Online & Ready
                  </span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50"
                >
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          m.role === 'user' 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          m.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                          <Bot size={14} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none flex gap-1 items-center shadow-sm">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border-none"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button Unit - Draggable */}
      <motion.div 
        drag
        dragConstraints={{ left: -300, right: 0, top: -600, bottom: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        className="flex items-center gap-3 touch-none"
        style={{ cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing', scale: 1.1 }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                width: 'auto',
                transition: { delay: 1 } 
              }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-none overflow-hidden whitespace-nowrap hidden md:block"
            >
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                Chat with Dr. ICAMS
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`${
            isOpen ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
          } w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden group transition-all duration-300`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="message"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                className="flex items-center justify-center"
              >
                <MessageCircle size={24} />
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-bounce" />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
