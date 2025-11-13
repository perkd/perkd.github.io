import { postcssIsolateStyles } from 'vitepress'

export default {
  plugins: [
    postcssIsolateStyles({
      includeFiles: [/vitepress\/lib\/client\/theme-default/]
    })
  ]
}
