import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { theme, useTheme } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    theme.enhanceApp({ app })

    // Hide the interactive playground and authorization sections
    const vitepressOpenapiTheme = useTheme()
    vitepressOpenapiTheme.setOperationHiddenSlots(['playground', 'security'])
  }
} satisfies Theme
