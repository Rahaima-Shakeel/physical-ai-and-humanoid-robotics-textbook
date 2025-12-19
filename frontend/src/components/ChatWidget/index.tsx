import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import styles from './styles.module.css';

export default function ChatWidget(): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.chatContainer}>
            {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

            {!isOpen && (
                <button
                    className={styles.fab}
                    onClick={() => setIsOpen(true)}
                    aria-label="Open chat"
                >
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
}
