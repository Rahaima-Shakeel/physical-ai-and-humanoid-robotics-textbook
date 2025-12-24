import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Send, X, Bot, User, MessageCircle, Trash2, Copy, Check, RefreshCcw, Clock, Plus, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './styles.module.css';
import { useChat } from './useChat';


export const ChatWindow: React.FC = () => {
    const {
        messages, sessions, currentSessionId,
        isLoading, isError, sendMessage,
        clearChat, createNewSession, deleteSession,
        setCurrentSessionId, isOpen, toggleChat
    } = useChat();
    const [inputValue, setInputValue] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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

    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const quickReplies = [
        "What is Physical AI?",
        "Humanoid control types",
        "Sensors in robotics",
        "Actuation mechanisms"
    ];

    return (
        <div className={styles.chatContainer}>
            {isOpen && (
                <div className={styles.window}>
                    <div className={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isHistoryOpen ? <Clock size={16} /> : <Bot size={16} />}
                            <span>{isHistoryOpen ? 'Chat History' : 'Book Assistant'}</span>
                        </div>
                        <div className={styles.headerActions}>
                            {!isHistoryOpen && (
                                <>
                                    <button
                                        onClick={() => setIsHistoryOpen(true)}
                                        className={styles.headerButton}
                                        title="View History"
                                    >
                                        <Clock size={16} />
                                        <span className={styles.buttonLabel}>History</span>
                                    </button>
                                    <button
                                        onClick={clearChat}
                                        className={styles.headerButton}
                                        title="Clear current chat"
                                    >
                                        <Trash2 size={16} />
                                        <span className={styles.buttonLabel}>Clear</span>
                                    </button>
                                </>
                            )}
                            {isHistoryOpen && (
                                <button
                                    onClick={createNewSession}
                                    className={styles.headerButton}
                                    title="Start New Chat"
                                >
                                    <Plus size={18} />
                                    <span className={styles.buttonLabel}>New Chat</span>
                                </button>
                            )}
                            <button onClick={toggleChat} className={styles.closeButton} aria-label="Close chat">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {isHistoryOpen ? (
                        <div className={styles.historyList}>
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className={styles.backButton}
                            >
                                <ChevronLeft size={16} /> Back to Chat
                            </button>
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={clsx(styles.historyItem, {
                                        [styles.activeHistoryItem]: session.id === currentSessionId
                                    })}
                                >
                                    <div
                                        className={styles.historyInfo}
                                        onClick={() => {
                                            setCurrentSessionId(session.id);
                                            setIsHistoryOpen(false);
                                        }}
                                    >
                                        <span className={styles.historyTitle}>{session.title}</span>
                                        <span className={styles.historyTime}>
                                            {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSession(session.id);
                                        }}
                                        className={styles.deleteHistoryBtn}
                                        title="Delete conversation"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className={styles.messageList}>
                                {messages.map((msg, index) => {
                                    const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
                                    const messageDate = new Date(msg.timestamp);
                                    const timeStr = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div
                                            key={msg.id}
                                            className={clsx(styles.messageWrapper, {
                                                [styles.userWrapper]: msg.sender === 'user',
                                                [styles.systemWrapper]: msg.sender === 'system',
                                            })}
                                        >
                                            <div className={styles.messageContainer}>
                                                {msg.sender === 'system' && (
                                                    <div className={clsx(styles.avatar, styles.botAvatar, { [styles.hiddenAvatar]: !showAvatar })}>
                                                        <Bot size={16} />
                                                    </div>
                                                )}

                                                <div className={clsx(styles.message, {
                                                    [styles.userMessage]: msg.sender === 'user',
                                                    [styles.systemMessage]: msg.sender === 'system',
                                                })}>
                                                    <div className={styles.messageContent}>
                                                        {msg.sender === 'system' ? (
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        ) : (
                                                            msg.content
                                                        )}
                                                    </div>
                                                    {msg.sender === 'system' && msg.content && (
                                                        <button
                                                            onClick={() => handleCopy(msg.content, msg.id)}
                                                            className={styles.copyButton}
                                                            title="Copy to clipboard"
                                                        >
                                                            {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    )}
                                                    <span className={styles.messageTime}>{timeStr}</span>
                                                </div>

                                                {msg.sender === 'user' && (
                                                    <div className={clsx(styles.avatar, styles.userAvatar, { [styles.hiddenAvatar]: !showAvatar })}>
                                                        <User size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {messages.length === 1 && (
                                    <div className={styles.quickReplies}>
                                        {quickReplies.map((reply) => (
                                            <button
                                                key={reply}
                                                onClick={() => sendMessage(reply)}
                                                className={styles.quickReplyChip}
                                                disabled={isLoading}
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {isError && (
                                    <div className={styles.errorContainer}>
                                        <p>Failed to get response. Please try again.</p>
                                        <button onClick={() => sendMessage(messages[messages.length - 2].content)} className={styles.retryButton}>
                                            <RefreshCcw size={14} /> Retry
                                        </button>
                                    </div>
                                )}
                                {isLoading && (!messages.length || messages[messages.length - 1].sender !== 'system') && (
                                    <div className={clsx(styles.message, styles.systemMessage)}>
                                        <div className={styles.typingIndicator}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
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
                        </>
                    )}
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