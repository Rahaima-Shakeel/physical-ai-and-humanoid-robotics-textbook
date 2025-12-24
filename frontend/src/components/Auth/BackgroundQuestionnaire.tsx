import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { RoboticsLicenseCard } from './RoboticsLicenseCard';
import { authClient } from '../../lib/auth-client';

// Options based on Robotics/AI domain
const LANGUAGES = ['Python', 'C++', 'Rust', 'MATLAB', 'JavaScript/TypeScript'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TOOLS = ['ROS/ROS2', 'Gazebo', 'Docker', 'PyTorch', 'TensorFlow', 'OpenCV'];
const DEVICES = ['Raspberry Pi', 'NVIDIA Jetson', 'Arduino', 'Laptop (GPU)', 'Laptop (CPU Only)'];

interface ProfileData {
    software_context: {
        languages: string[];
        experience_level: string;
        preferred_tools: string[];
    };
    hardware_context: {
        devices: string[];
        specifications: Record<string, any>;
        constraints: string[];
    };
}

interface BackgroundQuestionnaireProps {
    onSubmit: (data: ProfileData) => Promise<void>;
}

export const BackgroundQuestionnaire: React.FC<BackgroundQuestionnaireProps> = ({ onSubmit }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [languages, setLanguages] = useState<string[]>([]);
    const [experience, setExperience] = useState('Beginner');
    const [tools, setTools] = useState<string[]>([]);
    const [devices, setDevices] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('Robotics Cadet');

    useEffect(() => {
        // Fetch user name for the card
        async function fetchUser() {
            try {
                const { data } = await authClient.getSession();
                if (data?.user?.name) {
                    setUserName(data.user.name);
                }
            } catch (err) {
                console.log("No session user found for card");
            }
        }
        fetchUser();
    }, []);

    const handleMultiSelect = (
        current: string[],
        setter: (val: string[]) => void,
        item: string
    ) => {
        if (current.includes(item)) {
            setter(current.filter(i => i !== item));
        } else {
            setter([...current, item]);
        }
    };

    const handleNext = () => {
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    // Changed from React.FormEvent to generic MouseEvent or void
    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onSubmit({
                software_context: {
                    languages,
                    experience_level: experience,
                    preferred_tools: tools
                },
                hardware_context: {
                    devices,
                    specifications: {},
                    constraints: []
                }
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const progressPercentage = (currentStep / 3) * 100;

    return (
        <div style={{ width: '100%' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--site-brown)' }}>Setup Your Profile</h2>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--site-gray)' }}>
                Step {currentStep} of 3: {currentStep === 1 ? 'Experience' : currentStep === 2 ? 'Hardware' : 'Software'}
            </div>

            {/* Step 1: Experience */}
            {currentStep === 1 && (
                <div className={styles.field}>
                    <label>Experience Level</label>
                    <select
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '12px',
                            border: '1px solid var(--site-gray)',
                            background: 'var(--site-tan)',
                            color: 'var(--site-brown)'
                        }}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                    >
                        {EXPERIENCE_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Step 2: Hardware */}
            {currentStep === 2 && (
                <div className={styles.field}>
                    <label>Active Hardware</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {DEVICES.map(device => (
                            <div
                                key={device}
                                onClick={() => handleMultiSelect(devices, setDevices, device)}
                                style={{
                                    padding: '0.5rem',
                                    border: `1px solid ${devices.includes(device) ? 'var(--site-orange)' : 'var(--site-gray)'}`,
                                    background: devices.includes(device) ? 'rgba(217, 130, 43, 0.1)' : 'transparent',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    textAlign: 'center',
                                    color: 'var(--site-brown)'
                                }}
                            >
                                {device}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Software & Tools */}
            {currentStep === 3 && (
                <>
                    <div className={styles.field}>
                        <label>Languages</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            {LANGUAGES.map(lang => (
                                <div
                                    key={lang}
                                    onClick={() => handleMultiSelect(languages, setLanguages, lang)}
                                    style={{
                                        padding: '0.5rem',
                                        border: `1px solid ${languages.includes(lang) ? 'var(--site-orange)' : 'var(--site-gray)'}`,
                                        background: languages.includes(lang) ? 'rgba(217, 130, 43, 0.1)' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        color: 'var(--site-brown)'
                                    }}
                                >
                                    {lang}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Toolchain</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {TOOLS.map(tool => (
                                <div
                                    key={tool}
                                    onClick={() => handleMultiSelect(tools, setTools, tool)}
                                    style={{
                                        padding: '0.5rem',
                                        border: `1px solid ${tools.includes(tool) ? 'var(--site-orange)' : 'var(--site-gray)'}`,
                                        background: tools.includes(tool) ? 'rgba(217, 130, 43, 0.1)' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        color: 'var(--site-brown)'
                                    }}
                                >
                                    {tool}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className={styles.submit}
                        style={{ background: 'var(--site-gray)', color: 'white' }}
                    >
                        Back
                    </button>
                )}

                {currentStep < 3 ? (
                    <button type="button" onClick={handleNext} className={styles.submit}>
                        Next
                    </button>
                ) : (
                    <button type="button" onClick={handleSubmit} disabled={loading} className={styles.submit}>
                        {loading ? 'Finalizing...' : 'Complete Setup'}
                    </button>
                )}
            </div>
        </div>

    );
};
