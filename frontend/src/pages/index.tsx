import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
// @ts-ignore
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className="row row--align-center">
          <div className="col col--7 hero-content fade-in">
            <Heading as="h1" className="hero__title">
              Physical AI & <br />Humanoid Robotics
            </Heading>
            <p className="hero__subtitle">
              A premium, open-source guide to building the next generation of intelligent mobile machines.
              Designed for engineers, researchers, and dreamers.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/introduction">
                Start Learning Now
              </Link>
            </div>
          </div>
          <div className={clsx("col col--5", styles.heroImageContainer, "fade-in")}>
            <img
              src="/img/hero-book-art.png"
              alt="Academic Illustration of Humanoid Robotics"
              className={styles.heroImage}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function WhoIsThisFor() {
  return (
    <section className={styles.whoSection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h2">Who This Textbook is For</Heading>
            <p className={styles.whoText}>
              Whether you're a graduate student diving into control theory, a software engineer
              transitioning to robotics via ROS2, or a hardware enthusiast building your first actuator,
              this textbook provides the rigorous foundation and practical insights needed to
              navigate the complex landscape of Physical AI.
            </p>
            <ul className={styles.whoList}>
              <li>Undergraduate & Graduate Students</li>
              <li>Research Scientists in AI/Robotics</li>
              <li>Robotics Software Engineers</li>
              <li>Hardware & Mechatronics Designers</li>
            </ul>
          </div>
          <div className="col col--6">
            <div className={styles.quoteCard}>
              <p className={styles.quoteText}>
                "The future of AI is not just in the cloud—it's in the physical world,
                interacting with us in our homes, factories, and cities."
              </p>
              <div className={styles.quoteAuthor}>— Project Vision</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      // @ts-ignore
      title={`${siteConfig.title}`}
      description="The definitive guide to Physical AI and Humanoid Robotics.">
      <HomepageHeader />
      <main>
        <WhoIsThisFor />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
