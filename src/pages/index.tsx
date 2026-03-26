import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary')} style={{padding: '4rem 0'}}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem'}}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/api/get-languages"
            style={{color: '#fff', borderColor: '#fff'}}>
            API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: string;
  link: string;
};

const features: FeatureItem[] = [
  {
    title: 'Read Metadata',
    description:
      'Discover available tables, fields, and languages in your tenant. Retrieve localized labels in Hebrew or English.',
    link: '/docs/api/get-tables',
  },
  {
    title: 'Create & Update Records',
    description:
      'Insert new records or update existing ones via simple JSON requests. Supports single-record and bulk operations.',
    link: '/docs/api/insert-record',
  },
  {
    title: 'Zapier Integration',
    description:
      'Connect Modular 365 with thousands of apps using the official Zapier integration. No coding required.',
    link: '/docs/zapier',
  },
];

function Feature({title, description, link}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="feature-card" style={{height: '100%'}}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link to={link}>Learn more &rarr;</Link>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <div className="row">
          {features.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Modular 365 Integration API Documentation">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
