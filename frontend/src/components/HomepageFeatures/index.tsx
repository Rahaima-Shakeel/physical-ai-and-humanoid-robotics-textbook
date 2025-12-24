import type { ReactNode } from 'react';
import clsx from 'clsx';
// @ts-ignore
import Heading from '@theme/Heading';
import RoadmapCard from '../RoadmapCard';
import { RoadmapModules } from '@site/src/data/roadmap';
import styles from './styles.module.css';

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={clsx(styles.features, 'fade-in')}>
      <div className="container">
        <div className="text--center padding-bottom--lg">
          <Heading as="h2">The Learning Roadmap</Heading>
          <p>Embark on a structured journey from humanoid foundations to the future of Physical AI.</p>
        </div>
        <div className="roadmap-grid">
          {RoadmapModules.map((props, idx) => (
            <RoadmapCard key={idx} index={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
