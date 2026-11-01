import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Volume2,
  Image as ImageIcon,
  Bot,
  User,
  Compass,
  ArrowRight
} from 'lucide-react';
import { aiApi } from '../services/api';
import { Citation, AgentLog, Facility } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { CitationCard } from '../components/CitationCard';
import { AgentExecutionTimeline } from '../components/AgentExecutionTimeline';
import { FacilityCard } from '../components/FacilityCard';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  routingCategory?: string;
  citations?: Citation[];
  agentLogs?: AgentLog[];
  facilityCards?: Facility[];
  imageBase64?: string;
  timestamp: Date;
}

export const CivicAiChatPage: React.FC = () => {
  const { speak } = useLanguage();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content: "Hello! I am **CIVIC AI**, your civic assistant powered by Google Gemini 3.8 Flash.\n\nYou can ask me to find nearby public toilets, drinking water ATMs, hospital emergency rooms, dustbins, or ask broader questions across government schemes, programming, or science.",
      routingCategory: 'CIVIC_ASSISTANT',
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Attached image for multimodal Gemini vision
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Vizianagaram coordinates
  const [userLocation, setUserLocation] = useState<[number, number]>([18.1067, 83.3956]);

  // Session sidebar
  const [sessions, setSessions] = useState<{ id: string; title: string; createdAt: string }[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log('Location default to Vizianagaram:', err.message)
      );
    }

    aiApi.getSessions().then((data) => setSessions(data)).catch(() => {});

    const initialQ = searchParams.get('q');
    if (initialQ) {
      handleSendMessage(initialQ);
    }
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewSession = () => {
    setSessionId('');
    setMessages([
      {
        id: 'new-session-msg',
        sender: 'assistant',
        content: "New conversation initiated. What can I help you find or solve today?",
        routingCategory: 'CIVIC_ASSISTANT',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSelectSession = (sId: string) => {
    setSessionId(sId);
    setMessages([
      {
        id: `session-${sId}`,
        sender: 'assistant',
        content: "Resumed previous session. What would you like to explore or solve next?",
        routingCategory: 'CIVIC_ASSISTANT',
        timestamp: new Date(),
      },
    ]);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sId: string) => {
    e.stopPropagation();
    try {
      await aiApi.deleteSession(sId);
      setSessions((prev) => prev.filter((s) => s.id !== sId));
      if (sessionId === sId) {
        handleNewSession();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() && !attachedImage) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      imageBase64: attachedImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    const curImg = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await aiApi.chat({
        message: textToSend,
        sessionId: sessionId || undefined,
        imageBase64: curImg || undefined,
        latitude: userLocation[0],
        longitude: userLocation[1],
      });

      if (res.sessionId && res.sessionId !== sessionId) {
        setSessionId(res.sessionId);
        aiApi.getSessions().then((data) => setSessions(data)).catch(() => {});
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: res.message,
        routingCategory: res.routingCategory,
        citations: res.citations,
        agentLogs: res.agentLogs,
        facilityCards: res.facilityCards,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: "I encountered a transient connection issue. Please verify your internet connection or try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    { label: 'Find Restrooms', query: 'Where is the nearest public toilet?' },
    { label: 'Drinking Water', query: 'Find clean drinking water ATMs in Vizianagaram' },
    { label: 'Report Overflow', query: 'How do I report an overflowing dustbin?' },
    { label: 'Swachh Bharat', query: 'What are the benefits under Swachh Bharat Mission 2.0?' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col text-left">
      
      {/* Top Main Heading */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <Sparkles className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F8FAF5] tracking-tight">CIVIC AI</h1>
            <p className="text-xs text-[#94B7A8] font-medium">Your Civic Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#163B2E] border border-[#1E4D3A] px-3 py-1.5 rounded-full text-xs text-[#22C55E] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>Gemini 3.8 Flash Online</span>
          </div>
          <button
            onClick={handleNewSession}
            className="p-2 rounded-xl bg-[#1E4D3A] border border-[#163B2E] text-[#F8FAF5] hover:bg-[#22C55E] hover:text-[#0B1F16] transition"
            title="New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Chat History / Recent Prompts Sidebar (Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-5 flex-col justify-between overflow-hidden shadow-xl">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F8FAF5] uppercase tracking-wider">Conversations</span>
              <button
                onClick={handleNewSession}
                className="text-xs text-[#22C55E] font-bold hover:underline"
              >
                + New
              </button>
            </div>

            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-xs text-[#94B7A8]">No previous sessions yet.</p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`p-3 rounded-2xl text-xs flex items-center justify-between cursor-pointer transition ${
                      sessionId === s.id
                        ? 'bg-[#22C55E] text-[#0B1F16] font-bold shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                        : 'bg-[#0B1F16] text-[#D1E7D6] hover:bg-[#1E4D3A] border border-[#1E4D3A]'
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{s.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className={`p-1 rounded ${sessionId === s.id ? 'text-[#0B1F16] hover:text-[#EF4444]' : 'text-[#94B7A8] hover:text-[#EF4444]'}`}
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="pt-4 border-t border-[#1E4D3A] space-y-2">
            <span className="text-[11px] font-bold text-[#FAC615] uppercase tracking-wider">Quick Suggestions</span>
            <div className="space-y-1.5">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="w-full text-left p-2 rounded-xl bg-[#0B1F16] hover:bg-[#1E4D3A] border border-[#1E4D3A] text-[11px] text-[#D1E7D6] hover:text-[#F8FAF5] truncate transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chat Stream Panel */}
        <div className="lg:col-span-9 bg-[#163B2E] border border-[#1E4D3A] rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl relative">
          
          {/* Messages Container */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Bot Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1E4D3A] border border-[#22C55E]/40 text-[#F8FAF5] shadow-[0_4px_16px_rgba(0,0,0,0.3)] rounded-tr-none'
                        : 'bg-[#0F2F22] border border-[#1E4D3A] text-[#F8FAF5] shadow-md rounded-tl-none'
                    }`}
                  >
                    {/* Attached Image if any */}
                    {msg.imageBase64 && (
                      <div className="mb-3 rounded-2xl overflow-hidden border border-[#163B2E] max-w-xs">
                        <img src={msg.imageBase64} alt="Attached input" className="w-full h-auto object-cover max-h-48" />
                      </div>
                    )}

                    {/* Markdown Formatted Content */}
                    <div className="prose prose-sm max-w-none text-[#D1E7D6] prose-headings:text-[#F8FAF5] prose-headings:font-bold prose-a:text-[#FAC615] prose-code:font-mono prose-code:text-[#34D399] prose-code:bg-[#0B1F16] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Facility Result Cards if returned */}
                    {msg.facilityCards && msg.facilityCards.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#163B2E] space-y-2.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#22C55E]">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Located Facilities Nearby:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.facilityCards.slice(0, 4).map((f) => (
                            <FacilityCard key={f.id} facility={f} compact />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <CitationCard citations={msg.citations} />
                    )}

                    {/* Multi-Agent Logs */}
                    {msg.agentLogs && msg.agentLogs.length > 0 && (
                      <AgentExecutionTimeline logs={msg.agentLogs} />
                    )}
                  </div>

                  {/* Actions under Assistant Message */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center space-x-3 text-[11px] text-[#94B7A8] px-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-[#22C55E] flex items-center space-x-1 transition"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <span>•</span>

                      <button
                        onClick={() => speak(msg.content)}
                        className="hover:text-[#22C55E] flex items-center space-x-1 transition"
                        title="Read out response"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#FAC615] text-[#0B1F16] flex items-center justify-center shrink-0 mt-1 font-bold shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#0F2F22] rounded-3xl rounded-tl-none p-4 border border-[#1E4D3A] shadow-md flex items-center space-x-3 text-xs text-[#F8FAF5]">
                  <div className="w-4 h-4 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
                  <span>CIVIC AI is synthesizing response with Gemini 3.8 Flash...</span>
                </div>
              </div>
            )}
          </div>

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="px-6 py-2.5 bg-[#1E4D3A] border-t border-[#163B2E] flex items-center justify-between text-xs text-[#FAC615]">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span className="font-semibold">Photo attached for Gemini Vision analysis</span>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                className="font-bold hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* Input Bar Matching Reference Image 2: "Ask a follow-up..." */}
          <div className="p-4 bg-[#0F2F22]/90 border-t border-[#1E4D3A] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-3"
            >
              {/* Image upload trigger */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach photo"
                className="p-3 rounded-2xl bg-[#0B1F16] text-[#94B7A8] hover:text-[#22C55E] border border-[#1E4D3A] transition"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Voice input */}
              <VoiceInputButton
                onTranscript={(transcript) => {
                  setInputMessage((prev) => (prev ? prev + ' ' + transcript : transcript));
                }}
              />

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a follow-up..."
                className="flex-1 bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus:border-[#22C55E] text-xs sm:text-sm text-[#F8FAF5] px-5 py-3.5 focus:outline-none placeholder-[#94B7A8] transition shadow-inner"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (!inputMessage.trim() && !attachedImage)}
                className="p-3.5 rounded-2xl bg-[#FAC615] hover:bg-[#eab308] text-[#0B1F16] shadow-[0_0_15px_rgba(250,198,21,0.5)] transition disabled:opacity-40 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
