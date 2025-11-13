import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { theme, useTheme } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'
import ExampleResponse from './components/ExampleResponse.vue'
import CustomOASpec from './components/CustomOASpec.vue'
import { nextTick } from 'vue'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app, router }) {
    theme.enhanceApp({ app })

    // Register custom components
    app.component('ExampleResponse', ExampleResponse)
    app.component('CustomOASpec', CustomOASpec)
  },
  setup() {
    // Handle hash navigation on mount
    if (typeof window !== 'undefined') {
      nextTick(() => {
        // Function to scroll to hash
        const scrollToHash = (hash: string, smooth = true) => {
          if (!hash) return

          const element = document.getElementById(hash)
          if (element) {
            const offset = 90 // Offset for fixed header
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.scrollY - offset

            window.scrollTo({
              top: offsetPosition,
              behavior: smooth ? 'smooth' : 'auto'
            })
          }
        }

        // Intercept all clicks on links
        document.addEventListener('click', (e) => {
          const target = e.target as HTMLElement
          const link = target.closest('a')

          if (link && link.href) {
            const url = new URL(link.href)
            const currentPath = window.location.pathname

            // Check if it's a hash link to the current page
            if (url.pathname === currentPath && url.hash) {
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()

              const hash = url.hash.slice(1) // Remove #

              // Update URL without reload
              history.pushState(null, '', url.href)

              // Scroll to element
              setTimeout(() => scrollToHash(hash), 50)

              return false
            }
          }
        }, true) // Use capture phase

        // Handle initial hash on page load
        if (window.location.hash) {
          setTimeout(() => {
            scrollToHash(window.location.hash.slice(1), false)
          }, 100)
        }

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
          if (window.location.hash) {
            setTimeout(() => {
              scrollToHash(window.location.hash.slice(1))
            }, 50)
          }
        })
      })
    }
  }
} satisfies Theme
