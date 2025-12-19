import { useState, useCallback, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'system';
    timestamp: number;
    sources?: Array<{ id: number | string; title: string; url: string; score?: number }>;
}

const STORAGE_KEY = 'chat_widget_messages';

export const useChat = () => {
    const { siteConfig } = useDocusaurusContext();
    const backendUrl = (siteConfig.customFields?.backendUrl as string) || 'http://localhost:8000';

    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('chat_widget_is_open');
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });

    const [messages, setMessages] = useState<Message[]>(() => {
        // Load from session storage on init
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return [
            {
                id: 'welcome',
                content: 'Hi! I can help you answer questions about the Physical AI and Humanoid Robotics textbook. What would you like to know?',
                sender: 'system',
                timestamp: Date.now(),
            },
        ];
    });
    const [isLoading, setIsLoading] = useState(false);

    // Persistence effect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('chat_widget_is_open', JSON.stringify(isOpen));
        }
    }, [isOpen]);

    const toggleChat = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Use backend URL from Docusaurus config (supports environment override)
            const API_URL = `${backendUrl}/api/chat/message`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: content }),
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

                setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    if (!systemMsgAdded) {
                        systemMsgAdded = true;
                        return [...prev, {
                            id: systemMsgId,
                            content: accumulatedContent,
                            sender: 'system',
                            timestamp: Date.now()
                        }];
                    }

                    return prev.map(msg =>
                        msg.id === systemMsgId
                            ? {
                                ...msg,
                                content: accumulatedContent,
                            }
                            : msg
                    );
                });
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                content: 'Sorry, I encountered an error connecting to the server.',
                sender: 'system',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        isOpen,
        toggleChat,
    };
};