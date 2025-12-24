import React, { createContext, useContext, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { authClient } from '../lib/auth-client';

interface AuthContextType {
    user: any;
    session: any;
    isPending: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    profile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { siteConfig } = useDocusaurusContext();
    const backendUrl = (siteConfig.customFields?.backendUrl as string) || 'http://localhost:8000';

    const { data: session, isPending } = authClient.useSession();
    const [profile, setProfile] = useState<any>(null);

    const fetchProfile = async () => {
        if (!session?.user?.id) return;
        try {
            const resp = await fetch(`${backendUrl}/api/v1/profile`, {
                headers: {
                    'Authorization': `Bearer ${session.session.token}`
                }
            });
            if (resp.ok) {
                const data = await resp.json();
                setProfile(data);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    useEffect(() => {
        if (session) {
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [session]);

    const signOut = async () => {
        await authClient.signOut();
    };

    return (
        <AuthContext.Provider value={{
            user: session?.user,
            session: session?.session,
            isPending,
            signOut,
            profile,
            refreshProfile: fetchProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
