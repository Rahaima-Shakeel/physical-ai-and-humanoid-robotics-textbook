// import React, { JSX, useState } from 'react';
// import Layout from '@theme/Layout';
// import { SignUpForm } from '../components/Auth/SignUpForm';
// import { SignInForm } from '../components/Auth/SignInForm';
// import { BackgroundQuestionnaire } from '../components/Auth/BackgroundQuestionnaire';
// import { useSession } from '../lib/auth-client';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import styles from '../components/Auth/styles.module.css';

// export default function AuthPage(): JSX.Element {
//     const { siteConfig } = useDocusaurusContext();
//     const [step, setStep] = useState<'signin' | 'signup' | 'profile'>('signin');
//     const { data: session, isPending } = useSession();

//     // Effect to check if user is logged in but missing profile, or just logged in
//     React.useEffect(() => {
//         if (!isPending && session) {
//             // Need a way to check if profile exists.
//             // For now, let's assume if they are here manually (/auth), let them edit profile or see status.
//             //Ideally we fetch profile first.
//             setStep('profile');
//         }
//     }, [session, isPending]);

//     const handleProfileSubmit = async (profileData: any) => {
//         try {
//             // Use configured backend URL or default to localhost
//             const backendUrl = siteConfig?.customFields?.backendUrl as string || 'http://localhost:8000';
//             const token = session?.session?.token;

//             const headers: Record<string, string> = {
//                 'Content-Type': 'application/json',
//             };
//             if (token) {
//                 headers['Authorization'] = `Bearer ${token}`;
//             }

//             const response = await fetch(`${backendUrl}/api/user/profile`, {
//                 method: 'POST',
//                 headers,
//                 body: JSON.stringify(profileData),
//                 credentials: 'include'
//             });

//             if (response.ok) {
//                 window.location.href = '/';
//             } else {
//                 console.error("Failed to save profile");
//                 alert("Failed to save profile. Please try again.");
//             }
//         } catch (e) {
//             console.error(e);
//             alert("Error saving profile.");
//         }
//     };


//     return (
//         <Layout
//             title={`Authentication`}
//             description="Sign in or create an account"
//         >
//             <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 minHeight: 'calc(100vh - 60px)',
//                 background: 'var(--site-cream)',
//                 padding: '2rem'
//             }}>
//                 <div className={styles.modal} style={{ margin: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
//                     <h2>
//                         {step === 'signin' ? 'Welcome Back' : step === 'signup' ? 'Create Account' : ''}
//                     </h2>

//                     {step === 'signin' && (
//                         <>
//                             <SignInForm onSuccess={() => window.location.href = '/'} />
//                              <div className={styles.toggle}>
//                                 Don't have an account?
//                                 <button onClick={() => setStep('signup')}>
//                                     Sign Up
//                                 </button>
//                             </div>
//                         </>
//                     )}

//                     {step === 'signup' && (
//                         <>
//                             <SignUpForm onSuccess={() => setStep('profile')} />
//                             <div className={styles.toggle}>
//                                 Already have an account?
//                                 <button onClick={() => setStep('signin')}>
//                                     Sign In
//                                 </button>
//                             </div>
//                         </>
//                     )}

//                     {step === 'profile' && (
//                         <BackgroundQuestionnaire onSubmit={handleProfileSubmit} />
//                     )}
//                 </div>
//             </div>
//         </Layout>
//     );
// }


import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { PageMetadata } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { SignUpForm } from '../components/Auth/SignUpForm';
import { SignInForm } from '../components/Auth/SignInForm';
import { BackgroundQuestionnaire } from '../components/Auth/BackgroundQuestionnaire';
import { useSession } from '../lib/auth-client';

import styles from '../components/Auth/styles.module.css';

export default function AuthPage() {
  const { siteConfig } = useDocusaurusContext();

  const [step, setStep] = useState<'signin' | 'signup' | 'profile'>('signin');
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      setStep('profile');
    }
  }, [session, isPending]);

  const handleProfileSubmit = async (profileData: any) => {
    try {
      const backendUrl =
        (siteConfig?.customFields?.backendUrl as string) ||
        'http://localhost:8000';

      const token = session?.session?.token;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${backendUrl}/api/user/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData),
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving profile.');
    }
  };

  return (
    <>
      {/* ✅ Type-safe metadata */}
      <PageMetadata
        title="Authentication"
        description="Sign in or create an account"
      />

      <Layout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 60px)',
            background: 'var(--site-cream)',
            padding: '2rem',
          }}
        >
          <div
            className={styles.modal}
            style={{ margin: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <h2>
              {step === 'signin'
                ? 'Welcome Back'
                : step === 'signup'
                ? 'Create Account'
                : 'Complete Your Profile'}
            </h2>

            {step === 'signin' && (
              <>
                <SignInForm onSuccess={() => (window.location.href = '/')} />
                <div className={styles.toggle}>
                  Don&apos;t have an account?
                  <button onClick={() => setStep('signup')}>Sign Up</button>
                </div>
              </>
            )}

            {step === 'signup' && (
              <>
                <SignUpForm onSuccess={() => setStep('profile')} />
                <div className={styles.toggle}>
                  Already have an account?
                  <button onClick={() => setStep('signin')}>Sign In</button>
                </div>
              </>
            )}

            {step === 'profile' && (
              <BackgroundQuestionnaire onSubmit={handleProfileSubmit} />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

