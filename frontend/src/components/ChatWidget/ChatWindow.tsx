import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Send, X, Bot, User, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './styles.module.css';
import { useChat } from './useChat';


export const ChatWindow: React.FC = () => {
    const { messages, isLoading, sendMessage, isOpen, toggleChat } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            sendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    return (
        <div className={styles.chatContainer}>
            {isOpen && (
                <div className={styles.window}>
                    <div className={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bot size={20} />
                            <span>AI Assistant</span>
                        </div>
                        <button onClick={toggleChat} className={styles.closeButton} aria-label="Close chat">
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.messageList}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(styles.message, {
                                    [styles.userMessage]: msg.sender === 'user',
                                    [styles.systemMessage]: msg.sender === 'system',
                                })}
                            >
                                {msg.sender === 'system' ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}

                            </div>
                        ))}
                        {isLoading && (!messages.length || messages[messages.length - 1].sender !== 'system') && (
                            <div className={clsx(styles.message, styles.systemMessage)}>
                                <span style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ animation: 'pulse 1s infinite' }}>•</span>
                                    <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>•</span>
                                    <span style={{ animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>•</span>
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.inputArea}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask a question..."
                            className={styles.input}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={!inputValue.trim() || isLoading}
                            aria-label="Send message"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
            <button
                onClick={toggleChat}
                className={styles.fab}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};