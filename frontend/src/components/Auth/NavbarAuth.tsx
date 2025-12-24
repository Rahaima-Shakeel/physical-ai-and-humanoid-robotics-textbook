import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import { useSession, signOut } from '../../lib/auth-client';
import styles from './navbar.module.css';

export default function AuthNavbarItem(props: any): JSX.Element {
    const { data: session, isPending } = useSession();

    const handleLogout = async () => {
        try {
            localStorage.removeItem('chatkit_thread_id');
            localStorage.removeItem('chatkit_thread_anonymous');
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            window.location.href = '/';
        }
    };

    if (isPending) {
         return <div className={styles.loading}>...</div>;
    }

    if (session) {
        return (
            <div className={styles.container}>
                <span className={styles.user}>{session.user.name || session.user.email}</span>
                 <button
                    className={styles.authButton}
                    onClick={handleLogout}
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container} {...props}>
            <Link to="/auth" className={styles.authButton} style={{ textDecoration: 'none', color: 'white' }}>
                Sign In
            </Link>
        </div>
    );
}
