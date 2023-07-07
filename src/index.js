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

    app.directive('sk', directive)
  }
}
