import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Modular 365 API',
  tagline: 'Integration API Documentation',
  favicon: 'img/favicon.ico',

  url: 'https://docs.ozari.co.il',
  baseUrl: '/api-docs/',

  organizationName: 'modular365-agent',
  projectName: 'api-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Modular 365',
      logo: {
        alt: 'Modular 365 Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/api/get-languages',
          label: 'API Reference',
          position: 'left',
        },
        {
          href: 'https://modular365.co.il',
          label: 'Modular 365',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Authentication',
              to: '/docs/authentication',
            },
            {
              label: 'API Reference',
              to: '/docs/api/get-languages',
            },
          ],
        },
        {
          title: 'Integration',
          items: [
            {
              label: 'Zapier',
              to: '/docs/zapier',
            },
            {
              label: 'Error Handling',
              to: '/docs/api/errors',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Modular 365',
              href: 'https://modular365.co.il',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Modular 365. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
