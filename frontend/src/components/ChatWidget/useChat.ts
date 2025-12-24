import { useState, useCallback, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'system';
    timestamp: number;
    sources?: Array<{ id: number | string; title: string; url: string; score?: number }>;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: number;
}

const STORAGE_KEY = 'chat_widget_sessions';
const CURRENT_SESSION_ID_KEY = 'chat_widget_current_session_id';
const IS_OPEN_KEY = 'chat_widget_is_open';

export const useChat = () => {
    const { siteConfig } = useDocusaurusContext();
    const backendUrl = (siteConfig.customFields?.backendUrl as string);

    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(IS_OPEN_KEY);
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });

    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        }
        const initialSession: ChatSession = {
            id: 'default-' + Date.now(),
            title: 'New Chat',
            messages: [{
                id: 'welcome',
                content: '👋 Hi! I\'m your Book Assistant. I can help you answer questions about the textbook. What would you like to explore today? 🤖',
                sender: 'system',
                timestamp: Date.now(),
            }],
            updatedAt: Date.now(),
        };
        return [initialSession];
    });

    const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(CURRENT_SESSION_ID_KEY);
            return saved || '';
        }
        return '';
    });

    // Sync current session ID if missing
    useEffect(() => {
        if (!currentSessionId && sessions.length > 0) {
            setCurrentSessionId(sessions[0].id);
        }
    }, [currentSessionId, sessions]);

    const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
    const messages = currentSession?.messages || [];

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // Persistence effect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
            sessionStorage.setItem(CURRENT_SESSION_ID_KEY, currentSessionId);
            sessionStorage.setItem(IS_OPEN_KEY, JSON.stringify(isOpen));
        }
    }, [sessions, currentSessionId, isOpen]);

    const toggleChat = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const createNewSession = useCallback(() => {
        const newId = 'session-' + Date.now();
        const newSession: ChatSession = {
            id: newId,
            title: 'New Chat',
            messages: [{
                id: 'welcome-' + Date.now(),
                content: '👋 Hi! Starting a new conversation. How can I help you? ✨',
                sender: 'system',
                timestamp: Date.now(),
            }],
            updatedAt: Date.now(),
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setIsError(false);
    }, []);

    const deleteSession = useCallback((id: string) => {
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== id);
            if (filtered.length === 0) {
                const initial: ChatSession = {
                    id: 'default-' + Date.now(),
                    title: 'New Chat',
                    messages: [{
                        id: 'welcome-' + Date.now(),
                        content: '👋 Hi! I\'m your Book Assistant. Ready for a fresh start! 🤖',
                        sender: 'system',
                        timestamp: Date.now(),
                    }],
                    updatedAt: Date.now(),
                };
                return [initial];
            }
            return filtered;
        });
        if (currentSessionId === id) {
            setCurrentSessionId(''); // Will be reset by useEffect
        }
    }, [currentSessionId]);

    const clearChat = useCallback(() => {
        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
            ...s,
            messages: [{
                id: 'welcome-' + Date.now(),
                content: '👋 Chat cleared. How else can I help you? ✨',
                sender: 'system',
                timestamp: Date.now(),
            }],
            updatedAt: Date.now(),
        } : s));
        setIsError(false);
    }, [currentSessionId]);

    const sendMessage = useCallback(async (content: string) => {
        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: Date.now(),
        };

        setSessions(prev => prev.map(s => s.id === currentSessionId ? {
            ...s,
            messages: [...s.messages, userMsg],
            title: s.messages.length === 1 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : s.title,
            updatedAt: Date.now(),
        } : s));

        setIsLoading(true);
        setIsError(false);

        try {
            // Use backend URL from Docusaurus config (supports environment override)
    const API_URL = `${backendUrl}/api/chat/message`;

            const response = await fetch(API_URL, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    session_id: currentSessionId
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Initialize system message placeholder
            const systemMsgId = (Date.now() + 1).toString();
            const systemMsg: Message = {
                id: systemMsgId,
                content: '',
                sender: 'system',
                timestamp: Date.now(),
            };

            // System message will be added when first chunk arrives
            let systemMsgAdded = false;

            let buffer = '';
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Split by double newline for SSE events, or just newline if loose format
                // Standard SSE uses \n\n to separate events
                const lines = buffer.split('\n');
                // Keep the last partial line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;

                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') continue;

                        try {
                            const data = JSON.parse(dataStr);

                            if (data.type === 'content' && data.delta) {
                                accumulatedContent += data.delta;
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', dataStr);
                        }
                    }
                }

                setSessions(prev => prev.map(s => {
                    if (s.id !== currentSessionId) return s;

                    const lastMsg = s.messages[s.messages.length - 1];
                    if (!systemMsgAdded) {
                        systemMsgAdded = true;
                        return {
                            ...s,
                            messages: [...s.messages, {
                                id: systemMsgId,
                                content: accumulatedContent,
                                sender: 'system',
                                timestamp: Date.now()
                            }],
                            updatedAt: Date.now()
                        };
                    }

                    return {
                        ...s,
                        messages: s.messages.map(msg =>
                            msg.id === systemMsgId
                                ? { ...msg, content: accumulatedContent }
                                : msg
                        ),
                        updatedAt: Date.now()
                    };
                }));
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                content: 'Sorry, I encountered an error connecting to the server.',
                sender: 'system',
                timestamp: Date.now(),
            };
            setSessions(prev => prev.map(s => s.id === currentSessionId ? {
                ...s,
                messages: [...s.messages, errorMsg],
                updatedAt: Date.now()
            } : s));
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [currentSessionId, backendUrl]);

    return {
        messages,
        sessions,
        currentSessionId,
        isLoading,
        isError,
        sendMessage,
        clearChat,
        createNewSession,
        deleteSession,
        setCurrentSessionId,
        isOpen,
        toggleChat,
    };
};