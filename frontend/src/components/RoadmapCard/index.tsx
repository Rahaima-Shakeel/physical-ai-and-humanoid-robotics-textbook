import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
// @ts-ignore
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export interface RoadmapCardProps {
    title: string;
    description: string;
    link: string;
    icon?: string;
    color?: string;
    index: number;
}

export default function RoadmapCard({ title, description, link, icon, color, index }: RoadmapCardProps) {
    return (
        <div
            className={clsx('card', styles.roadmapCard, 'fade-in')}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <Link to={link} className={styles.cardLink}>
                <div className={styles.cardHeader}>
                    {icon && (
                        <div className={styles.iconContainer} style={{ backgroundColor: color || 'var(--site-bg-secondary)' }}>
                            <img src={icon} alt={title} className={styles.icon} />
                        </div>
                    )}
                    <Heading as="h3" className={styles.cardTitle}>{title}</Heading>
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.cardDescription}>{description}</p>
                </div>
                <div className={styles.cardFooter}>
                    <span className={styles.learnMore}>Explore Module →</span>
                </div>
            </Link>
        </div>
    );
}
