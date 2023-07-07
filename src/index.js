import directive from './directive'
import { refreshHtmlFontSize } from './util'

export default {
  install: (app, options = {}) => {
    refreshHtmlFontSize()
    let tid = null
    window.addEventListener('resize', () => {
      clearTimeout(tid)
      tid = setTimeout(refreshHtmlFontSize, 300)
    })
    directive.bind = directive.beforeMount
    directive.inserted = directive.mounted
    directive.unbind = directive.unmounted
    app.directive('sk', directive)
  }
}
