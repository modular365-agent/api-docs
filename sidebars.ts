import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  apiSidebar: [
    'intro',
    'authentication',
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/get-languages',
        'api/get-tables',
        'api/get-fields',
        'api/insert-record',
        'api/update-single',
        'api/update-bulk',
        'api/errors',
      ],
    },
    'zapier',
  ],
};

export default sidebars;
