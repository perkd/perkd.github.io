import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  title: 'Perkd Partner Docs',
  description: 'API Documentation for Perkd Partner Integrations',
  base: '/',
  ignoreDeadLinks: true, // Allow dead links for pages not yet created

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Machine APIs', link: '/machines/' },
      { text: 'Schemas', link: '/schemas/' },
      { text: 'Guides', link: '/guides/' }
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/getting-started/' },
            { text: 'Setup', link: '/getting-started/setup' },
            { text: 'Environments', link: '/getting-started/environments' },
            { text: 'Authentication', link: '/getting-started/authentication' }
          ]
        }
      ],

      '/machines/': [
        {
          text: 'Machine APIs',
          items: [
            { text: 'Overview', link: '/machines/' },
            { text: 'How It Works', link: '/machines/overview' }
          ]
        },
        {
          text: 'Vending',
          collapsed: false,
          items: [
            { text: 'Check In', link: '/machines/vending/checkin' },
            { text: 'Order', link: '/machines/vending/order' },
            { text: 'Pickup', link: '/machines/vending/pickup' },
            { text: 'Pay', link: '/machines/vending/pay' }
          ]
        },
        {
          text: 'Kiosk',
          collapsed: false,
          items: [
            { text: 'Order', link: '/machines/kiosk/order' }
          ]
        },
        {
          text: 'Callbacks',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/machines/callbacks/' },
            { text: 'Check In', link: '/machines/callbacks/checkin' },
            { text: 'Order', link: '/machines/callbacks/order' },
            { text: 'Pickup', link: '/machines/callbacks/pickup' },
            { text: 'Pay', link: '/machines/callbacks/pay' },
            { text: 'Authorize', link: '/machines/callbacks/authorize' },
            { text: 'Reserve', link: '/machines/callbacks/reserve' }
          ]
        },
        {
          text: 'Payment',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/machines/payment/' },
            { text: 'Commit', link: '/machines/payment/commit' },
            { text: 'Cancel', link: '/machines/payment/cancel' }
          ]
        }
      ],

      '/schemas/': [
        {
          text: 'Data Schemas',
          items: [
            { text: 'Overview', link: '/schemas/' },
            { text: 'Order', link: '/schemas/order' },
            { text: 'Item', link: '/schemas/item' },
            { text: 'Option', link: '/schemas/option' },
            { text: 'Person', link: '/schemas/person' },
            { text: 'Membership', link: '/schemas/membership' }
          ]
        }
      ],

      '/guides/': [
        {
          text: 'Guides',
          items: [
            { text: 'Workflows', link: '/guides/workflows/' },
            { text: 'Error Handling', link: '/guides/error-handling' },
            { text: 'Webhooks Best Practices', link: '/guides/webhooks' },
            { text: 'Testing', link: '/guides/testing' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/perkd' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Perkd'
    },

    search: {
      provider: 'local'
    }
  },

  // Mermaid configuration
  mermaid: {
    // Optional: configure mermaid theme
  },
  mermaidPlugin: {
    class: 'mermaid'
  },

  // Vite configuration to handle mermaid dependencies
  vite: {
    optimizeDeps: {
      include: ['mermaid']
    }
  }
}))
