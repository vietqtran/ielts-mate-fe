'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import instance from '@/lib/axios';
import { cn } from '@/lib/utils';
import { Bot, MessageCircle, Send, Sparkle, User, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface BaseResponse<T> {
  status: string;
  message: string;
  data: T;
  pagination?: any;
}

interface AIResponse {
  content: string;
  success: boolean;
  provider: string;
  model: string;
  errorMessage: string | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  currentMessage: string;
}

export function AIChatbot() {
  const pathname = usePathname();

  // Disable chatbot on exam taking and practice screens
  const shouldDisableChatbot = () => {
    if (!pathname) return false;

    const disabledRoutes = [
      '/exams/take', // Taking exams
      '/reading/.*?/practice', // Reading practice
      '/listening/.*?/practice', // Listening practice
    ];

    // Check for exact matches and pattern matches
    return (
      disabledRoutes.some((route) => {
        if (route.includes('.*?')) {
          // Use regex for dynamic routes
          const regex = new RegExp('^' + route + '$');
          return regex.test(pathname);
        }
        return pathname.startsWith(route);
      }) || pathname.includes('/practice')
    );
  };

  // Don't render chatbot on disabled routes
  if (shouldDisableChatbot()) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your IELTS preparation assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Also scroll when loading state changes (when AI response appears)
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history (last 10 messages)
      const conversationHistory = messages
        .slice(-10) // Get last 10 messages
        .map(
          (msg): ChatMessage => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })
        );

      // Prepare the request payload
      const chatRequest: ChatRequest = {
        messages: conversationHistory,
        currentMessage: messageContent,
      };

      // Call the API using the configured instance with proper endpoint
      const response = await instance.post<BaseResponse<AIResponse>>(
        '/personal/chat/ielts/send',
        chatRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Disable default error notifications since we handle them manually
          notify: false,
        }
      );

      let aiResponseContent = '';

      if (response.data.status === 'success' && response.data.data) {
        const aiData = response.data.data;

        // Check if the AI response was successful
        if (aiData.success && aiData.content) {
          aiResponseContent = aiData.content;
        } else {
          // Handle AI error
          aiResponseContent =
            aiData.errorMessage ||
            "I apologize, but I couldn't process your message properly. Could you please try again?";
        }
      } else {
        aiResponseContent =
          response.data.message || "I'm having trouble responding right now. Please try again.";
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseContent,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Force scroll after adding AI response
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } catch (error: any) {
      console.error('Error calling AI API:', error);

      let errorMessage =
        "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.";

      // Provide more specific error messages based on the error type
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to use the AI chatbot.';
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to use the AI chatbot.";
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'The AI service is temporarily unavailable. Please try again later.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (!isOpen) {
    return (
      <div className='fixed bottom-6 right-6 z-50'>
        <Button
          onClick={() => setIsOpen(true)}
          size='lg'
          className='w-14 h-14 rounded-full bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'
          aria-label='Open AI Chatbot'
        >
          <MessageCircle className='w-6 h-6' />
        </Button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <div className='w-96 h-[40rem] bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-tekhelet-900/10 flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-selective-yellow-300 to-selective-yellow-400 text-white p-3 flex items-center justify-between gap-2 flex-shrink-0'>
          <div className='flex items-center gap-2 text-base font-semibold flex-1 min-w-0'>
            <Sparkle className='w-4 h-4 flex-shrink-0' />
            <span className='truncate'>AI Assistant</span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setIsOpen(false);
              // Clear all messages when closing
              setMessages([
                {
                  id: '1',
                  content: "Hello! I'm your AI Assistant. How can I help you today?",
                  sender: 'ai',
                  timestamp: new Date(),
                },
              ]);
            }}
            className='text-white hover:bg-white/20 h-7 w-7 p-0 flex-shrink-0'
            aria-label='Close chatbot'
          >
            <X className='w-3 h-3' />
          </Button>
        </div>

        {/* Messages (scrollable) */}
        <div className='flex-1 min-h-0 overflow-y-auto p-4'>
          <div className='space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 max-w-full',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <div className='w-8 h-8 rounded-full bg-tekhelet-400 flex items-center justify-center flex-shrink-0'>
                    <Bot className='w-4 h-4 text-white' />
                  </div>
                )}

                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 max-w-[280px] break-words overflow-wrap-anywhere',
                    message.sender === 'user'
                      ? 'bg-selective-yellow-300 text-white ml-8'
                      : 'bg-gray-100 text-tekhelet-400 mr-8'
                  )}
                >
                  {message.sender === 'ai' ? (
                    <div className='text-sm leading-relaxed'>
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className='mb-2 last:mb-0 text-tekhelet-400'>{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className='mb-2 ml-4 list-disc text-tekhelet-400'>{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className='mb-2 ml-4 list-decimal text-tekhelet-400'>{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className='mb-1 text-tekhelet-400'>{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className='font-semibold text-tekhelet-400'>{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className='italic text-tekhelet-500'>{children}</em>
                          ),
                          h1: ({ children }) => (
                            <h1 className='text-base font-bold mb-2 text-tekhelet-400'>
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className='text-sm font-bold mb-2 text-tekhelet-400'>{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className='text-sm font-semibold mb-1 text-tekhelet-400'>
                              {children}
                            </h3>
                          ),
                          code: ({ children }) => (
                            <code className='bg-tekhelet-100 px-1 rounded text-tekhelet-600 text-xs'>
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className='border-l-2 border-tekhelet-300 pl-3 ml-2 text-tekhelet-500 italic'>
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className='text-sm leading-relaxed whitespace-pre-wrap'>
                      {message.content}
                    </div>
                  )}
                  <p
                    className={cn(
                      'text-xs mt-1 opacity-70',
                      message.sender === 'user' ? 'text-white' : 'text-tekhelet-500'
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className='w-8 h-8 rounded-full bg-selective-yellow-300 flex items-center justify-center flex-shrink-0'>
                    <User className='w-4 h-4 text-white' />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className='flex gap-3 justify-start'>
                <div className='w-8 h-8 rounded-full bg-tekhelet-400 flex items-center justify-center'>
                  <Bot className='w-4 h-4 text-white' />
                </div>
                <div className='bg-gray-100 rounded-2xl px-3 py-2 mr-8'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-tekhelet-400 rounded-full animate-bounce'></div>
                    <div
                      className='w-2 h-2 bg-tekhelet-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-tekhelet-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
        {/* End Messages */}

        {/* Input */}
        <div className='p-4 flex-shrink-0'>
          <div className='flex items-center gap-2 pt-2'>
            <div className='grow'>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Ask me about IELTS...'
                className='flex-1 w-full focus:border-selective-yellow-300 focus:ring-selective-yellow-300 text-base'
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size='default'
              className='bg-selective-yellow-300 hover:bg-selective-yellow-400 text-white px-3'
            >
              <Send className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
