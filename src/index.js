import directive from './directive'

export default {
  install: (app, options = {}) => {
    app.directive('sk', directive)
  }
}
