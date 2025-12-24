import React, { useState } from 'react';
import { signUp } from '../../lib/auth-client';

import styles from './styles.module.css';

interface SignUpFormProps {
    onSuccess: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data, error } = await signUp.email({
                email,
                password,
                name,
            });

            if (error) {
                setError(error.message || 'Failed to sign up');
            } else {
                onSuccess();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className={styles.field}>
                <label>Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Isaac Asimov"
                />
            </div>
            <div className={styles.field}>
                <label>Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                />
            </div>
            <div className={styles.field}>
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 chars"
                />
            </div>

            {error && (
                <div className={styles.error}>
                     {error}
                </div>
            )}

            <button type="submit" disabled={loading} className={styles.submit}>
                {loading ? 'Creating Identity...' : 'Register'}
            </button>
        </form>
    );
};
