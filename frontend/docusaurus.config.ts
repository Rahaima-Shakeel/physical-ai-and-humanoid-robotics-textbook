import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Physical AI and Humanoid Robotics',
  tagline: 'An Open-Source Book by Google DeepMind',
  favicon: 'img/favicon.ico',

  // Production URL
  url: 'https://physical-ai-and-humanoid-robotics-t-tau.vercel.app/',
  // Base path for GitHub Pages (repository name)
  baseUrl: '/',

  // GitHub pages deployment config
  organizationName: 'rahaima-shakeel',
  projectName: 'Physical-AI-and-Humanoid-Robotics-textbook',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    backendUrl: process.env.BACKEND_URL || 'https://robotics-textbook.up.railway.app',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'https://humanoid-robotic-auth.up.railway.app',
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          // editUrl can be added if you want "Edit this page" links
          // editUrl: 'https://github.com/rahaima-shakeel/Physical-AI-and-Humanoid-Robotics-textbook/edit/main/website/',
        },
        blog: {
          showReadingTime: true,
          // editUrl: 'https://github.com/rahaima-shakeel/Physical-AI-and-Humanoid-Robotics-textbook/edit/main/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Physical AI and Humanoid Robotics',
      logo: {
        alt: 'Book Assistant Logo',
        src: 'img/book-assistant-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/blog', label: 'Updates', position: 'left' },
        {
          type: 'custom-auth',
          position: 'right',
        },
        {
          href: 'https://github.com/rahaima-shakeel/Physical-AI-and-Humanoid-Robotics-textbook',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [{ label: 'Tutorial', to: '/docs/introduction' }],
        },
        {
          title: 'Community',
          items: [
            { label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus' },
            { label: 'Discord', href: 'https://discordapp.com/invite/docusaurus' },
            { label: 'Twitter', href: 'https://twitter.com/docusaurus' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Blog', to: '/blog' },
            { label: 'GitHub', href: 'https://github.com/rahaima-shakeel/Physical-AI-and-Humanoid-Robotics-textbook' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI and Humanoid Robotics. By Rahaima Shakeel. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
