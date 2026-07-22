"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { streamChat, uploadTempDocument, fetchChatHistory, clearTempDocument } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function getOrGenerateSessionId(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("janmitra_session_id");
    if (saved) return saved;
    const newSession = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("janmitra_session_id", newSession);
    return newSession;
  }
  return "default-session";
}

const SUGGESTION_QUERIES = [
  "I'm a farmer with 2 acres of land. What schemes am I eligible for?",
  "Engineering student looking for government scholarships",
  "What healthcare schemes are available for senior citizens?",
  "My family income is below ₹2 lakhs. What benefits can I get?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(getOrGenerateSessionId);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [language, setLanguage] = useState("English");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchChatHistory(sessionId);
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages as ChatMessage[]);
        }
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
    loadHistory();
  }, [sessionId]);

  // Check for query param from schemes page deep-link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query) {
      handleSend(query);
      // Clean URL
      window.history.replaceState({}, "", "/chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserProfile = useCallback(() => {
    try {
      const saved = localStorage.getItem("janmitra_profile");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  }, []);

  const handleSend = async (queryOverride?: string) => {
    const query = queryOverride || inputValue.trim();
    if (!query || isLoading) return;

    setInputValue("");
    const userMsg: ChatMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsg: ChatMessage = { role: "assistant", content: "", isStreaming: true };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(true);

    try {
      const profile = getUserProfile();
      let fullText = "";

      for await (const chunk of streamChat(query, profile, sessionId, language)) {
        fullText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: fullText, isStreaming: true };
          return updated;
        });
      }

      // Mark streaming complete
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: fullText, isStreaming: false };
        return updated;
      });
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "I'm sorry, I encountered an error connecting to the server. Please make sure the backend is running and try again.",
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Uploading...");
    try {
      const result = await uploadTempDocument(sessionId, file);
      setUploadStatus(`✓ ${file.name} processed (${result.num_chunks} chunks)`);
      setUploadedFiles(prev => prev.includes(file.name) ? prev : [...prev, file.name]);
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus(`✗ Failed to upload ${file.name}`);
      setTimeout(() => setUploadStatus(null), 5000);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFiles = async () => {
    try {
      await clearTempDocument(sessionId);
      setUploadedFiles([]);
      setUploadStatus("✓ Document unselected");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error("Failed to clear docs", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    const newSession = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("janmitra_session_id", newSession);
    }
    setSessionId(newSession);
    setMessages([]);
    setUploadStatus(null);
    setUploadedFiles([]);
    inputRef.current?.focus();
  };

  const isWelcomeState = messages.length === 0;

  return (
    <div className="bg-surface h-[calc(100vh)] w-full overflow-hidden flex text-on-surface">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col h-full w-64 bg-surface-container-low shadow-sm border-r border-outline-variant p-sm space-y-base flex-shrink-0 z-10 transition-all duration-200 ease-in-out">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6 px-2 pt-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
            </div>
            <span className="font-headline-md text-[16px] font-bold text-primary">JanMitra AI</span>
          </Link>
        </div>
        
        {/* CTA */}
        <button
          onClick={startNewChat}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-on-primary rounded-lg py-3 px-4 font-label-md text-label-md hover:opacity-90 transition-opacity mb-4"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>New Chat</span>
        </button>
        
        {/* Language Selector */}
        <div className="px-2 mb-2">
          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Response Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            <option value="Bengali">বাংলা (Bengali)</option>
          </select>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto space-y-1">
          <Link href="/schemes" className="flex items-center space-x-3 text-on-surface-variant px-4 py-3 hover:bg-surface-variant rounded-xl font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined text-[20px]">policy</span>
            <span>Explore Schemes</span>
          </Link>
          <Link href="/" className="flex items-center space-x-3 text-on-surface-variant px-4 py-3 hover:bg-surface-variant rounded-xl font-label-md text-label-md transition-colors duration-200">
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>Home</span>
          </Link>
        </div>
        
        {/* Footer Nav */}
        <div className="mt-auto pt-4 border-t border-outline-variant">
          <Link href="/profile" className="w-full flex items-center space-x-3 mt-2 px-4 py-3 hover:bg-surface-variant rounded-xl transition-colors text-left">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-outline-variant">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface">User Profile</span>
              <span className="text-[10px] text-on-surface-variant">Government Assistant</span>
            </div>
          </Link>
        </div>
      </nav>
      
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative bg-surface-container-lowest">
        {/* Upload Status Banner */}
        {uploadStatus && (
          <div className={`px-4 py-2 text-center font-label-sm text-label-sm border-b ${
            uploadStatus.startsWith("✓") ? "bg-secondary/10 text-secondary border-secondary/20" :
            uploadStatus.startsWith("✗") ? "bg-error-container text-on-error-container border-error/20" :
            "bg-primary/10 text-primary border-primary/20"
          }`}>
            {uploadStatus}
          </div>
        )}

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-gutter lg:p-lg flex flex-col items-center">
          {isWelcomeState ? (
            /* Welcome State */
            <div className="w-full max-w-3xl flex flex-col items-center justify-center mt-12 mb-auto text-center space-y-8">
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                Namaste, how can I help you today?
              </h1>
              
              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {SUGGESTION_QUERIES.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-left hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group flex flex-col justify-between h-24"
                  >
                    <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{suggestion}</span>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary self-end opacity-50">arrow_outward</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="w-full max-w-3xl flex flex-col gap-6 py-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-on-primary rounded-tr-sm"
                        : "bg-surface-container border border-outline-variant/50 text-on-surface rounded-tl-sm"
                    }`}
                  >
                    <div className="font-body-md text-body-md break-words react-markdown-container space-y-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-500 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0 inline-block w-full" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-current" {...props} />
                        }}
                      >
                        {msg.content + (msg.isStreaming ? ' ▍' : '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-on-surface text-[16px]">person</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
          {/* Spacer for input */}
          <div className="h-32 w-full flex-shrink-0"></div>
        </div>
        
        {/* Input Area (Fixed Bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest to-transparent pt-8 pb-gutter px-gutter flex justify-center">
          <div className="w-full max-w-3xl relative">
            
            {/* Uploaded Files Indicator */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 px-4 w-full">
                {uploadedFiles.map((fname, i) => (
                  <div key={i} className="bg-primary-container/30 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 shadow-sm group">
                    <span className="material-symbols-outlined text-[14px]">description</span>
                    <span className="truncate max-w-[200px]">{fname}</span>
                    <button 
                      onClick={handleRemoveFiles} 
                      className="hover:bg-primary/20 rounded-full p-0.5 ml-1 transition-colors flex items-center justify-center"
                      title="Remove document"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-container/20 transition-all flex items-center p-2 pr-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-outline-variant hover:text-on-surface transition-colors rounded-full flex items-center justify-center"
                title="Upload a document for context"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.doc,.docx,.md"
                onChange={handleFileUpload}
              />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant px-3 h-10"
                placeholder="Ask about schemes, eligibility, or documentation..."
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputValue.trim()}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                  isLoading || !inputValue.trim()
                    ? "bg-outline-variant text-surface cursor-not-allowed"
                    : "bg-primary text-on-primary hover:bg-primary-container hover:text-primary"
                }`}
              >
                {isLoading ? (
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
                )}
              </button>
            </div>
            <div className="text-center mt-3 text-[11px] text-on-surface-variant font-label-sm">
              JanMitra AI can make mistakes. Verify important information with official government portals.
            </div>
          </div>
        </div>
      </main>
      
      {/* Context Panel (Right Sidebar) */}
      <aside className="hidden xl:flex flex-col w-80 bg-surface-container-lowest border-l border-outline-variant h-full flex-shrink-0 z-10">
        <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <h2 className="font-headline-md text-[16px] font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">library_books</span>
            Retrieved Context
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
          {isWelcomeState ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant space-y-3 opacity-60">
              <span className="material-symbols-outlined text-4xl">travel_explore</span>
              <p className="font-body-sm text-body-sm max-w-[200px]">Sources and metadata will appear here once you ask a question.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Session</p>
                <p className="font-body-sm text-body-sm text-on-surface break-all">{sessionId.slice(0, 20)}...</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Language</p>
                <p className="font-body-sm text-body-sm text-on-surface">{language}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Messages</p>
                <p className="font-body-sm text-body-sm text-on-surface">{messages.length}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/50">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">RAG Pipeline</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-secondary">description</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">User Docs → Tier 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-primary">database</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Qdrant KB → Tier 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim">public</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Tavily → Tier 3</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
