export function getRandom(n = 6) {
  let randomNum = []
  for (let i = 0; i < n; i++) {
    randomNum.push(Math.floor(Math.random() * 10))
  }
  return randomNum.join('')
}

export function measureLineHeight(el) {
  const { lineHeight: elLineHeight, fontSize: elFontSize, fontFamily: elFontFamily } = getComputedStyle(el)

  if (elLineHeight === 'normal') {
    if (!window.__normal_line_height__) {
      window.__normal_line_height__ = {}
    }
    if (!window.__normal_line_height__[elFontFamily]) {
      const div = document.createElement('div')
      div.style.cssText = `font-size: 100px;line-height: normal;opacity: 0;position: absolute;font-family: ${elFontFamily};`
      div.innerHTML = '测量行高ABC'
      document.body.appendChild(div)

      window.__normal_line_height__[elFontFamily] = div.getBoundingClientRect().height / 100
      div.remove()
    }

    return (dimension(elFontSize) * window.__normal_line_height__[elFontFamily]) / dimension(window.__html_font_size__) + 'px'
  }
  return dimension(elLineHeight) / dimension(window.__html_font_size__) + 'px'
}

export function initAnimation() {
  if (window.__init_animation_done__) {
    return
  }
  window.__init_animation_done__ = true
  const styleEl = document.createElement('style')
  styleEl.innerHTML = `
      [data-skeleton-id]:empty::after {
        content: '\\feff' !important;
      }
      @keyframes transparent {
        0% {
          opacity: 0.3;
        }
      
        50% {
          opacity: 0.5;
        }
      
        to {
          opacity: 0.3;
        }
      }
  `
  document.getElementsByTagName('HEAD')[0].append(styleEl)
}

export function dimension(dimension) {
  return parseFloat(dimension || 0)
}

export function unitify(dimension, unit) {
  if (isUnit(dimension, unit)) {
    return dimension
  }
  const reg = /\d*\.?\d+/
  return String(dimension).match(reg)[0] + unit
}

export function unit(dimension) {
  const reg = /[^\d.]+/
  const result = String(dimension).match(reg)
  return result ? result[0] : ''
}

export function isUnit(dimension, unit) {
  const reg = new RegExp(`\\d*\\.?\\d+(${unit})$`)
  return reg.test(dimension)
}

export const placeHolderImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
